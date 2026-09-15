import { PointCoords, distance } from './Point';

// General line equation: a*x + b*y + c = 0
export interface LineValue {
  a: number;
  b: number;
  c: number;
  p1?: PointCoords;
  p2?: PointCoords;
  slope?: number;
  intercept?: number;
}

export interface SegmentValue {
  p1: PointCoords;
  p2: PointCoords;
}

export interface RayValue {
  origin: PointCoords;
  direction: PointCoords;
}

export interface VectorValue {
  p1?: PointCoords;
  p2?: PointCoords;
  dx: number;
  dy: number;
}

export function lineFromTwoPoints(p1: PointCoords, p2: PointCoords): LineValue {
  const a = p1.y - p2.y;
  const b = p2.x - p1.x;
  const c = p1.x * p2.y - p2.x * p1.y;
  return { a, b, c, p1, p2 };
}

export function perpendicularLine(line: LineValue, p: PointCoords): LineValue {
  const a = -line.b;
  const b = line.a;
  const c = line.b * p.x - line.a * p.y;
  return { a, b, c };
}

export function parallelLine(line: LineValue, p: PointCoords): LineValue {
  const c = -line.a * p.x - line.b * p.y;
  return { a: line.a, b: line.b, c };
}

export function perpendicularBisector(p1: PointCoords, p2: PointCoords): LineValue {
  const mid: PointCoords = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
  const normalX = p2.x - p1.x;
  const normalY = p2.y - p1.y;
  return {
    a: normalX,
    b: normalY,
    c: -normalX * mid.x - normalY * mid.y,
  };
}

export function angleBisector(
  p1: PointCoords,
  vertex: PointCoords,
  p2: PointCoords
): LineValue {
  const d1 = distance(vertex, p1);
  const d2 = distance(vertex, p2);

  if (d1 === 0 || d2 === 0) {
    return { a: 1, b: 0, c: -vertex.x };
  }

  const u1 = { x: (p1.x - vertex.x) / d1, y: (p1.y - vertex.y) / d1 };
  const u2 = { x: (p2.x - vertex.x) / d2, y: (p2.y - vertex.y) / d2 };

  let dirX = u1.x + u2.x;
  let dirY = u1.y + u2.y;
  const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);

  if (dirLen < 1e-9) {
    dirX = -u1.y;
    dirY = u1.x;
  }

  const targetPt: PointCoords = {
    x: vertex.x + dirX,
    y: vertex.y + dirY,
  };

  return lineFromTwoPoints(vertex, targetPt);
}

export function polarLineOfPoint(
  p: PointCoords,
  circle: { center: PointCoords; radius: number }
): LineValue {
  const a = p.x - circle.center.x;
  const b = p.y - circle.center.y;
  const c = -a * circle.center.x - b * circle.center.y - circle.radius * circle.radius;
  return { a, b, c };
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
    return { a: 1, b: 0, c: -meanX };
  }

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  return {
    a: slope,
    b: -1,
    c: intercept,
    slope,
    intercept,
  };
}
