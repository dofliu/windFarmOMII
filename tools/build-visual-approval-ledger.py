"""Build a persistent, non-promoting visual approval ledger.

The ledger joins the scene and P01 production review queues while preserving
any decisions already recorded by a reviewer.  It is deliberately separate
from runtime manifests: changing a decision here never changes QA status or
which asset the game serves.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCENE_INDEX = ROOT / "json/sceneAssets.json"
P01_MANIFEST = ROOT / "assets/source-art/p01-manifest.json"
DEFAULT_OUTPUT = ROOT / "assets/source-art/qa/visual-approval-ledger-2026-07-24.json"
DECISIONS = {"pending", "approved", "rejected"}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8").lstrip("\ufeff"))


def preserve(existing: dict, key: str, defaults: dict) -> dict:
    old = existing.get(key, {})
    decision = old.get("decision", "pending")
    if decision not in DECISIONS:
        raise SystemExit(f"Invalid decision for {key}: {decision}")
    result = dict(defaults)
    result["decision"] = decision
    result["note"] = old.get("note", "")
    result["reviewedAt"] = old.get("reviewedAt")
    result["reviewedBy"] = old.get("reviewedBy")
    return result


def build(output: Path) -> tuple[Path, int, int]:
    existing = read_json(output) if output.exists() else {}
    old_scene = {item["sceneId"]: item for item in existing.get("sceneCandidates", [])}
    old_p01 = {item["characterId"]: item for item in existing.get("p01ProductionCandidates", [])}

    scene_index = read_json(SCENE_INDEX)
    scenes = []
    for scene_id, item in sorted(scene_index.get("items", {}).items()):
        if item.get("qaStatus") != "VISUAL_REVIEW_REQUIRED":
            continue
        scenes.append(
            preserve(
                old_scene,
                scene_id,
                {
                    "sceneId": scene_id,
                    "file": item.get("file"),
                    "qaStatus": item.get("qaStatus"),
                },
            )
        )

    p01_manifest = read_json(P01_MANIFEST)
    p01 = []
    for item in sorted(p01_manifest.get("items", []), key=lambda value: value.get("productionSequence", value.get("sequence", 0))):
        if item.get("productionResolutionStatus") != "Production QA Pending":
            continue
        character_id = item["characterId"]
        p01.append(
            preserve(
                old_p01,
                character_id,
                {
                    "characterId": character_id,
                    "batchId": item.get("batchId"),
                    "activeFile": item.get("activeFile"),
                    "productionFile": item.get("productionFile"),
                    "productionResolutionStatus": item.get("productionResolutionStatus"),
                    "productionQaStatus": item.get("productionQaStatus"),
                },
            )
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    ledger = {
        "schemaVersion": "1.0",
        "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "purpose": "Human visual approval decisions only; this ledger never promotes assets or changes runtime QA status.",
        "decisionPolicy": {
            "pending": "Not reviewed; do not promote.",
            "approved": "Explicit user visual approval recorded; promotion still requires the dedicated promotion gate.",
            "rejected": "Do not promote; retain as evidence and replace only through a separate correction workflow.",
        },
        "summary": {
            "sceneCandidates": len(scenes),
            "scenePending": sum(item["decision"] == "pending" for item in scenes),
            "sceneApproved": sum(item["decision"] == "approved" for item in scenes),
            "sceneRejected": sum(item["decision"] == "rejected" for item in scenes),
            "p01ProductionCandidates": len(p01),
            "p01Pending": sum(item["decision"] == "pending" for item in p01),
            "p01Approved": sum(item["decision"] == "approved" for item in p01),
            "p01Rejected": sum(item["decision"] == "rejected" for item in p01),
        },
        "sceneCandidates": scenes,
        "p01ProductionCandidates": p01,
    }
    output.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output, len(scenes), len(p01)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    path, scene_count, p01_count = build(args.output)
    print(f"Visual approval ledger built: {scene_count} scene candidates, {p01_count} P01 production candidates")
    print(f"Ledger: {path}")


if __name__ == "__main__":
    main()
