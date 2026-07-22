import type {
  BossData,
  BossChallengeAuditData,
  CareerTrackData,
  CharacterData,
  CodexEntryData,
  EquipmentData,
  FactionData,
  GameDatabase,
  ManifestData,
  MissionData,
  SceneAssetIndexData,
  SceneData,
  SkillData,
  SourceArtIndexData,
  TurbineData,
  VesselData,
} from './types';

async function fetchJson<T>(fileName: string): Promise<T> {
  const response = await fetch(`/data/${fileName}`);
  if (!response.ok) {
    throw new Error(`資料檔載入失敗：${fileName} (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function fetchSourceArtIndex(): Promise<SourceArtIndexData> {
  const response = await fetch('/assets/source-art/p01/index.json');
  if (!response.ok) {
    throw new Error(`角色原畫索引載入失敗 (${response.status})`);
  }
  return response.json() as Promise<SourceArtIndexData>;
}

async function fetchShinkaiArtIndex(): Promise<SourceArtIndexData | undefined> {
  try {
    const response = await fetch('/assets/source-art/v2-shinkai/index.json');
    if (!response.ok) return undefined;
    return (await response.json()) as SourceArtIndexData;
  } catch {
    return undefined;
  }
}

export async function loadGameDatabase(): Promise<GameDatabase> {
  const [manifest, factions, careerTracks, characters, skills, equipment, bosses, bossChallengeAudit, scenes, sceneAssets, missions, turbines, codex, vessels, sourceArtIndex, shinkaiArtIndex] = await Promise.all([
    fetchJson<ManifestData>('manifest.json'),
    fetchJson<FactionData[]>('factions.json'),
    fetchJson<CareerTrackData[]>('tracks.json'),
    fetchJson<CharacterData[]>('characters.json'),
    fetchJson<SkillData[]>('skills.json'),
    fetchJson<EquipmentData[]>('equipment.json'),
    fetchJson<BossData[]>('bosses.json'),
    fetchJson<BossChallengeAuditData>('bossChallengeAudit.json'),
    fetchJson<SceneData[]>('scenes.json'),
    fetchJson<SceneAssetIndexData>('sceneAssets.json'),
    fetchJson<MissionData[]>('missions.json'),
    fetchJson<TurbineData[]>('turbines.json'),
    fetchJson<CodexEntryData[]>('codex.json'),
    fetchJson<VesselData[]>('vessels.json'),
    fetchSourceArtIndex(),
    fetchShinkaiArtIndex(),
  ]);

  const database: GameDatabase = {
    manifest,
    factions,
    careerTracks,
    characters,
    skills,
    equipment,
    bosses,
    bossChallengeAudit,
    scenes,
    sceneAssets,
    missions,
    turbines,
    codex,
    vessels,
    sourceArtIndex,
    shinkaiArtIndex,
    factionById: new Map(factions.map((item) => [item.code, item])),
    careerTrackById: new Map(careerTracks.map((item) => [item.id, item])),
    characterById: new Map(characters.map((item) => [item.id, item])),
    skillById: new Map(skills.map((item) => [item.id, item])),
    equipmentById: new Map(equipment.map((item) => [item.id, item])),
    bossById: new Map(bosses.map((item) => [item.id, item])),
    bossChallengeAuditById: new Map(bossChallengeAudit.items.map((item) => [item.bossId, item])),
    sceneById: new Map(scenes.map((item) => [item.id, item])),
    missionById: new Map(missions.map((item) => [item.id, item])),
    turbineById: new Map(turbines.map((item) => [item.id, item])),
    codexById: new Map(codex.map((item) => [item.id, item])),
    vesselById: new Map(vessels.map((item) => [item.id, item])),
  };

  validateBrowserDatabase(database);
  return database;
}

export function validateBrowserDatabase(database: GameDatabase): void {
  const { counts } = database.manifest;
  const countChecks: Array<[string, number, number]> = [
    ['factions', counts.factions, database.factions.length],
    ['careerTracks', counts.careerTracks, database.careerTracks.length],
    ['characters', counts.characters, database.characters.length],
    ['skills', counts.skills, database.skills.length],
    ['equipment', counts.equipment, database.equipment.length],
    ['bosses', counts.bosses, database.bosses.length],
    ['scenes', counts.scenes, database.scenes.length],
    ['missions', counts.missions, database.missions.length],
    ['turbines', counts.turbines, database.turbines.length],
    ['codexEntries', counts.codexEntries, database.codex.length],
    ['vessels', counts.vessels, database.vessels.length],
  ];

  for (const [label, expected, actual] of countChecks) {
    if (expected !== actual) {
      throw new Error(`${label} 筆數不符：預期 ${expected}，實際 ${actual}`);
    }
  }

  for (const character of database.characters) {
    if (!database.careerTrackById.has(character.trackId)) {
      throw new Error(`${character.id} Career Track 外鍵失效：${character.trackId}`);
    }
    if (!database.factionById.has(character.factionCode)) {
      throw new Error(`${character.id} 陣營外鍵失效：${character.factionCode}`);
    }
    for (const skillId of characterSkillIds(character)) {
      if (!database.skillById.has(skillId)) {
        throw new Error(`${character.id} 技能外鍵失效：${skillId}`);
      }
    }
  }

  for (const track of database.careerTracks) {
    const members = database.characters.filter((character) => character.trackId === track.id);
    if (members.length !== 5 || new Set(members.map((character) => character.levelCode)).size !== 5) {
      throw new Error(`${track.id} 必須恰有 L1–L5 五名角色`);
    }
  }

  const equipmentTierCounts = new Map<string, number>();
  for (const item of database.equipment) equipmentTierCounts.set(item.tier, (equipmentTierCounts.get(item.tier) ?? 0) + 1);
  for (const tier of ['L1', 'L2', 'L3', 'L4', 'L5']) {
    if (equipmentTierCounts.get(tier) !== 40) throw new Error(`Equipment ${tier} 必須恰有 40 項`);
  }

  const sourceArtEntries = Object.entries(database.sourceArtIndex.items);
  if (database.sourceArtIndex.total !== sourceArtEntries.length) {
    throw new Error(`角色原畫索引筆數不符：預期 ${database.sourceArtIndex.total}，實際 ${sourceArtEntries.length}`);
  }
  for (const [characterId, art] of sourceArtEntries) {
    if (!database.characterById.has(characterId) || art.characterId !== characterId) {
      throw new Error(`角色原畫索引外鍵失效：${characterId}`);
    }
  }

  const sceneAssets = database.sceneAssets;
  if (sceneAssets.schemaVersion !== 1 || !database.sceneById.has(sceneAssets.fallback.sourceSceneId)) {
    throw new Error('Scene asset index 必須使用 schema v1 並指定有效 fallback Scene');
  }
  if (!sceneAssets.fallback.file.startsWith('/') || !/^v\d{3}$/.test(sceneAssets.fallback.version)) {
    throw new Error('Scene fallback asset 必須使用絕對 Web path 與 vNNN 版本');
  }
  for (const [sceneId, asset] of Object.entries(sceneAssets.items)) {
    if (asset.sceneId !== sceneId || !database.sceneById.has(sceneId)) {
      throw new Error(`Scene asset index 外鍵失效：${sceneId}`);
    }
    if (!asset.file.startsWith('/') || !/^v\d{3}$/.test(asset.version)) {
      throw new Error(`${sceneId} Scene asset 必須使用絕對 Web path 與 vNNN 版本`);
    }
  }

  const audit = database.bossChallengeAudit;
  const auditedBossIds = audit.items.map((item) => item.bossId);
  if (audit.schemaVersion !== 1 || !audit.gatesPassed || audit.summary.auditedBosses !== database.bosses.length || audit.items.length !== database.bosses.length) {
    throw new Error('Boss Challenge audit 必須為通過 gates 的完整 100 Boss snapshot');
  }
  if (new Set(auditedBossIds).size !== database.bosses.length || auditedBossIds.some((id) => !database.bossById.has(id))) {
    throw new Error('Boss Challenge audit Boss IDs 不完整或含未知資料');
  }
  if (audit.hardOutlierBossIds.some((id) => !database.bossChallengeAuditById.has(id))) {
    throw new Error('Boss Challenge audit hard outlier ID 無對應結果');
  }
  for (const item of audit.items) {
    if (item.recommendedTeamIds.length !== 3 || new Set(item.recommendedTeamIds).size !== 3 || item.recommendedTeamIds.some((id) => !database.characterById.has(id))) {
      throw new Error(`${item.bossId} Challenge audit 推薦隊伍必須是三名已知且唯一角色`);
    }
  }

  const missionSiteCodes = new Set<string>();
  const turbineMissionCounts = new Map(database.turbines.map((turbine) => [turbine.id, 0]));
  const expectedMasteryByChapter = new Map([[1, 1], [2, 1], [3, 2], [4, 3], [5, 4]]);
  const expectedEquipmentTierByChapter = new Map([[1, 'L1'], [2, 'L2'], [3, 'L3'], [4, 'L4'], [5, 'L4']]);
  const expectedRewardTierByOrder = new Map([[3, 'L2'], [6, 'L3'], [9, 'L4'], [12, 'L5']]);
  const validVesselClasses = new Set(['CTV', 'SOV', 'USV']);
  for (const mission of database.missions) {
    const equipment = database.equipmentById.get(mission.recommendedEquipmentId);
    const spare = database.equipmentById.get(mission.recommendedSpareId);
    const recommendedVessel = database.vesselById.get(mission.recommendedVesselId);
    if (!database.bossById.has(mission.bossId)) throw new Error(`${mission.id} Boss 外鍵失效：${mission.bossId}`);
    if (!database.sceneById.has(mission.sceneId)) throw new Error(`${mission.id} Scene 外鍵失效：${mission.sceneId}`);
    if (!database.turbineById.has(mission.turbineId)) throw new Error(`${mission.id} Turbine 外鍵失效：${mission.turbineId}`);
    turbineMissionCounts.set(mission.turbineId, (turbineMissionCounts.get(mission.turbineId) ?? 0) + 1);
    if (!equipment) throw new Error(`${mission.id} 裝備外鍵失效：${mission.recommendedEquipmentId}`);
    if (!spare || spare.category !== 'SPARES') throw new Error(`${mission.id} 備品外鍵失效：${mission.recommendedSpareId}`);
    if (equipment.tier !== expectedEquipmentTierByChapter.get(mission.chapter) || spare.tier !== expectedEquipmentTierByChapter.get(mission.chapter)) throw new Error(`${mission.id} 推薦裝備 Tier 與 Chapter progression 不一致`);
    if (mission.rewardEquipmentTier !== (expectedRewardTierByOrder.get(mission.order) ?? null)) throw new Error(`${mission.id} Equipment reward milestone 不正確`);
    if (!recommendedVessel) throw new Error(`${mission.id} 船舶外鍵失效：${mission.recommendedVesselId}`);
    if (mission.unlockRequires && !database.missionById.has(mission.unlockRequires)) throw new Error(`${mission.id} 解鎖外鍵失效：${mission.unlockRequires}`);
    if (mission.diagnosisOptions.filter((option) => option.correct).length !== 1) throw new Error(`${mission.id} 必須有且僅有一個正確診斷選項`);
    const validBranchCodes = new Set(['WEATHER_ESCALATION', 'SPARE_DELAY', 'SECONDARY_FAULT', 'COMMS_OUTAGE', 'FALSE_ALARM']);
    const rounds = mission.branchEventDeck.map((trigger) => trigger.round);
    if (mission.branchEventDeck.length !== 3) throw new Error(`${mission.id} 必須定義三個 branch event trigger`);
    if (new Set(rounds).size !== rounds.length || rounds.some((round, index) => round < 1 || (index > 0 && round <= rounds[index - 1]))) {
      throw new Error(`${mission.id} branch event 回合必須為正整數且嚴格遞增`);
    }
    for (const trigger of mission.branchEventDeck) {
      if (!validBranchCodes.has(trigger.eventCode)) throw new Error(`${mission.id} branch event code 無效：${trigger.eventCode}`);
      if (!Number.isFinite(trigger.intensity) || trigger.intensity < 0.5 || trigger.intensity > 2) throw new Error(`${mission.id} branch intensity 必須介於 0.5–2.0`);
    }

    const profile = mission.operationProfile;
    if (!profile) throw new Error(`${mission.id} 缺少 Operation Profile`);
    const requiredText = [profile.siteCode, profile.siteNameZh, profile.siteNameEn, profile.weatherZh, profile.weatherEn, profile.workPermitCode, profile.workPermitZh, profile.workPermitEn, profile.accessRequirementZh, profile.accessRequirementEn];
    if (requiredText.some((value) => typeof value !== 'string' || value.trim().length === 0)) throw new Error(`${mission.id} Operation Profile 雙語文字不可空白`);
    if (missionSiteCodes.has(profile.siteCode)) throw new Error(`${mission.id} Site Code 重複：${profile.siteCode}`);
    missionSiteCodes.add(profile.siteCode);
    if (!Number.isInteger(profile.seaState) || profile.seaState < 1 || profile.seaState > 5) throw new Error(`${mission.id} Sea State 必須介於 1–5`);
    if (!profile.workPermitCode.startsWith('PTW-')) throw new Error(`${mission.id} Work Permit Code 必須以 PTW- 開頭`);
    if (profile.minimumMasteryLevel !== expectedMasteryByChapter.get(mission.chapter)) throw new Error(`${mission.id} Mastery 門檻與 Chapter progression 不一致`);
    if (!Number.isInteger(profile.minimumQualifiedMembers) || profile.minimumQualifiedMembers < 1 || profile.minimumQualifiedMembers > 3) throw new Error(`${mission.id} 合格技師人數必須介於 1–3`);
    if (profile.requiredPpeZh.length === 0 || profile.requiredPpeZh.length !== profile.requiredPpeEn.length) throw new Error(`${mission.id} PPE 中英文項目必須非空且一一對應`);
    if (profile.allowedVesselClasses.length === 0 || profile.allowedVesselClasses.some((value) => !validVesselClasses.has(value))) throw new Error(`${mission.id} 允許船舶類別無效`);
    if (!profile.allowedVesselClasses.includes(recommendedVessel.class)) throw new Error(`${mission.id} 建議船舶不符合 Operation Profile`);
    if (!Number.isFinite(profile.initialWeatherWindow) || profile.initialWeatherWindow < 1 || profile.initialWeatherWindow > 100) throw new Error(`${mission.id} 初始天候窗口必須介於 1–100`);
    if (!Number.isFinite(profile.mobilizationCost) || profile.mobilizationCost < 0) throw new Error(`${mission.id} 動員成本不可為負值`);
    if (profile.gameplayAbstraction !== true) throw new Error(`${mission.id} Operation Profile 必須標記為 gameplay abstraction`);
  }

  for (const turbine of database.turbines) {
    if (!/^WTG-OWM-\d{3}$/.test(turbine.id)) throw new Error(`${turbine.id} Turbine ID 必須符合 WTG-OWM-NNN`);
    if (!turbine.zone || turbine.ratedPowerMw <= 0 || turbine.initialReliability < 0 || turbine.initialReliability > 100 || turbine.initialOpenFaults < 0) {
      throw new Error(`${turbine.id} Turbine 初始狀態無效`);
    }
    if ((turbineMissionCounts.get(turbine.id) ?? 0) < 2) throw new Error(`${turbine.id} 至少需要指派 2 個 Campaign Missions`);
  }

  const orderedMissions = [...database.missions].sort((left, right) => left.order - right.order);
  orderedMissions.forEach((mission, index) => {
    if (mission.order !== index + 1) throw new Error(`${mission.id} Campaign order 必須連續`);
    const prerequisite = index === 0 ? null : orderedMissions[index - 1].id;
    if (mission.unlockRequires !== prerequisite) throw new Error(`${mission.id} 前置任務必須為 ${prerequisite ?? 'null'}`);
  });
  const chapterFive = orderedMissions.filter((mission) => mission.chapter === 5);
  if (chapterFive.length !== 3) throw new Error('Chapter 05 必須包含三個終局任務');
  for (const mission of chapterFive) {
    if (database.bossById.get(mission.bossId)?.severity !== 'S5') throw new Error(`${mission.id} 必須使用 S5 Boss`);
    if (Math.min(...mission.branchEventDeck.map((trigger) => trigger.intensity)) < 1.35) throw new Error(`${mission.id} 終局事件強度不足`);
  }

  if (database.codexById.size !== database.codex.length) {
    throw new Error('Knowledge Codex ID 不可重複');
  }
  for (const entry of database.codex) {
    if (!database.missionById.has(entry.unlockMissionId)) {
      throw new Error(`${entry.id} 解鎖任務外鍵失效：${entry.unlockMissionId}`);
    }
    if (entry.keyPointsZh.length === 0 || entry.keyPointsZh.length !== entry.keyPointsEn.length) {
      throw new Error(`${entry.id} 中英文知識重點數量不一致`);
    }
  }
  if (new Set(database.codex.map((entry) => entry.unlockMissionId)).size !== database.missions.length) {
    throw new Error('每個 Campaign Mission 必須對應一筆 Knowledge Codex');
  }
}

export function characterSkillIds(character: CharacterData): string[] {
  return [
    character.passiveSkillId,
    character.skill1Id,
    character.skill2Id,
    character.ultimateSkillId,
  ];
}
