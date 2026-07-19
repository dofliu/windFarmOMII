import type { Language, SceneAssetIndexData, SceneData } from './types';

export type SceneAssetAvailability = 'INTEGRATED' | 'FALLBACK';

export interface SceneRoute {
  requestedScene: SceneData;
  sourceScene: SceneData;
  availability: SceneAssetAvailability;
  assetUrl: string;
  fallbackUrl: string;
  version: string;
  qaStatus: string;
  provenanceZh: string;
  provenanceEn: string;
}

export function resolveSceneRoute(
  sceneId: string,
  sceneById: ReadonlyMap<string, SceneData>,
  assetIndex: SceneAssetIndexData,
): SceneRoute {
  const requestedScene = sceneById.get(sceneId);
  if (!requestedScene) throw new Error(`Scene 不存在：${sceneId}`);

  const directAsset = assetIndex.items[sceneId];
  const selectedAsset = directAsset ?? assetIndex.fallback;
  const sourceSceneId = directAsset?.sceneId ?? assetIndex.fallback.sourceSceneId;
  const sourceScene = sceneById.get(sourceSceneId);
  if (!sourceScene) throw new Error(`Scene asset source 不存在：${sourceSceneId}`);

  return {
    requestedScene,
    sourceScene,
    availability: directAsset ? 'INTEGRATED' : 'FALLBACK',
    assetUrl: selectedAsset.file,
    fallbackUrl: assetIndex.fallback.file,
    version: selectedAsset.version,
    qaStatus: selectedAsset.qaStatus,
    provenanceZh: directAsset
      ? `專屬場景資產 · ${directAsset.version}`
      : `${assetIndex.fallback.labelZh} · 原始場景 ${sourceScene.id}`,
    provenanceEn: directAsset
      ? `Dedicated scene asset · ${directAsset.version}`
      : `${assetIndex.fallback.labelEn} · source scene ${sourceScene.id}`,
  };
}

export function sceneRouteName(route: SceneRoute, language: Language): string {
  return language === 'zh' ? route.requestedScene.nameZh : route.requestedScene.nameEn;
}

export function sceneRouteProvenance(route: SceneRoute, language: Language): string {
  return language === 'zh' ? route.provenanceZh : route.provenanceEn;
}
