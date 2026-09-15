import { PointCoords } from './Point';

export function sampleLocus(
  driverRange: { min: number; max: number; steps?: number },
  computePoint: (param: number) => PointCoords | null
): PointCoords[] {
  const steps = driverRange.steps ?? 100;
  const min = driverRange.min;
  const max = driverRange.max;
  const dt = (max - min) / steps;

  const points: PointCoords[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = min + i * dt;
    const pt = computePoint(t);
    if (pt && !isNaN(pt.x) && !isNaN(pt.y) && isFinite(pt.x) && isFinite(pt.y)) {
      points.push(pt);
    }
  }
  return points;
}
