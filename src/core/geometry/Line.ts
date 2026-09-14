import { PointCoords } from './Point';

// General line equation: a*x + b*y + c = 0
export interface LineValue {
  a: number;
  b: number;
  c: number;
}

export interface SegmentValue {
  p1: PointCoords;
  p2: PointCoords;
}

export interface RayValue {
  origin: PointCoords;
  direction: PointCoords; // normalized vector or second point
}

export interface VectorValue {
  dx: number;
  dy: number;
}

export function lineFromTwoPoints(p1: PointCoords, p2: PointCoords): LineValue {
  const a = p1.y - p2.y;
  const b = p2.x - p1.x;
  const c = p1.x * p2.y - p2.x * p1.y;
  return { a, b, c };
}

export function perpendicularLine(line: LineValue, p: PointCoords): LineValue {
  // Original line: ax + by + c = 0
  // Perpendicular line: -bx + ay + c' = 0
  // c' = bx - ay
  const a = -line.b;
  const b = line.a;
  const c = line.b * p.x - line.a * p.y;
  return { a, b, c };
}

export function parallelLine(line: LineValue, p: PointCoords): LineValue {
  // Original line: ax + by + c = 0
  // Parallel line: ax + by + c' = 0
  // c' = -ax - by
  const c = -line.a * p.x - line.b * p.y;
  return { a: line.a, b: line.b, c };
}

export function bestFitLine(points: PointCoords[]): LineValue & { slope?: number; intercept?: number } {
  if (points.length === 0) {
    return { a: 0, b: 1, c: 0, slope: 0, intercept: 0 };
  }
  if (points.length === 1) {
    return { a: 0, b: 1, c: -points[0].y, slope: 0, intercept: points[0].y };
  }
  if (points.length === 2) {
    const line = lineFromTwoPoints(points[0], points[1]);
    const slope = Math.abs(line.b) > 1e-10 ? -line.a / line.b : undefined;
    const intercept = Math.abs(line.b) > 1e-10 ? -line.c / line.b : undefined;
    return { ...line, slope, intercept };
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
  }

  if (Math.abs(sxx) < 1e-10) {
    // Vertical line x = meanX => 1*x + 0*y - meanX = 0
    return { a: 1, b: 0, c: -meanX };
  }

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  // y = m*x + b => m*x - 1*y + b = 0 => a = slope, b = -1, c = intercept
  return {
    a: slope,
    b: -1,
    c: intercept,
    slope,
    intercept
  };
}
