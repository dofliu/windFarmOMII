import { describe, expect, it } from 'vitest';
import bossesJson from '../../json/bosses.json';
import auditJson from '../../json/bossChallengeAudit.json';
import charactersJson from '../../json/characters.json';
import equipmentJson from '../../json/equipment.json';
import missionsJson from '../../json/missions.json';
import skillsJson from '../../json/skills.json';
import vesselsJson from '../../json/vessels.json';
import type { BalanceDatabase } from './balance';
import { createInitialCampaign } from './campaign';
import {
  BOSS_CHALLENGE_MASTERY_XP,
  bossChallengeRoundTeamProjection,
  bossChallengeSourceSummary,
  bossChallengeSummary,
  confirmBossChallengeImport,
  confirmBossChallengeDraftSettlement,
  bossChallengeVesselProjection,
  createBossChallengeDraftSettlementPreview,
  createBossChallengeImportPreview,
  createBossChallengeCampaignProjection,
  createInitialBossChallengeProgress,
  normalizeBossChallengeProgress,
  parseBossChallengeSave,
  recordBossChallenge,
  recordBossChallengeSquadDraft,
  seedBossChallengeSquadDraftFromAudit,
  serializeBossChallengeSave,
  undoBossChallengeImport,
} from './bossChallenge';
import { createBossChallengeRuntimeRepairEscalation } from './bossChallengeRepairEscalation';
import { verifyBossChallengeDraft } from './bossChallengeVerification';
import { createMission, type MissionDebrief } from './runtime';
import type { BossChallengeAuditData, BossData, CharacterData, VesselData } from './types';

const bosses = bossesJson as BossData[];
const characters = charactersJson as CharacterData[];
const audit = auditJson as BossChallengeAuditData;
const vessels = vesselsJson as VesselData[];
const database = {
  missions: missionsJson,
  bosses: bossesJson,
  characters: charactersJson,
  skills: skillsJson,
  equipment: equipmentJson,
  vessels: vesselsJson,
} as unknown as BalanceDatabase;
const boss = bosses[0];
const teamIds = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
const debrief = (score: number, grade: MissionDebrief['grade'] = 'A'): MissionDebrief => ({
  totalScore: score,
  grade,
  safetyScore: 80,
  completionScore: 100,
  evidenceScore: 80,
  timeScore: 80,
  fatigueScore: 80,
  costScore: 80,
});

describe('Boss Challenge', () => {
  it('v1 local best 可無損移轉為 v3，且只保留合法 Boss／隊伍／分數並標記 OPERATION', () => {
    const normalized = normalizeBossChallengeProgress({
      schemaVersion: 1,
      bestByBossId: {
        [boss.id]: { bossId: boss.id, bestScore: 88, grade: 'A', completed: true, roundsUsed: 7, teamIds, updatedAt: '2026-07-16T00:00:00Z' },
        UNKNOWN: { bossId: 'UNKNOWN', bestScore: 100, grade: 'S', completed: true, roundsUsed: 1, teamIds },
      },
    }, bosses, characters);
    expect(normalized.schemaVersion).toBe(3);
    expect(normalized.draftByBossId).toEqual({});
    expect(Object.keys(normalized.bestByBossId)).toEqual([boss.id]);
    expect(normalized.bestByBossId[boss.id].bestScore).toBe(88);
    expect(normalized.bestByBossId[boss.id].source).toBe('OPERATION');
  });

  it('v2 best/draft migration 保留 draft 並為舊 best 套用 OPERATION；v3 保留合法來源', () => {
    const legacy = normalizeBossChallengeProgress({
      schemaVersion: 2,
      bestByBossId: {
        [boss.id]: { bossId: boss.id, bestScore: 88, grade: 'A', completed: true, roundsUsed: 7, teamIds, source: 'DRAFT_CONFIRMATION', updatedAt: 'LEGACY' },
      },
      draftByBossId: { [boss.id]: { bossId: boss.id, teamIds, updatedAt: 'DRAFT' } },
    }, bosses, characters);
    expect(legacy).toMatchObject({ schemaVersion: 3 });
    expect(legacy.bestByBossId[boss.id].source).toBe('OPERATION');
    expect(legacy.draftByBossId[boss.id].teamIds).toEqual(teamIds);

    const current = normalizeBossChallengeProgress({
      ...legacy,
      bestByBossId: { [boss.id]: { ...legacy.bestByBossId[boss.id], source: 'DRAFT_CONFIRMATION' } },
    }, bosses, characters);
    expect(current.bestByBossId[boss.id].source).toBe('DRAFT_CONFIRMATION');
  });

  it('Challenge-only v3 envelope 可 round-trip，v2 envelope 會正規化來源並保留 draft', () => {
    const progress = normalizeBossChallengeProgress({
      schemaVersion: 3,
      bestByBossId: {
        [boss.id]: { bossId: boss.id, bestScore: 88, grade: 'A', completed: true, roundsUsed: 7, teamIds, source: 'DRAFT_CONFIRMATION', updatedAt: 'BEST' },
      },
      draftByBossId: { [boss.id]: { bossId: boss.id, teamIds, updatedAt: 'DRAFT' } },
    }, bosses, characters);
    expect(parseBossChallengeSave(serializeBossChallengeSave(progress), bosses, characters)).toEqual({ ok: true, progress, migratedLegacy: false, sourceSchemaVersion: 3 });

    const legacyEnvelope = JSON.stringify({
      format: 'OWM_CHALLENGE_SAVE',
      schemaVersion: 2,
      progress: { ...progress, schemaVersion: 2 },
    });
    const legacy = parseBossChallengeSave(legacyEnvelope, bosses, characters);
    expect(legacy.ok).toBe(true);
    if (legacy.ok) {
      expect(legacy.migratedLegacy).toBe(true);
      expect(legacy.sourceSchemaVersion).toBe(2);
      expect(legacy.progress.bestByBossId[boss.id].source).toBe('OPERATION');
      expect(legacy.progress.draftByBossId[boss.id].teamIds).toEqual(teamIds);
    }
  });

  it('Challenge backup 拒絕 Campaign envelope、損壞 JSON 與未來版本', () => {
    expect(parseBossChallengeSave('{oops', bosses, characters)).toEqual({ ok: false, error: 'INVALID_JSON' });
    expect(parseBossChallengeSave(JSON.stringify({ format: 'OWM_CAMPAIGN_SAVE', schemaVersion: 5, progress: {} }), bosses, characters)).toEqual({ ok: false, error: 'INVALID_FORMAT' });
    expect(parseBossChallengeSave(JSON.stringify({ format: 'OWM_CHALLENGE_SAVE', schemaVersion: 4, progress: { bestByBossId: {} } }), bosses, characters)).toEqual({ ok: false, error: 'UNSUPPORTED_VERSION' });
    expect(parseBossChallengeSave(JSON.stringify({ schemaVersion: 4, bestByBossId: {} }), bosses, characters)).toEqual({ ok: false, error: 'UNSUPPORTED_VERSION' });
  });

  it('Challenge import preflight 顯示 best/source/draft 差異與被移除 Boss，確認後可 session undo', () => {
    const current = normalizeBossChallengeProgress({
      schemaVersion: 3,
      bestByBossId: {
        BOSS001: { bossId: 'BOSS001', bestScore: 80, grade: 'A', completed: true, roundsUsed: 4, teamIds, source: 'OPERATION', updatedAt: 'A' },
        BOSS002: { bossId: 'BOSS002', bestScore: 70, grade: 'B', completed: true, roundsUsed: 5, teamIds, source: 'DRAFT_CONFIRMATION', updatedAt: 'B' },
      },
      draftByBossId: {
        BOSS001: { bossId: 'BOSS001', teamIds, updatedAt: 'A' },
        BOSS003: { bossId: 'BOSS003', teamIds, updatedAt: 'C' },
      },
    }, bosses, characters);
    const imported = parseBossChallengeSave(JSON.stringify({
      format: 'OWM_CHALLENGE_SAVE',
      schemaVersion: 2,
      progress: {
        schemaVersion: 2,
        bestByBossId: {
          BOSS002: { bossId: 'BOSS002', bestScore: 71, grade: 'B', completed: true, roundsUsed: 5, teamIds, source: 'DRAFT_CONFIRMATION', updatedAt: 'B2' },
          BOSS004: { bossId: 'BOSS004', bestScore: 65, grade: 'C', completed: true, roundsUsed: 6, teamIds, updatedAt: 'D' },
        },
        draftByBossId: {
          BOSS002: { bossId: 'BOSS002', teamIds, updatedAt: 'B2' },
          BOSS003: { bossId: 'BOSS003', teamIds: ['CHR-GOV-003', 'CHR-MAR-178', 'CHR-OMI-223'], updatedAt: 'C2' },
        },
      },
    }), bosses, characters);
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;

    const preview = createBossChallengeImportPreview(current, imported);
    expect(preview).toMatchObject({
      provenance: 'CHALLENGE_IMPORT_CONFIRMATION_REQUIRED',
      sourceSchemaVersion: 2,
      migratedLegacy: true,
      current: { bestRecords: 2, operationRecords: 1, draftConfirmationRecords: 1, squadDrafts: 2 },
      incoming: { bestRecords: 2, operationRecords: 2, draftConfirmationRecords: 0, squadDrafts: 2 },
      addedBestBossIds: ['BOSS004'],
      changedBestBossIds: ['BOSS002'],
      removedBestBossIds: ['BOSS001'],
      addedDraftBossIds: ['BOSS002'],
      changedDraftBossIds: ['BOSS003'],
      removedDraftBossIds: ['BOSS001'],
      removedBossIds: ['BOSS001'],
    });

    const confirmed = confirmBossChallengeImport(current, preview);
    expect(confirmed.progress.bestByBossId.BOSS002.source).toBe('OPERATION');
    expect(confirmed.progress.bestByBossId.BOSS004).toBeDefined();
    expect(undoBossChallengeImport(confirmed.progress, confirmed.undo)).toBe(current);
  });

  it('Challenge import preview 與 Undo fingerprint 會拒絕過期狀態', () => {
    const current = recordBossChallenge(createInitialBossChallengeProgress(), boss, debrief(80), { ...createMission(boss), complete: true, round: 4 }, teamIds, 'A').progress;
    const imported = parseBossChallengeSave(JSON.stringify({ schemaVersion: 3, bestByBossId: {}, draftByBossId: {} }), bosses, characters);
    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    const preview = createBossChallengeImportPreview(current, imported);
    const changed = recordBossChallengeSquadDraft(current, boss, teamIds, 'DRAFT');
    expect(() => confirmBossChallengeImport(changed, preview)).toThrow(/changed before import confirmation/);

    const confirmed = confirmBossChallengeImport(current, preview);
    const changedAfterImport = recordBossChallengeSquadDraft(confirmed.progress, boss, teamIds, 'AFTER');
    expect(() => undoBossChallengeImport(changedAfterImport, confirmed.undo)).toThrow(/session undo is stale/);
    expect(() => confirmBossChallengeImport(current, { ...preview, incomingProgress: changedAfterImport })).toThrow(/payload changed/);
  });

  it('100 Boss squad drafts 皆驗證 Boss/character FK，並拒絕重複或未知 stable ID', () => {
    const draftByBossId = Object.fromEntries(bosses.map((item) => [item.id, {
      bossId: item.id,
      teamIds,
      updatedAt: item.id,
    }]));
    const normalized = normalizeBossChallengeProgress({
      schemaVersion: 2,
      bestByBossId: {},
      draftByBossId: {
        ...draftByBossId,
        UNKNOWN: { bossId: 'UNKNOWN', teamIds, updatedAt: 'x' },
        [bosses[1].id]: { bossId: bosses[1].id, teamIds: [teamIds[0], teamIds[0], teamIds[1]], updatedAt: 'x' },
      },
    }, bosses, characters);
    expect(Object.keys(normalized.draftByBossId)).toHaveLength(99);
    expect(normalized.draftByBossId[boss.id].teamIds).toEqual(teamIds);
    expect(normalized.draftByBossId.UNKNOWN).toBeUndefined();
    expect(normalized.draftByBossId[bosses[1].id]).toBeUndefined();
  });

  it('Squad draft 與 local best provenance 獨立，相同隊伍不重寫', () => {
    const mission = { ...createMission(boss), complete: true, round: 8 };
    const withBest = recordBossChallenge(createInitialBossChallengeProgress(), boss, debrief(82), mission, teamIds, 'BEST').progress;
    const draftTeam = ['CHR-GOV-003', 'CHR-MAR-178', 'CHR-OMI-223'];
    const withDraft = recordBossChallengeSquadDraft(withBest, boss, draftTeam, 'DRAFT');
    expect(withDraft.bestByBossId[boss.id].teamIds).toEqual(teamIds);
    expect(withDraft.draftByBossId[boss.id]).toEqual({ bossId: boss.id, teamIds: draftTeam, updatedAt: 'DRAFT' });
    expect(recordBossChallengeSquadDraft(withDraft, boss, draftTeam, 'LATER')).toBe(withDraft);
  });

  it('100 Boss 均可由成功 audit recommendation 建立 draft，且不改 local best 並保持 idempotent', () => {
    const bossById = new Map(bosses.map((item) => [item.id, item]));
    let progress = createInitialBossChallengeProgress();
    for (const item of audit.items) {
      progress = seedBossChallengeSquadDraftFromAudit(progress, bossById.get(item.bossId)!, item, characters, item.bossId);
    }
    expect(Object.keys(progress.draftByBossId)).toHaveLength(100);
    expect(progress.bestByBossId).toEqual({});
    expect(progress.draftByBossId.BOSS001.teamIds).toEqual(audit.items[0].recommendedTeamIds);
    expect(seedBossChallengeSquadDraftFromAudit(progress, bosses[0], audit.items[0], characters, 'LATER')).toBe(progress);
  });

  it('audit seed 拒絕 Boss mismatch、失敗結果與未知角色 FK', () => {
    const item = audit.items[0];
    expect(() => seedBossChallengeSquadDraftFromAudit(createInitialBossChallengeProgress(), bosses[1], item, characters)).toThrow(/不可用/);
    expect(() => seedBossChallengeSquadDraftFromAudit(createInitialBossChallengeProgress(), bosses[0], { ...item, success: false }, characters)).toThrow(/不可用/);
    expect(() => seedBossChallengeSquadDraftFromAudit(createInitialBossChallengeProgress(), bosses[0], { ...item, recommendedTeamIds: ['UNKNOWN', item.recommendedTeamIds[1], item.recommendedTeamIds[2]] }, characters)).toThrow(/角色 FK/);
  });

  it('高分優先，同分時完成優先，再以較少回合決勝', () => {
    const mission = { ...createMission(boss), complete: true, round: 8 };
    const first = recordBossChallenge(createInitialBossChallengeProgress(), boss, debrief(82), mission, teamIds, 'A').progress;
    const lower = recordBossChallenge(first, boss, debrief(70, 'B'), { ...mission, round: 4 }, teamIds, 'B');
    expect(lower.settlement.isNewBest).toBe(false);
    const faster = recordBossChallenge(first, boss, debrief(82), { ...mission, round: 6 }, teamIds, 'C');
    expect(faster.settlement.isNewBest).toBe(true);
    expect(faster.progress.bestByBossId[boss.id].roundsUsed).toBe(6);
  });

  it('CLEAR runtime candidate 先建立無副作用 preview，確認後才寫入 local best', () => {
    const clearBoss = bosses.find((item) => item.id === 'BOSS015')!;
    const sourceIds: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
    const escalation = createBossChallengeRuntimeRepairEscalation(database, clearBoss.id, sourceIds, 'NO_REACTIVE');
    const clearCandidate = escalation.candidates.find((candidate) => candidate.verification.success)!;
    const initial = createInitialBossChallengeProgress();
    const preview = createBossChallengeDraftSettlementPreview(initial, clearBoss, clearCandidate.verification);

    expect(initial.bestByBossId).toEqual({});
    expect(preview).toMatchObject({
      provenance: 'DRAFT_RUNTIME_CONFIRMATION_REQUIRED',
      bossId: 'BOSS015',
      teamIds: clearCandidate.teamIds,
      status: 'CLEAR',
      score: clearCandidate.verification.score,
      round: clearCandidate.verification.round,
      previousBestScore: null,
      projectedIsNewBest: true,
    });

    const confirmed = confirmBossChallengeDraftSettlement(initial, clearBoss, preview, 'CONFIRMED');
    expect(confirmed.settlement).toMatchObject({ isNewBest: true, previousBestScore: null });
    expect(confirmed.progress.bestByBossId.BOSS015).toMatchObject({
      completed: true,
      teamIds: clearCandidate.teamIds,
      bestScore: clearCandidate.verification.score,
      roundsUsed: clearCandidate.verification.round,
      source: 'DRAFT_CONFIRMATION',
      updatedAt: 'CONFIRMED',
    });
  });

  it('來源不參與最佳紀錄排序；相同成績的 OPERATION 不覆寫 DRAFT_CONFIRMATION', () => {
    const clearBoss = bosses.find((item) => item.id === 'BOSS015')!;
    const verification = verifyBossChallengeDraft(database, clearBoss.id, ['CHR-MFG-128', 'CHR-MAR-176', 'CHR-OMI-221']);
    const preview = createBossChallengeDraftSettlementPreview(createInitialBossChallengeProgress(), clearBoss, verification);
    const confirmed = confirmBossChallengeDraftSettlement(createInitialBossChallengeProgress(), clearBoss, preview, 'DRAFT');
    const operation = recordBossChallenge(
      confirmed.progress,
      clearBoss,
      debrief(verification.score, verification.grade),
      { ...createMission(clearBoss), complete: true, round: verification.round },
      verification.teamIds,
      'OPERATION',
    );

    expect(operation.settlement.attempt.source).toBe('OPERATION');
    expect(operation.settlement.isNewBest).toBe(false);
    expect(operation.progress.bestByBossId[clearBoss.id].source).toBe('DRAFT_CONFIRMATION');
  });

  it('FAILED verification 不可建立確認預覽，過期 preview 也不可覆寫較新的 local best', () => {
    const clearBoss = bosses.find((item) => item.id === 'BOSS015')!;
    const failed = verifyBossChallengeDraft(database, clearBoss.id, ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221']);
    expect(failed.status).toBe('FAILED');
    expect(() => createBossChallengeDraftSettlementPreview(createInitialBossChallengeProgress(), clearBoss, failed)).toThrow(/CLEAR/);

    const clearVerification = verifyBossChallengeDraft(database, clearBoss.id, ['CHR-MFG-128', 'CHR-MAR-176', 'CHR-OMI-221']);
    const initial = createInitialBossChallengeProgress();
    const preview = createBossChallengeDraftSettlementPreview(initial, clearBoss, clearVerification);
    const changed = recordBossChallenge(initial, clearBoss, debrief(99, 'S'), { ...createMission(clearBoss), complete: true, round: 2 }, audit.items.find((item) => item.bossId === clearBoss.id)!.recommendedTeamIds, 'NEWER').progress;
    expect(() => confirmBossChallengeDraftSettlement(changed, clearBoss, preview, 'STALE')).toThrow(/changed before confirmation/);
  });

  it('摘要只統計每個 Boss 的 local best', () => {
    const result = recordBossChallenge(
      createInitialBossChallengeProgress(),
      boss,
      debrief(92, 'S'),
      { ...createMission(boss), complete: true, round: 5 },
      teamIds,
      'A',
    ).progress;
    expect(result.bestByBossId[boss.id].source).toBe('OPERATION');
    expect(bossChallengeSummary(result, bosses)).toEqual({ attemptedBosses: 1, completedBosses: 1, totalBosses: 100, averageBestScore: 92, sGradeBosses: 1 });
    expect(bossChallengeSourceSummary(result, bosses)).toEqual({ operationRecords: 1, operationCompleted: 1, draftConfirmationRecords: 0, draftConfirmationCompleted: 0 });
  });

  it('固定 L3 projection 不修改 Campaign XP 或持久疲勞', () => {
    const campaign = { ...createInitialCampaign([], []), characterXp: { 'CHR-GOV-001': 900 }, crewFatigue: { 'CHR-GOV-001': 50 } };
    const projected = createBossChallengeCampaignProjection(campaign, characters);
    expect(projected.characterXp['CHR-GOV-001']).toBe(BOSS_CHALLENGE_MASTERY_XP);
    expect(Object.values(projected.characterXp).every((xp) => xp === 250)).toBe(true);
    expect(projected.crewFatigue).toEqual({});
    expect(campaign.characterXp['CHR-GOV-001']).toBe(900);
    expect(campaign.crewFatigue['CHR-GOV-001']).toBe(50);
  });

  it('GRD S5 reserve 只投影 Challenge，不修改原始 VES002 或其他 Boss', () => {
    const vessel = vessels.find((item) => item.id === 'VES002')!;
    const gridFinale = bosses.find((item) => item.id === 'BOSS080')!;
    const nonGridFinale = bosses.find((item) => item.severity === 'S5' && item.class !== 'GRD')!;
    const projected = bossChallengeVesselProjection(vessel, gridFinale);
    expect(projected.weatherProtection).toBe(vessel.weatherProtection + 3);
    expect(vessel.weatherProtection).toBe(5);
    expect(bossChallengeVesselProjection(vessel, nonGridFinale)).toBe(vessel);

    const team = [{ characterId: teamIds[0], fatigue: 0, actionPoints: 1, energy: 6, fatigueProtection: 0, cooldowns: {}, statuses: [] }];
    expect(bossChallengeRoundTeamProjection(team, gridFinale)[0].energy).toBe(7);
    expect(team[0].energy).toBe(6);
    expect(bossChallengeRoundTeamProjection(team, nonGridFinale)).toBe(team);
  });
});
