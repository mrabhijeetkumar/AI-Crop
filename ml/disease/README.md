# Disease datasets and real training setup

This isolated setup downloads verified PlantVillage and PlantDoc archives, audits
the images, prepares manifests, and runs a real neural-network smoke test. It
does not change the website, production database, or existing inference routes.
The existing `backend/app/ml/training/train_disease_model.py` is a metadata
generator with fixed metrics; this new trainer is separate and actually fits
weights. Do not interpret that existing file's 96.42% as a result of this setup.

## Start on Linux or Apple Silicon Mac

Allow at least 12 GB free disk space, an internet connection, and time to download
about 3.17 GB of source archives plus Python packages. No Kaggle account or paid
GPU is needed for setup. Linux uses CPU wheels. On Apple Silicon, the trainer
automatically selects MPS if available; Mac execution has not been tested in the
connected Linux workspace. Intel Macs/Rosetta need a different PyTorch version.

From the repository root:

```bash
bash ml/disease/setup.sh "$(pwd)/../AI-Crop-Data"
```

The script uses `uv` when available. Otherwise it installs a pinned `uv` into
`.bootstrap-disease` using Python 3. It creates `.venv-disease` with Python 3.12,
installs PyTorch 2.10.0 / torchvision 0.25.0 and pinned core requirements, downloads
and checks sources, then runs a four-image forward/backward smoke test. A missing
Python 3 installation must be installed before using the fallback. Existing
global packages and the app's backend environment are not modified.

Interrupted downloads resume through `.part` files. Completed files must match
the SHA-256 values in `sources.json`. A checksum mismatch stops setup rather than
accepting a changed archive. Reruns validate/extract/audit the pinned source again.

## Data sources and attribution

| Dataset | Pinned source | Use |
| --- | --- | --- |
| PlantVillage | [Author dataset](https://huggingface.co/datasets/mohanty/PlantVillage/tree/9e97599868962bd0079b8db4b7f1efa9185fa1e7), [ZIP](https://huggingface.co/datasets/mohanty/PlantVillage/resolve/9e97599868962bd0079b8db4b7f1efa9185fa1e7/data.zip?download=true) | Base training; all original variants remain in the downloaded ZIP; only color images are extracted. |
| Cropped PlantDoc | [Author repository](https://github.com/pratikkayal/PlantDoc-Dataset/tree/5467f6012d78d1c446145d5f582da6096f852ae8), [ZIP](https://codeload.github.com/pratikkayal/PlantDoc-Dataset/zip/5467f6012d78d1c446145d5f582da6096f852ae8) | External development/test images; never mixed into baseline training. |

PlantVillage: Mohanty, Hughes and Salathé, *Using Deep Learning for Image-Based
Plant Disease Detection* (2016); dataset card declares CC-BY-SA-3.0.
PlantDoc: Singh et al., *PlantDoc: A Dataset for Visual Plant Disease Detection*
(2020); repository declares CC-BY-4.0. Original dataset cards/LICENSE are kept
with the files. PlantDoc uses internet-collected images; preserve provenance and
review image-level rights before redistributing them in a commercial product.

## What is prepared

All raw classes are retained locally. The initial model selects tomato, potato,
and maize: **17 PlantVillage labels**. This is deliberately a bounded first model,
not a claim to recognize all Indian crops, diseases, or pest species.

```text
AI-Crop-Data/
  downloads/                  # verified original ZIPs
  sources/plantvillage/       # original leaf map, split files and dataset card
  images/plantvillage/raw/color/
  images/plantdoc/train/      # preserved author's source folder
  images/plantdoc/test/
  manifests/                 # train, val, test, external_dev, external_test CSVs
  reports/                   # inventory, exclusions, preparation and smoke report
  models/                    # created only by actual full training
  cache/torch/               # official pretrained backbone weights
```

Manifests reference original images; they do not duplicate the dataset into
additional train/validation/test directories. Paths are relative to the data
directory so they work on both Linux and Mac.

Preparation:

1. Verifies archive and metadata SHA-256; rejects archive traversal and symlinks.
2. Decodes every image and calculates both file and decoded-RGB hashes.
3. Excludes corrupt/oversized images, conflicting identical-image labels and
   duplicate pixels. Every exclusion has an explicit reason in `excluded.csv`.
4. Preserves PlantVillage official test membership, after deduplication. Any
   training image sharing an available leaf group with that test is excluded.
5. Splits the remaining official training groups into training and validation
   using seed 42 and approximately 15% of groups per class for validation.
6. Holds PlantDoc's provided test folder for external testing; its provided train
   folder becomes `external_dev`, also held out from this baseline's fitting.
7. Requires zero exact-file, identical-pixel and available-leaf-ID overlap across
   final splits. Records source revisions, counts and manifest fingerprints.

The PlantDoc mapping includes only 11 clearly corresponding disease names in
`plantdoc-labels.json`. Generic `Corn leaf blight`, `Tomato leaf yellow virus`, and
generic healthy-leaf names are excluded rather than silently mapped to more
specific diagnoses. One mapped class has no examples in PlantDoc's test folder;
the report gives actual test coverage. Mapping is still subject to expert review.

Known limitations: leaf IDs are absent for maize and some other images; exact
hash checks do not detect all differently cropped/resized copies. Farm, plant,
camera, location and source-photo independence cannot be guaranteed from these
metadata. Perceptual near-duplicate review, label review and a consented local
field-image test set are needed before deployment. A high PlantVillage score is
not evidence of high field accuracy. Filtering also changes the published test
benchmark, so do not compare scores as if the test population were unchanged.

## Train and evaluate

Run actual baseline training after setup:

```bash
.venv-disease/bin/python ml/disease/train.py \
  --data-dir ../AI-Crop-Data --epochs 12
```

This uses an ImageNet-pretrained MobileNetV3-Small, image augmentation, a frozen
backbone (including BatchNorm statistics), class-weighted cross-entropy, AdamW,
and early stopping on validation macro-F1. It saves real `best.pt` weights, class
order, preprocessing, source manifest fingerprints and measured validation
metrics. CPU training can be slow; Apple Silicon MPS/CUDA are selected when the
installed runtime supports them. GPU fine-tuning is a later step.

After selecting the model using validation/external development data, evaluate
the final checkpoint explicitly (replace `RUN_DIRECTORY` with the printed path):

```bash
.venv-disease/bin/python ml/disease/train.py \
  --data-dir ../AI-Crop-Data \
  --evaluate ../AI-Crop-Data/models/RUN_DIRECTORY/best.pt
```

Reports include sample counts, accuracy, per-class precision/recall/F1, observed
class and all-model-class macro-F1, confusion matrices and uncalibrated ECE.
Do not tune on `test` or `external_test`. External metrics cover only the labels
actually present, not all 17 model classes. Softmax is not a calibrated
probability of diagnosis, and no production confidence threshold is claimed.

`--smoke` only proves that images load, a forward pass works and weights update;
it exports no trained model and reports no accuracy. Full training, calibration,
image-quality/unknown-input rejection, field validation and connecting an honest
inference API/UI remain separate work. The existing website's placeholder disease
result is not replaced by running this installer.

## Checks

```bash
.venv-disease/bin/python -m unittest discover -s ml/disease/tests -v
bash -n ml/disease/setup.sh
git diff --check
```

Tests check traversal rejection, color-only extraction, decoded-pixel deduplication,
leaf/test isolation, conflicting labels, split determinism and leakage detection.
Real-data audit results are in `AI-Crop-Data/reports/preparation.json`.
