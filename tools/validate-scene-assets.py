from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCENE_INDEX = PROJECT_ROOT / "json" / "sceneAssets.json"
EXPECTED_SIZE = (1915, 821)
EXPECTED_MODE = "RGB"
# The shared AI fallback predates the dedicated wide scene-feed contract and is
# intentionally retained until a later art review replaces it.
LEGACY_FALLBACK_SIZE = (1672, 941)


def main() -> int:
    index = json.loads(SCENE_INDEX.read_text(encoding="utf-8"))
    errors: list[str] = []
    fallback_file = index["fallback"]["file"]
    fallback_path = PROJECT_ROOT / "public" / fallback_file.lstrip("/")

    if not fallback_path.is_file():
        errors.append(f"fallback file missing: {fallback_file}")
    else:
        with Image.open(fallback_path) as image:
            if image.size != LEGACY_FALLBACK_SIZE:
                errors.append(f"fallback size changed unexpectedly: {image.size}")

    for scene_id, item in index.get("items", {}).items():
        asset_path = PROJECT_ROOT / "public" / item["file"].lstrip("/")
        if not asset_path.is_file():
            errors.append(f"{scene_id}: file missing: {item['file']}")
            continue
        with Image.open(asset_path) as image:
            allowed_sizes = {EXPECTED_SIZE}
            if item["file"] == fallback_file:
                allowed_sizes.add(LEGACY_FALLBACK_SIZE)
            if image.size not in allowed_sizes:
                errors.append(f"{scene_id}: expected {EXPECTED_SIZE}, got {image.size}")
            if image.mode != EXPECTED_MODE:
                errors.append(f"{scene_id}: expected {EXPECTED_MODE}, got {image.mode}")

    if errors:
        print(f"Scene asset validation failed with {len(errors)} error(s):")
        for error in errors:
            print(f"- {error}")
        return 1

    dedicated_count = sum(1 for item in index.get("items", {}).values() if item["file"] != fallback_file)
    print(f"Scene asset validation passed: {dedicated_count} dedicated assets at 1915x821 RGB; shared fallback routes retained at 1672x941.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
