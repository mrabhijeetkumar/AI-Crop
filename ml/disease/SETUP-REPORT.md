# Verified setup: 27 November 2026

Repository base: `655fe7af30cc6b935b460b73d006566a4bf73693`.
Executed in the connected Linux x86_64 workspace with Python 3.12.14,
PyTorch 2.10.0+cpu and torchvision 0.25.0+cpu. No CUDA GPU was available.

## Download and image audit

Both complete source ZIPs matched the pinned SHA-256 checksums in `sources.json`.

| Source | ZIP bytes | Images actually decoded | Raw label folders |
| --- | ---: | ---: | ---: |
| PlantVillage color | 2,184,723,441 | 54,305 | 38 |
| Cropped PlantDoc | 984,592,720 | 2,578 | 28 |

The PlantVillage ZIP also contains grayscale/segmented variants, which are not
used as additional training examples. Actual extracted counts differ from the
published 54,306 and 2,598 headline counts; this report uses inspected file counts.
No image decode failures were found in these snapshots.

## Prepared initial model data

| Split | Images | Role |
| --- | ---: | --- |
| PlantVillage train | 16,405 | Fit model weights |
| PlantVillage validation | 2,904 | Select model and training settings |
| PlantVillage test | 4,841 | Held-out internal evaluation |
| PlantDoc external development | 917 | Inspect domain shift; not fitted by baseline |
| PlantDoc external test | 85 | Small held-out external evaluation |

Tomato, potato and maize cover 17 PlantVillage classes. PlantDoc's conservative
mapping has 11 disease labels; its test subset covers 10 of them, with only 4–11
images per class. It does not test all 17 labels or healthy leaves.

Preparation excluded 14 identical-pixel PlantVillage duplicates and 11 PlantDoc
duplicates, 30,141 PlantVillage images outside the initial three crops, and 1,565
PlantDoc images outside scope or with ambiguous label mapping. Excluded files
remain in the original raw dataset, with reasons recorded in `excluded.csv`.

Final manifests have zero cross-split exact-file, identical-pixel and available
leaf-ID overlap. Leaf IDs were available for only 13,563 of 24,164 selected
PlantVillage images before deduplication. Perceptual near-duplicates, web-source
overlap and field/farm independence have not been audited. These checks therefore
do not prove the absence of all leakage.

## Execution checks

- Seven integrity tests passed: archive traversal, extraction scope, decoded-pixel
  hashes, leaf/test isolation, conflicting labels, reproducibility and leakage.
- Real-image smoke test passed on CPU: a batch of four images produced 17 logits
  per image, finite loss, and a real classifier-weight update.
- A separate 34-image training fixture checked checkpoint save/reload and report
  generation against 17 internal and 10 external fixture test images. This was
  software integration testing, not model quality evaluation.
- Shell syntax, Python compilation and `git diff --check` passed.
- Dependency resolution succeeded for Python 3.12 / Apple Silicon macOS. Native
  macOS execution and MPS hardware behavior were not tested here.

Full-dataset training has **not** been run. There is no new production accuracy
claim or deployable trained model from this setup. Website behavior, the existing
placeholder disease engine, UI/UX and LLM integration still need implementation.
The next command is the full training command in `README.md`; further work should
include field data, expert label review, calibration and unknown-input handling.
