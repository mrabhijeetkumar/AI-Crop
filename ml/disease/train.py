"""Real MobileNetV3 transfer-learning baseline; test evaluation is a separate step."""
from __future__ import annotations

import argparse
from collections import Counter
import csv
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import random
import time

import numpy as np
from PIL import Image, ImageOps
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms

from prepare import sha256, write_json

MEAN, STD = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]


class Images(Dataset):
    def __init__(self, root: Path, split: str, classes: list[str], training=False):
        self.root = root
        self.classes = classes
        self.class_index = {label: index for index, label in enumerate(classes)}
        with (root / f"manifests/{split}.csv").open() as handle:
            self.rows = list(csv.DictReader(handle))
        self.transform = transforms.Compose([
            *([transforms.RandomResizedCrop(224, scale=(0.8, 1.0)), transforms.RandomHorizontalFlip(),
               transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1)] if training else
              [transforms.Resize(256), transforms.CenterCrop(224)]),
            transforms.ToTensor(), transforms.Normalize(MEAN, STD)
        ])

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        row = self.rows[index]
        path = (self.root / row["path"]).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError("Manifest path escapes dataset directory")
        with Image.open(path) as image:
            tensor = self.transform(ImageOps.exif_transpose(image).convert("RGB"))
        return tensor, self.class_index[row["label"]]


def device_for(name: str):
    if name != "auto":
        return torch.device(name)
    if torch.cuda.is_available():
        return torch.device("cuda")
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def new_model(count: int, pretrained=True):
    weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained else None
    model = models.mobilenet_v3_small(weights=weights)
    for parameter in model.features.parameters():
        parameter.requires_grad_(False)
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, count)
    return model


@torch.inference_mode()
def evaluate(model, loader, device, classes):
    model.eval()
    actual, predicted, probabilities = [], [], []
    for images, labels in loader:
        outputs = model(images.to(device)).softmax(dim=1).cpu()
        actual.extend(labels.tolist())
        predicted.extend(outputs.argmax(dim=1).tolist())
        probabilities.extend(outputs.max(dim=1).values.tolist())
    if not actual:
        raise ValueError("Cannot evaluate an empty dataset")
    labels = list(range(len(classes)))
    present = sorted(set(actual))
    confidence = np.asarray(probabilities)
    correct = np.asarray(actual) == np.asarray(predicted)
    ece = 0.0
    bins = np.minimum((confidence * 10).astype(int), 9)
    for index in range(10):
        mask = bins == index
        if mask.any():
            ece += float(mask.mean() * abs(correct[mask].mean() - confidence[mask].mean()))
    return {
        "samples": len(actual), "accuracy": accuracy_score(actual, predicted),
        "macro_f1_all_model_classes": f1_score(actual, predicted, labels=labels, average="macro", zero_division=0),
        "macro_f1_observed_classes": f1_score(actual, predicted, labels=present, average="macro", zero_division=0),
        "observed_classes": [classes[index] for index in present],
        "ece_10_bins_uncalibrated": ece,
        "classification_report": classification_report(actual, predicted, labels=labels, target_names=classes, output_dict=True, zero_division=0),
        "confusion_matrix_labels": classes,
        "confusion_matrix": confusion_matrix(actual, predicted, labels=labels).tolist()
    }


def main(args):
    root = args.data_dir.expanduser().resolve()
    report = json.loads((root / "reports/preparation.json").read_text())
    for name, digest in report["manifest_sha256"].items():
        if sha256(root / "manifests" / name) != digest:
            raise ValueError(f"Manifest changed since preparation: {name}")
    classes = json.loads((root / "manifests/classes.json").read_text())
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    torch.set_num_threads(args.threads)
    os.environ.setdefault("TORCH_HOME", str(root / "cache/torch"))
    device = device_for(args.device)
    print(f"Device: {device}; classes: {len(classes)}", flush=True)

    if args.evaluate:
        # Load only locally generated checkpoints; weights_only avoids general pickle execution.
        checkpoint = torch.load(args.evaluate, map_location="cpu", weights_only=True)
        if checkpoint["classes"] != classes or checkpoint["manifest_sha256"] != report["manifest_sha256"]:
            raise ValueError("Checkpoint classes or data manifest fingerprints do not match")
        model = new_model(len(classes), pretrained=False).to(device)
        model.load_state_dict(checkpoint["state_dict"])
        for split in args.splits:
            data = Images(root, split, classes)
            result = evaluate(model, DataLoader(data, batch_size=args.batch_size, num_workers=args.workers), device, classes)
            result.update(split=split, checkpoint_sha256=sha256(args.evaluate), manifest_sha256=sha256(root / f"manifests/{split}.csv"))
            output = args.evaluate.parent / f"evaluation-{split}.json"
            write_json(output, result)
            print(f"{split}: n={result['samples']}, accuracy={result['accuracy']:.4f}, observed-class macro-F1={result['macro_f1_observed_classes']:.4f}; {output}", flush=True)
        return

    training, validation = Images(root, "train", classes, training=True), Images(root, "val", classes)
    model = new_model(len(classes)).to(device)
    counts = Counter(row["label"] for row in training.rows)
    weights = torch.tensor([len(training) / (len(classes) * counts[label]) for label in classes], dtype=torch.float32, device=device)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=args.lr, weight_decay=0.01)
    if args.smoke:
        # One real forward/backward update checks the setup; it is NOT model evaluation.
        indices = [next(i for i, row in enumerate(training.rows) if row["label"] == label) for label in classes]
        items = [training[index] for index in indices[:4]]
        images = torch.stack([item[0] for item in items]).to(device)
        labels = torch.tensor([item[1] for item in items], device=device)
        before = model.classifier[-1].weight.detach().clone()
        model.train()
        model.features.eval()
        logits = model(images)
        loss = criterion(logits, labels)
        if not torch.isfinite(loss):
            raise ValueError("Non-finite smoke-test loss")
        loss.backward()
        optimizer.step()
        assert logits.shape == (4, len(classes))
        assert not torch.equal(before, model.classifier[-1].weight)
        result = {"status": "passed", "kind": "setup_smoke_test_only", "device": str(device),
                  "torch": torch.__version__, "samples": 4, "output_shape": list(logits.shape),
                  "finite_loss": float(loss.detach().cpu()), "classifier_weights_changed": True,
                  "trained_model_exported": False, "accuracy": None}
        write_json(root / "reports/smoke-test.json", result)
        print(json.dumps(result, indent=2), flush=True)
        return

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    output = root / "models" / ("mobilenetv3-" + stamp)
    output.mkdir(parents=True, exist_ok=False)
    training_loader = DataLoader(training, batch_size=args.batch_size, shuffle=True, num_workers=args.workers)
    validation_loader = DataLoader(validation, batch_size=args.batch_size, num_workers=args.workers)
    best, stale, history = -1.0, 0, []
    for epoch in range(1, args.epochs + 1):
        start, total_loss = time.monotonic(), 0.0
        model.train()
        model.features.eval()  # Frozen backbone BN statistics must stay frozen too.
        for images, labels in training_loader:
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(images.to(device)), labels.to(device))
            if not torch.isfinite(loss):
                raise ValueError("Non-finite training loss")
            loss.backward()
            optimizer.step()
            total_loss += float(loss.detach().cpu()) * len(labels)
        metrics = evaluate(model, validation_loader, device, classes)
        score = metrics["macro_f1_all_model_classes"]
        summary = {"epoch": epoch, "train_loss": total_loss / len(training), "val_accuracy": metrics["accuracy"],
                   "val_macro_f1": score, "seconds": time.monotonic() - start}
        history.append(summary)
        write_json(output / "history.json", history)
        print(json.dumps(summary), flush=True)
        if score > best:
            best, stale = score, 0
            checkpoint = {"state_dict": {k: v.detach().cpu() for k, v in model.state_dict().items()},
                          "classes": classes, "architecture": "mobilenet_v3_small", "input_size": 224,
                          "mean": MEAN, "std": STD, "epoch": epoch, "seed": args.seed,
                          "pretrained_weights": "IMAGENET1K_V1", "training_mode": "frozen_backbone",
                          "manifest_sha256": report["manifest_sha256"]}
            temporary = output / "best.pt.tmp"
            torch.save(checkpoint, temporary)
            temporary.replace(output / "best.pt")
            write_json(output / "validation.json", metrics)
        else:
            stale += 1
        if stale >= args.patience:
            break
    write_json(output / "run.json", {"status": "baseline_trained", "device": str(device),
               "torch": torch.__version__, "epochs_completed": len(history), "seed": args.seed,
               "batch_size": args.batch_size, "lr": args.lr, "best_val_macro_f1": best,
               "test_evaluated": False, "limitations": "Frozen-backbone baseline; not calibrated or field-validated; not connected to website."})
    print(f"Saved {output / 'best.pt'}; test sets were not evaluated during training.", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--workers", type=int, default=0)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--patience", type=int, default=3)
    parser.add_argument("--device", choices=["auto", "cpu", "mps", "cuda"], default="auto")
    parser.add_argument("--evaluate", type=Path)
    parser.add_argument("--splits", nargs="+", choices=["val", "test", "external_dev", "external_test"], default=["test", "external_test"])
    args = parser.parse_args()
    if min(args.epochs, args.batch_size, args.threads, args.patience) < 1 or args.workers < 0 or args.lr <= 0:
        parser.error("Invalid training settings")
    if args.smoke and args.evaluate:
        parser.error("Choose --smoke or --evaluate")
    main(args)
