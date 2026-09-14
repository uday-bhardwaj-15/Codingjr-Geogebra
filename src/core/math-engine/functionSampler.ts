import { PointCoords } from '../geometry/Point';

export function sampleFunction(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  numPoints: number = 200
): PointCoords[] {
  const points: PointCoords[] = [];
  const step = (xMax - xMin) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    try {
      const y = fn(x);
      if (Number.isFinite(y)) {
        points.push({ x, y });
      }
    } catch (e) {
      // Ignore evaluation errors for specific points
    }
  }

  return points;
}
