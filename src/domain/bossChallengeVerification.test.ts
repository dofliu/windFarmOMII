import { describe, expect, it } from 'vitest';
import audit from '../../json/bossChallengeAudit.json';
import bosses from '../../json/bosses.json';
import characters from '../../json/characters.json';
import equipment from '../../json/equipment.json';
import missions from '../../json/missions.json';
import skills from '../../json/skills.json';
import vessels from '../../json/vessels.json';
import type { BalanceDatabase } from './balance';
import { createBossChallengeRouteRepairPreview } from './bossChallengeCandidate';
import {
  compareBossChallengeDraftVerifications,
  createBossChallengeDraftRepairEvidence,
  verifyBossChallengeDraft,
} from './bossChallengeVerification';

const database = { missions, bosses, characters, skills, equipment, vessels } as unknown as BalanceDatabase;

describe('Boss Challenge draft verification', () => {
  it('repeats the same draft deterministically without mutating its input', () => {
    const teamIds = [...audit.items[3].recommendedTeamIds] as [string, string, string];
    const before = [...teamIds];
    const first = verifyBossChallengeDraft(database, audit.items[3].bossId, teamIds);
    const second = verifyBossChallengeDraft(database, audit.items[3].bossId, teamIds);
    expect(second).toEqual(first);
    expect(teamIds).toEqual(before);
    expect(first).toMatchObject({ provenance: 'DRAFT_RUNTIME_ONLY', status: 'CLEAR' });
  });

  it('matches all 100 stored audit recommendations exactly', () => {
    for (const item of audit.items) {
      const result = verifyBossChallengeDraft(database, item.bossId, [...item.recommendedTeamIds] as [string, string, string]);
      expect(result, item.bossId).toMatchObject({
        bossId: item.bossId,
        teamIds: item.recommendedTeamIds,
        success: item.success,
        score: item.score,
        grade: item.grade,
        round: item.round,
        pressure: item.pressure,
      });
    }
  });

  it('reports both a successful audit draft and a failed modified draft', () => {
    const auditTeam = [...audit.items.find((item) => item.bossId === 'BOSS080')!.recommendedTeamIds] as [string, string, string];
    const modifiedTeam: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
    expect(verifyBossChallengeDraft(database, 'BOSS080', auditTeam)).toMatchObject({ status: 'CLEAR', success: true });
    expect(verifyBossChallengeDraft(database, 'BOSS080', modifiedTeam)).toMatchObject({ status: 'FAILED', success: false });
  });

  it('binds a failed runtime result to the priority structural repair using stable IDs', () => {
    const teamIds: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
    const boss = bosses.find((item) => item.id === 'BOSS080')!;
    const characterById = new Map(characters.map((item) => [item.id, item]));
    const preview = createBossChallengeRouteRepairPreview(
      boss as never,
      teamIds.map((id) => characterById.get(id)!) as never,
      characters as never,
      new Map(skills.map((item) => [item.id, item])) as never,
    );
    const before = verifyBossChallengeDraft(database, boss.id, teamIds);
    const evidence = createBossChallengeDraftRepairEvidence(before, preview);
    expect(evidence).toMatchObject({
      bossId: 'BOSS080',
      failedTeamIds: teamIds,
      priorityGap: 'NO_REACTIVE',
      repairTeamIds: preview?.candidate?.teamIds,
      replacementCharacterId: preview?.candidate?.character.id,
      replacedCharacterId: preview?.candidate?.replaces.id,
    });
    const after = verifyBossChallengeDraft(database, boss.id, evidence!.repairTeamIds);
    expect(compareBossChallengeDraftVerifications(before, after)).toMatchObject({
      bossId: 'BOSS080',
      beforeTeamIds: teamIds,
      afterTeamIds: evidence!.repairTeamIds,
      outcome: 'STILL_FAILED',
      scoreDelta: after.score - before.score,
      roundDelta: after.round - before.round,
    });
  });

  it('has a deterministic failed-to-clear repair fixture', () => {
    const teamIds: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
    const characterById = new Map(characters.map((item) => [item.id, item]));
    const skillById = new Map(skills.map((item) => [item.id, item]));
    const boss = bosses.find((item) => item.id === 'BOSS015')!;
    const before = verifyBossChallengeDraft(database, boss.id, teamIds);
    const preview = createBossChallengeRouteRepairPreview(
      boss as never,
      teamIds.map((id) => characterById.get(id)!) as never,
      characters as never,
      skillById as never,
    );
    expect(before.success).toBe(false);
    expect(preview?.candidate?.teamIds).toEqual(['CHR-MFG-128', 'CHR-MAR-176', 'CHR-OMI-221']);
    const after = verifyBossChallengeDraft(database, boss.id, preview!.candidate!.teamIds);
    expect(after.success).toBe(true);
    expect(compareBossChallengeDraftVerifications(before, after)).toMatchObject({
      outcome: 'CLEARED_AFTER_REPAIR',
      beforeTeamIds: teamIds,
      afterTeamIds: ['CHR-MFG-128', 'CHR-MAR-176', 'CHR-OMI-221'],
    });
  });
});
