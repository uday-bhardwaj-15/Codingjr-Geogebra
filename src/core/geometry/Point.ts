export interface PointCoords {
  x: number;
  y: number;
}

export interface FreePoint {
  kind: 'free';
  x: number;
  y: number;
}

export interface PointOnObject {
  kind: 'onObject';
  parentId: string;
  parameter: number;
}

export type PointValue = FreePoint | PointOnObject;

export function distance(p1: PointCoords, p2: PointCoords): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function midpoint(p1: PointCoords, p2: PointCoords): PointCoords {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function resolvePoint(pt: any): PointCoords {
  if (!pt) return { x: 0, y: 0 };
  if (typeof pt.x === 'number' && typeof pt.y === 'number') {
    return { x: pt.x, y: pt.y };
  }
  if (pt.kind === 'free' && typeof pt.x === 'number' && typeof pt.y === 'number') {
    return { x: pt.x, y: pt.y };
  }
  if (Array.isArray(pt) && pt.length >= 2) {
    const x = Number(pt[0]);
    const y = Number(pt[1]);
    if (!isNaN(x) && !isNaN(y)) return { x, y };
  }
  return { x: 0, y: 0 };
}
