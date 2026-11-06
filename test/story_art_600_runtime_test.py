import hashlib
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.prepare_story_art_600_runtime import build_runtime_index


class StoryArtRuntimeIndexTests(unittest.TestCase):
    def make_approved_row(self, root: Path) -> dict:
        source = root / "assets/sprites/story/panels_600/inky/wave_005_panel_01.webp"
        web = root / "build/web/assets/sprites/story/panels_600/inky/wave_005_panel_01.webp"
        source.parent.mkdir(parents=True)
        web.parent.mkdir(parents=True)
        Image.new("RGB", (1280, 720), (35, 27, 22)).save(source, "WEBP", quality=70)
        web.write_bytes(source.read_bytes())
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        return {
            "id": "story_inky_wave_005_panel_01",
            "character_id": "inky",
            "wave": 5,
            "panel_index": 1,
            "expected_source_path": source.relative_to(root).as_posix(),
            "expected_web_path": web.relative_to(root).as_posix(),
            "status": "approved",
            "human_review": {"reviewer": "artist@example.test", "reviewed_at": "2026-11-06"},
            "qa": {
                "unique_composition": "pass", "character_match": "pass", "pixel_art_edges": "pass",
                "no_text_or_file_icons": "pass", "story_beat_match": "pass", "source_web_parity": "pass",
            },
            "source_sha256": digest,
            "web_sha256": digest,
        }

    def test_only_human_approved_valid_webp_enters_runtime_index(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            row = self.make_approved_row(root)
            result = build_runtime_index({"images": [row]}, root)
            self.assertEqual(result["approved_count"], 1)
            self.assertEqual(result["panels"]["inky:5:1"]["path"], "assets/sprites/story/panels_600/inky/wave_005_panel_01.webp")

    def test_pending_ai_draft_is_not_in_runtime_index(self):
        result = build_runtime_index({"images": [{"id": "draft", "status": "awaiting_human_review"}]}, Path("/tmp"))
        self.assertEqual(result["approved_count"], 0)
        self.assertEqual(result["panels"], {})

    def test_failed_human_qa_blocks_runtime_approval(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            row = self.make_approved_row(root)
            row["qa"]["character_match"] = "needs_revision"
            with self.assertRaisesRegex(ValueError, "all visual and parity QA items"):
                build_runtime_index({"images": [row]}, root)


if __name__ == "__main__":
    unittest.main()
