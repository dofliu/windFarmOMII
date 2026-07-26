"""Build a single visual-review sheet for the isolated P01 production candidates.

The source is the nine already-reviewed per-batch production contact sheets,
not a second decode of all 90 multi-megapixel PNGs.  This keeps the review
artifact fast and reproducible on a synced workspace while never changing the
active art index or any QA status.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "assets/source-art/p01-manifest.json"
DEFAULT_OUTPUT_DIR = ROOT / "assets/source-art/qa/production-p01-2026-07-24"


def font(size: int):
    """Use a predictable Windows font, with Pillow's fallback for portability."""

    for candidate in ("C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def build(manifest_path: Path, output_dir: Path) -> tuple[Path, Path, int]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = [
        item
        for item in manifest["items"]
        if item.get("productionResolutionStatus") == "Production QA Pending"
    ]
    items.sort(key=lambda item: item.get("productionSequence", item["sequence"]))
    if not items:
        raise SystemExit("No Production QA Pending candidates found.")

    output_dir.mkdir(parents=True, exist_ok=True)
    batches: dict[str, list[dict]] = {}
    for item in items:
        batches.setdefault(item["batchId"], []).append(item)
    batch_ids = sorted(batches)
    columns = 3
    tile_width, tile_height, label_height = 640, 438, 30
    header_height = 66
    rows = (len(batch_ids) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_width, header_height + rows * (tile_height + label_height)), "#11202b")
    draw = ImageDraw.Draw(sheet)
    draw.text((16, 12), "OWM P01 production candidates — visual review only", fill="#f2c66d", font=font(22))
    draw.text(
        (16, 39),
        f"{len(items)} files · exact 4096×6144 PNG · Production QA Pending · no runtime promotion",
        fill="#b8d8de",
        font=font(14),
    )

    evidence = []
    for index, batch_id in enumerate(batch_ids):
        batch_dir = ROOT / "assets/source-art/qa" / f"{batch_id}-r7-samples"
        contact_sheet = batch_dir / f"{batch_id}-production-contact-sheet.png"
        if not contact_sheet.exists():
            raise SystemExit(f"Missing batch contact sheet: {contact_sheet}")
        with Image.open(contact_sheet) as source:
            tile = ImageOps.contain(source.convert("RGB"), (tile_width, tile_height), method=Image.Resampling.LANCZOS)

        col, row = index % columns, index // columns
        x = col * tile_width + (tile_width - tile.width) // 2
        y = header_height + row * (tile_height + label_height)
        draw.rectangle((col * tile_width, y - 2, (col + 1) * tile_width - 1, y + tile_height + label_height - 1), fill="#183242")
        sheet.paste(tile, (x, y))
        draw.text((col * tile_width + 8, y + tile_height + 4), f"{batch_id} · {len(batches[batch_id])}/10 · QA Pending", fill="#ffffff", font=font(14))
        for item in batches[batch_id]:
            evidence.append(
                {
                    "order": len(evidence) + 1,
                    "characterId": item["characterId"],
                    "batchId": item["batchId"],
                    "productionFile": item["productionFile"],
                    "productionResolutionStatus": item["productionResolutionStatus"],
                    "visualQaStatus": item.get("visualQaStatus"),
                    "productionQaStatus": item.get("productionQaStatus"),
                    "width": item.get("productionWidth"),
                    "height": item.get("productionHeight"),
                }
            )

    sheet_path = output_dir / "production-contact-sheet-all-v001.png"
    manifest_out = output_dir / "production-contact-sheet-all-v001.json"
    sheet.save(sheet_path, format="PNG", optimize=True)
    manifest_out.write_text(
        json.dumps(
            {
                "generatedFrom": str(manifest_path.relative_to(ROOT)).replace("\\", "/"),
                "candidateCount": len(evidence),
                "grid": {"columns": columns, "tileWidth": tile_width, "tileHeight": tile_height, "source": "per-batch production contact sheets"},
                "status": "VISUAL_REVIEW_REQUIRED",
                "items": evidence,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return sheet_path, manifest_out, len(evidence)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()
    sheet, manifest, count = build(args.manifest, args.output_dir)
    print(f"Built production review sheet for {count} candidates: {sheet}")
    print(f"Review evidence manifest: {manifest}")


if __name__ == "__main__":
    main()
