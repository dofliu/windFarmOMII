"""Record a human visual-review decision in the approval ledger only.

This command intentionally does not touch sceneAssets.json, p01-manifest.json,
the public index, or any runtime file.  Promotion remains a separate gate.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LEDGER = ROOT / "assets/source-art/qa/visual-approval-ledger-2026-07-24.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=("scene", "p01"), required=True)
    parser.add_argument("--id", action="append", dest="ids", required=True, help="ID to update; repeat for a batch decision.")
    parser.add_argument("--decision", choices=("pending", "approved", "rejected"), required=True)
    parser.add_argument("--note", default="", help="Optional review note applied to each selected ID.")
    parser.add_argument("--reviewed-by", default="user", help="Reviewer label stored in the ledger.")
    parser.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    parser.add_argument("--dry-run", action="store_true", help="Validate the selection without changing the ledger.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ledger = json.loads(args.ledger.read_text(encoding="utf-8"))
    key = "sceneCandidates" if args.kind == "scene" else "p01ProductionCandidates"
    id_key = "sceneId" if args.kind == "scene" else "characterId"
    items = {item[id_key]: item for item in ledger.get(key, [])}
    ids = list(dict.fromkeys(args.ids))
    missing = [item_id for item_id in ids if item_id not in items]
    if missing:
        print(f"Unknown {args.kind} ID(s): {', '.join(missing)}")
        return 1

    if args.dry_run:
        print(f"Visual approval ledger dry-run passed: {len(ids)} {args.kind} decision(s) -> {args.decision}; no files changed.")
        return 0

    reviewed_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    for item_id in ids:
        item = items[item_id]
        item["decision"] = args.decision
        item["note"] = args.note
        item["reviewedAt"] = reviewed_at
        item["reviewedBy"] = args.reviewed_by

    ledger["updatedAt"] = reviewed_at
    scene_items = ledger.get("sceneCandidates", [])
    p01_items = ledger.get("p01ProductionCandidates", [])
    ledger["summary"].update(
        {
            "scenePending": sum(item["decision"] == "pending" for item in scene_items),
            "sceneApproved": sum(item["decision"] == "approved" for item in scene_items),
            "sceneRejected": sum(item["decision"] == "rejected" for item in scene_items),
            "p01Pending": sum(item["decision"] == "pending" for item in p01_items),
            "p01Approved": sum(item["decision"] == "approved" for item in p01_items),
            "p01Rejected": sum(item["decision"] == "rejected" for item in p01_items),
        }
    )
    args.ledger.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Recorded {len(ids)} {args.kind} visual decision(s): {args.decision}; runtime manifests unchanged.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
