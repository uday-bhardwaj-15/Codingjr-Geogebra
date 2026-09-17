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

export interface Conic3DValue {
  conicType: 'ellipse' | 'hyperbola' | 'parabola' | 'conic';
  center?: PointCoords3D;
  vertex?: PointCoords3D;
  normal?: Vector3D;
  u?: Vector3D; // Major axis
  v?: Vector3D; // Minor axis
  a?: number;
  b?: number;
  p?: number;
  points: PointCoords3D[];
}

/**
 * 3D Ellipse defined by two foci (f1, f2) and a point on the ellipse (p).
 */
export function ellipse3DFromFociAndPoint(
  f1: PointCoords3D,
  f2: PointCoords3D,
  p: PointCoords3D
): Conic3DValue {
  const cDist = distance3D(f1, f2) / 2;
  const d1 = distance3D(f1, p);
  const d2 = distance3D(f2, p);
  const a = Math.max(cDist + 0.001, (d1 + d2) / 2);
  const b = Math.sqrt(Math.max(0.001, a * a - cDist * cDist));

  const center: PointCoords3D = {
    x: (f1.x + f2.x) / 2,
    y: (f1.y + f2.y) / 2,
    z: ((f1.z ?? 0) + (f2.z ?? 0)) / 2,
  };

  // Major axis vector
  let u = sub3D(f2, f1);
  if (length3D(u) < 1e-6) {
    u = sub3D(p, center);
    if (length3D(u) < 1e-6) u = { x: 1, y: 0, z: 0 };
  }
  u = normalize3D(u);

  // Normal to plane of f1, f2, p
  const vP = sub3D(p, center);
  let normal = cross3D(u, vP);
  if (length3D(normal) < 1e-6) {
    let aux = { x: -u.y, y: u.x, z: 0 };
    if (length3D(aux) < 1e-6) aux = { x: 0, y: -u.z, z: u.y };
    normal = cross3D(u, aux);
  }
  normal = normalize3D(normal);

  // Minor axis vector
  const v = normalize3D(cross3D(normal, u));

  // Generate 64 sampled 3D points
  const points: PointCoords3D[] = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const theta = (i * 2 * Math.PI) / steps;
    const pt = add3D(
      center,
      add3D(scale3D(u, a * Math.cos(theta)), scale3D(v, b * Math.sin(theta)))
    );
    points.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  return {
    conicType: 'ellipse',
    center,
    normal,
    u,
    v,
    a,
    b,
    points,
  };
}

/**
 * 3D Hyperbola defined by two foci (f1, f2) and a point on the hyperbola (p).
 */
export function hyperbola3DFromFociAndPoint(
  f1: PointCoords3D,
  f2: PointCoords3D,
  p: PointCoords3D
): Conic3DValue {
  const cDist = distance3D(f1, f2) / 2;
  const d1 = distance3D(f1, p);
  const d2 = distance3D(f2, p);
  const diff = Math.abs(d1 - d2);
  const a = Math.max(0.001, Math.min(cDist - 0.001, diff / 2));
  const b = Math.sqrt(Math.max(0.001, cDist * cDist - a * a));

  const center: PointCoords3D = {
    x: (f1.x + f2.x) / 2,
    y: (f1.y + f2.y) / 2,
    z: ((f1.z ?? 0) + (f2.z ?? 0)) / 2,
  };

  let u = sub3D(f2, f1);
  if (length3D(u) < 1e-6) u = { x: 1, y: 0, z: 0 };
  u = normalize3D(u);

  const vP = sub3D(p, center);
  let normal = cross3D(u, vP);
  if (length3D(normal) < 1e-6) {
    let aux = { x: -u.y, y: u.x, z: 0 };
    if (length3D(aux) < 1e-6) aux = { x: 0, y: -u.z, z: u.y };
    normal = cross3D(u, aux);
  }
  normal = normalize3D(normal);
  const v = normalize3D(cross3D(normal, u));

  const points: PointCoords3D[] = [];
  const steps = 32;
  const maxT = 2.2;

  // Branch 1 (right)
  for (let i = -steps; i <= steps; i++) {
    const t = (i * maxT) / steps;
    const pt = add3D(
      center,
      add3D(scale3D(u, a * Math.cosh(t)), scale3D(v, b * Math.sinh(t)))
    );
    points.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  // Branch 2 (left)
  for (let i = -steps; i <= steps; i++) {
    const t = (i * maxT) / steps;
    const pt = add3D(
      center,
      add3D(scale3D(u, -a * Math.cosh(t)), scale3D(v, b * Math.sinh(t)))
    );
    points.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  return {
    conicType: 'hyperbola',
    center,
    normal,
    u,
    v,
    a,
    b,
    points,
  };
}

/**
 * 3D Parabola defined by a focus point and a directrix line.
 */
export function parabola3DFromFocusAndDirectrix(
  focus: PointCoords3D,
  directrix: { p1: PointCoords3D; p2: PointCoords3D } | Line3DValue
): Conic3DValue {
  const p1 = directrix.p1;
  const p2 = directrix.p2;
  const dirLine = normalize3D(sub3D(p2, p1));

  // Foot of perpendicular from focus to directrix line
  const vFocus = sub3D(focus, p1);
  const projLen = dot3D(vFocus, dirLine);
  const foot = add3D(p1, scale3D(dirLine, projLen));

  const pParam = Math.max(0.001, distance3D(focus, foot));
  const vertex = scale3D(add3D(focus, foot), 0.5);

  let u = normalize3D(sub3D(focus, foot));
  if (length3D(u) < 1e-6) u = { x: 0, y: 0, z: 1 };
  const v = dirLine;

  const normal = normalize3D(cross3D(u, v));

  const points: PointCoords3D[] = [];
  const steps = 40;
  const maxT = 6;

  for (let i = -steps; i <= steps; i++) {
    const t = (i * maxT) / steps;
    const offsetU = (t * t) / (2 * pParam);
    const pt = add3D(vertex, add3D(scale3D(u, offsetU), scale3D(v, t)));
    points.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  return {
    conicType: 'parabola',
    vertex,
    normal,
    u,
    v,
    p: pParam,
    points,
  };
}

/**
 * 3D Conic passing through 5 points in space.
 */
export function conic3DFromFivePoints(pts: PointCoords3D[]): Conic3DValue {
  if (pts.length < 5) {
    return { conicType: 'conic', points: pts };
  }

  // Find center of 5 points
  let sum = { x: 0, y: 0, z: 0 };
  pts.forEach((p) => {
    sum = add3D(sum, p);
  });
  const center = scale3D(sum, 1 / pts.length);

  // Normal to plane of first 3 points
  const v1 = sub3D(pts[1], pts[0]);
  const v2 = sub3D(pts[2], pts[0]);
  let normal = normalize3D(cross3D(v1, v2));
  if (length3D(normal) < 1e-6) normal = { x: 0, y: 0, z: 1 };

  let u = normalize3D(v1);
  if (length3D(u) < 1e-6) u = { x: 1, y: 0, z: 0 };
  const v = normalize3D(cross3D(normal, u));

  // Compute average in-plane distance as radius
  let avgDist = 0;
  pts.forEach((p) => {
    avgDist += distance3D(center, p);
  });
  avgDist = Math.max(0.5, avgDist / pts.length);

  const points: PointCoords3D[] = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const theta = (i * 2 * Math.PI) / steps;
    const pt = add3D(
      center,
      add3D(scale3D(u, avgDist * Math.cos(theta)), scale3D(v, avgDist * Math.sin(theta)))
    );
    points.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  return {
    conicType: 'conic',
    center,
    normal,
    u,
    v,
    points,
  };
}
