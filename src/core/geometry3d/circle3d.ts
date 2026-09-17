import { PointCoords3D } from '../../types/geo';
import {
  Vector3D,
  sub3D,
  add3D,
  scale3D,
  dot3D,
  cross3D,
  normalize3D,
  length3D,
  distance3D,
} from './point3d';
import { Line3DValue } from './line3d';
import { PlaneValue } from '../../types/geo';

export interface Circle3DValue {
  center: PointCoords3D;
  radius: number;
  normal: Vector3D;
  startAngle?: number;
  endAngle?: number;
  isSector?: boolean;
}

/**
 * Circle in 3D given an axis line (p1, p2) and a point on the circle.
 * The center is the projection of the point onto the axis line.
 */
export function circle3DFromAxisAndPoint(
  axisLine: { p1: PointCoords3D; p2: PointCoords3D } | Line3DValue,
  ptOnCircle: PointCoords3D
): Circle3DValue {
  const p1 = axisLine.p1;
  const p2 = axisLine.p2;
  const axisDir = normalize3D(sub3D(p2, p1));

  // Center is projection of ptOnCircle onto axis line
  const v = sub3D(ptOnCircle, p1);
  const projLen = dot3D(v, axisDir);
  const center = add3D(p1, scale3D(axisDir, projLen));
  const radius = distance3D(center, ptOnCircle);

  return {
    center,
    radius: Math.max(0.001, radius),
    normal: axisDir,
  };
}

/**
 * Circle in 3D given center point, radius, and normal direction vector / line.
 */
export function circle3DFromCenterRadiusDirection(
  center: PointCoords3D,
  radius: number,
  direction: Vector3D | { p1: PointCoords3D; p2: PointCoords3D }
): Circle3DValue {
  let normal: Vector3D = { x: 0, y: 0, z: 1 };
  if ('p1' in direction && 'p2' in direction) {
    normal = normalize3D(sub3D(direction.p2, direction.p1));
  } else if ('x' in direction && 'y' in direction && 'z' in direction) {
    normal = normalize3D(direction);
  }

  return {
    center,
    radius: Math.max(0.001, radius),
    normal,
  };
}

/**
 * Circle in 3D passing through 3 points.
 * Computes the circumcenter in the plane of the 3 points.
 */
export function circle3DFromThreePoints(
  p1: PointCoords3D,
  p2: PointCoords3D,
  p3: PointCoords3D
): Circle3DValue | null {
  const v1 = sub3D(p2, p1);
  const v2 = sub3D(p3, p1);
  const cross = cross3D(v1, v2);
  const normalLen = length3D(cross);

  if (normalLen < 1e-6) {
    // Points are collinear
    return null;
  }

  const normal = normalize3D(cross);

  // Circumcenter in 3D using vector formula:
  // c = p1 + (|v2|^2 (v1 x cross) + |v1|^2 (cross x v2)) / (2 * |cross|^2)
  const v1LenSq = dot3D(v1, v1);
  const v2LenSq = dot3D(v2, v2);

  const t1 = scale3D(cross3D(v2, cross), v1LenSq);
  const t2 = scale3D(cross3D(cross, v1), v2LenSq);
  const offset = scale3D(add3D(t1, t2), 1 / (2 * normalLen * normalLen));
  const center = add3D(p1, offset);
  const radius = distance3D(center, p1);

  return {
    center,
    radius,
    normal,
  };
}

/**
 * Circular Arc in 3D defined by center and two endpoints p1, p2.
 */
export function circularArc3DFromCenter(
  center: PointCoords3D,
  p1: PointCoords3D,
  p2: PointCoords3D,
  isSector: boolean = false
): Circle3DValue {
  const v1 = sub3D(p1, center);
  const v2 = sub3D(p2, center);
  const r1 = length3D(v1);
  const normal = normalize3D(cross3D(v1, v2));

  return {
    center,
    radius: Math.max(0.001, r1),
    normal,
    startAngle: 0,
    endAngle: Math.acos(Math.max(-1, Math.min(1, dot3D(normalize3D(v1), normalize3D(v2))))),
    isSector,
  };
}
