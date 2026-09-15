import { PointCoords } from './Point';
import { LineValue } from './Line';
import { VectorValue } from './Line';

export function translatePoint(p: PointCoords, v: VectorValue | { dx: number; dy: number }): PointCoords {
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
  if (d === 0) return { ...p };
  const x = (p.x * (b * b - a * a) - 2 * a * (b * p.y + c)) / d;
  const y = (p.y * (a * a - b * b) - 2 * b * (a * p.x + c)) / d;
  return { x, y };
}

export function rotatePoint(p: PointCoords, center: PointCoords, angleRad: number): PointCoords {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export function dilatePoint(p: PointCoords, center: PointCoords, factor: number): PointCoords {
  return {
    x: center.x + factor * (p.x - center.x),
    y: center.y + factor * (p.y - center.y),
  };
}

export function invertPointAboutCircle(
  p: PointCoords,
  circle: { center: PointCoords; radius: number }
): PointCoords {
  const dx = p.x - circle.center.x;
  const dy = p.y - circle.center.y;
  const d2 = dx * dx + dy * dy;
  if (d2 === 0) return { ...p };
  const factor = (circle.radius * circle.radius) / d2;
  return {
    x: circle.center.x + dx * factor,
    y: circle.center.y + dy * factor,
  };
}
