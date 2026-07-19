import { describe, expect, it } from 'vitest';
import { resolveSceneRoute, sceneRouteName, sceneRouteProvenance } from './sceneRouting';
import type { SceneAssetIndexData, SceneData } from './types';

const scenes: SceneData[] = [
  {
    id: 'SCN001', nameZh: '清晨風場', nameEn: 'Dawn wind farm', locationType: '風場全景', variant: 'V1',
    camera: '16:9', mood: 'dawn', imagePrompt: 'prompt 1', fileName: 'SCN001_V1_v001.png',
  },
  {
    id: 'SCN002', nameZh: '晴日風場', nameEn: 'Clear wind farm', locationType: '風場全景', variant: 'V2',
    camera: '16:9', mood: 'day', imagePrompt: 'prompt 2', fileName: 'SCN002_V2_v001.png',
  },
  {
    id: 'SCN003', nameZh: '憸典?冽?駁憭?', nameEn: 'Rainy wind farm', locationType: '憸典?冽', variant: 'V3',
    camera: '16:9', mood: 'rain', imagePrompt: 'prompt 3', fileName: 'SCN003_V3_v001.png',
  },
];
const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
const assets: SceneAssetIndexData = {
  schemaVersion: 1,
  fallback: {
    sourceSceneId: 'SCN002', file: '/fallback.png', version: 'v001', qaStatus: 'ENGINEERING_QA_PASSED',
    labelZh: '共用風場', labelEn: 'Shared field feed',
  },
  items: {
    SCN001: { sceneId: 'SCN001', file: '/SCN001.png', version: 'v003', qaStatus: 'VISUAL_REVIEW_REQUIRED' },
    SCN003: { sceneId: 'SCN003', file: '/SCN003-rain.png', version: 'v001', qaStatus: 'ENGINEERING_QA_PASSED' },
  },
};

describe('Mission scene routing', () => {
  it('routes an integrated scene to its dedicated versioned asset', () => {
    const route = resolveSceneRoute('SCN001', sceneById, assets);
    expect(route.availability).toBe('INTEGRATED');
    expect(route.assetUrl).toBe('/SCN001.png');
    expect(route.fallbackUrl).toBe('/fallback.png');
    expect(route.sourceScene.id).toBe('SCN001');
    expect(route.version).toBe('v003');
    expect(sceneRouteName(route, 'zh')).toBe('清晨風場');
    expect(sceneRouteProvenance(route, 'en')).toContain('Dedicated scene asset');
  });

  it('routes additional field-feed variants as integrated assets', () => {
    const route = resolveSceneRoute('SCN003', sceneById, assets);
    expect(route.availability).toBe('INTEGRATED');
    expect(route.assetUrl).toBe('/SCN003-rain.png');
    expect(route.sourceScene.id).toBe('SCN003');
    expect(route.qaStatus).toBe('ENGINEERING_QA_PASSED');
    expect(sceneRouteName(route, 'en')).toBe('Rainy wind farm');
  });

  it('preserves requested metadata while safely routing missing art to the shared fallback', () => {
    const route = resolveSceneRoute('SCN002', sceneById, { ...assets, items: {} });
    expect(route.availability).toBe('FALLBACK');
    expect(route.requestedScene.id).toBe('SCN002');
    expect(route.sourceScene.id).toBe('SCN002');
    expect(route.assetUrl).toBe('/fallback.png');
    expect(sceneRouteProvenance(route, 'zh')).toContain('共用風場');
  });

  it('rejects unknown requested or fallback scene IDs instead of hiding broken FKs', () => {
    expect(() => resolveSceneRoute('SCN999', sceneById, assets)).toThrow('Scene 不存在');
    expect(() => resolveSceneRoute('SCN002', sceneById, {
      ...assets,
      fallback: { ...assets.fallback, sourceSceneId: 'SCN999' },
      items: {},
    })).toThrow('Scene asset source 不存在');
  });
});
