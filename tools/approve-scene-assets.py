from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCENE_INDEX = PROJECT_ROOT / "json" / "sceneAssets.json"
EXPECTED_SIZE = (1915, 821)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Promote explicitly reviewed scene candidates without touching fallback routes."
    )
    parser.add_argument(
        "--scene-id",
        action="append",
        dest="scene_ids",
        required=True,
        help="Scene ID to approve; repeat for multiple explicitly reviewed scenes.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate the selected candidates without changing manifests.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    scene_ids = list(dict.fromkeys(args.scene_ids))
    index = json.loads(SCENE_INDEX.read_text(encoding="utf-8"))
    items = index.get("items", {})
    errors: list[str] = []

    for scene_id in scene_ids:
        item = items.get(scene_id)
        if item is None:
            errors.append(f"{scene_id}: unknown scene asset")
            continue
        if item.get("qaStatus") != "VISUAL_REVIEW_REQUIRED":
            errors.append(f"{scene_id}: expected VISUAL_REVIEW_REQUIRED, got {item.get('qaStatus')}")
            continue
        asset_path = PROJECT_ROOT / "public" / item["file"].lstrip("/")
        if not asset_path.is_file():
            errors.append(f"{scene_id}: missing file {item['file']}")
            continue
        with Image.open(asset_path) as image:
            if image.size != EXPECTED_SIZE or image.mode != "RGB":
                errors.append(f"{scene_id}: expected {EXPECTED_SIZE} RGB, got {image.size} {image.mode}")

    if errors:
        print("Scene approval validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    if args.dry_run:
        print(f"Scene approval dry-run passed for {len(scene_ids)} scene(s); no files changed.")
        return 0

    for scene_id in scene_ids:
        items[scene_id]["qaStatus"] = "ENGINEERING_QA_PASSED"
    SCENE_INDEX.write_text(f"{json.dumps(index, ensure_ascii=False, indent=2)}\n", encoding="utf-8")
    subprocess.run(["node", "tools/sync-data.mjs"], cwd=PROJECT_ROOT, check=True)
    print(f"Approved {len(scene_ids)} scene asset(s): {', '.join(scene_ids)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
