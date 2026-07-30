from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = PROJECT_ROOT / "course-deployment-assets"
PORTRAIT_OUTPUT = OUTPUT_ROOT / "portraits"
SCENE_OUTPUT = OUTPUT_ROOT / "scenes"
COURSE_CONFIG = PROJECT_ROOT / "public" / "course" / "course-config.json"
MISSIONS_FILE = PROJECT_ROOT / "json" / "missions.json"
SCENE_INDEX_FILE = PROJECT_ROOT / "json" / "sceneAssets.json"
SOURCE_ART_INDEX = PROJECT_ROOT / "public" / "assets" / "source-art" / "p01" / "index.json"
SOURCE_ART_ROOT = PROJECT_ROOT / "public" / "assets" / "source-art" / "p01"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_webp(source: Path, destination: Path, size: tuple[int, int], quality: int) -> None:
    if not source.exists():
        raise FileNotFoundError(f"Missing source image: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        converted = image.convert("RGB")
        converted = ImageOps.contain(converted, size, Image.Resampling.LANCZOS)
        converted.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    config = read_json(COURSE_CONFIG)
    missions_raw = read_json(MISSIONS_FILE)
    missions = {item["id"]: item for item in missions_raw}
    scene_index = read_json(SCENE_INDEX_FILE)
    art_index = read_json(SOURCE_ART_INDEX)

    # 課程部署只保留固定 roster 與 Guided Practice 預設隊伍，避免將 1 GB 完整收藏素材送上 Pages。
    essential_characters = set(config["rosterIds"])
    essential_characters.update(["CHR-GOV-001", "CHR-MAR-176", "CHR-OMI-221"])
    for assignment in config["assignments"]:
        essential_characters.update(assignment["teamIds"])

    portrait_map: dict[str, str] = {}
    for character_id in sorted(essential_characters):
        entry = art_index["items"].get(character_id)
        if not entry:
            raise KeyError(f"Missing Source Art index entry: {character_id}")
        source = SOURCE_ART_ROOT / entry["file"]
        file_name = f"{character_id}.webp"
        save_webp(source, PORTRAIT_OUTPUT / file_name, (512, 768), 74)
        portrait_map[character_id] = file_name

    placeholder_source_id = sorted(essential_characters)[0]
    placeholder_file = "_course_placeholder.webp"
    save_webp(
        SOURCE_ART_ROOT / art_index["items"][placeholder_source_id]["file"],
        PORTRAIT_OUTPUT / placeholder_file,
        (512, 768),
        70,
    )

    essential_scene_ids = {scene_index["fallback"]["sourceSceneId"]}
    for assignment in config["assignments"]:
        essential_scene_ids.add(missions[assignment["missionId"]]["sceneId"])

    scene_map: dict[str, str] = {}
    for scene_id in sorted(essential_scene_ids):
        entry = scene_index["items"][scene_id]
        source = PROJECT_ROOT / "public" / entry["file"].lstrip("/")
        file_name = f"{scene_id}.webp"
        save_webp(source, SCENE_OUTPUT / file_name, (1280, 548), 76)
        scene_map[scene_id] = file_name

    fallback_scene_id = scene_index["fallback"]["sourceSceneId"]
    fallback_file = "_course_scene_fallback.webp"
    fallback_source = PROJECT_ROOT / "public" / scene_index["fallback"]["file"].lstrip("/")
    save_webp(fallback_source, SCENE_OUTPUT / fallback_file, (1280, 548), 74)

    manifest = {
        "schemaVersion": 1,
        "releaseVersion": config["releaseVersion"],
        "portraitFallback": placeholder_file,
        "sceneFallback": fallback_file,
        "portraits": portrait_map,
        "scenes": scene_map,
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    (OUTPUT_ROOT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Course deployment assets: {len(portrait_map)} portraits, "
        f"{len(scene_map)} scenes, 2 fallbacks."
    )


if __name__ == "__main__":
    main()
