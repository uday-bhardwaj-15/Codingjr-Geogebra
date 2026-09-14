import { PointCoords } from './Point';
import { LineValue } from './Line';
import { VectorValue } from './Line';

export function translatePoint(p: PointCoords, v: VectorValue): PointCoords {
  return { x: p.x + v.dx, y: p.y + v.dy };
}

export function reflectPointAboutPoint(p: PointCoords, center: PointCoords): PointCoords {
  return {
    x: 2 * center.x - p.x,
    y: 2 * center.y - p.y,
  };
}

export function reflectPointAboutLine(p: PointCoords, line: LineValue): PointCoords {
  const { a, b, c } = line;
  const d = a * a + b * b;
  const x = (p.x * (b * b - a * a) - 2 * a * (b * p.y + c)) / d;
  const y = (p.y * (a * a - b * b) - 2 * b * (a * p.x + c)) / d;
  return { x, y };
}
