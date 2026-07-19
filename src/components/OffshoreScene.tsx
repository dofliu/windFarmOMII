import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { BossClassTelegraph } from '../domain/runtime';
import type { SceneRoute } from '../domain/sceneRouting';
import { rotorTelemetryGeometry, turbineBladePolygon, type RotorTelemetryGeometry } from '../domain/turbineGeometry';

interface OffshoreSceneProps {
  accent: string;
  danger: number;
  stage: string;
  telegraph: BossClassTelegraph;
  eventPulse: number;
  reducedMotion: boolean;
  sceneRoute: SceneRoute;
}

class WindFieldScene extends Phaser.Scene {
  private telemetryText?: Phaser.GameObjects.Text;
  private hazardGlow?: Phaser.GameObjects.Arc;
  private hazardRing?: Phaser.GameObjects.Arc;
  private hazardSymbol?: Phaser.GameObjects.Text;
  private hazardLabel?: Phaser.GameObjects.Text;
  private rotorTelemetryMeta?: RotorTelemetryGeometry & {
    hubX: number;
    hubY: number;
    bladeCount: number;
    shaftStartX: number;
    shaftEndX: number;
    bladeAngleCsv: string;
    transformOrigin: string;
  };
  private lastEventPulse = 0;
  private initialAccent = '#39d9c7';
  private readonly reducedMotion: boolean;
  private readonly sceneRoute: SceneRoute;
  private readonly onReady?: (scene: WindFieldScene) => void;

  constructor(accent: string, reducedMotion: boolean, sceneRoute: SceneRoute, onReady?: (scene: WindFieldScene) => void) {
    super('WindField');
    this.initialAccent = accent;
    this.reducedMotion = reducedMotion;
    this.sceneRoute = sceneRoute;
    this.onReady = onReady;
  }

  preload(): void {
    this.load.image('operation-scene-primary', this.sceneRoute.assetUrl);
    if (this.sceneRoute.fallbackUrl !== this.sceneRoute.assetUrl) {
      this.load.image('operation-scene-fallback', this.sceneRoute.fallbackUrl);
    }
  }

  create(): void {
    const width = 900;
    const height = 420;
    const sceneTexture = this.textures.exists('operation-scene-primary')
      ? 'operation-scene-primary'
      : this.textures.exists('operation-scene-fallback')
        ? 'operation-scene-fallback'
        : undefined;
    if (sceneTexture) {
      const fieldFeed = this.add.image(width / 2, height / 2, sceneTexture);
      const coverScale = Math.max(width / fieldFeed.width, height / fieldFeed.height);
      fieldFeed.setScale(coverScale);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x071a24, 1);
      this.add.text(width / 2, height / 2, 'FIELD FEED UNAVAILABLE', {
        color: '#789ca5', fontFamily: 'Consolas, monospace', fontSize: '14px', fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    const grade = this.add.graphics();
    grade.fillStyle(0x03121a, 0.34);
    grade.fillRect(0, 0, width, height);
    grade.fillGradientStyle(0x041720, 0x041720, 0x041720, 0x041720, 0.62, 0.62, 0.04, 0.04);
    grade.fillRect(0, 0, width, 105);
    grade.fillGradientStyle(0x041720, 0x041720, 0x041720, 0x041720, 0.02, 0.02, 0.76, 0.76);
    grade.fillRect(0, 300, width, 120);

    this.createRotorTelemetry(805, 318, 0.5);

    this.hazardGlow = this.add.circle(450, 190, 72, 0xff6b4a, 0.12);
    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.hazardGlow,
        scale: 1.18,
        alpha: 0.04,
        yoyo: true,
        repeat: -1,
        duration: 1100,
      });
    }

    this.hazardRing = this.add.circle(450, 190, 66, 0xffffff, 0).setStrokeStyle(3, 0xffffff, 0).setDepth(5);
    this.hazardSymbol = this.add.text(450, 190, '', {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '54px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setDepth(6);
    this.hazardLabel = this.add.text(856, 27, '', {
      color: '#8db8c4',
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(6);

    const accentValue = Phaser.Display.Color.HexStringToColor(this.initialAccent).color;
    this.add.rectangle(24, 24, 5, 56, accentValue, 1).setOrigin(0, 0);
    this.add.text(44, 26, '環海聯盟｜即時作業視窗', {
      color: '#dffbff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });
    this.telemetryText = this.add.text(44, 53, 'Detect · WEATHER WINDOW ACTIVE', {
      color: '#8db8c4',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      letterSpacing: 1.5,
    });
    this.onReady?.(this);
  }

  updateTelemetry(stage: string, danger: number): void {
    this.telemetryText?.setText(`${stage.toUpperCase()} · RISK ${Math.round(danger * 100)}%`);
    if (this.hazardGlow) {
      this.hazardGlow.setAlpha(0.06 + danger * 0.25);
      this.hazardGlow.setScale(0.85 + danger * 0.45);
    }
  }

  updateHazard(telegraph: BossClassTelegraph, eventPulse: number): void {
    const color = Phaser.Display.Color.HexStringToColor(telegraph.accent).color;
    this.hazardLabel?.setText(`${telegraph.icon} ${telegraph.code} · ${telegraph.pattern.toUpperCase()}`).setColor(telegraph.accent);
    if (eventPulse <= 0 || eventPulse <= this.lastEventPulse || !this.hazardRing || !this.hazardSymbol) return;
    this.lastEventPulse = eventPulse;
    this.hazardRing.setStrokeStyle(3, color, this.reducedMotion ? 0.42 : 0.82).setScale(this.reducedMotion ? 1.1 : 0.58).setAlpha(1);
    this.hazardSymbol.setText(telegraph.icon).setColor(telegraph.accent).setScale(this.reducedMotion ? 1 : 0.72).setAlpha(this.reducedMotion ? 0.58 : 0.92);
    if (this.reducedMotion) return;
    this.tweens.killTweensOf(this.hazardRing);
    this.tweens.killTweensOf(this.hazardSymbol);
    this.tweens.add({ targets: this.hazardRing, scale: 1.75, alpha: 0.08, duration: 900, ease: 'Cubic.Out' });
    this.tweens.add({ targets: this.hazardSymbol, scale: 1.18, alpha: 0.12, duration: 760, ease: 'Quad.Out' });
  }

  getRotorTelemetryMeta() {
    return this.rotorTelemetryMeta;
  }

  private createRotorTelemetry(x: number, y: number, scale: number): void {
    const geometry = rotorTelemetryGeometry(scale);
    this.rotorTelemetryMeta = {
      ...geometry,
      hubX: x,
      hubY: y,
      bladeCount: geometry.bladeAngles.length,
      shaftStartX: x,
      shaftEndX: x + geometry.shaftLength,
      bladeAngleCsv: geometry.bladeAngles.join(','),
      transformOrigin: `${x},${y}`,
    };

    const structure = this.add.graphics().setDepth(2);
    const towerTopY = y + geometry.hubRadius + 4 * scale;
    const towerBaseY = y + geometry.towerHeight;
    structure.fillStyle(0x08212b, 0.72);
    structure.fillPoints([
      new Phaser.Math.Vector2(x - geometry.towerTopWidth / 2, towerTopY),
      new Phaser.Math.Vector2(x + geometry.towerTopWidth / 2, towerTopY),
      new Phaser.Math.Vector2(x + geometry.towerBaseWidth / 2, towerBaseY),
      new Phaser.Math.Vector2(x - geometry.towerBaseWidth / 2, towerBaseY),
    ], true);
    structure.lineStyle(1.5 * scale, 0x8fd9dc, 0.28);
    structure.strokePoints([
      new Phaser.Math.Vector2(x - geometry.towerTopWidth / 2, towerTopY),
      new Phaser.Math.Vector2(x + geometry.towerTopWidth / 2, towerTopY),
      new Phaser.Math.Vector2(x + geometry.towerBaseWidth / 2, towerBaseY),
      new Phaser.Math.Vector2(x - geometry.towerBaseWidth / 2, towerBaseY),
    ], true);
    structure.fillStyle(0x0d2c37, 0.86);
    structure.fillRoundedRect(x + geometry.hubRadius * 0.9, y - geometry.nacelleHeight / 2, geometry.nacelleLength, geometry.nacelleHeight, 4 * scale);
    structure.lineStyle(2.3 * scale, 0xd4f5f6, 0.72);
    structure.lineBetween(x, y, x + geometry.shaftLength, y);
    structure.lineStyle(1.25 * scale, 0xf2c66f, 0.58);
    structure.strokeCircle(x, y, geometry.hubRadius * 1.45);

    const ring = this.add.circle(x, y, geometry.bladeLength + geometry.hubRadius * 1.4, 0x061820, 0.38).setStrokeStyle(2, 0x8fd9dc, 0.32).setDepth(2.4);
    this.add.line(x, y, -82 * scale, 0, 82 * scale, 0, 0x8fd9dc, 0.16).setDepth(2.4);
    this.add.line(x, y, 0, -82 * scale, 0, 82 * scale, 0x8fd9dc, 0.16).setDepth(2.4);
    const rotor = this.add.container(x, y).setDepth(3);
    const bladeGraphics = this.add.graphics();
    bladeGraphics.fillStyle(0xe7f3f5, 0.92);
    for (const angle of geometry.bladeAngles) {
      const blade = turbineBladePolygon(angle, geometry.bladeLength, geometry.hubRadius)
        .map((point) => new Phaser.Math.Vector2(point.x, point.y));
      bladeGraphics.fillPoints(blade, true);
    }
    rotor.add(bladeGraphics);
    rotor.add(this.add.circle(0, 0, geometry.hubRadius, 0xb9dadd, 1).setStrokeStyle(2, 0x416f78, 0.9));
    rotor.add(this.add.circle(0, 0, geometry.hubRadius * 0.36, 0x17343f, 1));
    this.add.text(x, y + 82 * scale, 'ROTOR DIGITAL TWIN · 3B · SHAFT LOCK', {
      color: '#b7d8dc',
      fontFamily: 'Consolas, monospace',
      fontSize: '9px',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(3);
    if (!this.reducedMotion) this.tweens.add({ targets: rotor, angle: 360, repeat: -1, duration: 9400, ease: 'Linear' });
    if (!this.reducedMotion) this.tweens.add({ targets: ring, alpha: 0.62, yoyo: true, repeat: -1, duration: 1800 });
  }
}

export function OffshoreScene({ accent, danger, stage, telegraph, eventPulse, reducedMotion, sceneRoute }: OffshoreSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<WindFieldScene | null>(null);
  const telemetryRef = useRef({ danger, stage, telegraph, eventPulse });

  // Scene 可能因陣營色重建；保留最新任務狀態，避免 ready 後退回預設 Detect。
  telemetryRef.current = { danger, stage, telegraph, eventPulse };

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const host = hostRef.current;
    // React StrictMode 會重跑 effect；先清空 host，避免開發模式殘留重複 canvas。
    host.replaceChildren();
    delete host.dataset.sceneReady;
    const scene = new WindFieldScene(accent, reducedMotion, sceneRoute, (readyScene) => {
      readyScene.updateTelemetry(telemetryRef.current.stage, telemetryRef.current.danger);
      readyScene.updateHazard(telemetryRef.current.telegraph, telemetryRef.current.eventPulse);
      const rotorMeta = readyScene.getRotorTelemetryMeta();
      host.dataset.sceneReady = 'true';
      host.dataset.sceneRequestedId = sceneRoute.requestedScene.id;
      host.dataset.sceneSourceId = sceneRoute.sourceScene.id;
      host.dataset.sceneAssetUrl = sceneRoute.assetUrl;
      host.dataset.sceneFallbackUrl = sceneRoute.fallbackUrl;
      host.dataset.sceneAssetVersion = sceneRoute.version;
      host.dataset.sceneQaStatus = sceneRoute.qaStatus;
      host.dataset.sceneAvailability = sceneRoute.availability;
      if (rotorMeta) {
        host.dataset.rotorBladeCount = String(rotorMeta.bladeCount);
        host.dataset.rotorHubX = String(rotorMeta.hubX);
        host.dataset.rotorHubY = String(rotorMeta.hubY);
        host.dataset.rotorShaftStartX = String(rotorMeta.shaftStartX);
        host.dataset.rotorShaftEndX = String(rotorMeta.shaftEndX);
        host.dataset.rotorShaftLocked = 'true';
        host.dataset.rotorAxisConsistent = 'true';
        host.dataset.rotorHubLocked = 'true';
        host.dataset.rotorBladeAngles = rotorMeta.bladeAngleCsv;
        host.dataset.rotorTransformOrigin = rotorMeta.transformOrigin;
        host.dataset.rotorNacelle = 'true';
        host.dataset.rotorTower = 'true';
      }
    });
    sceneRef.current = scene;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 900,
      height: 420,
      backgroundColor: '#071a24',
      transparent: true,
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
    });
    return () => {
      sceneRef.current = null;
      game.destroy(true);
      host.replaceChildren();
      delete host.dataset.sceneReady;
      delete host.dataset.sceneRequestedId;
      delete host.dataset.sceneSourceId;
      delete host.dataset.sceneAssetUrl;
      delete host.dataset.sceneFallbackUrl;
      delete host.dataset.sceneAssetVersion;
      delete host.dataset.sceneQaStatus;
      delete host.dataset.sceneAvailability;
      delete host.dataset.rotorBladeCount;
      delete host.dataset.rotorHubX;
      delete host.dataset.rotorHubY;
      delete host.dataset.rotorShaftStartX;
      delete host.dataset.rotorShaftEndX;
      delete host.dataset.rotorShaftLocked;
      delete host.dataset.rotorAxisConsistent;
      delete host.dataset.rotorHubLocked;
      delete host.dataset.rotorBladeAngles;
      delete host.dataset.rotorTransformOrigin;
      delete host.dataset.rotorNacelle;
      delete host.dataset.rotorTower;
    };
  }, [
    accent,
    reducedMotion,
    sceneRoute.assetUrl,
    sceneRoute.availability,
    sceneRoute.fallbackUrl,
    sceneRoute.qaStatus,
    sceneRoute.requestedScene.id,
    sceneRoute.sourceScene.id,
    sceneRoute.version,
  ]);

  useEffect(() => {
    sceneRef.current?.updateTelemetry(stage, danger);
  }, [danger, stage]);

  useEffect(() => {
    sceneRef.current?.updateHazard(telegraph, eventPulse);
  }, [eventPulse, telegraph]);

  return <div className="phaser-host" ref={hostRef} aria-label={`${sceneRoute.requestedScene.id} ${sceneRoute.requestedScene.nameZh} 寫實海上風場視覺化與三葉片 rotor digital twin`} />;
}
