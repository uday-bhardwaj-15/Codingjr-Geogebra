import { PointCoords3D } from '../../types/geo';
import { Vector3D, sub3D, normalize3D, dot3D, add3D, scale3D } from './point3d';

export interface Line3DValue {
  p1: PointCoords3D;
  p2: PointCoords3D;
  dir: Vector3D;
  direction?: Vector3D;
}

export function lineFromTwoPoints3D(p1: PointCoords3D, p2: PointCoords3D): Line3DValue {
  const dir = normalize3D(sub3D(p2, p1));
  return { p1, p2, dir, direction: dir };
}

export function closestPointOnLine3D(
  a: Line3DValue | { p1: PointCoords3D; p2?: PointCoords3D } | PointCoords3D,
  b: Line3DValue | { p1: PointCoords3D; p2?: PointCoords3D } | PointCoords3D
): PointCoords3D {
  const line = ('p1' in a ? a : b) as Line3DValue | { p1: PointCoords3D; p2?: PointCoords3D };
  const pt = ('p1' in a ? b : a) as PointCoords3D;
  const dir = (line as any).dir || (line as any).direction || (line.p2 ? normalize3D(sub3D(line.p2, line.p1)) : { x: 1, y: 0, z: 0 });
  const v = sub3D(pt, line.p1);
  const t = dot3D(v, dir);
  return add3D(line.p1, scale3D(dir, t));
}
