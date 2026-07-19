import { describe, expect, it } from 'vitest';
import { THREE_BLADE_ANGLES, fleetTurbineIconGeometry, rotorTelemetryGeometry, turbineBladePolygon } from './turbineGeometry';

describe('Turbine rotor geometry', () => {
  it('固定為三葉片且以 120° 等分同一 hub 原點', () => {
    expect(THREE_BLADE_ANGLES).toEqual([0, 120, 240]);
    const tips = THREE_BLADE_ANGLES.map((angle) => turbineBladePolygon(angle, 90, 9)[3]);
    for (const tip of tips) expect(Math.hypot(tip.x, tip.y)).toBeCloseTo(90, 6);
    const angularGaps = tips.map((tip, index) => {
      const current = Math.atan2(tip.y, tip.x) * 180 / Math.PI;
      const nextTip = tips[(index + 1) % tips.length];
      const next = Math.atan2(nextTip.y, nextTip.x) * 180 / Math.PI;
      return (next - current + 360) % 360;
    });
    for (const gap of angularGaps) expect(gap).toBeCloseTo(120, 6);
  });

  it('每片葉根都落在 hub 外緣，沒有離軸矩形偏移', () => {
    for (const angle of THREE_BLADE_ANGLES) {
      const [leftRoot, , , , , , rightRoot] = turbineBladePolygon(angle, 90, 9);
      expect(Math.hypot(leftRoot.x, leftRoot.y)).toBeLessThan(10);
      expect(Math.hypot(rightRoot.x, rightRoot.y)).toBeLessThan(10);
    }
  });

  it('rotor telemetry model 明確包含同軸 nacelle、shaft 與 tower 尺寸', () => {
    const geometry = rotorTelemetryGeometry(0.5);
    expect(geometry.bladeAngles).toEqual([0, 120, 240]);
    expect(geometry.bladeLength).toBeCloseTo(31, 6);
    expect(geometry.hubRadius).toBeCloseTo(4, 6);
    expect(geometry.shaftLength).toBeGreaterThan(geometry.hubRadius);
    expect(geometry.nacelleLength).toBeGreaterThan(geometry.shaftLength);
    expect(geometry.towerHeight).toBeGreaterThan(geometry.bladeLength);
    expect(geometry.towerBaseWidth).toBeGreaterThan(geometry.towerTopWidth);
  });
  it('Fleet Board icon geometry keeps shaft, hub, tower, and nacelle on one main axis', () => {
    const geometry = fleetTurbineIconGeometry();
    expect(geometry.bladeLength).toBeGreaterThan(geometry.hubRadius * 4);
    expect(geometry.shaftEnd.x).toBeGreaterThan(geometry.hub.x + geometry.hubRadius);
    expect(geometry.shaftEnd.y).toBe(geometry.hub.y);
    expect(geometry.towerTopY).toBeGreaterThan(geometry.hub.y);
    expect(geometry.towerBaseY).toBeGreaterThan(geometry.towerTopY);
    expect(geometry.towerBaseWidth).toBeGreaterThan(geometry.towerTopWidth);
    expect(geometry.platformY).toBeGreaterThan(geometry.towerBaseY);
  });
});
