export interface TurbinePoint {
  x: number;
  y: number;
}

export const THREE_BLADE_ANGLES = [0, 120, 240] as const;

export interface RotorTelemetryGeometry {
  bladeAngles: typeof THREE_BLADE_ANGLES;
  bladeLength: number;
  hubRadius: number;
  nacelleLength: number;
  nacelleHeight: number;
  shaftLength: number;
  towerHeight: number;
  towerTopWidth: number;
  towerBaseWidth: number;
}

export interface FleetTurbineIconGeometry {
  viewBoxWidth: number;
  viewBoxHeight: number;
  hub: TurbinePoint;
  bladeLength: number;
  hubRadius: number;
  shaftEnd: TurbinePoint;
  nacelleLength: number;
  nacelleHeight: number;
  towerTopY: number;
  towerBaseY: number;
  towerTopWidth: number;
  towerBaseWidth: number;
  platformY: number;
}

export function rotorTelemetryGeometry(scale: number): RotorTelemetryGeometry {
  // 所有尺寸都以 hub 原點為基準，讓 Phaser 只需要旋轉 rotor container，不會把葉片畫到另一個軸心。
  return {
    bladeAngles: THREE_BLADE_ANGLES,
    bladeLength: 62 * scale,
    hubRadius: 8 * scale,
    nacelleLength: 42 * scale,
    nacelleHeight: 17 * scale,
    shaftLength: 22 * scale,
    towerHeight: 74 * scale,
    towerTopWidth: 8 * scale,
    towerBaseWidth: 22 * scale,
  };
}

export function fleetTurbineIconGeometry(): FleetTurbineIconGeometry {
  // Route 層級的 SVG icon 使用固定工程示意比例：hub 是唯一旋轉中心，
  // shaft 水平穿過 hub，tower 中心線垂直對齊 hub，避免視覺上出現離軸 rotor。
  return {
    viewBoxWidth: 96,
    viewBoxHeight: 82,
    hub: { x: 43, y: 29 },
    bladeLength: 27,
    hubRadius: 4.8,
    shaftEnd: { x: 76, y: 29 },
    nacelleLength: 35,
    nacelleHeight: 11,
    towerTopY: 38,
    towerBaseY: 70,
    towerTopWidth: 7,
    towerBaseWidth: 17,
    platformY: 73,
  };
}

function rotatePoint(point: TurbinePoint, angleDegrees: number): TurbinePoint {
  const radians = angleDegrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: point.x * cosine - point.y * sine,
    y: point.x * sine + point.y * cosine,
  };
}

export function turbineBladePolygon(
  angleDegrees: number,
  length: number,
  hubRadius: number,
): TurbinePoint[] {
  // 葉根從 hub 外緣開始，整組 polygon 再繞原點旋轉；因此 rotor 永遠以主軸中心為唯一旋轉軸。
  const baseBlade: TurbinePoint[] = [
    { x: -hubRadius * 0.34, y: -hubRadius * 0.88 },
    { x: -length * 0.075, y: -length * 0.62 },
    { x: -length * 0.025, y: -length * 0.92 },
    { x: 0, y: -length },
    { x: length * 0.018, y: -length * 0.84 },
    { x: hubRadius * 0.42, y: -hubRadius * 1.2 },
    { x: hubRadius * 0.34, y: -hubRadius * 0.88 },
  ];
  return baseBlade.map((point) => rotatePoint(point, angleDegrees));
}
