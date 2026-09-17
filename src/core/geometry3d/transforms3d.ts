import { PointCoords3D, PlaneValue } from '../../types/geo';
import {
  Vector3D,
  sub3D,
  add3D,
  scale3D,
  dot3D,
  cross3D,
  normalize3D,
  length3D,
} from './point3d';
import { Line3DValue } from './line3d';

/**
 * Reflects a point P about a 3D Plane ax + by + cz + d = 0.
 */
export function reflectPointAboutPlane(pt: PointCoords3D, plane: PlaneValue): PointCoords3D {
  const normal: Vector3D = plane.normal || normalize3D({ x: plane.a, y: plane.b, z: plane.c });
  const dist = dot3D(normal, pt) + plane.d;
  return sub3D(pt, scale3D(normal, 2 * dist));
}

/**
 * Reflects a point P about a center point C in 3D: P' = 2C - P.
 */
export function reflectPointAboutPoint3D(pt: PointCoords3D, center: PointCoords3D): PointCoords3D {
  return sub3D(scale3D(center, 2), pt);
}

/**
 * Reflects a point P about a 3D line (A, dir).
 */
export function reflectPointAboutLine3D(
  pt: PointCoords3D,
  line: { p1: PointCoords3D; p2: PointCoords3D } | Line3DValue
): PointCoords3D {
  const p1 = line.p1;
  const p2 = line.p2;
  const dir = normalize3D(sub3D(p2, p1));

  // Projection of pt onto line
  const v = sub3D(pt, p1);
  const projLen = dot3D(v, dir);
  const proj = add3D(p1, scale3D(dir, projLen));

  // P' = 2*proj - pt
  return sub3D(scale3D(proj, 2), pt);
}

/**
 * Rotates a point P around a 3D Line (axisOrigin, axisDir) by angle theta (in radians)
 * using Rodrigues' rotation formula.
 */
export function rotatePointAroundLine3D(
  pt: PointCoords3D,
  line: { p1: PointCoords3D; p2: PointCoords3D } | Line3DValue,
  angleRad: number
): PointCoords3D {
  const axisOrigin = line.p1;
  const k = normalize3D(sub3D(line.p2, line.p1));
  const v = sub3D(pt, axisOrigin);

  const cosTheta = Math.cos(angleRad);
  const sinTheta = Math.sin(angleRad);

  // v_rot = v*cos(theta) + (k x v)*sin(theta) + k*(k . v)*(1 - cos(theta))
  const term1 = scale3D(v, cosTheta);
  const term2 = scale3D(cross3D(k, v), sinTheta);
  const term3 = scale3D(k, dot3D(k, v) * (1 - cosTheta));

  const vRot = add3D(add3D(term1, term2), term3);
  return add3D(axisOrigin, vRot);
}

/**
 * Translates a point by a 3D vector.
 */
export function translatePoint3D(pt: PointCoords3D, vector: Vector3D): PointCoords3D {
  return add3D(pt, vector);
}

/**
 * Dilates / scales a point from center C by scale factor.
 */
export function dilatePoint3D(pt: PointCoords3D, center: PointCoords3D, factor: number): PointCoords3D {
  return add3D(center, scale3D(sub3D(pt, center), factor));
}
