import { PointCoords } from './Point';
import { LineValue } from './Line';
import { CircleValue } from './Circle';

export function intersectLineLine(l1: LineValue, l2: LineValue): PointCoords | null {
  const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < 1e-10) {
    return null; // Parallel or coincident
  }
  const x = (l1.b * l2.c - l2.b * l1.c) / det;
  const y = (l2.a * l1.c - l1.a * l2.c) / det;
  return { x, y };
}

export function intersectLineCircle(l: LineValue, c: CircleValue): PointCoords[] {
  // Line: ax + by + c_L = 0
  // Circle: (x - cx)^2 + (y - cy)^2 = r^2
  
  // Transform line to origin-centered circle system
  const cx = c.center.x;
  const cy = c.center.y;
  
  // New line: a(x' + cx) + b(y' + cy) + c_L = 0
  // ax' + by' + (a*cx + b*cy + c_L) = 0
  const a = l.a;
  const b = l.b;
  const cL = a * cx + b * cy + l.c;
  
  const r = c.radius;
  
  const d0 = Math.abs(cL) / Math.sqrt(a * a + b * b);
  if (d0 > r + 1e-10) return []; // No intersection

  const mult = Math.sqrt(a * a + b * b);
  const aNorm = a / mult;
  const bNorm = b / mult;
  const cNorm = cL / mult;

  // Closest point on line to circle center (in translated coords)
  const x0 = -aNorm * cNorm;
  const y0 = -bNorm * cNorm;

  if (Math.abs(d0 - r) < 1e-10) {
    // Tangent (1 intersection)
    return [{ x: x0 + cx, y: y0 + cy }];
  }

  // 2 intersections
  const d = Math.sqrt(r * r - cNorm * cNorm);
  return [
    { x: x0 + bNorm * d + cx, y: y0 - aNorm * d + cy },
    { x: x0 - bNorm * d + cx, y: y0 + aNorm * d + cy }
  ];
}

export function intersectCircleCircle(c1: CircleValue, c2: CircleValue): PointCoords[] {
  const dx = c2.center.x - c1.center.x;
  const dy = c2.center.y - c1.center.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > c1.radius + c2.radius + 1e-10) return []; // Too far
  if (d < Math.abs(c1.radius - c2.radius) - 1e-10) return []; // One inside other
  if (d === 0 && c1.radius === c2.radius) return []; // Coincident (infinite)

  const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, c1.radius * c1.radius - a * a)); // max(0) guards against tiny floats

  // Point P2 where line connecting intersections crosses line connecting centers
  const p2x = c1.center.x + a * (dx / d);
  const p2y = c1.center.y + a * (dy / d);

  if (h < 1e-10) {
    // Tangent circles
    return [{ x: p2x, y: p2y }];
  }

  // Two intersections
  return [
    { x: p2x + h * (dy / d), y: p2y - h * (dx / d) },
    { x: p2x - h * (dy / d), y: p2y + h * (dx / d) }
  ];
}
