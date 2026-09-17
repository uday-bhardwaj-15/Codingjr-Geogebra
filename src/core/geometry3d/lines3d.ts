import { PointCoords3D, PlaneValue, SphereValue } from '../../types/geo';
import {
  Vector3D,
  sub3D,
  add3D,
  scale3D,
  dot3D,
  cross3D,
  normalize3D,
  distance3D,
  length3D,
} from './point3d';

export interface Line3DPoints {
  p1: PointCoords3D;
  p2: PointCoords3D;
}

/**
 * Creates a line passing through a point pt and parallel to a given line.
 */
export function parallelLine3D(
  line: Line3DPoints,
  pt: PointCoords3D
): Line3DPoints {
  const dir = sub3D(line.p2, line.p1);
  return {
    p1: pt,
    p2: add3D(pt, dir),
  };
}

/**
 * Creates a line passing through a point pt and perpendicular to a given line in the plane of the two.
 */
export function perpendicularLineToLine3D(
  line: Line3DPoints,
  pt: PointCoords3D
): Line3DPoints {
  const p1 = line.p1;
  const p2 = line.p2;
  const dir = normalize3D(sub3D(p2, p1));

  // Projection of pt onto line
  const v = sub3D(pt, p1);
  const projLen = dot3D(v, dir);
  const proj = add3D(p1, scale3D(dir, projLen));

  // If pt is on line, pick any perpendicular direction
  const perpDir = sub3D(pt, proj);
  const resultP2 = length3D(perpDir) >= 1e-6
    ? proj
    : (() => {
        let aux = { x: -dir.y, y: dir.x, z: 0 };
        if (length3D(aux) < 1e-6) aux = { x: 1, y: 0, z: 0 };
        return add3D(pt, normalize3D(cross3D(dir, aux)));
      })();

  return {
    p1: pt,
    p2: resultP2,
  };
}

/**
 * Creates an angle bisector line in 3D for angle P1 - Vertex - P2.
 */
export function angleBisector3D(
  p1: PointCoords3D,
  vertex: PointCoords3D,
  p2: PointCoords3D
): Line3DPoints {
  const u1 = normalize3D(sub3D(p1, vertex));
  const u2 = normalize3D(sub3D(p2, vertex));
  const bisectorDir = normalize3D(add3D(u1, u2));

  return {
    p1: vertex,
    p2: add3D(vertex, bisectorDir),
  };
}

/**
 * Creates tangent line/ray to a 3D sphere from an external point pt.
 */
export function tangentsToSphere3D(
  pt: PointCoords3D,
  sphere: SphereValue
): Line3DPoints | null {
  const d = distance3D(pt, sphere.center);
  if (d <= sphere.radius) return null; // Inside sphere

  const dir = normalize3D(sub3D(sphere.center, pt));
  let aux = { x: -dir.y, y: dir.x, z: 0 };
  if (length3D(aux) < 1e-6) aux = { x: 1, y: 0, z: 0 };
  const perp = normalize3D(cross3D(dir, aux));

  const alpha = Math.asin(sphere.radius / d);
  const tangentDir = add3D(
    scale3D(dir, Math.cos(alpha)),
    scale3D(perp, Math.sin(alpha))
  );

  return {
    p1: pt,
    p2: add3D(pt, scale3D(tangentDir, 5)),
  };
}
