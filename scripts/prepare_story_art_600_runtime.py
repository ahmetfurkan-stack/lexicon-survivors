#!/usr/bin/env python3
"""Validate human-approved 600-panel art and build the small runtime lookup.

This script never approves art. Only manifest rows explicitly marked approved
with a named human reviewer, passing QA, matching WebP mirrors and unique
SHA-256 hashes are written to the runtime lookup.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "assets/data/story_art_600_manifest.json"
SOURCE_INDEX_PATH = ROOT / "assets/data/story_art_600_runtime.json"
WEB_INDEX_PATH = ROOT / "build/web/assets/data/story_art_600_runtime.json"
QA_KEYS = (
    "unique_composition", "character_match", "pixel_art_edges",
    "no_text_or_file_icons", "story_beat_match", "source_web_parity",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_file(root: Path, relative_path: str) -> Path:
    path = (root / relative_path).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError(f"Asset path escapes the repository: {relative_path}")
    return path


def validate_approved_panels(manifest: dict[str, Any], root: Path = ROOT) -> dict[str, dict[str, Any]]:
    approved: dict[str, dict[str, Any]] = {}
    used_hashes: dict[str, str] = {}
    for row in manifest.get("images", []):
        if row.get("status") != "approved":
            continue
        asset_id = str(row.get("id", ""))
        reviewer = row.get("human_review")
        if not isinstance(reviewer, dict) or not reviewer.get("reviewer") or not reviewer.get("reviewed_at"):
            raise ValueError(f"{asset_id}: approved art must name its human reviewer and review date")
        qa = row.get("qa", {})
        if any(qa.get(key) != "pass" for key in QA_KEYS):
            raise ValueError(f"{asset_id}: all visual and parity QA items must pass before runtime approval")

        source = safe_file(root, str(row.get("expected_source_path", "")))
        web = safe_file(root, str(row.get("expected_web_path", "")))
        if not source.is_file() or not web.is_file():
            raise ValueError(f"{asset_id}: both source and web WebP files must exist")
        if source.stat().st_size > 300_000 or web.stat().st_size > 300_000:
            raise ValueError(f"{asset_id}: runtime WebP exceeds the 300 KB asset budget")
        source_hash, web_hash = sha256(source), sha256(web)
        if source_hash != web_hash:
            raise ValueError(f"{asset_id}: source and web mirror differ")
        if row.get("source_sha256") != source_hash or row.get("web_sha256") != web_hash:
            raise ValueError(f"{asset_id}: manifest hashes do not match the files under review")
        if source_hash in used_hashes:
            raise ValueError(f"{asset_id}: duplicates approved image bytes from {used_hashes[source_hash]}")
        used_hashes[source_hash] = asset_id
        with Image.open(web) as image:
            if image.format != "WEBP" or image.size != (1280, 720):
                raise ValueError(f"{asset_id}: runtime art must be a 1280x720 WebP")

        web_relative = Path(row["expected_web_path"]).relative_to("build/web").as_posix()
        key = f"{row['character_id']}:{int(row['wave'])}:{int(row['panel_index'])}"
        if key in approved:
            raise ValueError(f"{asset_id}: duplicate story panel key {key}")
        approved[key] = {"id": asset_id, "path": web_relative, "sha256": web_hash}
    return approved


def build_runtime_index(manifest: dict[str, Any], root: Path = ROOT) -> dict[str, Any]:
    panels = validate_approved_panels(manifest, root)
    return {
        "schema_version": 1,
        "approved_count": len(panels),
        "panels": panels,
    }


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    runtime_index = build_runtime_index(manifest)
    encoded = json.dumps(runtime_index, ensure_ascii=False, indent=2) + "\n"
    SOURCE_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    WEB_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    SOURCE_INDEX_PATH.write_text(encoded, encoding="utf-8")
    WEB_INDEX_PATH.write_text(encoded, encoding="utf-8")
    print(f"Runtime story art index ready: {runtime_index['approved_count']} human-approved panels.")


if __name__ == "__main__":
    main()
