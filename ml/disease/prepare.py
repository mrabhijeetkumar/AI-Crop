"""Download pinned sources, audit images, and create leakage-checked CSV manifests.

Raw images are never augmented or relabelled on disk. Only PlantVillage color
images are extracted; its ZIP also retains the original alternative variants.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
import csv
import hashlib
import json
from pathlib import Path, PurePosixPath
import random
import shutil
import stat
import time
import urllib.error
import urllib.request
import zipfile

from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
PREFIXES = ("Tomato___", "Potato___", "Corn_(maize)___")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
FIELDS = ["path", "source", "original_label", "label", "original_split", "split",
          "sha256", "pixel_sha256", "width", "height", "leaf_group_ids", "group", "reason"]


def sha256(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")
    temporary.replace(path)


def download(url: str, destination: Path, expected_sha: str):
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if sha256(destination) == expected_sha:
            print(f"Verified {destination.name}", flush=True)
            return
        raise RuntimeError(f"Checksum mismatch for {destination}; move it aside before retrying")
    part = destination.with_suffix(destination.suffix + ".part")
    for attempt in range(4):
        # A complete .part from an interrupted final rename needs no redownload.
        if part.exists() and sha256(part) == expected_sha:
            part.replace(destination)
            return
        offset = part.stat().st_size if part.exists() else 0
        request = urllib.request.Request(url, headers={"User-Agent": "AI-Crop-dataset-setup/1"})
        if offset:
            request.add_header("Range", f"bytes={offset}-")
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                partial = response.status == 206
                if partial and not response.headers.get("Content-Range", "").startswith(f"bytes {offset}-"):
                    raise RuntimeError("Download server returned an unexpected byte range")
                with part.open("ab" if partial else "wb") as handle:
                    print(f"Downloading {destination.name} (resume={offset if partial else 0} bytes)", flush=True)
                    shutil.copyfileobj(response, handle, 1024 * 1024)
            if sha256(part) != expected_sha:
                raise RuntimeError(f"Checksum mismatch after download: {part}")
            part.replace(destination)
            return
        except urllib.error.HTTPError as exc:
            if exc.code == 416:
                raise RuntimeError(f"Invalid partial download: move {part} aside and retry") from exc
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
        except (OSError, TimeoutError):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError(f"Download failed: {destination.name}")


def safe_member(name: str) -> PurePosixPath:
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or "\\" in name or not path.parts:
        raise ValueError(f"Unsafe archive member: {name}")
    return path


def extract(archive: Path, target: Path, source: str):
    count = 0
    with zipfile.ZipFile(archive) as handle:
        for member in handle.infolist():
            path = safe_member(member.filename)
            if stat.S_ISLNK(member.external_attr >> 16):
                raise ValueError(f"Archive symlink is not supported: {member.filename}")
            if source == "plantvillage":
                # Locate raw/color even when the archive has an enclosing folder.
                parts = path.parts
                positions = [i for i in range(len(parts) - 1) if parts[i:i + 2] == ("raw", "color")]
                if not positions:
                    continue
                relative = PurePosixPath(*parts[positions[0]:])
            else:
                relative = PurePosixPath(*path.parts[1:])
                if not relative.parts:
                    continue
                if relative.parts[0] not in {"train", "test", "README.md", "LICENSE.txt"}:
                    continue
            output = target.joinpath(*relative.parts)
            if not output.resolve().is_relative_to(target.resolve()):
                raise ValueError(f"Archive escapes output directory: {relative}")
            if member.is_dir():
                output.mkdir(parents=True, exist_ok=True)
                continue
            output.parent.mkdir(parents=True, exist_ok=True)
            with handle.open(member) as src, output.open("wb") as dst:
                shutil.copyfileobj(src, dst, 1024 * 1024)
            count += 1
    print(f"Extracted {source}: {count} files", flush=True)


def inspect_image(path: Path, root: Path) -> dict:
    row = {"path": path.relative_to(root).as_posix()}
    try:
        row["sha256"] = sha256(path)
        with Image.open(path) as image:
            if image.width * image.height > 50_000_000:
                raise ValueError("Image exceeds the 50-megapixel audit limit")
            image.verify()
        with Image.open(path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.load()
            row.update(width=image.width, height=image.height)
            digest = hashlib.sha256(f"RGB:{image.width}:{image.height}:".encode())
            digest.update(image.tobytes())
            row["pixel_sha256"] = digest.hexdigest()
    except Exception as exc:
        row["reason"] = f"invalid_image:{type(exc).__name__}:{str(exc)[:180]}"
    return row


class UnionFind:
    def __init__(self, count: int):
        self.parent = list(range(count))

    def find(self, index: int) -> int:
        while index != self.parent[index]:
            self.parent[index] = self.parent[self.parent[index]]
            index = self.parent[index]
        return index

    def union(self, left: int, right: int):
        self.parent[self.find(left)] = self.find(right)


def group_plantvillage(rows: list[dict]):
    union = UnionFind(len(rows))
    seen = {}
    for index, row in enumerate(rows):
        name = Path(row["path"]).stem.split("___", 1)[-1].lower().strip()
        tokens = ["pixel:" + row["pixel_sha256"], f"name:{row['label']}:{name}"]
        tokens += ["leaf:" + value for value in row["leaf_group_ids"].split("|") if value]
        for token in tokens:
            if token in seen:
                union.union(index, seen[token])
            seen[token] = index
    groups = defaultdict(list)
    for index, row in enumerate(rows):
        groups[union.find(index)].append(row)
    for values in groups.values():
        group = hashlib.sha256(min(row["path"] for row in values).encode()).hexdigest()[:24]
        for row in values:
            row["group"] = group
    return list(groups.values())


def split_plantvillage(rows: list[dict], seed: int) -> tuple[list[dict], list[dict]]:
    """Keep official test membership; remove its group mates from training."""
    accepted, excluded = [], []
    train_groups = defaultdict(list)
    for group in group_plantvillage(rows):
        pixels = defaultdict(list)
        for row in group:
            pixels[row["pixel_sha256"]].append(row)
        kept = []
        for same_pixels in pixels.values():
            if len({row["label"] for row in same_pixels}) > 1:
                for row in same_pixels:
                    row["reason"] = "conflicting_labels_for_identical_pixels"
                    excluded.append(row)
                continue
            same_pixels.sort(key=lambda row: (row["original_split"] != "test", row["path"]))
            kept.append(same_pixels[0])
            for row in same_pixels[1:]:
                row["reason"] = "duplicate_pixels"
                excluded.append(row)
        if any(row["original_split"] == "test" for row in group):
            for row in kept:
                if row["original_split"] == "test":
                    row["split"] = "test"
                    accepted.append(row)
                else:
                    row["reason"] = "leaf_or_duplicate_group_overlaps_official_test"
                    excluded.append(row)
        elif kept:
            labels = {row["label"] for row in kept}
            if len(labels) != 1:
                raise ValueError("Unexpected mixed-label training leaf group")
            train_groups[kept[0]["label"]].append(kept)
    rng = random.Random(seed)
    for label in sorted(train_groups):
        groups = sorted(train_groups[label], key=lambda g: g[0]["group"])
        if len(groups) < 2:
            raise ValueError(f"Not enough independent groups for {label}")
        rng.shuffle(groups)
        validation_count = max(1, min(len(groups) - 1, round(len(groups) * 0.15)))
        for index, group in enumerate(groups):
            for row in group:
                row["split"] = "val" if index < validation_count else "train"
                accepted.append(row)
    return accepted, excluded


def assert_separation(rows: list[dict]):
    for field in ("sha256", "pixel_sha256", "group", "leaf_group_ids"):
        seen = {}
        for row in rows:
            values = row.get(field, "").split("|") if field == "leaf_group_ids" else [row.get(field, "")]
            for value in filter(None, values):
                previous = seen.setdefault(value, row["split"])
                if previous != row["split"]:
                    raise AssertionError(f"Leakage across splits for {field}: {row['path']}")


def write_csv(path: Path, rows: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda row: row["path"]))


def prepare(root: Path, seed: int, workers: int, skip_download: bool):
    root.mkdir(parents=True, exist_ok=True)
    sources = json.loads((HERE / "sources.json").read_text())
    for source, spec in sources.items():
        for item in spec["files"]:
            url = item.get("url") or f"{spec['source']}/resolve/{spec['revision']}/{item['remote']}?download=true"
            if not skip_download:
                download(url, root / item["local"], item["sha256"])
            elif not (root / item["local"]).is_file() or sha256(root / item["local"]) != item["sha256"]:
                raise ValueError(f"Missing or unverified source: {item['local']}")
    extract(root / "downloads/plantvillage-data.zip", root / "images/plantvillage", "plantvillage")
    extract(root / "downloads/plantdoc.zip", root / "images/plantdoc", "plantdoc")
    leaf_map = json.loads((root / "sources/plantvillage/leaf_grouping/leaf-map.json").read_text())
    official = {}
    for split in ("train", "test"):
        for line in (root / f"sources/plantvillage/splits/color_{split}.txt").read_text().splitlines():
            if line in official:
                raise ValueError(f"Duplicate entry across official split files: {line}")
            official[line] = split
    mapping = json.loads((HERE / "plantdoc-labels.json").read_text())
    image_paths = sorted(path for path in (root / "images").rglob("*") if path.suffix.lower() in IMAGE_SUFFIXES and path.is_file())
    print(f"Decoding and hashing {len(image_paths)} images...", flush=True)
    inventory, excluded, village, doc = [], [], [], []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for number, row in enumerate(pool.map(lambda path: inspect_image(path, root), image_paths), 1):
            parts = PurePosixPath(row["path"]).parts
            source = parts[1]
            label = parts[-2]
            row.update(source=source, original_label=label, label=label)
            inventory.append(row)
            if number % 5000 == 0:
                print(f"Audited {number}/{len(image_paths)}", flush=True)
            if row.get("reason"):
                excluded.append(row)
                continue
            if source == "plantvillage":
                original_path = "/".join(parts[2:])
                row["original_split"] = official.get(original_path, "unknown")
                if not label.startswith(PREFIXES):
                    row["reason"] = "outside_initial_three_crops"
                elif row["original_split"] == "unknown":
                    row["reason"] = "not_in_official_splits"
                else:
                    key = Path(row["path"]).stem.split("___", 1)[-1].lower().strip()
                    ids = sorted({x for x in leaf_map.get(key, []) if x.split(":::")[0] == label})
                    row["leaf_group_ids"] = "|".join(ids)
                    village.append(row)
            else:
                row["original_split"] = parts[2]
                if label not in mapping:
                    row["reason"] = "out_of_scope_or_ambiguous_label"
                else:
                    row["label"] = mapping[label]
                    doc.append(row)
            if row.get("reason"):
                excluded.append(row)
    classes = sorted({row["label"] for row in village})
    if len(classes) != 17:
        raise ValueError(f"Expected 17 classes for tomato/potato/maize; found {len(classes)}")
    selected_count = len(village)
    leaf_coverage = sum(bool(row["leaf_group_ids"]) for row in village)
    accepted, filtered = split_plantvillage(village, seed)
    excluded.extend(filtered)
    # Hold out both PlantDoc source splits. Its train split is external development
    # data; no PlantDoc image is used by the baseline trainer for fitting.
    village_pixels = {row["pixel_sha256"] for row in village}
    seen_doc = set()
    for row in sorted(doc, key=lambda x: (x["original_split"] != "test", x["path"])):
        if row["pixel_sha256"] in village_pixels:
            row["reason"] = "external_image_duplicates_plantvillage"
        elif row["pixel_sha256"] in seen_doc:
            row["reason"] = "duplicate_plantdoc_pixels_test_has_priority"
        else:
            row["split"] = "external_test" if row["original_split"] == "test" else "external_dev"
            row["group"] = "plantdoc:" + row["pixel_sha256"]
            accepted.append(row)
        seen_doc.add(row["pixel_sha256"])
        if row.get("reason"):
            excluded.append(row)
    assert_separation(accepted)
    for split in ("train", "val", "test", "external_dev", "external_test"):
        rows = [row for row in accepted if row["split"] == split]
        if not rows:
            raise ValueError(f"Empty split: {split}")
        if split in {"train", "val", "test"} and {r["label"] for r in rows} != set(classes):
            raise ValueError(f"Missing classes in {split}")
        write_csv(root / f"manifests/{split}.csv", rows)
    write_csv(root / "reports/inventory.csv", inventory)
    write_csv(root / "reports/excluded.csv", excluded)
    write_json(root / "manifests/classes.json", classes)
    report = {
        "seed": seed, "sources": sources, "initial_crops": ["tomato", "potato", "maize"],
        "raw_image_counts": dict(Counter(row["source"] for row in inventory)),
        "raw_label_counts": {s: len({row['original_label'] for row in inventory if row['source'] == s}) for s in sources},
        "classes": classes, "split_counts": dict(Counter(row["split"] for row in accepted)),
        "per_class_counts": {split: dict(Counter(row['label'] for row in accepted if row['split'] == split)) for split in sorted({r['split'] for r in accepted})},
        "excluded_reasons": dict(Counter(row["reason"] for row in excluded)),
        "selected_plantvillage_before_deduplication": selected_count,
        "selected_plantvillage_with_leaf_group": leaf_coverage,
        "manifest_sha256": {p.name: sha256(p) for p in sorted((root / "manifests").glob("*")) if p.is_file()},
        "checks": {"image_decode": "complete", "cross_split_exact_hash_overlap": 0, "cross_split_identical_pixel_overlap": 0, "cross_split_available_leaf_id_overlap": 0},
        "limitations": [
            "Leaf IDs are incomplete: absent for maize and some other images. Filename/pixel grouping is a fallback, not proof of plant independence.",
            "Perceptual near-duplicate and farm/source-group audits have not been performed. Different crops of the same internet image may remain.",
            "PlantDoc mapping is a conservative label-name mapping, not an agronomist-verified image-label audit. Ambiguous labels are excluded.",
            "The external test covers only a subset of the 17 labels. This is not a field validation or all-India benchmark.",
            "Official test subsets are deduplicated; scores are not directly comparable with unfiltered published benchmarks."
        ]
    }
    write_json(root / "reports/preparation.json", report)
    print(json.dumps({"raw_images": report["raw_image_counts"], "splits": report["split_counts"], "exclusions": report["excluded_reasons"]}, indent=2), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--skip-download", action="store_true")
    args = parser.parse_args()
    if args.workers < 1:
        parser.error("--workers must be positive")
    prepare(args.data_dir.expanduser().resolve(), args.seed, args.workers, args.skip_download)
