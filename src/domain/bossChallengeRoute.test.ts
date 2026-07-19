import { describe, expect, it } from 'vitest';
import auditJson from '../../json/bossChallengeAudit.json';
import bossesJson from '../../json/bosses.json';
import charactersJson from '../../json/characters.json';
import skillsJson from '../../json/skills.json';
import type { BossChallengeProgress } from './bossChallenge';
import {
  bossChallengeRouteClasses,
  createBossChallengeDraftPortfolio,
  createBossChallengeRepairQueue,
  createBossChallengeRouteDraftSummary,
  createInitialBossChallengeRouteFilters,
  filterAndSortBossChallengeRoute,
} from './bossChallengeRoute';
import type { BossChallengeAuditData, BossData, CharacterData, SkillData } from './types';

const bosses = bossesJson as BossData[];
const audit = auditJson as BossChallengeAuditData;
const characters = charactersJson as CharacterData[];
const characterById = new Map(characters.map((character) => [character.id, character]));
const skillById = new Map((skillsJson as SkillData[]).map((skill) => [skill.id, skill]));
const emptyProgress: BossChallengeProgress = { schemaVersion: 3, bestByBossId: {}, draftByBossId: {} };

describe('Boss Challenge Route', () => {
  it('預設依 ID 顯示完整 100 Boss，並提供 14 種 Class', () => {
    const items = filterAndSortBossChallengeRoute(bosses, emptyProgress, audit, createInitialBossChallengeRouteFilters(), characterById, skillById);
    expect(items).toHaveLength(100);
    expect(items[0].boss.id).toBe('BOSS001');
    expect(items[99].boss.id).toBe('BOSS100');
    expect(bossChallengeRouteClasses(bosses)).toHaveLength(14);
  });

  it('Severity、Class 與完成狀態可交集篩選', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      draftByBossId: {},
      bestByBossId: {
        BOSS079: { bossId: 'BOSS079', bestScore: 54, grade: 'D', completed: true, roundsUsed: 10, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'OPERATION', updatedAt: 'A' },
        BOSS080: { bossId: 'BOSS080', bestScore: 40, grade: 'D', completed: false, roundsUsed: 10, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'OPERATION', updatedAt: 'B' },
      },
    };
    const base = createInitialBossChallengeRouteFilters();
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, severity: 'S5', classCode: 'GRD' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS080']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, status: 'CLEARED' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS079']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, status: 'FAILED' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS080']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, status: 'UNATTEMPTED' }, characterById, skillById)).toHaveLength(98);
  });

  it('local-best source 可與完成狀態交集篩選', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      draftByBossId: {},
      bestByBossId: {
        BOSS001: { bossId: 'BOSS001', bestScore: 70, grade: 'B', completed: true, roundsUsed: 4, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'OPERATION', updatedAt: 'A' },
        BOSS002: { bossId: 'BOSS002', bestScore: 90, grade: 'S', completed: true, roundsUsed: 3, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'DRAFT_CONFIRMATION', updatedAt: 'B' },
        BOSS003: { bossId: 'BOSS003', bestScore: 40, grade: 'D', completed: false, roundsUsed: 10, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'OPERATION', updatedAt: 'C' },
      },
    };
    const base = createInitialBossChallengeRouteFilters();
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, source: 'OPERATION' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS001', 'BOSS003']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, source: 'DRAFT_CONFIRMATION' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS002']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, source: 'OPERATION', status: 'CLEARED' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS001']);
  });

  it('best-score 與 audit hardest 排序保持 deterministic', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      draftByBossId: {},
      bestByBossId: {
        BOSS001: { bossId: 'BOSS001', bestScore: 70, grade: 'B', completed: true, roundsUsed: 4, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'OPERATION', updatedAt: 'A' },
        BOSS002: { bossId: 'BOSS002', bestScore: 90, grade: 'S', completed: true, roundsUsed: 3, teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], source: 'DRAFT_CONFIRMATION', updatedAt: 'B' },
      },
    };
    const base = createInitialBossChallengeRouteFilters();
    const bestDescending = filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, sort: 'BEST_DESC' }, characterById, skillById);
    expect(bestDescending.slice(0, 2).map((item) => item.boss.id)).toEqual(['BOSS002', 'BOSS001']);
    const hardest = filterAndSortBossChallengeRoute(bosses, emptyProgress, audit, { ...base, sort: 'AUDIT_HARDEST' }, characterById, skillById);
    expect(hardest.slice(0, 3).map((item) => item.boss.id)).toEqual(['BOSS079', 'BOSS075', 'BOSS080']);
    expect(hardest.slice(0, 3).every((item) => item.hardOutlier)).toBe(true);
  });

  it('DRAFTED／UNDRAFTED 可交集篩選，並以 drafted-first + stable ID 排序', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      bestByBossId: {},
      draftByBossId: {
        BOSS099: { bossId: 'BOSS099', teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'B' },
        BOSS002: { bossId: 'BOSS002', teamIds: ['CHR-GOV-003', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'A' },
      },
    };
    const base = createInitialBossChallengeRouteFilters();
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, draftStatus: 'DRAFTED' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS002', 'BOSS099']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, draftStatus: 'UNDRAFTED' }, characterById, skillById)).toHaveLength(98);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, sort: 'DRAFTED_FIRST' }, characterById, skillById).slice(0, 3).map((item) => item.boss.id)).toEqual(['BOSS002', 'BOSS099', 'BOSS001']);
  });

  it('readiness portfolio、gap type filter 與排序會由正式 Strategy 結構派生', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      bestByBossId: {},
      draftByBossId: {
        BOSS001: { bossId: 'BOSS001', teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'A' },
        BOSS002: { bossId: 'BOSS002', teamIds: ['CHR-GOV-003', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'B' },
      },
    };
    const base = createInitialBossChallengeRouteFilters();
    const items = filterAndSortBossChallengeRoute(bosses, progress, audit, base, characterById, skillById);
    expect(createBossChallengeDraftPortfolio(items)).toEqual({
      totalBosses: 100,
      draftedBosses: 2,
      gapFreeDrafts: 1,
      draftsWithGaps: 1,
      gapCounts: { NO_REACTIVE: 1, NO_TEAM_RECOVERY: 0, NO_LOW_ENERGY_ACTION: 0, STAGE_GAP: 0 },
    });
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, readiness: 'GAP_FREE' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS002']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, readiness: 'HAS_GAPS' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS001']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, readiness: 'NO_REACTIVE' }, characterById, skillById).map((item) => item.boss.id)).toEqual(['BOSS001']);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...base, sort: 'READINESS' }, characterById, skillById).slice(0, 3).map((item) => item.boss.id)).toEqual(['BOSS002', 'BOSS001', 'BOSS003']);
  });

  it('Repair queue 忽略輸入排序並以 stable Boss ID 提供下一個 HAS-GAPS draft', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      bestByBossId: {},
      draftByBossId: {
        BOSS003: { bossId: 'BOSS003', teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'C' },
        BOSS002: { bossId: 'BOSS002', teamIds: ['CHR-GOV-003', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'B' },
        BOSS001: { bossId: 'BOSS001', teamIds: ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'], updatedAt: 'A' },
      },
    };
    const items = filterAndSortBossChallengeRoute(bosses, progress, audit, { ...createInitialBossChallengeRouteFilters(), sort: 'SEVERITY_DESC' }, characterById, skillById);
    const fromFirst = createBossChallengeRepairQueue([...items].reverse(), 'BOSS001');
    expect(fromFirst).toEqual({
      bossIds: ['BOSS001', 'BOSS003'],
      remainingDrafts: 2,
      currentPosition: 1,
      nextBossId: 'BOSS003',
      gapCounts: { NO_REACTIVE: 2, NO_TEAM_RECOVERY: 0, NO_LOW_ENERGY_ACTION: 0, STAGE_GAP: 0 },
    });
    expect(createBossChallengeRepairQueue(items, 'BOSS002')).toMatchObject({ currentPosition: 0, nextBossId: 'BOSS003' });
    expect(createBossChallengeRepairQueue(items, 'BOSS004')).toMatchObject({ currentPosition: 0, nextBossId: 'BOSS001' });
  });

  it('100 Boss draft FK 都可派生正式 Counter、Stage 與結構缺口摘要', () => {
    const progress: BossChallengeProgress = {
      schemaVersion: 3,
      bestByBossId: {},
      draftByBossId: Object.fromEntries(audit.items.map((item) => [item.bossId, {
        bossId: item.bossId,
        teamIds: item.recommendedTeamIds,
        updatedAt: item.bossId,
      }])),
    };
    const drafted = filterAndSortBossChallengeRoute(bosses, progress, audit, { ...createInitialBossChallengeRouteFilters(), draftStatus: 'DRAFTED' }, characterById, skillById);
    expect(drafted).toHaveLength(100);
    expect(filterAndSortBossChallengeRoute(bosses, progress, audit, { ...createInitialBossChallengeRouteFilters(), draftStatus: 'UNDRAFTED' }, characterById, skillById)).toHaveLength(0);
    for (const item of drafted) {
      const summary = createBossChallengeRouteDraftSummary(item, characterById, skillById);
      expect(summary?.teamIds).toHaveLength(3);
      expect(summary?.counterCount).toBeGreaterThanOrEqual(0);
      expect(summary?.counterCount).toBeLessThanOrEqual(3);
      expect(summary?.coveredStageCount).toBe(6);
      expect(summary?.gaps).toBeDefined();
    }
    const portfolio = createBossChallengeDraftPortfolio(drafted);
    expect(portfolio).toEqual({
      totalBosses: 100,
      draftedBosses: 100,
      gapFreeDrafts: 0,
      draftsWithGaps: 100,
      gapCounts: { NO_REACTIVE: 100, NO_TEAM_RECOVERY: 0, NO_LOW_ENERGY_ACTION: 0, STAGE_GAP: 0 },
    });
  });
});
