from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


FILES = {
    "factions": "factions.json",
    "careerTracks": "tracks.json",
    "characters": "characters.json",
    "skills": "skills.json",
    "characterSkillLinks": "character_skills.json",
    "equipment": "equipment.json",
    "bosses": "bosses.json",
    "scenes": "scenes.json",
    "missions": "missions.json",
    "turbines": "turbines.json",
    "codexEntries": "codex.json",
    "vessels": "vessels.json",
    "prompts": "prompts.json",
}
AUDIT_FILE = "bossChallengeAudit.json"
SCENE_ASSET_FILE = "sceneAssets.json"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    manifest = load_json(root / "manifest.json")
    data = {name: load_json(root / filename) for name, filename in FILES.items()}
    audit = load_json(root / AUDIT_FILE)
    scene_assets = load_json(root / SCENE_ASSET_FILE)

    required_inventory = {f"json/{filename}" for filename in [*FILES.values(), AUDIT_FILE, SCENE_ASSET_FILE]}
    missing_inventory = required_inventory - set(manifest.get("files", []))
    if missing_inventory:
        errors.append(f"manifest files inventory missing {sorted(missing_inventory)}")

    for name, rows in data.items():
        expected = manifest["counts"][name]
        if len(rows) != expected:
            errors.append(f"{name}: expected {expected}, actual {len(rows)}")

    id_fields = {
        "factions": "code",
        "careerTracks": "id",
        "characters": "id",
        "skills": "id",
        "equipment": "id",
        "bosses": "id",
        "scenes": "id",
        "missions": "id",
        "turbines": "id",
        "codexEntries": "id",
        "vessels": "id",
        "prompts": "id",
    }
    indexes: dict[str, set[str]] = {}
    for name, field in id_fields.items():
        values = [row.get(field, "") for row in data[name]]
        indexes[name] = set(values)
        if "" in indexes[name]:
            errors.append(f"{name}: empty {field}")
        duplicates = [value for value, count in Counter(values).items() if count > 1]
        if duplicates:
            errors.append(f"{name}: duplicate IDs {duplicates[:10]}")

    scene_fallback = scene_assets.get("fallback", {})
    scene_asset_items = scene_assets.get("items", {})
    valid_scene_qa = {"ENGINEERING_QA_PASSED", "VISUAL_REVIEW_REQUIRED"}
    if scene_assets.get("schemaVersion") != 1:
        errors.append("sceneAssets: schemaVersion must be 1")
    if scene_fallback.get("sourceSceneId") not in indexes["scenes"]:
        errors.append("sceneAssets: fallback sourceSceneId must reference a known Scene")
    if not str(scene_fallback.get("file", "")).startswith("/") or not re.fullmatch(r"v\d{3}", str(scene_fallback.get("version", ""))):
        errors.append("sceneAssets: fallback must use an absolute Web path and vNNN version")
    if scene_fallback.get("qaStatus") not in valid_scene_qa:
        errors.append("sceneAssets: fallback qaStatus is invalid")
    if not isinstance(scene_asset_items, dict):
        errors.append("sceneAssets: items must be an object keyed by Scene ID")
        scene_asset_items = {}
    for scene_id, asset in scene_asset_items.items():
        if scene_id not in indexes["scenes"] or asset.get("sceneId") != scene_id:
            errors.append(f"sceneAssets: invalid Scene mapping {scene_id}")
        if not str(asset.get("file", "")).startswith("/") or not re.fullmatch(r"v\d{3}", str(asset.get("version", ""))):
            errors.append(f"sceneAssets: {scene_id} must use an absolute Web path and vNNN version")
        if asset.get("qaStatus") not in valid_scene_qa:
            errors.append(f"sceneAssets: {scene_id} qaStatus is invalid")

    for row in data["careerTracks"]:
        if row["faction"] not in indexes["factions"]:
            errors.append(f"{row['id']}: missing faction {row['faction']}")

    for row in data["skills"]:
        if row["trackId"] != "GLOBAL" and row["trackId"] not in indexes["careerTracks"]:
            errors.append(f"{row['id']}: missing track {row['trackId']}")
        if row["faction"] != "ALL" and row["faction"] not in indexes["factions"]:
            errors.append(f"{row['id']}: missing faction {row['faction']}")

    links_by_character: dict[str, list[dict]] = defaultdict(list)
    for link in data["characterSkillLinks"]:
        links_by_character[link["characterId"]].append(link)
        if link["characterId"] not in indexes["characters"]:
            errors.append(f"link: missing character {link['characterId']}")
        if link["skillId"] not in indexes["skills"]:
            errors.append(f"link: missing skill {link['skillId']}")

    prompts_by_character: dict[str, set[str]] = defaultdict(set)
    for prompt in data["prompts"]:
        prompts_by_character[prompt["characterId"]].add(prompt["variantCode"])
        if prompt["characterId"] not in indexes["characters"]:
            errors.append(f"{prompt['id']}: missing character {prompt['characterId']}")

    expected_variants = {f"P{index:02d}" for index in range(1, 11)}
    for character in data["characters"]:
        character_id = character["id"]
        if character["trackId"] not in indexes["careerTracks"]:
            errors.append(f"{character_id}: missing track {character['trackId']}")
        if character["factionCode"] not in indexes["factions"]:
            errors.append(f"{character_id}: missing faction {character['factionCode']}")

        field_skills = {
            character["passiveSkillId"],
            character["skill1Id"],
            character["skill2Id"],
            character["ultimateSkillId"],
        }
        linked_skills = {link["skillId"] for link in links_by_character[character_id]}
        if len(links_by_character[character_id]) != 4 or field_skills != linked_skills:
            errors.append(f"{character_id}: four skill fields disagree with CharacterSkills")
        if not field_skills <= indexes["skills"]:
            errors.append(f"{character_id}: missing skill FK {sorted(field_skills - indexes['skills'])}")
        if prompts_by_character[character_id] != expected_variants:
            errors.append(f"{character_id}: prompt variants are not exactly P01-P10")

    equipment = {row["id"]: row for row in data["equipment"]}
    equipment_tier_counts = Counter(row.get("tier") for row in data["equipment"])
    if equipment_tier_counts != Counter({f"L{tier}": 40 for tier in range(1, 6)}):
        errors.append(f"equipment: expected exactly 40 items per L1-L5 tier, actual {dict(equipment_tier_counts)}")
    vessels = {row["id"]: row for row in data["vessels"]}
    valid_branch_codes = {
        "WEATHER_ESCALATION", "SPARE_DELAY", "SECONDARY_FAULT", "COMMS_OUTAGE", "FALSE_ALARM"
    }
    valid_vessel_classes = {"CTV", "SOV", "USV"}
    expected_mastery_by_chapter = {1: 1, 2: 1, 3: 2, 4: 3, 5: 4}
    expected_equipment_tier_by_chapter = {1: "L1", 2: "L2", 3: "L3", 4: "L4", 5: "L4"}
    expected_reward_tier_by_order = {3: "L2", 6: "L3", 9: "L4", 12: "L5"}
    mission_site_codes: set[str] = set()
    mission_scene_ids: set[str] = set()
    turbine_mission_counts = Counter()
    for mission in data["missions"]:
        mission_id = mission["id"]
        if mission["bossId"] not in indexes["bosses"]:
            errors.append(f"{mission_id}: missing boss {mission['bossId']}")
        if mission["sceneId"] not in indexes["scenes"]:
            errors.append(f"{mission_id}: missing scene {mission['sceneId']}")
        else:
            mission_scene_ids.add(mission["sceneId"])
        if mission.get("turbineId") not in indexes["turbines"]:
            errors.append(f"{mission_id}: missing turbine {mission.get('turbineId')}")
        else:
            turbine_mission_counts[mission["turbineId"]] += 1
        if mission["recommendedEquipmentId"] not in equipment:
            errors.append(f"{mission_id}: missing equipment {mission['recommendedEquipmentId']}")
        spare = equipment.get(mission["recommendedSpareId"])
        if spare is None or spare.get("category") != "SPARES":
            errors.append(f"{mission_id}: recommended spare must reference SPARES equipment")
        recommended_equipment = equipment.get(mission["recommendedEquipmentId"])
        expected_equipment_tier = expected_equipment_tier_by_chapter.get(mission["chapter"])
        if recommended_equipment and recommended_equipment.get("tier") != expected_equipment_tier:
            errors.append(f"{mission_id}: recommended equipment tier must be {expected_equipment_tier}")
        if spare and spare.get("tier") != expected_equipment_tier:
            errors.append(f"{mission_id}: recommended spare tier must be {expected_equipment_tier}")
        if mission.get("rewardEquipmentTier") != expected_reward_tier_by_order.get(mission["order"]):
            errors.append(f"{mission_id}: invalid equipment reward milestone")
        if mission["recommendedVesselId"] not in indexes["vessels"]:
            errors.append(f"{mission_id}: missing vessel {mission['recommendedVesselId']}")
        unlock_requires = mission.get("unlockRequires")
        if unlock_requires and unlock_requires not in indexes["missions"]:
            errors.append(f"{mission_id}: missing prerequisite mission {unlock_requires}")
        if sum(1 for option in mission["diagnosisOptions"] if option["correct"]) != 1:
            errors.append(f"{mission_id}: must have exactly one correct diagnosis option")
        branch_deck = mission.get("branchEventDeck", [])
        if len(branch_deck) != 3:
            errors.append(f"{mission_id}: branchEventDeck must contain exactly three triggers")
        rounds = [trigger.get("round") for trigger in branch_deck]
        if any(not isinstance(round_value, int) or round_value < 1 for round_value in rounds) or rounds != sorted(set(rounds)):
            errors.append(f"{mission_id}: branch trigger rounds must be positive, unique and ascending")
        for trigger in branch_deck:
            if trigger.get("eventCode") not in valid_branch_codes:
                errors.append(f"{mission_id}: invalid branch event code {trigger.get('eventCode')}")
            intensity = trigger.get("intensity")
            if not isinstance(intensity, (int, float)) or not 0.5 <= intensity <= 2.0:
                errors.append(f"{mission_id}: branch intensity must be between 0.5 and 2.0")

        profile = mission.get("operationProfile")
        if not isinstance(profile, dict):
            errors.append(f"{mission_id}: missing operationProfile")
            continue
        required_text = (
            "siteCode", "siteNameZh", "siteNameEn", "weatherZh", "weatherEn",
            "workPermitCode", "workPermitZh", "workPermitEn",
            "accessRequirementZh", "accessRequirementEn",
        )
        if any(not isinstance(profile.get(field), str) or not profile[field].strip() for field in required_text):
            errors.append(f"{mission_id}: operationProfile bilingual text must be non-empty")
        site_code = profile.get("siteCode")
        if site_code in mission_site_codes:
            errors.append(f"{mission_id}: duplicate siteCode {site_code}")
        mission_site_codes.add(site_code)
        sea_state = profile.get("seaState")
        if not isinstance(sea_state, int) or not 1 <= sea_state <= 5:
            errors.append(f"{mission_id}: seaState must be an integer between 1 and 5")
        if not str(profile.get("workPermitCode", "")).startswith("PTW-"):
            errors.append(f"{mission_id}: workPermitCode must start with PTW-")
        if profile.get("minimumMasteryLevel") != expected_mastery_by_chapter.get(mission["chapter"]):
            errors.append(f"{mission_id}: minimumMasteryLevel does not match chapter progression")
        qualified_members = profile.get("minimumQualifiedMembers")
        if not isinstance(qualified_members, int) or not 1 <= qualified_members <= 3:
            errors.append(f"{mission_id}: minimumQualifiedMembers must be between 1 and 3")
        ppe_zh = profile.get("requiredPpeZh", [])
        ppe_en = profile.get("requiredPpeEn", [])
        if not ppe_zh or len(ppe_zh) != len(ppe_en):
            errors.append(f"{mission_id}: bilingual PPE lists must be non-empty and aligned")
        allowed_vessels = profile.get("allowedVesselClasses", [])
        if not allowed_vessels or any(item not in valid_vessel_classes for item in allowed_vessels):
            errors.append(f"{mission_id}: allowedVesselClasses contains an invalid class")
        recommended_vessel = vessels.get(mission["recommendedVesselId"])
        if recommended_vessel and recommended_vessel.get("class") not in allowed_vessels:
            errors.append(f"{mission_id}: recommended vessel is not allowed by operationProfile")
        weather_window = profile.get("initialWeatherWindow")
        if not isinstance(weather_window, (int, float)) or not 1 <= weather_window <= 100:
            errors.append(f"{mission_id}: initialWeatherWindow must be between 1 and 100")
        mobilization_cost = profile.get("mobilizationCost")
        if not isinstance(mobilization_cost, (int, float)) or mobilization_cost < 0:
            errors.append(f"{mission_id}: mobilizationCost must be non-negative")
        if profile.get("gameplayAbstraction") is not True:
            errors.append(f"{mission_id}: operationProfile must be marked as gameplay abstraction")

    missing_mission_scene_assets = sorted(mission_scene_ids - set(scene_asset_items))
    if missing_mission_scene_assets:
        errors.append(f"sceneAssets: Campaign mission Scenes require direct assets {missing_mission_scene_assets}")

    for turbine in data["turbines"]:
        turbine_id = turbine["id"]
        if not re.fullmatch(r"WTG-OWM-\d{3}", turbine_id):
            errors.append(f"{turbine_id}: turbine ID must match WTG-OWM-NNN")
        required_text = ("nameZh", "nameEn", "zone")
        if any(not isinstance(turbine.get(field), str) or not turbine[field].strip() for field in required_text):
            errors.append(f"{turbine_id}: bilingual names and zone must be non-empty")
        if not isinstance(turbine.get("ratedPowerMw"), (int, float)) or turbine["ratedPowerMw"] <= 0:
            errors.append(f"{turbine_id}: ratedPowerMw must be positive")
        reliability = turbine.get("initialReliability")
        if not isinstance(reliability, int) or not 0 <= reliability <= 100:
            errors.append(f"{turbine_id}: initialReliability must be an integer between 0 and 100")
        open_faults = turbine.get("initialOpenFaults")
        if not isinstance(open_faults, int) or not 0 <= open_faults <= 9:
            errors.append(f"{turbine_id}: initialOpenFaults must be an integer between 0 and 9")
        if turbine_mission_counts[turbine_id] < 2:
            errors.append(f"{turbine_id}: at least two Campaign missions must be assigned")

    # Campaign 是單一路徑教學進程；驗證完整鏈可避免新增關卡後出現跳關或孤兒節點。
    ordered_missions = sorted(data["missions"], key=lambda mission: mission["order"])
    expected_orders = list(range(1, len(ordered_missions) + 1))
    if [mission["order"] for mission in ordered_missions] != expected_orders:
        errors.append(f"missions: order must be contiguous {expected_orders}")
    for index, mission in enumerate(ordered_missions):
        expected_prerequisite = None if index == 0 else ordered_missions[index - 1]["id"]
        if mission.get("unlockRequires") != expected_prerequisite:
            errors.append(f"{mission['id']}: prerequisite must be {expected_prerequisite}")

    expected_chapter_counts = {chapter: 3 for chapter in range(1, 6)}
    chapter_counts = dict(Counter(mission["chapter"] for mission in ordered_missions))
    if chapter_counts != expected_chapter_counts:
        errors.append(f"missions: expected five chapters with three missions each, actual {chapter_counts}")

    bosses = {row["id"]: row for row in data["bosses"]}
    chapter_five = [mission for mission in ordered_missions if mission["chapter"] == 5]
    for mission in chapter_five:
        boss = bosses.get(mission["bossId"])
        if boss and boss.get("severity") != "S5":
            errors.append(f"{mission['id']}: Chapter 05 boss must be S5")
        intensities = [trigger["intensity"] for trigger in mission.get("branchEventDeck", [])]
        if intensities and min(intensities) < 1.35:
            errors.append(f"{mission['id']}: Chapter 05 branch intensity must start at 1.35 or higher")
    if chapter_five and max(trigger["intensity"] for mission in chapter_five for trigger in mission["branchEventDeck"]) != 2.0:
        errors.append("missions: Chapter 05 final event deck must reach intensity 2.0")

    required_codex_text = {
        "titleZh", "titleEn", "summaryZh", "summaryEn",
        "safetyNoteZh", "safetyNoteEn", "sourceNoteZh", "sourceNoteEn",
    }
    for entry in data["codexEntries"]:
        entry_id = entry["id"]
        if entry["unlockMissionId"] not in indexes["missions"]:
            errors.append(f"{entry_id}: missing unlock mission {entry['unlockMissionId']}")
        if any(not isinstance(entry.get(field), str) or not entry[field].strip() for field in required_codex_text):
            errors.append(f"{entry_id}: required bilingual text is empty")
        points_zh = entry.get("keyPointsZh", [])
        points_en = entry.get("keyPointsEn", [])
        if not points_zh or len(points_zh) != len(points_en):
            errors.append(f"{entry_id}: bilingual key points must be non-empty and aligned")

    if {entry["unlockMissionId"] for entry in data["codexEntries"]} != indexes["missions"]:
        errors.append("codexEntries: every Campaign mission must unlock exactly one Codex entry")

    audit_items = audit.get("items", [])
    audit_ids = [item.get("bossId") for item in audit_items]
    if audit.get("schemaVersion") != 1 or audit.get("gatesPassed") is not True:
        errors.append("bossChallengeAudit: schema v1 with passed gates required")
    if len(audit_items) != len(data["bosses"]) or set(audit_ids) != indexes["bosses"]:
        errors.append("bossChallengeAudit: must contain exactly one result for every Boss")
    if audit.get("summary", {}).get("auditedBosses") != len(data["bosses"]) or audit.get("summary", {}).get("completedBosses") != len(data["bosses"]):
        errors.append("bossChallengeAudit: summary must prove 100/100 completion")
    if not set(audit.get("hardOutlierBossIds", [])).issubset(indexes["bosses"]):
        errors.append("bossChallengeAudit: hard outlier IDs must reference known Bosses")
    for item in audit_items:
        team_ids = item.get("recommendedTeamIds", [])
        if len(team_ids) != 3 or len(set(team_ids)) != 3 or not set(team_ids).issubset(indexes["characters"]):
            errors.append(f"{item.get('bossId', 'UNKNOWN')}: audit recommended team must contain three unique known characters")

    return errors


def main() -> int:
    project_root = Path(__file__).resolve().parents[1]
    source = project_root / "json"
    web_data = project_root / "public" / "data"

    errors = validate(source)
    for filename in ["manifest.json", *FILES.values(), AUDIT_FILE, SCENE_ASSET_FILE]:
        if (source / filename).read_bytes() != (web_data / filename).read_bytes():
            errors.append(f"Web public/data copy differs: {filename}")

    scene_assets = load_json(source / SCENE_ASSET_FILE)
    asset_paths = [scene_assets["fallback"]["file"], *[item["file"] for item in scene_assets["items"].values()]]
    for asset_path in sorted(set(asset_paths)):
        if not (project_root / "public" / asset_path.lstrip("/")).is_file():
            errors.append(f"Scene asset file missing: {asset_path}")

    if errors:
        print(f"OWM data validation failed with {len(errors)} error(s):")
        for error in errors:
            print(f"- {error}")
        return 1

    print("OWM data validation passed: counts, unique IDs, six stable Turbine IDs, 15 mission-to-turbine assignments, complete Boss Challenge audit snapshot, Scene asset routing/fallback files, 15 Campaign Scene direct assets, 15 operation profiles, readiness progression, 5x40 equipment tiers, four inventory reward milestones, prerequisite chain, five chapters, S5 final decks, mission/loadout/Codex foreign keys, skill links, prompt variants, and Web public/data sync.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
