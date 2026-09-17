import { PointCoords3D } from '../../types/geo';
import { resolvePoint } from '../geometry/Point';

export type Vector3D = PointCoords3D;

export function resolvePoint3D(pt: any): PointCoords3D {
  const p = resolvePoint(pt);
  return {
    x: p.x,
    y: p.y,
    z: typeof p.z === 'number' ? p.z : 0,
  };
}

export function distance3D(p1: PointCoords3D, p2: PointCoords3D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function midpoint3D(p1: PointCoords3D, p2: PointCoords3D): PointCoords3D {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
  };
}

export function add3D(v1: PointCoords3D, v2: PointCoords3D): PointCoords3D {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

export function sub3D(p1: PointCoords3D, p2: PointCoords3D): Vector3D {
  return { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
}

export function scale3D(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function dot3D(v1: Vector3D, v2: Vector3D): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function cross3D(v1: Vector3D, v2: Vector3D): Vector3D {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
}

export function length3D(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize3D(v: Vector3D): Vector3D {
  const len = length3D(v);
  if (len < 1e-9) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
