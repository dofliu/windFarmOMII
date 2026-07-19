import type { MissionDebrief, MissionState } from './runtime';
import type { CharacterData, CodexEntryData, DiagnosisOptionData, EquipmentData, EquipmentTier, MissionData, TurbineData, VesselData } from './types';
import { careerTrackRewardUpdates, type CareerTrackRewardUpdate } from './careerTrack.ts';
import { FIVE_LEVEL_XP_THRESHOLDS } from './progression.ts';
import { createInitialWindFarm, normalizeWindFarmState, performFleetMaintenancePlan, performTurbineMaintenance, settleWindFarmMission, type FleetConditionDispatchProjection, type FleetConditionPressure, type FleetMaintenancePlanSettlement, type TurbineAvailability, type TurbineMaintenanceSettlement, type TurbineMissionUpdate, type WindFarmState, type WindFarmSummary } from './windFarm.ts';

export const CAMPAIGN_STORAGE_KEY = 'owm.campaign.v5';
export const LEGACY_CAMPAIGN_STORAGE_KEYS = ['owm.campaign.v4', 'owm.campaign.v3', 'owm.campaign.v2', 'owm.campaign.v1'] as const;
export const CAMPAIGN_SAVE_FORMAT = 'OWM_CAMPAIGN_SAVE';
export const MAX_EQUIPMENT_CONDITION = 100;
export const MIN_SERVICEABLE_CONDITION = 25;
export const INITIAL_MAINTENANCE_CREDITS = 80;
export const INITIAL_REST_TOKENS = 3;
export const MAX_FLEET_OPERATION_HISTORY = 30;

export type FleetOperationHistoryKind = 'DISPATCH' | 'MISSION' | 'MAINTENANCE' | 'MAINTENANCE_PLAN';
export type FleetOperationOutcome = 'CLEAR' | 'FAILED';

export interface FleetOperationHistoryRecord {
  id: string;
  sequence: number;
  kind: FleetOperationHistoryKind;
  missionId?: string;
  turbineId?: string;
  turbineIds?: string[];
  pressure?: FleetConditionPressure;
  outcome?: FleetOperationOutcome;
  score?: number;
  grade?: CampaignGrade;
  actionCount?: number;
  creditsBefore?: number;
  creditsAfter?: number;
  creditsDelta?: number;
  costBefore?: number;
  costAfter?: number;
  safetyBefore?: number;
  safetyAfter?: number;
  reliabilityBefore?: number;
  reliabilityAfter?: number;
  backlogBefore?: number;
  backlogAfter?: number;
  availabilityBefore?: TurbineAvailability;
  availabilityAfter?: TurbineAvailability;
  fleetBefore?: WindFarmSummary;
  fleetAfter?: WindFarmSummary;
}

export interface CampaignProgress {
  schemaVersion: 5;
  totalXp: number;
  completedMissionIds: string[];
  unlockedMissionIds: string[];
  bestScores: Record<string, number>;
  characterXp: Record<string, number>;
  ownedEquipmentIds: string[];
  maintenanceCredits: number;
  equipmentCondition: Record<string, number>;
  recoveryTokens: number;
  crewFatigue: Record<string, number>;
  windFarm: WindFarmState;
  fleetOperationsHistory: FleetOperationHistoryRecord[];
}

export interface CampaignSaveEnvelope {
  format: typeof CAMPAIGN_SAVE_FORMAT;
  schemaVersion: 5;
  exportedAt: string;
  progress: CampaignProgress;
}

export type CampaignSaveImportResult =
  | { ok: true; progress: CampaignProgress; migratedLegacy: boolean }
  | { ok: false; error: 'INVALID_JSON' | 'INVALID_FORMAT' | 'UNSUPPORTED_VERSION' };

export interface CampaignReward {
  earnedXp: number;
  currentScore: number;
  currentGrade: CampaignGrade;
  previousBestScore?: number;
  bestScoreAfter: number;
  bestGradeAfter: CampaignGrade;
  scoreRecordStatus: 'FIRST_BEST' | 'NEW_BEST' | 'BEST_HELD';
  maintenanceCreditsEarned: number;
  equipmentWear: EquipmentWearResult[];
  recoveryTokensEarned: number;
  crewFatigueUpdates: CrewFatigueUpdate[];
  newlyUnlockedMissionId?: string;
  newlyUnlockedEquipmentTier?: EquipmentTier;
  newlyUnlockedEquipmentIds: string[];
  trackProgressUpdates: CareerTrackRewardUpdate[];
  newlyUnlockedCharacterIds: string[];
  campaignCompleted: boolean;
  windFarmUpdate?: TurbineMissionUpdate;
}

export type CrewReadinessBand = 'Stable' | 'Tired' | 'Critical' | 'Exhausted';

export interface CrewFatigueUpdate {
  characterId: string;
  source: 'deployed' | 'reserve';
  before: number;
  missionEnd?: number;
  recovery: number;
  after: number;
}

export interface CrewRestQuote {
  characterId: string;
  before: number;
  recovery: number;
  after: number;
  tokenCost: 1;
  canRest: boolean;
}

export interface EquipmentWearResult {
  equipmentId: string;
  slot: 'equipment' | 'spare';
  before: number;
  wear: number;
  after: number;
}

export interface EquipmentRepairQuote {
  equipmentId: string;
  condition: number;
  missingCondition: number;
  cost: number;
  serviceable: boolean;
  canAfford: boolean;
  needsRepair: boolean;
}

export type CampaignMissionStatus = 'completed' | 'available' | 'locked';
export type CampaignGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface CampaignCompletionSummary {
  complete: boolean;
  completedMissions: number;
  totalMissions: number;
  completedChapters: number;
  totalChapters: number;
  averageBestScore: number;
  scoredMissions: number;
  campaignGrade: CampaignGrade | null;
  sGradeCount: number;
  masteredCharacterCount: number;
}

export interface CampaignContinueTargets {
  currentMission?: MissionData;
  nextAvailableMission?: MissionData;
  availableMissionCount: number;
  campaignComplete: boolean;
}

export interface LoadoutEvaluation {
  matchedChoices: number;
  evidenceBonus: number;
  reliabilityBonus: number;
  initialCost: number;
  equipmentMatch: boolean;
  spareMatch: boolean;
  vesselMatch: boolean;
}

export interface OperationPlanningConfirmations {
  permit: boolean;
  ppe: boolean;
  access: boolean;
}

export interface OperationReadinessEvaluation {
  ready: boolean;
  matchedChecks: number;
  totalChecks: 5;
  permitReady: boolean;
  ppeReady: boolean;
  accessReady: boolean;
  vesselReady: boolean;
  masteryReady: boolean;
  qualifiedMembers: number;
  requiredQualifiedMembers: number;
  initialWeatherWindow: number;
  mobilizationCost: number;
}

export interface DiagnosisResolution {
  mission: MissionState;
  correct: boolean;
  evidenceDelta: number;
  safetyDelta: number;
}

export interface CharacterMastery {
  level: number;
  xp: number;
  currentThreshold: number;
  nextThreshold: number | null;
  progress: number;
  unlockedSkillSlots: number;
}

export interface MasteryPerkDefinition {
  id: 'SPECIALIST_READINESS' | 'VETERAN_GUARD';
  requiredLevel: 4 | 5;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
}

export interface MasteryPerkModifiers {
  startingEnergyBonus: number;
  fatigueProtection: number;
  evidenceBonus: number;
  reliabilityBonus: number;
  statuses: string[];
  unlockedPerkIds: MasteryPerkDefinition['id'][];
}

export interface TeamMasteryPerks {
  evidenceBonus: number;
  reliabilityBonus: number;
  unlockedPerkCount: number;
  byCharacterId: Record<string, MasteryPerkModifiers>;
}

export const MASTERY_THRESHOLDS = FIVE_LEVEL_XP_THRESHOLDS;
export const MASTERY_PERKS: readonly MasteryPerkDefinition[] = [
  {
    id: 'SPECIALIST_READINESS',
    requiredLevel: 4,
    titleZh: '專家整備',
    titleEn: 'Specialist Readiness',
    descriptionZh: '個人初始 Energy +2；團隊初始 Evidence +3。',
    descriptionEn: 'Personal starting Energy +2; team starting Evidence +3.',
  },
  {
    id: 'VETERAN_GUARD',
    requiredLevel: 5,
    titleZh: '資深防護',
    titleEn: 'Veteran Guard',
    descriptionZh: '個人每回合疲勞傷害 -2；團隊初始 Reliability +4。',
    descriptionEn: 'Personal round fatigue damage -2; team starting Reliability +4.',
  },
] as const;

export function createInitialCampaign(missions: MissionData[], equipment: EquipmentData[], turbines: TurbineData[] = []): CampaignProgress {
  return {
    schemaVersion: 5,
    totalXp: 0,
    completedMissionIds: [],
    unlockedMissionIds: missions.filter((mission) => !mission.unlockRequires).map((mission) => mission.id),
    bestScores: {},
    characterXp: {},
    ownedEquipmentIds: equipment.filter((item) => item.tier === 'L1').map((item) => item.id),
    maintenanceCredits: INITIAL_MAINTENANCE_CREDITS,
    // 只保存低於 100 的 condition，未列出的已持有裝備視為全新狀態，避免 save 無謂膨脹。
    equipmentCondition: {},
    recoveryTokens: INITIAL_REST_TOKENS,
    // 與 Equipment Condition 相同，僅保存大於 0 的角色疲勞，未列角色視為完整恢復。
    crewFatigue: {},
    windFarm: createInitialWindFarm(turbines),
    fleetOperationsHistory: [],
  };
}

export function isEquipmentOwned(progress: CampaignProgress, equipmentId: string): boolean {
  return progress.ownedEquipmentIds.includes(equipmentId);
}

export function campaignEquipmentCondition(progress: CampaignProgress, equipmentId: string): number {
  if (!isEquipmentOwned(progress, equipmentId)) return 0;
  return progress.equipmentCondition[equipmentId] ?? MAX_EQUIPMENT_CONDITION;
}

export function isEquipmentServiceable(progress: CampaignProgress, equipmentId: string): boolean {
  return isEquipmentOwned(progress, equipmentId)
    && campaignEquipmentCondition(progress, equipmentId) >= MIN_SERVICEABLE_CONDITION;
}

export function equipmentRepairQuote(progress: CampaignProgress, equipment: EquipmentData): EquipmentRepairQuote {
  const condition = campaignEquipmentCondition(progress, equipment.id);
  const missingCondition = isEquipmentOwned(progress, equipment.id)
    ? MAX_EQUIPMENT_CONDITION - condition
    : MAX_EQUIPMENT_CONDITION;
  const cost = Math.ceil((missingCondition * equipmentTierRank(equipment.tier)) / 2);
  return {
    equipmentId: equipment.id,
    condition,
    missingCondition,
    cost,
    serviceable: isEquipmentServiceable(progress, equipment.id),
    canAfford: isEquipmentOwned(progress, equipment.id) && progress.maintenanceCredits >= cost,
    needsRepair: isEquipmentOwned(progress, equipment.id) && missingCondition > 0,
  };
}

export function repairCampaignEquipment(
  progress: CampaignProgress,
  equipment: EquipmentData,
): { progress: CampaignProgress; cost: number } | null {
  const quote = equipmentRepairQuote(progress, equipment);
  if (!quote.needsRepair || !quote.canAfford) return null;
  const equipmentCondition = { ...progress.equipmentCondition };
  delete equipmentCondition[equipment.id];
  return {
    progress: {
      ...progress,
      maintenanceCredits: progress.maintenanceCredits - quote.cost,
      equipmentCondition,
    },
    cost: quote.cost,
  };
}

export function maintainCampaignTurbine(
  progress: CampaignProgress,
  turbineId: string,
): { progress: CampaignProgress; settlement: TurbineMaintenanceSettlement } | null {
  const result = performTurbineMaintenance(progress.windFarm, turbineId, progress.maintenanceCredits);
  if (!result) return null;
  return {
    progress: {
      ...appendFleetOperationHistory(progress, fleetMaintenanceHistoryRecord(result.settlement)),
      maintenanceCredits: result.settlement.afterCredits,
      windFarm: result.state,
    },
    settlement: result.settlement,
  };
}

export function maintainCampaignTurbinePlan(
  progress: CampaignProgress,
  turbineIds: string[],
): { progress: CampaignProgress; settlement: FleetMaintenancePlanSettlement } | null {
  const result = performFleetMaintenancePlan(progress.windFarm, turbineIds, progress.maintenanceCredits);
  if (!result) return null;
  return {
    progress: {
      ...appendFleetOperationHistory(progress, fleetMaintenancePlanHistoryRecord(result.settlement)),
      maintenanceCredits: result.settlement.afterCredits,
      windFarm: result.state,
    },
    settlement: result.settlement,
  };
}

export function recordFleetConditionDispatch(
  progress: CampaignProgress,
  mission: MissionData,
  projection: FleetConditionDispatchProjection,
): CampaignProgress {
  return appendFleetOperationHistory(progress, {
    kind: 'DISPATCH',
    missionId: mission.id,
    turbineId: projection.modifier.turbineId,
    pressure: projection.modifier.pressure,
    creditsBefore: undefined,
    creditsAfter: undefined,
    costBefore: projection.mobilizationCostBefore,
    costAfter: projection.mobilizationCostAfter,
    safetyBefore: projection.safetyBefore,
    safetyAfter: projection.safetyAfter,
    reliabilityBefore: projection.reliabilityBefore,
    reliabilityAfter: projection.reliabilityAfter,
    backlogBefore: projection.modifier.openFaults,
    backlogAfter: projection.modifier.openFaults,
    availabilityBefore: projection.modifier.availability,
    availabilityAfter: projection.modifier.availability,
  });
}

export function campaignCrewFatigue(progress: CampaignProgress, characterId: string): number {
  return progress.crewFatigue[characterId] ?? 0;
}

export function crewReadinessBandForFatigue(fatigue: number, fatigueMax: number): CrewReadinessBand {
  const ratio = fatigueMax <= 0 ? 0 : fatigue / fatigueMax;
  if (ratio >= 1) return 'Exhausted';
  if (ratio >= 0.7) return 'Critical';
  if (ratio >= 0.4) return 'Tired';
  return 'Stable';
}

export function crewReadinessBand(progress: CampaignProgress, character: CharacterData): CrewReadinessBand {
  // 所有 Deployment、Forecast 與輪班邏輯共用同一組門檻，避免同一疲勞值顯示不同狀態。
  return crewReadinessBandForFatigue(campaignCrewFatigue(progress, character.id), character.fatigueMax);
}

export function isCrewMemberDeployable(progress: CampaignProgress, character: CharacterData): boolean {
  return campaignCrewFatigue(progress, character.id) < character.fatigueMax;
}

export function crewRestQuote(progress: CampaignProgress, character: CharacterData): CrewRestQuote {
  const before = campaignCrewFatigue(progress, character.id);
  const recovery = Math.min(before, Math.max(20, Math.ceil(character.fatigueMax * 0.4)));
  return {
    characterId: character.id,
    before,
    recovery,
    after: Math.max(0, before - recovery),
    tokenCost: 1,
    canRest: before > 0 && progress.recoveryTokens >= 1,
  };
}

export function restCampaignCharacter(
  progress: CampaignProgress,
  character: CharacterData,
): { progress: CampaignProgress; recovered: number } | null {
  const quote = crewRestQuote(progress, character);
  if (!quote.canRest) return null;
  const crewFatigue = { ...progress.crewFatigue };
  if (quote.after > 0) crewFatigue[character.id] = quote.after;
  else delete crewFatigue[character.id];
  return {
    progress: {
      ...progress,
      recoveryTokens: progress.recoveryTokens - quote.tokenCost,
      crewFatigue,
    },
    recovered: quote.recovery,
  };
}

export function isCodexEntryUnlocked(entry: CodexEntryData, progress: CampaignProgress): boolean {
  return progress.completedMissionIds.includes(entry.unlockMissionId);
}

export function unlockedCodexEntries(entries: CodexEntryData[], progress: CampaignProgress): CodexEntryData[] {
  return entries.filter((entry) => isCodexEntryUnlocked(entry, progress));
}

export function campaignMissionStatus(mission: MissionData, progress: CampaignProgress): CampaignMissionStatus {
  if (progress.completedMissionIds.includes(mission.id)) return 'completed';
  return progress.unlockedMissionIds.includes(mission.id) ? 'available' : 'locked';
}

export function campaignContinueTargets(
  missions: MissionData[],
  progress: CampaignProgress,
  currentMissionId: string,
): CampaignContinueTargets {
  const orderedMissions = [...missions].sort((left, right) => left.order - right.order);
  const currentMission = orderedMissions.find((mission) => mission.id === currentMissionId);
  const availableMissions = orderedMissions.filter((mission) => campaignMissionStatus(mission, progress) === 'available');
  const nextAfterCurrent = currentMission
    ? availableMissions.find((mission) => mission.order > currentMission.order)
    : undefined;
  const nextAvailableMission = nextAfterCurrent
    ?? availableMissions.find((mission) => mission.id !== currentMissionId)
    ?? availableMissions[0];

  return {
    currentMission,
    nextAvailableMission,
    availableMissionCount: availableMissions.length,
    campaignComplete: orderedMissions.length > 0 && orderedMissions.every((mission) => progress.completedMissionIds.includes(mission.id)),
  };
}

export function campaignMissionGrade(missionId: string, progress: CampaignProgress): CampaignGrade | null {
  if (!progress.completedMissionIds.includes(missionId)) return null;
  const score = progress.bestScores[missionId];
  if (typeof score !== 'number') return null;
  return scoreGrade(score);
}

export function campaignCompletionSummary(progress: CampaignProgress, missions: MissionData[]): CampaignCompletionSummary {
  const completedIds = new Set(progress.completedMissionIds);
  const completedMissions = missions.filter((mission) => completedIds.has(mission.id));
  const chapters = [...new Set(missions.map((mission) => mission.chapter))];
  const completedChapters = chapters.filter((chapter) => {
    const chapterMissions = missions.filter((mission) => mission.chapter === chapter);
    return chapterMissions.length > 0 && chapterMissions.every((mission) => completedIds.has(mission.id));
  }).length;
  const scores = completedMissions
    .map((mission) => progress.bestScores[mission.id])
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));
  const averageBestScore = scores.length > 0
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : 0;
  const complete = missions.length > 0 && completedMissions.length === missions.length;

  return {
    complete,
    completedMissions: completedMissions.length,
    totalMissions: missions.length,
    completedChapters,
    totalChapters: chapters.length,
    averageBestScore,
    scoredMissions: scores.length,
    campaignGrade: complete && scores.length === missions.length ? scoreGrade(averageBestScore) : null,
    sGradeCount: scores.filter((score) => score >= 90).length,
    masteredCharacterCount: Object.values(progress.characterXp).filter((xp) => xp >= MASTERY_THRESHOLDS[4]).length,
  };
}

export function normalizeCampaignProgress(
  value: unknown,
  missions: MissionData[],
  equipment: EquipmentData[],
  characters: CharacterData[] = [],
  turbines: TurbineData[] = [],
): CampaignProgress {
  const initial = createInitialCampaign(missions, equipment, turbines);
  if (!value || typeof value !== 'object') return initial;
  const candidate = value as Partial<CampaignProgress>;
  const validIds = new Set(missions.map((mission) => mission.id));
  const completedMissionIds = uniqueStrings(candidate.completedMissionIds).filter((id) => validIds.has(id));
  const completedIds = new Set(completedMissionIds);
  const unlockedMissionIds = uniqueStrings([
    ...initial.unlockedMissionIds,
    ...completedMissionIds,
    ...uniqueStrings(candidate.unlockedMissionIds).filter((id) => validIds.has(id)),
    ...missions.filter((mission) => mission.unlockRequires && completedIds.has(mission.unlockRequires)).map((mission) => mission.id),
  ]);
  const validEquipmentIds = new Set(equipment.map((item) => item.id));
  const entitledTiers = new Set<EquipmentTier>([
    'L1',
    ...missions
      .filter((mission) => completedIds.has(mission.id) && mission.rewardEquipmentTier)
      .map((mission) => mission.rewardEquipmentTier as EquipmentTier),
  ]);
  const entitledEquipmentIds = equipment.filter((item) => entitledTiers.has(item.tier)).map((item) => item.id);
  const savedOwnedEquipmentIds = uniqueStrings(candidate.ownedEquipmentIds)
    .filter((id) => validEquipmentIds.has(id) && entitledEquipmentIds.includes(id));
  const ownedEquipmentIds = uniqueStrings([...initial.ownedEquipmentIds, ...entitledEquipmentIds, ...savedOwnedEquipmentIds]);

  return {
    schemaVersion: 5,
    totalXp: validNumber(candidate.totalXp),
    completedMissionIds,
    unlockedMissionIds,
    bestScores: validNumberRecord(candidate.bestScores, validIds),
    characterXp: validNumberRecord(candidate.characterXp),
    // Inventory 以完成紀錄重建 entitlement，舊存檔與被截斷的 v2 存檔都不會缺少下一章必需裝備。
    ownedEquipmentIds,
    // v1/v2 沒有維修資源；migration 時給予與新 Campaign 相同的初始整備額度，避免舊檔進入無法維修的死局。
    maintenanceCredits: typeof candidate.maintenanceCredits === 'number'
      ? validNumber(candidate.maintenanceCredits)
      : INITIAL_MAINTENANCE_CREDITS,
    equipmentCondition: validEquipmentConditionRecord(candidate.equipmentCondition, new Set(ownedEquipmentIds)),
    recoveryTokens: typeof candidate.recoveryTokens === 'number'
      ? validNumber(candidate.recoveryTokens)
      : INITIAL_REST_TOKENS,
    crewFatigue: validCrewFatigueRecord(candidate.crewFatigue, characters),
    windFarm: normalizeWindFarmState(candidate.windFarm, turbines),
    fleetOperationsHistory: validFleetOperationHistoryRecord(
      candidate.fleetOperationsHistory,
      validIds,
      new Set(turbines.map((turbine) => turbine.id)),
    ),
  };
}

export function loadCampaignProgress(missions: MissionData[], equipment: EquipmentData[], characters: CharacterData[] = [], turbines: TurbineData[] = []): CampaignProgress {
  if (typeof localStorage === 'undefined') return createInitialCampaign(missions, equipment, turbines);
  for (const key of [CAMPAIGN_STORAGE_KEY, ...LEGACY_CAMPAIGN_STORAGE_KEYS]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const progress = normalizeCampaignProgress(JSON.parse(raw), missions, equipment, characters, turbines);
      if (key !== CAMPAIGN_STORAGE_KEY) saveCampaignProgress(progress);
      return progress;
    } catch {
      // 損壞的新版本不應遮蔽仍可 migration 的舊存檔，因此繼續檢查下一個 key。
    }
  }
  return createInitialCampaign(missions, equipment, turbines);
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
}

export function serializeCampaignSave(progress: CampaignProgress): string {
  const envelope: CampaignSaveEnvelope = {
    format: CAMPAIGN_SAVE_FORMAT,
    schemaVersion: 5,
    exportedAt: new Date().toISOString(),
    progress,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseCampaignSave(text: string, missions: MissionData[], equipment: EquipmentData[], characters: CharacterData[] = [], turbines: TurbineData[] = []): CampaignSaveImportResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: 'INVALID_JSON' };
  }
  if (!value || typeof value !== 'object') return { ok: false, error: 'INVALID_FORMAT' };

  const candidate = value as Record<string, unknown>;
  if ('format' in candidate) {
    if (candidate.format !== CAMPAIGN_SAVE_FORMAT) return { ok: false, error: 'INVALID_FORMAT' };
    if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== 3 && candidate.schemaVersion !== 4 && candidate.schemaVersion !== 5) return { ok: false, error: 'UNSUPPORTED_VERSION' };
    if (!candidate.progress || typeof candidate.progress !== 'object') return { ok: false, error: 'INVALID_FORMAT' };
    return { ok: true, progress: normalizeCampaignProgress(candidate.progress, missions, equipment, characters, turbines), migratedLegacy: candidate.schemaVersion !== 5 };
  }

  // 舊版直接保存 CampaignProgress；只讀 JSON 並重新正規化，避免信任外部欄位。
  if ('totalXp' in candidate || 'completedMissionIds' in candidate || 'unlockedMissionIds' in candidate) {
    if ('schemaVersion' in candidate && candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== 3 && candidate.schemaVersion !== 4 && candidate.schemaVersion !== 5) return { ok: false, error: 'UNSUPPORTED_VERSION' };
    return { ok: true, progress: normalizeCampaignProgress(candidate, missions, equipment, characters, turbines), migratedLegacy: candidate.schemaVersion !== 5 };
  }
  return { ok: false, error: 'INVALID_FORMAT' };
}

export function evaluateLoadout(
  mission: MissionData,
  equipment: EquipmentData,
  spare: EquipmentData,
  vessel: VesselData,
): LoadoutEvaluation {
  const equipmentMatch = equipment.id === mission.recommendedEquipmentId;
  const spareMatch = spare.id === mission.recommendedSpareId;
  const vesselMatch = vessel.id === mission.recommendedVesselId;
  return {
    matchedChoices: Number(equipmentMatch) + Number(spareMatch) + Number(vesselMatch),
    evidenceBonus: equipmentMatch ? 12 : 0,
    reliabilityBonus: spareMatch ? 15 : 0,
    initialCost: vessel.deploymentCost + tierCost(equipment.tier) + tierCost(spare.tier),
    equipmentMatch,
    spareMatch,
    vesselMatch,
  };
}

export function evaluateOperationReadiness(
  mission: MissionData,
  team: CharacterData[],
  progress: CampaignProgress,
  vessel: VesselData,
  confirmations: OperationPlanningConfirmations,
): OperationReadinessEvaluation {
  const profile = mission.operationProfile;
  const qualifiedMembers = team.filter((character) => characterMastery(progress.characterXp[character.id] ?? 0).level >= profile.minimumMasteryLevel).length;
  const vesselReady = profile.allowedVesselClasses.includes(vessel.class);
  const masteryReady = qualifiedMembers >= profile.minimumQualifiedMembers;
  const checks = [confirmations.permit, confirmations.ppe, confirmations.access, vesselReady, masteryReady];
  return {
    ready: checks.every(Boolean),
    matchedChecks: checks.filter(Boolean).length,
    totalChecks: 5,
    permitReady: confirmations.permit,
    ppeReady: confirmations.ppe,
    accessReady: confirmations.access,
    vesselReady,
    masteryReady,
    qualifiedMembers,
    requiredQualifiedMembers: profile.minimumQualifiedMembers,
    initialWeatherWindow: profile.initialWeatherWindow,
    mobilizationCost: profile.mobilizationCost,
  };
}

export function applyOperationReadiness(mission: MissionState, readiness: OperationReadinessEvaluation): MissionState {
  if (!readiness.ready) throw new Error('Operation readiness gate is incomplete');
  // Gate 通過後才套用任務環境，確保 UI 預覽、runtime 與 balance simulator 使用同一份後果。
  return {
    ...mission,
    weatherWindow: Math.min(mission.weatherWindow, readiness.initialWeatherWindow),
    cost: mission.cost + readiness.mobilizationCost,
  };
}

export function evaluateSandboxLoadout(
  equipment: EquipmentData,
  spare: EquipmentData,
  vessel: VesselData,
): LoadoutEvaluation {
  return {
    matchedChoices: 0,
    evidenceBonus: 0,
    reliabilityBonus: 0,
    initialCost: vessel.deploymentCost + tierCost(equipment.tier) + tierCost(spare.tier),
    equipmentMatch: false,
    spareMatch: false,
    vesselMatch: false,
  };
}

export function characterMastery(xp: number): CharacterMastery {
  const safeXp = Math.max(0, xp);
  const thresholds: readonly number[] = MASTERY_THRESHOLDS;
  let thresholdIndex = 0;
  thresholds.forEach((threshold, index) => {
    if (safeXp >= threshold) thresholdIndex = index;
  });
  const currentThreshold = thresholds[thresholdIndex] ?? 0;
  const nextThreshold = thresholds[thresholdIndex + 1] ?? null;
  const progress = nextThreshold === null
    ? 1
    : (safeXp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold);
  const level = thresholdIndex + 1;
  return {
    level,
    xp: safeXp,
    currentThreshold,
    nextThreshold,
    progress: Math.min(1, Math.max(0, progress)),
    // L1：Passive + Skill 1；L2：Skill 2；L3：Ultimate；L4/L5 解鎖任務 perk。
    unlockedSkillSlots: Math.min(4, level + 1),
  };
}

export function unlockedMasteryPerks(xp: number): MasteryPerkDefinition[] {
  const mastery = characterMastery(xp);
  return MASTERY_PERKS.filter((perk) => mastery.level >= perk.requiredLevel);
}

export function masteryPerkModifiers(xp: number): MasteryPerkModifiers {
  const unlocked = unlockedMasteryPerks(xp);
  const hasL4 = unlocked.some((perk) => perk.id === 'SPECIALIST_READINESS');
  const hasL5 = unlocked.some((perk) => perk.id === 'VETERAN_GUARD');
  return {
    startingEnergyBonus: hasL4 ? 2 : 0,
    fatigueProtection: hasL5 ? 2 : 0,
    evidenceBonus: hasL4 ? 3 : 0,
    reliabilityBonus: hasL5 ? 4 : 0,
    statuses: [hasL4 ? 'SpecialistReady' : '', hasL5 ? 'VeteranGuard' : ''].filter(Boolean),
    unlockedPerkIds: unlocked.map((perk) => perk.id),
  };
}

export function teamMasteryPerks(characterIds: string[], progress: CampaignProgress, unlockAll = false): TeamMasteryPerks {
  const byCharacterId = Object.fromEntries(characterIds.map((characterId) => [
    characterId,
    masteryPerkModifiers(unlockAll ? MASTERY_THRESHOLDS[4] : (progress.characterXp[characterId] ?? 0)),
  ]));
  const modifiers = Object.values(byCharacterId);
  return {
    evidenceBonus: modifiers.reduce((total, item) => total + item.evidenceBonus, 0),
    reliabilityBonus: modifiers.reduce((total, item) => total + item.reliabilityBonus, 0),
    unlockedPerkCount: modifiers.reduce((total, item) => total + item.unlockedPerkIds.length, 0),
    byCharacterId,
  };
}

export function applyMasteryPerks(mission: MissionState, perks: TeamMasteryPerks): MissionState {
  return {
    ...mission,
    evidence: Math.min(100, mission.evidence + perks.evidenceBonus),
    reliability: mission.reliability + perks.reliabilityBonus,
  };
}

export function isSkillSlotUnlocked(skillIndex: number, mastery: CharacterMastery): boolean {
  return skillIndex < mastery.unlockedSkillSlots;
}

export function applyLoadout(mission: MissionState, evaluation: LoadoutEvaluation): MissionState {
  return {
    ...mission,
    evidence: Math.min(100, mission.evidence + evaluation.evidenceBonus),
    reliability: mission.reliability + evaluation.reliabilityBonus,
    cost: mission.cost + evaluation.initialCost,
  };
}

export function resolveDiagnosisDecision(
  mission: MissionState,
  option: DiagnosisOptionData,
): DiagnosisResolution {
  const evidenceDelta = option.correct ? 15 : 0;
  const safetyDelta = option.correct ? 0 : -8;
  return {
    mission: {
      ...mission,
      evidence: Math.min(100, mission.evidence + evidenceDelta),
      safety: Math.max(0, mission.safety + safetyDelta),
    },
    correct: option.correct,
    evidenceDelta,
    safetyDelta,
  };
}

export function awardCampaignMission(
  current: CampaignProgress,
  mission: MissionData,
  debrief: MissionDebrief,
  completed: boolean,
  teamCharacterIds: string[],
  missions: MissionData[],
  equipment: EquipmentData[],
  deployedEquipmentIds: string[],
  characters: CharacterData[],
  vessel: VesselData,
  deployedCrewFatigue: Record<string, number>,
): { progress: CampaignProgress; reward: CampaignReward } {
  const previousBestScore = current.bestScores[mission.id];
  const bestScoreAfter = Math.max(previousBestScore ?? 0, debrief.totalScore);
  const scoreRecordStatus = previousBestScore === undefined
    ? 'FIRST_BEST'
    : debrief.totalScore > previousBestScore
      ? 'NEW_BEST'
      : 'BEST_HELD';
  const earnedXp = completed
    ? mission.rewardXp + Math.round(debrief.totalScore / 2)
    : Math.max(10, Math.round(debrief.totalScore / 4));
  const completedMissionIds = completed
    ? uniqueStrings([...current.completedMissionIds, mission.id])
    : current.completedMissionIds;
  const campaignCompleted = completed && missions.every((candidate) => completedMissionIds.includes(candidate.id));
  const unlockedMissionIds = [...current.unlockedMissionIds];
  const nextMission = missions
    .filter((candidate) => candidate.unlockRequires === mission.id)
    .sort((a, b) => a.order - b.order)[0];
  let newlyUnlockedMissionId: string | undefined;
  if (completed && nextMission && !unlockedMissionIds.includes(nextMission.id)) {
    unlockedMissionIds.push(nextMission.id);
    newlyUnlockedMissionId = nextMission.id;
  }
  const share = Math.floor(earnedXp / Math.max(1, teamCharacterIds.length));
  const characterXp = { ...current.characterXp };
  for (const characterId of teamCharacterIds) {
    characterXp[characterId] = (characterXp[characterId] ?? 0) + share;
  }
  const trackProgressUpdates = careerTrackRewardUpdates(current, { characterXp }, characters, teamCharacterIds);
  const newlyUnlockedCharacterIds = trackProgressUpdates.flatMap((update) => update.newlyUnlockedCharacterIds);
  const newlyUnlockedEquipmentIds = completed && mission.rewardEquipmentTier
    ? equipment
        .filter((item) => item.tier === mission.rewardEquipmentTier && !current.ownedEquipmentIds.includes(item.id))
        .map((item) => item.id)
    : [];
  const maintenanceCreditsEarned = maintenanceCreditsForMission(mission, debrief, completed);
  const deployedIds = uniqueStrings(deployedEquipmentIds).filter((id) => current.ownedEquipmentIds.includes(id));
  const equipmentCondition = { ...current.equipmentCondition };
  const equipmentWear = deployedIds.map((equipmentId, index): EquipmentWearResult => {
    const slot = index === 0 ? 'equipment' : 'spare';
    const before = campaignEquipmentCondition(current, equipmentId);
    const wear = equipmentWearForMission(mission, completed, slot);
    const after = Math.max(0, before - wear);
    if (after < MAX_EQUIPMENT_CONDITION) equipmentCondition[equipmentId] = after;
    else delete equipmentCondition[equipmentId];
    return { equipmentId, slot, before, wear, after };
  });
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const deployedCrewIds = uniqueStrings([...teamCharacterIds, ...Object.keys(deployedCrewFatigue)])
    .filter((id) => characterById.has(id));
  const deployedCrewSet = new Set(deployedCrewIds);
  const crewFatigue = { ...current.crewFatigue };
  const transitRecovery = Math.max(0, vessel.fatigueRelief * 2);
  const crewFatigueUpdates: CrewFatigueUpdate[] = [];

  for (const characterId of deployedCrewIds) {
    const character = characterById.get(characterId)!;
    const before = campaignCrewFatigue(current, characterId);
    const missionEnd = Math.max(0, Math.min(character.fatigueMax, deployedCrewFatigue[characterId] ?? before));
    const recovery = Math.min(missionEnd, transitRecovery);
    const after = missionEnd - recovery;
    if (after > 0) crewFatigue[characterId] = after;
    else delete crewFatigue[characterId];
    crewFatigueUpdates.push({ characterId, source: 'deployed', before, missionEnd, recovery, after });
  }

  for (const [characterId, before] of Object.entries(current.crewFatigue)) {
    if (deployedCrewSet.has(characterId)) continue;
    const character = characterById.get(characterId);
    if (!character) continue;
    const recovery = Math.min(before, Math.max(0, character.fatigueRecovery * 2));
    const after = before - recovery;
    if (after > 0) crewFatigue[characterId] = after;
    else delete crewFatigue[characterId];
    if (recovery > 0) crewFatigueUpdates.push({ characterId, source: 'reserve', before, recovery, after });
  }
  const recoveryTokensEarned = vessel.class === 'SOV' ? 2 : 1;
  const windFarmSettlement = settleWindFarmMission(current.windFarm, mission, completed, debrief.totalScore);
  const progressWithHistory = windFarmSettlement.update
    ? appendFleetOperationHistory(
        current,
        fleetMissionHistoryRecord(mission, debrief, completed, maintenanceCreditsEarned, windFarmSettlement.update),
      )
    : current;

  return {
    progress: {
      ...progressWithHistory,
      totalXp: current.totalXp + earnedXp,
      completedMissionIds,
      unlockedMissionIds,
      bestScores: {
        ...current.bestScores,
        [mission.id]: bestScoreAfter,
      },
      characterXp,
      ownedEquipmentIds: uniqueStrings([...current.ownedEquipmentIds, ...newlyUnlockedEquipmentIds]),
      maintenanceCredits: current.maintenanceCredits + maintenanceCreditsEarned,
      equipmentCondition,
      recoveryTokens: current.recoveryTokens + recoveryTokensEarned,
      crewFatigue,
      windFarm: windFarmSettlement.state,
    },
    reward: {
      earnedXp,
      currentScore: debrief.totalScore,
      currentGrade: debrief.grade,
      ...(previousBestScore !== undefined ? { previousBestScore } : {}),
      bestScoreAfter,
      bestGradeAfter: scoreGrade(bestScoreAfter),
      scoreRecordStatus,
      maintenanceCreditsEarned,
      equipmentWear,
      recoveryTokensEarned,
      crewFatigueUpdates,
      newlyUnlockedMissionId,
      newlyUnlockedEquipmentTier: newlyUnlockedEquipmentIds.length > 0 ? mission.rewardEquipmentTier ?? undefined : undefined,
      newlyUnlockedEquipmentIds,
      trackProgressUpdates,
      newlyUnlockedCharacterIds,
      campaignCompleted,
      windFarmUpdate: windFarmSettlement.update,
    },
  };
}

export function equipmentWearForMission(
  mission: MissionData,
  completed: boolean,
  slot: 'equipment' | 'spare',
): number {
  const baseWear = slot === 'equipment' ? 6 + mission.chapter * 2 : 4 + mission.chapter;
  const failureWear = completed ? 0 : slot === 'equipment' ? 6 : 4;
  return baseWear + failureWear;
}

export function maintenanceCreditsForMission(
  mission: MissionData,
  debrief: Pick<MissionDebrief, 'totalScore'>,
  completed: boolean,
): number {
  return completed
    ? 18 + mission.chapter * 6 + Math.floor(debrief.totalScore / 10)
    : 8 + mission.chapter * 3;
}

function scoreGrade(score: number): CampaignGrade {
  return score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
}

function appendFleetOperationHistory(
  progress: CampaignProgress,
  record: Omit<FleetOperationHistoryRecord, 'id' | 'sequence'>,
): CampaignProgress {
  const lastSequence = progress.fleetOperationsHistory.reduce((max, item) => Math.max(max, item.sequence), 0);
  const sequence = lastSequence + 1;
  const event: FleetOperationHistoryRecord = {
    ...record,
    id: `FOP-${String(sequence).padStart(4, '0')}-${record.kind}`,
    sequence,
  };
  return {
    ...progress,
    fleetOperationsHistory: [...progress.fleetOperationsHistory, event].slice(-MAX_FLEET_OPERATION_HISTORY),
  };
}

function fleetMaintenanceHistoryRecord(
  settlement: TurbineMaintenanceSettlement,
): Omit<FleetOperationHistoryRecord, 'id' | 'sequence'> {
  return {
    kind: 'MAINTENANCE',
    turbineId: settlement.turbineId,
    actionCount: 1,
    creditsBefore: settlement.beforeCredits,
    creditsAfter: settlement.afterCredits,
    creditsDelta: settlement.afterCredits - settlement.beforeCredits,
    reliabilityBefore: settlement.before.reliability,
    reliabilityAfter: settlement.after.reliability,
    backlogBefore: settlement.before.openFaults,
    backlogAfter: settlement.after.openFaults,
    availabilityBefore: settlement.before.availability,
    availabilityAfter: settlement.after.availability,
  };
}

function fleetMaintenancePlanHistoryRecord(
  settlement: FleetMaintenancePlanSettlement,
): Omit<FleetOperationHistoryRecord, 'id' | 'sequence'> {
  return {
    kind: 'MAINTENANCE_PLAN',
    turbineIds: [...settlement.turbineIds],
    actionCount: settlement.steps.length,
    creditsBefore: settlement.beforeCredits,
    creditsAfter: settlement.afterCredits,
    creditsDelta: settlement.afterCredits - settlement.beforeCredits,
    reliabilityBefore: settlement.beforeSummary.averageReliability,
    reliabilityAfter: settlement.afterSummary.averageReliability,
    backlogBefore: settlement.beforeSummary.totalBacklog,
    backlogAfter: settlement.afterSummary.totalBacklog,
    fleetBefore: settlement.beforeSummary,
    fleetAfter: settlement.afterSummary,
  };
}

function fleetMissionHistoryRecord(
  mission: MissionData,
  debrief: MissionDebrief,
  completed: boolean,
  maintenanceCreditsEarned: number,
  update: TurbineMissionUpdate,
): Omit<FleetOperationHistoryRecord, 'id' | 'sequence'> {
  return {
    kind: 'MISSION',
    missionId: mission.id,
    turbineId: update.turbineId,
    outcome: completed ? 'CLEAR' : 'FAILED',
    score: debrief.totalScore,
    grade: scoreGrade(debrief.totalScore),
    creditsDelta: maintenanceCreditsEarned,
    reliabilityBefore: update.before.reliability,
    reliabilityAfter: update.after.reliability,
    backlogBefore: update.before.openFaults,
    backlogAfter: update.after.openFaults,
    availabilityBefore: update.before.availability,
    availabilityAfter: update.after.availability,
  };
}

function tierCost(tier: string): number {
  const match = tier.match(/(\d+)/);
  return match ? Number(match[1]) * 2 : 2;
}

function equipmentTierRank(tier: EquipmentTier): number {
  return Number(tier.slice(1));
}

function validNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function validNumberRecord(value: unknown, allowedKeys?: Set<string>): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => (!allowedKeys || allowedKeys.has(key)) && validNumber(item) === item),
  );
}

function validEquipmentConditionRecord(value: unknown, allowedKeys: Set<string>): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => allowedKeys.has(key)
        && typeof item === 'number'
        && Number.isFinite(item)
        && item >= 0
        && item < MAX_EQUIPMENT_CONDITION)
      .map(([key, item]) => [key, Math.round(item as number)]),
  );
}

function validCrewFatigueRecord(value: unknown, characters: CharacterData[]): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  const characterById = new Map(characters.map((character) => [character.id, character]));
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => characterById.has(key)
        && typeof item === 'number'
        && Number.isFinite(item)
        && item > 0)
      .map(([key, item]) => {
        const character = characterById.get(key)!;
        return [key, Math.round(Math.min(item as number, character.fatigueMax))];
      }),
  );
}

function validFleetOperationHistoryRecord(
  value: unknown,
  validMissionIds: Set<string>,
  validTurbineIds: Set<string>,
): FleetOperationHistoryRecord[] {
  if (!Array.isArray(value)) return [];
  const kinds = new Set<FleetOperationHistoryKind>(['DISPATCH', 'MISSION', 'MAINTENANCE', 'MAINTENANCE_PLAN']);
  const pressures = new Set<FleetConditionPressure>(['NOMINAL', 'ELEVATED', 'HIGH', 'CRITICAL']);
  const outcomes = new Set<FleetOperationOutcome>(['CLEAR', 'FAILED']);
  const grades = new Set<CampaignGrade>(['S', 'A', 'B', 'C', 'D']);
  const availability = new Set<TurbineAvailability>(['AVAILABLE', 'DEGRADED', 'OFFLINE']);
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item): FleetOperationHistoryRecord | null => {
      if (typeof item.id !== 'string' || typeof item.sequence !== 'number' || !Number.isFinite(item.sequence)) return null;
      if (typeof item.kind !== 'string' || !kinds.has(item.kind as FleetOperationHistoryKind)) return null;
      const missionId = typeof item.missionId === 'string' && validMissionIds.has(item.missionId) ? item.missionId : undefined;
      const turbineId = typeof item.turbineId === 'string' && validTurbineIds.has(item.turbineId) ? item.turbineId : undefined;
      const turbineIds = uniqueStrings(item.turbineIds).filter((id) => validTurbineIds.has(id));
      const fleetBefore = validWindFarmSummary(item.fleetBefore);
      const fleetAfter = validWindFarmSummary(item.fleetAfter);
      return {
        id: item.id,
        sequence: Math.max(1, Math.round(item.sequence)),
        kind: item.kind as FleetOperationHistoryKind,
        ...(missionId ? { missionId } : {}),
        ...(turbineId ? { turbineId } : {}),
        ...(turbineIds.length > 0 ? { turbineIds } : {}),
        ...(typeof item.pressure === 'string' && pressures.has(item.pressure as FleetConditionPressure) ? { pressure: item.pressure as FleetConditionPressure } : {}),
        ...(typeof item.outcome === 'string' && outcomes.has(item.outcome as FleetOperationOutcome) ? { outcome: item.outcome as FleetOperationOutcome } : {}),
        ...(typeof item.score === 'number' && Number.isFinite(item.score) ? { score: Math.round(item.score) } : {}),
        ...(typeof item.grade === 'string' && grades.has(item.grade as CampaignGrade) ? { grade: item.grade as CampaignGrade } : {}),
        ...(typeof item.actionCount === 'number' && Number.isFinite(item.actionCount) ? { actionCount: Math.max(0, Math.round(item.actionCount)) } : {}),
        ...validOptionalNumber(item, 'creditsBefore'),
        ...validOptionalNumber(item, 'creditsAfter'),
        ...validOptionalNumber(item, 'creditsDelta'),
        ...validOptionalNumber(item, 'costBefore'),
        ...validOptionalNumber(item, 'costAfter'),
        ...validOptionalNumber(item, 'safetyBefore'),
        ...validOptionalNumber(item, 'safetyAfter'),
        ...validOptionalNumber(item, 'reliabilityBefore'),
        ...validOptionalNumber(item, 'reliabilityAfter'),
        ...validOptionalNumber(item, 'backlogBefore'),
        ...validOptionalNumber(item, 'backlogAfter'),
        ...(typeof item.availabilityBefore === 'string' && availability.has(item.availabilityBefore as TurbineAvailability) ? { availabilityBefore: item.availabilityBefore as TurbineAvailability } : {}),
        ...(typeof item.availabilityAfter === 'string' && availability.has(item.availabilityAfter as TurbineAvailability) ? { availabilityAfter: item.availabilityAfter as TurbineAvailability } : {}),
        ...(fleetBefore ? { fleetBefore } : {}),
        ...(fleetAfter ? { fleetAfter } : {}),
      };
    })
    .filter((item): item is FleetOperationHistoryRecord => item !== null)
    .sort((left, right) => left.sequence - right.sequence)
    .slice(-MAX_FLEET_OPERATION_HISTORY);
}

function validOptionalNumber(record: Record<string, unknown>, key: keyof FleetOperationHistoryRecord): Partial<FleetOperationHistoryRecord> {
  const value = record[key as string];
  return typeof value === 'number' && Number.isFinite(value)
    ? { [key]: Math.round(value) }
    : {};
}

function validWindFarmSummary(value: unknown): WindFarmSummary | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<WindFarmSummary>;
  if (typeof record.available !== 'number' || typeof record.degraded !== 'number' || typeof record.offline !== 'number' || typeof record.averageReliability !== 'number' || typeof record.totalBacklog !== 'number') return null;
  return {
    available: Math.max(0, Math.round(record.available)),
    degraded: Math.max(0, Math.round(record.degraded)),
    offline: Math.max(0, Math.round(record.offline)),
    averageReliability: Math.max(0, Math.round(record.averageReliability)),
    totalBacklog: Math.max(0, Math.round(record.totalBacklog)),
  };
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))];
}
