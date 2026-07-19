import type { CampaignProgress } from './campaign';
import type { CharacterRuntimeState, MissionDebrief, MissionState } from './runtime';
import type { BossChallengeAuditItemData, BossData, CharacterData, VesselData } from './types';
import type { BossChallengeDraftVerification } from './bossChallengeVerification';

export const BOSS_CHALLENGE_STORAGE_KEY = 'owm.challenge.v3';
export const BOSS_CHALLENGE_LEGACY_V2_STORAGE_KEY = 'owm.challenge.v2';
export const BOSS_CHALLENGE_LEGACY_STORAGE_KEY = 'owm.challenge.v1';
export const BOSS_CHALLENGE_SCHEMA_VERSION = 3;
export const BOSS_CHALLENGE_SAVE_FORMAT = 'OWM_CHALLENGE_SAVE';
export const BOSS_CHALLENGE_MASTERY_XP = 250;
export const BOSS_CHALLENGE_MASTERY_LEVEL = 3;
export const BOSS_CHALLENGE_ROUND_LIMIT = 10;
export const BOSS_CHALLENGE_EQUIPMENT_ID = 'EQ0051';
export const BOSS_CHALLENGE_SPARE_ID = 'EQ0126';
export const BOSS_CHALLENGE_VESSEL_ID = 'VES002';
export const BOSS_CHALLENGE_GRID_WEATHER_PROTECTION_BONUS = Object.freeze({ S4: 1, S5: 3 }) as Readonly<Record<string, number>>;
export const BOSS_CHALLENGE_GRID_ENERGY_RESERVE_BONUS = Object.freeze({ S5: 1 }) as Readonly<Record<string, number>>;

export type BossChallengeRecordSource = 'OPERATION' | 'DRAFT_CONFIRMATION';

export interface BossChallengeRecord {
  bossId: string;
  bestScore: number;
  grade: MissionDebrief['grade'];
  completed: boolean;
  roundsUsed: number;
  teamIds: [string, string, string];
  source: BossChallengeRecordSource;
  updatedAt: string;
}

export interface BossChallengeSquadDraft {
  bossId: string;
  teamIds: [string, string, string];
  updatedAt: string;
}

export interface BossChallengeProgress {
  schemaVersion: 3;
  bestByBossId: Record<string, BossChallengeRecord>;
  draftByBossId: Record<string, BossChallengeSquadDraft>;
}

export interface BossChallengeSaveEnvelope {
  format: typeof BOSS_CHALLENGE_SAVE_FORMAT;
  schemaVersion: 3;
  exportedAt: string;
  progress: BossChallengeProgress;
}

export interface BossChallengeSaveImportSuccess {
  ok: true;
  progress: BossChallengeProgress;
  migratedLegacy: boolean;
  sourceSchemaVersion: 1 | 2 | 3;
}

export type BossChallengeSaveImportResult =
  | BossChallengeSaveImportSuccess
  | { ok: false; error: 'INVALID_JSON' | 'INVALID_FORMAT' | 'UNSUPPORTED_VERSION' };

export const BOSS_CHALLENGE_IMPORT_MODEL = 'OWM_CHALLENGE_IMPORT_PREVIEW' as const;

export interface BossChallengeImportCounts {
  bestRecords: number;
  operationRecords: number;
  draftConfirmationRecords: number;
  squadDrafts: number;
}

export interface BossChallengeImportPreview {
  schemaVersion: 1;
  model: typeof BOSS_CHALLENGE_IMPORT_MODEL;
  provenance: 'CHALLENGE_IMPORT_CONFIRMATION_REQUIRED';
  sourceSchemaVersion: 1 | 2 | 3;
  migratedLegacy: boolean;
  current: BossChallengeImportCounts;
  incoming: BossChallengeImportCounts;
  addedBestBossIds: string[];
  changedBestBossIds: string[];
  removedBestBossIds: string[];
  addedDraftBossIds: string[];
  changedDraftBossIds: string[];
  removedDraftBossIds: string[];
  removedBossIds: string[];
  currentFingerprint: string;
  incomingFingerprint: string;
  incomingProgress: BossChallengeProgress;
}

export interface BossChallengeImportUndo {
  schemaVersion: 1;
  model: 'OWM_CHALLENGE_IMPORT_UNDO';
  provenance: 'SESSION_ONLY_IMPORT_UNDO';
  previousFingerprint: string;
  importedFingerprint: string;
  previousProgress: BossChallengeProgress;
}

export interface BossChallengeSettlement {
  attempt: BossChallengeRecord;
  best: BossChallengeRecord;
  previousBestScore: number | null;
  isNewBest: boolean;
}

export const BOSS_CHALLENGE_DRAFT_SETTLEMENT_MODEL = 'OWM_CHALLENGE_DRAFT_SETTLEMENT_CONFIRMATION' as const;

export interface BossChallengeDraftSettlementPreview {
  schemaVersion: 1;
  model: typeof BOSS_CHALLENGE_DRAFT_SETTLEMENT_MODEL;
  provenance: 'DRAFT_RUNTIME_CONFIRMATION_REQUIRED';
  bossId: string;
  teamIds: [string, string, string];
  score: number;
  grade: MissionDebrief['grade'];
  round: number;
  status: 'CLEAR';
  previousBestScore: number | null;
  projectedBestScore: number;
  projectedIsNewBest: boolean;
  previousBestFingerprint: string;
}

export interface BossChallengeSummary {
  attemptedBosses: number;
  completedBosses: number;
  totalBosses: number;
  averageBestScore: number;
  sGradeBosses: number;
}

export interface BossChallengeSourceSummary {
  operationRecords: number;
  operationCompleted: number;
  draftConfirmationRecords: number;
  draftConfirmationCompleted: number;
}

export function createInitialBossChallengeProgress(): BossChallengeProgress {
  return { schemaVersion: BOSS_CHALLENGE_SCHEMA_VERSION, bestByBossId: {}, draftByBossId: {} };
}

export function normalizeBossChallengeProgress(
  value: unknown,
  bosses: BossData[],
  characters: CharacterData[],
): BossChallengeProgress {
  const initial = createInitialBossChallengeProgress();
  if (!value || typeof value !== 'object') return initial;
  const candidate = value as { schemaVersion?: unknown; bestByBossId?: unknown; draftByBossId?: unknown };
  if ((candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== BOSS_CHALLENGE_SCHEMA_VERSION)
    || !candidate.bestByBossId || typeof candidate.bestByBossId !== 'object') return initial;
  const bossIds = new Set(bosses.map((boss) => boss.id));
  const characterIds = new Set(characters.map((character) => character.id));
  const bestByBossId: Record<string, BossChallengeRecord> = {};
  const draftByBossId: Record<string, BossChallengeSquadDraft> = {};

  for (const [bossId, raw] of Object.entries(candidate.bestByBossId as Record<string, unknown>)) {
    if (!bossIds.has(bossId) || !raw || typeof raw !== 'object') continue;
    const record = raw as Partial<BossChallengeRecord>;
    const score = validInteger(record.bestScore, 0, 100);
    const roundsUsed = validInteger(record.roundsUsed, 1, 99);
    const teamIds = validTeamIds(record.teamIds, characterIds);
    if (score === null || roundsUsed === null || !teamIds || !isGrade(record.grade)) continue;
    bestByBossId[bossId] = {
      bossId,
      bestScore: score,
      grade: record.grade,
      completed: record.completed === true,
      roundsUsed,
      teamIds,
      // v1/v2 發布時尚未有 draft-confirmation 結算；舊紀錄統一視為正式 Operation。
      source: candidate.schemaVersion === BOSS_CHALLENGE_SCHEMA_VERSION && isBossChallengeRecordSource(record.source)
        ? record.source
        : 'OPERATION',
      updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : '',
    };
  }
  if ((candidate.schemaVersion === 2 || candidate.schemaVersion === BOSS_CHALLENGE_SCHEMA_VERSION)
    && candidate.draftByBossId && typeof candidate.draftByBossId === 'object') {
    for (const [bossId, raw] of Object.entries(candidate.draftByBossId as Record<string, unknown>)) {
      if (!bossIds.has(bossId) || !raw || typeof raw !== 'object') continue;
      const draft = raw as Partial<BossChallengeSquadDraft>;
      const teamIds = validTeamIds(draft.teamIds, characterIds);
      if (!teamIds) continue;
      draftByBossId[bossId] = {
        bossId,
        teamIds,
        updatedAt: typeof draft.updatedAt === 'string' ? draft.updatedAt : '',
      };
    }
  }
  return { schemaVersion: BOSS_CHALLENGE_SCHEMA_VERSION, bestByBossId, draftByBossId };
}

export function loadBossChallengeProgress(bosses: BossData[], characters: CharacterData[]): BossChallengeProgress {
  if (typeof localStorage === 'undefined') return createInitialBossChallengeProgress();
  try {
    const raw = localStorage.getItem(BOSS_CHALLENGE_STORAGE_KEY)
      ?? localStorage.getItem(BOSS_CHALLENGE_LEGACY_V2_STORAGE_KEY)
      ?? localStorage.getItem(BOSS_CHALLENGE_LEGACY_STORAGE_KEY);
    return normalizeBossChallengeProgress(raw ? JSON.parse(raw) : null, bosses, characters);
  } catch {
    return createInitialBossChallengeProgress();
  }
}

export function recordBossChallengeSquadDraft(
  current: BossChallengeProgress,
  boss: BossData,
  teamIds: string[],
  updatedAt: string = new Date().toISOString(),
): BossChallengeProgress {
  if (teamIds.length !== 3 || new Set(teamIds).size !== 3 || teamIds.some((id) => typeof id !== 'string' || id.length === 0)) {
    throw new Error('Boss Challenge squad draft requires three unique character IDs.');
  }
  const normalizedTeamIds = [...teamIds] as [string, string, string];
  const previous = current.draftByBossId[boss.id];
  if (previous && previous.teamIds.every((id, index) => id === normalizedTeamIds[index])) return current;
  return {
    ...current,
    draftByBossId: {
      ...current.draftByBossId,
      [boss.id]: { bossId: boss.id, teamIds: normalizedTeamIds, updatedAt },
    },
  };
}

export function seedBossChallengeSquadDraftFromAudit(
  current: BossChallengeProgress,
  boss: BossData,
  audit: BossChallengeAuditItemData,
  characters: CharacterData[],
  updatedAt: string = new Date().toISOString(),
): BossChallengeProgress {
  if (audit.bossId !== boss.id || !audit.success) {
    throw new Error(`Boss Challenge audit draft 不可用：${boss.id}`);
  }
  const characterIds = new Set(characters.map((character) => character.id));
  const teamIds = validTeamIds(audit.recommendedTeamIds, characterIds);
  if (!teamIds) throw new Error(`Boss Challenge audit draft 角色 FK 失效：${boss.id}`);
  return recordBossChallengeSquadDraft(current, boss, teamIds, updatedAt);
}

export function saveBossChallengeProgress(progress: BossChallengeProgress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BOSS_CHALLENGE_STORAGE_KEY, JSON.stringify(progress));
}

export function serializeBossChallengeSave(progress: BossChallengeProgress): string {
  const envelope: BossChallengeSaveEnvelope = {
    format: BOSS_CHALLENGE_SAVE_FORMAT,
    schemaVersion: BOSS_CHALLENGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseBossChallengeSave(
  text: string,
  bosses: BossData[],
  characters: CharacterData[],
): BossChallengeSaveImportResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: 'INVALID_JSON' };
  }
  if (!value || typeof value !== 'object') return { ok: false, error: 'INVALID_FORMAT' };

  const candidate = value as Record<string, unknown>;
  if ('format' in candidate) {
    if (candidate.format !== BOSS_CHALLENGE_SAVE_FORMAT) return { ok: false, error: 'INVALID_FORMAT' };
    if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== BOSS_CHALLENGE_SCHEMA_VERSION) {
      return { ok: false, error: 'UNSUPPORTED_VERSION' };
    }
    if (!candidate.progress || typeof candidate.progress !== 'object') return { ok: false, error: 'INVALID_FORMAT' };
    const progress = candidate.progress as Record<string, unknown>;
    if (!progress.bestByBossId || typeof progress.bestByBossId !== 'object') return { ok: false, error: 'INVALID_FORMAT' };
    return {
      ok: true,
      progress: normalizeBossChallengeProgress({ ...progress, schemaVersion: candidate.schemaVersion }, bosses, characters),
      migratedLegacy: candidate.schemaVersion !== BOSS_CHALLENGE_SCHEMA_VERSION,
      sourceSchemaVersion: candidate.schemaVersion,
    };
  }

  if (!candidate.bestByBossId || typeof candidate.bestByBossId !== 'object') return { ok: false, error: 'INVALID_FORMAT' };
  if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== BOSS_CHALLENGE_SCHEMA_VERSION) {
    return { ok: false, error: 'UNSUPPORTED_VERSION' };
  }
  return {
    ok: true,
    progress: normalizeBossChallengeProgress(candidate, bosses, characters),
    migratedLegacy: true,
    sourceSchemaVersion: candidate.schemaVersion,
  };
}

export function createBossChallengeImportPreview(
  current: BossChallengeProgress,
  imported: BossChallengeSaveImportSuccess,
): BossChallengeImportPreview {
  const currentBestIds = Object.keys(current.bestByBossId).sort((left, right) => left.localeCompare(right));
  const incomingBestIds = Object.keys(imported.progress.bestByBossId).sort((left, right) => left.localeCompare(right));
  const currentDraftIds = Object.keys(current.draftByBossId).sort((left, right) => left.localeCompare(right));
  const incomingDraftIds = Object.keys(imported.progress.draftByBossId).sort((left, right) => left.localeCompare(right));
  const currentPresenceIds = new Set([...currentBestIds, ...currentDraftIds]);
  const incomingPresenceIds = new Set([...incomingBestIds, ...incomingDraftIds]);
  return {
    schemaVersion: 1,
    model: BOSS_CHALLENGE_IMPORT_MODEL,
    provenance: 'CHALLENGE_IMPORT_CONFIRMATION_REQUIRED',
    sourceSchemaVersion: imported.sourceSchemaVersion,
    migratedLegacy: imported.migratedLegacy,
    current: bossChallengeImportCounts(current),
    incoming: bossChallengeImportCounts(imported.progress),
    addedBestBossIds: incomingBestIds.filter((bossId) => !current.bestByBossId[bossId]),
    changedBestBossIds: incomingBestIds.filter((bossId) => current.bestByBossId[bossId]
      && bossChallengeRecordFingerprint(current.bestByBossId[bossId]) !== bossChallengeRecordFingerprint(imported.progress.bestByBossId[bossId])),
    removedBestBossIds: currentBestIds.filter((bossId) => !imported.progress.bestByBossId[bossId]),
    addedDraftBossIds: incomingDraftIds.filter((bossId) => !current.draftByBossId[bossId]),
    changedDraftBossIds: incomingDraftIds.filter((bossId) => current.draftByBossId[bossId]
      && bossChallengeDraftFingerprint(current.draftByBossId[bossId]) !== bossChallengeDraftFingerprint(imported.progress.draftByBossId[bossId])),
    removedDraftBossIds: currentDraftIds.filter((bossId) => !imported.progress.draftByBossId[bossId]),
    removedBossIds: [...currentPresenceIds].filter((bossId) => !incomingPresenceIds.has(bossId)).sort((left, right) => left.localeCompare(right)),
    currentFingerprint: bossChallengeProgressFingerprint(current),
    incomingFingerprint: bossChallengeProgressFingerprint(imported.progress),
    incomingProgress: imported.progress,
  };
}

export function confirmBossChallengeImport(
  current: BossChallengeProgress,
  preview: BossChallengeImportPreview,
): { progress: BossChallengeProgress; undo: BossChallengeImportUndo } {
  if (preview.model !== BOSS_CHALLENGE_IMPORT_MODEL || preview.provenance !== 'CHALLENGE_IMPORT_CONFIRMATION_REQUIRED') {
    throw new Error('Invalid Boss Challenge import preview.');
  }
  if (bossChallengeProgressFingerprint(current) !== preview.currentFingerprint) {
    throw new Error('Boss Challenge progress changed before import confirmation; rebuild the preview.');
  }
  if (bossChallengeProgressFingerprint(preview.incomingProgress) !== preview.incomingFingerprint) {
    throw new Error('Boss Challenge import preview payload changed before confirmation.');
  }
  return {
    progress: preview.incomingProgress,
    undo: {
      schemaVersion: 1,
      model: 'OWM_CHALLENGE_IMPORT_UNDO',
      provenance: 'SESSION_ONLY_IMPORT_UNDO',
      previousFingerprint: preview.currentFingerprint,
      importedFingerprint: preview.incomingFingerprint,
      previousProgress: current,
    },
  };
}

export function undoBossChallengeImport(
  current: BossChallengeProgress,
  undo: BossChallengeImportUndo,
): BossChallengeProgress {
  if (undo.model !== 'OWM_CHALLENGE_IMPORT_UNDO' || undo.provenance !== 'SESSION_ONLY_IMPORT_UNDO') {
    throw new Error('Invalid Boss Challenge import undo.');
  }
  if (bossChallengeProgressFingerprint(current) !== undo.importedFingerprint) {
    throw new Error('Boss Challenge progress changed after import; session undo is stale.');
  }
  if (bossChallengeProgressFingerprint(undo.previousProgress) !== undo.previousFingerprint) {
    throw new Error('Boss Challenge import undo payload changed.');
  }
  return undo.previousProgress;
}

export function recordBossChallenge(
  current: BossChallengeProgress,
  boss: BossData,
  debrief: MissionDebrief,
  mission: MissionState,
  teamIds: string[],
  updatedAt: string = new Date().toISOString(),
): { progress: BossChallengeProgress; settlement: BossChallengeSettlement } {
  if (teamIds.length !== 3 || new Set(teamIds).size !== 3) throw new Error('Boss Challenge requires three unique team members.');
  const attempt: BossChallengeRecord = {
    bossId: boss.id,
    bestScore: Math.max(0, Math.min(100, Math.round(debrief.totalScore))),
    grade: debrief.grade,
    completed: mission.complete,
    roundsUsed: Math.max(1, mission.round),
    teamIds: [...teamIds] as [string, string, string],
    source: 'OPERATION',
    updatedAt,
  };
  return settleBossChallengeRecord(current, attempt);
}

export function createBossChallengeDraftSettlementPreview(
  current: BossChallengeProgress,
  boss: BossData,
  verification: BossChallengeDraftVerification,
): BossChallengeDraftSettlementPreview {
  if (verification.bossId !== boss.id) throw new Error('Draft settlement preview requires the same Boss ID.');
  if (!verification.success || verification.status !== 'CLEAR') throw new Error('Only a CLEAR draft verification can create a settlement preview.');
  if (verification.teamIds.length !== 3 || new Set(verification.teamIds).size !== 3) {
    throw new Error('Draft settlement preview requires three unique team members.');
  }
  const previous = current.bestByBossId[boss.id];
  const projected: BossChallengeRecord = {
    bossId: boss.id,
    bestScore: verification.score,
    grade: verification.grade,
    completed: true,
    roundsUsed: verification.round,
    teamIds: [...verification.teamIds],
    source: 'DRAFT_CONFIRMATION',
    updatedAt: '',
  };
  const projectedIsNewBest = !previous || compareChallengeRecords(projected, previous) > 0;
  return {
    schemaVersion: 1,
    model: BOSS_CHALLENGE_DRAFT_SETTLEMENT_MODEL,
    provenance: 'DRAFT_RUNTIME_CONFIRMATION_REQUIRED',
    bossId: boss.id,
    teamIds: [...verification.teamIds],
    score: verification.score,
    grade: verification.grade,
    round: verification.round,
    status: 'CLEAR',
    previousBestScore: previous?.bestScore ?? null,
    projectedBestScore: projectedIsNewBest ? projected.bestScore : previous.bestScore,
    projectedIsNewBest,
    previousBestFingerprint: bossChallengeRecordFingerprint(previous),
  };
}

export function confirmBossChallengeDraftSettlement(
  current: BossChallengeProgress,
  boss: BossData,
  preview: BossChallengeDraftSettlementPreview,
  updatedAt: string = new Date().toISOString(),
): { progress: BossChallengeProgress; settlement: BossChallengeSettlement } {
  if (preview.model !== BOSS_CHALLENGE_DRAFT_SETTLEMENT_MODEL
    || preview.provenance !== 'DRAFT_RUNTIME_CONFIRMATION_REQUIRED'
    || preview.bossId !== boss.id
    || preview.status !== 'CLEAR') {
    throw new Error('Invalid Boss Challenge draft settlement preview.');
  }
  if (bossChallengeRecordFingerprint(current.bestByBossId[boss.id]) !== preview.previousBestFingerprint) {
    throw new Error('Boss Challenge local best changed before confirmation; rebuild the preview.');
  }
  if (preview.teamIds.length !== 3 || new Set(preview.teamIds).size !== 3) {
    throw new Error('Draft settlement confirmation requires three unique team members.');
  }
  const attempt: BossChallengeRecord = {
    bossId: boss.id,
    bestScore: Math.max(0, Math.min(100, Math.round(preview.score))),
    grade: preview.grade,
    completed: true,
    roundsUsed: Math.max(1, Math.min(BOSS_CHALLENGE_ROUND_LIMIT, Math.round(preview.round))),
    teamIds: [...preview.teamIds],
    source: 'DRAFT_CONFIRMATION',
    updatedAt,
  };
  return settleBossChallengeRecord(current, attempt);
}

function settleBossChallengeRecord(
  current: BossChallengeProgress,
  attempt: BossChallengeRecord,
): { progress: BossChallengeProgress; settlement: BossChallengeSettlement } {
  const previous = current.bestByBossId[attempt.bossId];
  const isNewBest = !previous || compareChallengeRecords(attempt, previous) > 0;
  const best = isNewBest ? attempt : previous;
  return {
    progress: isNewBest
      ? { ...current, bestByBossId: { ...current.bestByBossId, [attempt.bossId]: attempt } }
      : current,
    settlement: {
      attempt,
      best,
      previousBestScore: previous?.bestScore ?? null,
      isNewBest,
    },
  };
}

function bossChallengeRecordFingerprint(record: BossChallengeRecord | undefined): string {
  return record
    ? [record.bossId, record.bestScore, record.grade, Number(record.completed), record.roundsUsed, ...record.teamIds, record.source, record.updatedAt].join('|')
    : 'NONE';
}

function bossChallengeDraftFingerprint(draft: BossChallengeSquadDraft | undefined): string {
  return draft ? [draft.bossId, ...draft.teamIds, draft.updatedAt].join('|') : 'NONE';
}

function bossChallengeProgressFingerprint(progress: BossChallengeProgress): string {
  const best = Object.keys(progress.bestByBossId)
    .sort((left, right) => left.localeCompare(right))
    .map((bossId) => bossChallengeRecordFingerprint(progress.bestByBossId[bossId]));
  const drafts = Object.keys(progress.draftByBossId)
    .sort((left, right) => left.localeCompare(right))
    .map((bossId) => bossChallengeDraftFingerprint(progress.draftByBossId[bossId]));
  return [`V${progress.schemaVersion}`, `BEST:${best.join('~')}`, `DRAFT:${drafts.join('~')}`].join('||');
}

function bossChallengeImportCounts(progress: BossChallengeProgress): BossChallengeImportCounts {
  const records = Object.values(progress.bestByBossId);
  return {
    bestRecords: records.length,
    operationRecords: records.filter((record) => record.source === 'OPERATION').length,
    draftConfirmationRecords: records.filter((record) => record.source === 'DRAFT_CONFIRMATION').length,
    squadDrafts: Object.keys(progress.draftByBossId).length,
  };
}

export function bossChallengeSummary(progress: BossChallengeProgress, bosses: BossData[]): BossChallengeSummary {
  const validBossIds = new Set(bosses.map((boss) => boss.id));
  const records = Object.values(progress.bestByBossId).filter((record) => validBossIds.has(record.bossId));
  return {
    attemptedBosses: records.length,
    completedBosses: records.filter((record) => record.completed).length,
    totalBosses: bosses.length,
    averageBestScore: records.length > 0 ? Math.round(records.reduce((sum, record) => sum + record.bestScore, 0) / records.length) : 0,
    sGradeBosses: records.filter((record) => record.grade === 'S').length,
  };
}

export function bossChallengeSourceSummary(progress: BossChallengeProgress, bosses: BossData[]): BossChallengeSourceSummary {
  const validBossIds = new Set(bosses.map((boss) => boss.id));
  const records = Object.values(progress.bestByBossId).filter((record) => validBossIds.has(record.bossId));
  const operation = records.filter((record) => record.source === 'OPERATION');
  const draftConfirmation = records.filter((record) => record.source === 'DRAFT_CONFIRMATION');
  return {
    operationRecords: operation.length,
    operationCompleted: operation.filter((record) => record.completed).length,
    draftConfirmationRecords: draftConfirmation.length,
    draftConfirmationCompleted: draftConfirmation.filter((record) => record.completed).length,
  };
}

export function createBossChallengeCampaignProjection(
  campaign: CampaignProgress,
  characters: CharacterData[],
): CampaignProgress {
  // Challenge 只借用既有 Mastery／filter API；回傳新物件且清空持久疲勞，絕不寫回 Campaign。
  return {
    ...campaign,
    characterXp: Object.fromEntries(characters.map((character) => [character.id, BOSS_CHALLENGE_MASTERY_XP])),
    crewFatigue: {},
  };
}

export function bossChallengeWeatherProtectionBonus(boss: BossData): number {
  return boss.class === 'GRD' ? (BOSS_CHALLENGE_GRID_WEATHER_PROTECTION_BONUS[boss.severity] ?? 0) : 0;
}

export function bossChallengeVesselProjection(vessel: VesselData, boss: BossData): VesselData {
  const weatherProtectionBonus = bossChallengeWeatherProtectionBonus(boss);
  // 固定 VES002 在高階電網事件代表已完成海況預判與動態定位準備；只投影 Challenge，Campaign 原值不變。
  return weatherProtectionBonus > 0
    ? { ...vessel, weatherProtection: vessel.weatherProtection + weatherProtectionBonus }
    : vessel;
}

export function bossChallengeRoundTeamProjection(team: CharacterRuntimeState[], boss: BossData): CharacterRuntimeState[] {
  const energyBonus = boss.class === 'GRD' ? (BOSS_CHALLENGE_GRID_ENERGY_RESERVE_BONUS[boss.severity] ?? 0) : 0;
  // 高階電網事件預留船上電力與通訊資源，讓固定 L1 loadout 仍能在十回合內形成有效決策空間。
  return energyBonus > 0
    ? team.map((runtime) => ({ ...runtime, energy: Math.min(10, runtime.energy + energyBonus) }))
    : team;
}

function compareChallengeRecords(left: BossChallengeRecord, right: BossChallengeRecord): number {
  if (left.bestScore !== right.bestScore) return left.bestScore > right.bestScore ? 1 : -1;
  if (left.completed !== right.completed) return left.completed ? 1 : -1;
  if (left.roundsUsed !== right.roundsUsed) return left.roundsUsed < right.roundsUsed ? 1 : -1;
  return 0;
}

function validInteger(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function isGrade(value: unknown): value is MissionDebrief['grade'] {
  return value === 'S' || value === 'A' || value === 'B' || value === 'C' || value === 'D';
}

function isBossChallengeRecordSource(value: unknown): value is BossChallengeRecordSource {
  return value === 'OPERATION' || value === 'DRAFT_CONFIRMATION';
}

function validTeamIds(value: unknown, characterIds: Set<string>): [string, string, string] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const teamIds = value.filter((id): id is string => typeof id === 'string' && characterIds.has(id));
  return teamIds.length === 3 && new Set(teamIds).size === 3 ? teamIds as [string, string, string] : null;
}
