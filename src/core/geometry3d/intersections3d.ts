import { PointCoords3D, PlaneValue } from '../../types/geo';
import { Line3DValue } from './line3d';
import {
  sub3D,
  dot3D,
  cross3D,
  length3D,
  normalize3D,
  add3D,
  scale3D,
  Vector3D,
} from './point3d';

/**
 * Closed-form intersection of two 3D lines. Returns null if parallel or skew.
 */
export function intersectLineLine3D(
  l1: Line3DValue | { p1: PointCoords3D; p2: PointCoords3D; dir?: Vector3D; direction?: Vector3D },
  l2: Line3DValue | { p1: PointCoords3D; p2: PointCoords3D; dir?: Vector3D; direction?: Vector3D },
  tolerance = 1e-4
): PointCoords3D | null {
  const p1 = l1.p1;
  const d1 = (l1 as any).dir || (l1 as any).direction || normalize3D(sub3D(l1.p2, l1.p1));
  const p2 = l2.p1;
  const d2 = (l2 as any).dir || (l2 as any).direction || normalize3D(sub3D(l2.p2, l2.p1));

  const cross = cross3D(d1, d2);
  const crossLenSq = dot3D(cross, cross);

  if (crossLenSq < 1e-9) {
    // Parallel or coincident lines
    return null;
  }

  const p2p1 = sub3D(p2, p1);
  // Check if coplanar: (p2 - p1) . (d1 x d2) == 0
  const coplanar = Math.abs(dot3D(p2p1, cross)) < tolerance;
  if (!coplanar) {
    // Skew lines
    return null;
  }

  // Calculate parameters t1 and t2
  const t1 = dot3D(cross3D(p2p1, d2), cross) / crossLenSq;
  return add3D(p1, scale3D(d1, t1));
}

/**
 * Closed-form intersection of a line and a plane in 3D. Returns null if line is parallel to plane.
 */
export function intersectLinePlane3D(
  line: Line3DValue | { p1: PointCoords3D; p2: PointCoords3D; dir?: Vector3D; direction?: Vector3D },
  plane: PlaneValue
): PointCoords3D | null {
  const normal: Vector3D = plane.normal || normalize3D({ x: plane.a, y: plane.b, z: plane.c });
  const dir = (line as any).dir || (line as any).direction || normalize3D(sub3D(line.p2, line.p1));
  const denom = dot3D(normal, dir);

  if (Math.abs(denom) < 1e-9) {
    // Line is parallel to the plane
    return null;
  }

  const t = -(dot3D(normal, line.p1) + plane.d) / denom;
  return add3D(line.p1, scale3D(dir, t));
}

/**
 * Closed-form intersection of two planes in 3D. Returns a Line3DValue or null if planes are parallel.
 */
export function intersectPlanes3D(
  pl1: PlaneValue,
  pl2: PlaneValue
): Line3DValue | null {
  const n1: Vector3D = pl1.normal || normalize3D({ x: pl1.a, y: pl1.b, z: pl1.c });
  const n2: Vector3D = pl2.normal || normalize3D({ x: pl2.a, y: pl2.b, z: pl2.c });

  const dir = cross3D(n1, n2);
  const dirLenSq = dot3D(dir, dir);
  if (dirLenSq < 1e-9) {
    return null; // Parallel or coincident planes
  }

  // Solve for point p on line of intersection: p = c1 * n1 + c2 * n2
  // n1 . p = -pl1.d, n2 . p = -pl2.d
  const dot11 = dot3D(n1, n1);
  const dot12 = dot3D(n1, n2);
  const dot22 = dot3D(n2, n2);

  const det = dot11 * dot22 - dot12 * dot12;
  if (Math.abs(det) < 1e-9) return null;

  const b1 = -pl1.d;
  const b2 = -pl2.d;
  const c1 = (b1 * dot22 - b2 * dot12) / det;
  const c2 = (dot11 * b2 - dot12 * b1) / det;

  const p1 = add3D(scale3D(n1, c1), scale3D(n2, c2));
  const normalizedDir = normalize3D(dir);
  const p2 = add3D(p1, normalizedDir);

  return {
    p1,
    p2,
    dir: normalizedDir,
    direction: normalizedDir,
  };
}


