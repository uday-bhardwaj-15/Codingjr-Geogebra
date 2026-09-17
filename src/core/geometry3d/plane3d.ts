import { PointCoords3D, PlaneValue } from '../../types/geo';
import {
  Vector3D,
  sub3D,
  cross3D,
  normalize3D,
  dot3D,
  scale3D,
  add3D,
} from './point3d';
import { Line3DValue } from './line3d';

export function planeFromPointAndNormal(pt: PointCoords3D, normalVec: Vector3D): PlaneValue {
  const normal = normalize3D(normalVec);
  const d = -dot3D(normal, pt);
  return {
    a: normal.x,
    b: normal.y,
    c: normal.z,
    d,
    normal,
    point: pt,
  };
}

export function planeFromThreePoints(
  p1: PointCoords3D,
  p2: PointCoords3D,
  p3: PointCoords3D
): PlaneValue {
  const v1 = sub3D(p2, p1);
  const v2 = sub3D(p3, p1);
  const normal = cross3D(v1, v2);
  return planeFromPointAndNormal(p1, normal);
}

export function parallelPlaneThroughPoint(plane: PlaneValue, pt: PointCoords3D): PlaneValue {
  const normal: Vector3D = plane.normal || { x: plane.a, y: plane.b, z: plane.c };
  return planeFromPointAndNormal(pt, normal);
}

export function perpendicularPlaneThroughLine(
  line: Line3DValue | { p1: PointCoords3D; p2: PointCoords3D; dir?: Vector3D; direction?: Vector3D },
  pt: PointCoords3D
): PlaneValue {
  const dir = (line as any).dir || (line as any).direction || normalize3D(sub3D(line.p2, line.p1));
  return planeFromPointAndNormal(pt, dir);
}

export function projectPointOnPlane(
  a: PlaneValue | PointCoords3D,
  b: PlaneValue | PointCoords3D
): PointCoords3D {
  const plane = ('a' in a && 'b' in a && 'c' in a ? a : b) as PlaneValue;
  const pt = ('a' in a && 'b' in a && 'c' in a ? b : a) as PointCoords3D;

  const normal: Vector3D = plane.normal || normalize3D({ x: plane.a, y: plane.b, z: plane.c });
  const dist = dot3D(normal, pt) + plane.d;
  return sub3D(pt, scale3D(normal, dist));
}
