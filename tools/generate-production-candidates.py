"""Build exact-size production candidates without changing the active preview.

The first production gate is deliberately conservative: it performs a deterministic
Lanczos resize from the reviewed 2:3 preview and writes to a QA staging directory.
The existing production importer then records the candidate as Production QA Pending;
no file is promoted to Production Approved by this script.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


TARGET_SIZE = (4096, 6144)
EXPECTED_PREVIEW_SIZE = (1024, 1536)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create 4096x6144 production candidates for one P01 batch")
    parser.add_argument("--batch-id", required=True, help="Batch manifest ID, for example BATCH-P01-023")
    parser.add_argument(
        "--output-root",
        default=".codex_qa/production-candidates",
        help="Staging directory; candidates are not connected to the runtime by this script",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[1]
    art_root = project_root / "assets" / "source-art"
    batch_path = art_root / "batches" / f"{args.batch_id}.json"
    batch = json.loads(batch_path.read_text(encoding="utf-8-sig"))
    output_dir = project_root / args.output_root / args.batch_id
    output_dir.mkdir(parents=True, exist_ok=True)

    candidates = [
        item
        for item in batch["items"]
        if item.get("generationStatus") == "Generated"
        and item.get("activeFile")
        and item.get("productionResolutionStatus", "Upscale Pending") == "Upscale Pending"
    ]
    if not candidates:
        print(f"{args.batch_id}: no Upscale Pending active candidates; nothing to stage")
        return

    for item in candidates:
        source = art_root / item["activeFile"]
        destination = output_dir / f"{item['characterId']}_{item['levelCode']}_P01_{item.get('activeVersion', 'v001')}_production.png"
        if destination.exists() and destination.stat().st_size > 0:
            with Image.open(destination) as existing:
                if existing.size == TARGET_SIZE:
                    print(f"{item['characterId']} already staged; skipping")
                    continue
        with Image.open(source) as image:
            image = image.convert("RGB")
            if image.size != EXPECTED_PREVIEW_SIZE:
                raise SystemExit(f"{item['characterId']}: expected {EXPECTED_PREVIEW_SIZE}, received {image.size}")
            # Keep the reviewed full-body composition; both source and target are exactly 2:3.
            image.resize(TARGET_SIZE, Image.Resampling.LANCZOS).save(destination, format="PNG", optimize=True)
        with Image.open(destination) as candidate:
            if candidate.size != TARGET_SIZE:
                raise SystemExit(f"{item['characterId']}: candidate size mismatch {candidate.size}")
        print(f"{item['characterId']} -> {destination} ({TARGET_SIZE[0]}x{TARGET_SIZE[1]})")

    print(f"{args.batch_id}: generated {len(candidates)} staging candidate(s); import remains a separate QA step")


if __name__ == "__main__":
    main()
