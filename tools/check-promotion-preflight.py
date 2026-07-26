"""Read-only preflight for explicitly approved visual assets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "assets/source-art/qa/visual-approval-ledger-2026-07-24.json"
SCENE_INDEX = ROOT / "json/sceneAssets.json"
P01_MANIFEST = ROOT / "assets/source-art/p01-manifest.json"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=("scene", "p01"), required=True)
    parser.add_argument("--id", action="append", dest="ids", required=True)
    args = parser.parse_args()
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    failures: list[str] = []
    if args.kind == "scene":
        items = {item["sceneId"]: item for item in ledger["sceneCandidates"]}
        source = json.loads(SCENE_INDEX.read_text(encoding="utf-8")).get("items", {})
        for item_id in dict.fromkeys(args.ids):
            review = items.get(item_id)
            route = source.get(item_id)
            if not review or not route:
                failures.append(f"{item_id}: unknown scene candidate")
                continue
            if review.get("decision") != "approved":
                failures.append(f"{item_id}: ledger decision is {review.get('decision')}, expected approved")
                continue
            asset = ROOT / "public" / route["file"].lstrip("/")
            if not asset.is_file():
                failures.append(f"{item_id}: missing {asset}")
                continue
            with Image.open(asset) as image:
                if image.size != (1915, 821) or image.mode != "RGB":
                    failures.append(f"{item_id}: expected 1915x821 RGB, got {image.size} {image.mode}")
    else:
        items = {item["characterId"]: item for item in ledger["p01ProductionCandidates"]}
        manifest = json.loads(P01_MANIFEST.read_text(encoding="utf-8"))
        source = {item["characterId"]: item for item in manifest["items"]}
        for item_id in dict.fromkeys(args.ids):
            review = items.get(item_id)
            candidate = source.get(item_id)
            if not review or not candidate:
                failures.append(f"{item_id}: unknown P01 candidate")
                continue
            if review.get("decision") != "approved":
                failures.append(f"{item_id}: ledger decision is {review.get('decision')}, expected approved")
                continue
            if candidate.get("productionResolutionStatus") != "Production QA Pending":
                failures.append(f"{item_id}: production status is {candidate.get('productionResolutionStatus')}, expected pending")
                continue
            production = ROOT / "assets/source-art" / candidate["productionFile"]
            if not production.is_file():
                failures.append(f"{item_id}: missing {production}")
                continue
            with Image.open(production) as image:
                if image.size != (4096, 6144) or image.format != "PNG":
                    failures.append(f"{item_id}: expected 4096x6144 PNG, got {image.format} {image.size}")

    if failures:
        print("Promotion preflight failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Promotion preflight passed for {len(dict.fromkeys(args.ids))} {args.kind} candidate(s); no files changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
