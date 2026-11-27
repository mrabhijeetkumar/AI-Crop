import copy
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prepare import assert_separation, extract, inspect_image, safe_member, split_plantvillage


def row(name, split="train", leaf="", pixels=None, label="Tomato___Early_blight"):
    return {"path": name + ".jpg", "label": label, "original_split": split,
            "sha256": "file-" + name, "pixel_sha256": pixels or "pixel-" + name,
            "leaf_group_ids": leaf}


class PreparationTests(unittest.TestCase):
    def test_archive_traversal_rejected(self):
        for name in ("../escape.jpg", "/absolute.jpg", "raw/../../escape", "raw\\escape"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                safe_member(name)

    def test_extract_only_color_and_no_grayscale(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / "test.zip"
            with zipfile.ZipFile(archive, "w") as handle:
                handle.writestr("raw/color/healthy/a.jpg", b"color")
                handle.writestr("raw/grayscale/healthy/a.jpg", b"grayscale")
            extract(archive, root / "out", "plantvillage")
            self.assertEqual((root / "out/raw/color/healthy/a.jpg").read_bytes(), b"color")
            self.assertFalse((root / "out/raw/grayscale").exists())

    def test_metadata_differences_still_detect_identical_pixels(self):
        from PIL.PngImagePlugin import PngInfo
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = Image.new("RGB", (8, 8), (20, 50, 100))
            image.save(root / "a.png")
            meta = PngInfo()
            meta.add_text("description", "different metadata")
            image.save(root / "b.png", pnginfo=meta)
            first, second = (inspect_image(root / name, root) for name in ("a.png", "b.png"))
            self.assertNotEqual(first["sha256"], second["sha256"])
            self.assertEqual(first["pixel_sha256"], second["pixel_sha256"])

    def test_test_leaf_mate_and_exact_duplicate_removed_from_train(self):
        rows = [row("test", "test", "leaf1"), row("mate", leaf="leaf1"),
                row("copy", pixels="pixel-test")]
        rows += [row(f"train{i}", leaf=f"group{i}") for i in range(20)]
        accepted, excluded = split_plantvillage(rows, 42)
        self.assertEqual([r["path"] for r in accepted if r["split"] == "test"], ["test.jpg"])
        self.assertTrue({"mate.jpg", "copy.jpg"}.issubset({r["path"] for r in excluded}))
        self.assertEqual({r["split"] for r in accepted}, {"train", "val", "test"})
        assert_separation(accepted)

    def test_conflicting_duplicate_labels_are_quarantined(self):
        rows = [row(f"a{i}") for i in range(20)] + [row(f"b{i}", label="Potato___Early_blight") for i in range(20)]
        rows += [row("conflict1", pixels="same"), row("conflict2", pixels="same", label="Potato___Early_blight")]
        accepted, excluded = split_plantvillage(rows, 42)
        self.assertEqual(len(excluded), 2)
        self.assertFalse(any(r["pixel_sha256"] == "same" for r in accepted))

    def test_reproducible_split_keeps_leaf_mates_together(self):
        rows = [row(f"image{i}", leaf=f"leaf{i // 2}") for i in range(40)]
        first, _ = split_plantvillage(copy.deepcopy(rows), 42)
        second, _ = split_plantvillage(copy.deepcopy(rows), 42)
        self.assertEqual([(r["path"], r["split"]) for r in first], [(r["path"], r["split"]) for r in second])
        assert_separation(first)

    def test_assertion_detects_cross_split_leakage(self):
        first, second = row("a", leaf="same"), row("b", leaf="same")
        first["split"], second["split"] = "train", "val"
        with self.assertRaises(AssertionError):
            assert_separation([first, second])


if __name__ == "__main__":
    unittest.main()
