import { describe, it, expect } from 'vitest';
import { distance3D, midpoint3D, dot3D, cross3D, normalize3D } from '../../src/core/geometry3d/point3d';
import { lineFromTwoPoints3D, closestPointOnLine3D } from '../../src/core/geometry3d/line3d';
import {
  planeFromThreePoints,
  planeFromPointAndNormal,
  parallelPlaneThroughPoint,
  perpendicularPlaneThroughLine,
  projectPointOnPlane,
} from '../../src/core/geometry3d/plane3d';
import { intersectLineLine3D, intersectLinePlane3D } from '../../src/core/geometry3d/intersections3d';

describe('3D Point & Vector Operations', () => {
  it('calculates 3D Euclidean distance', () => {
    const p1 = { x: 1, y: 2, z: 3 };
    const p2 = { x: 4, y: 6, z: 3 };
    expect(distance3D(p1, p2)).toBeCloseTo(5, 5);

    const p3 = { x: 0, y: 0, z: 0 };
    const p4 = { x: 1, y: 2, z: 2 };
    expect(distance3D(p3, p4)).toBeCloseTo(3, 5);
  });

  it('calculates 3D midpoint correctly', () => {
    const p1 = { x: 2, y: 4, z: 6 };
    const p2 = { x: 6, y: 8, z: 10 };
    const mid = midpoint3D(p1, p2);
    expect(mid).toEqual({ x: 4, y: 6, z: 8 });
  });

  it('computes dot product, cross product, and normalization', () => {
    const v1 = { x: 1, y: 0, z: 0 };
    const v2 = { x: 0, y: 1, z: 0 };

    expect(dot3D(v1, v2)).toBe(0);
    const cross = cross3D(v1, v2);
    expect(cross).toEqual({ x: 0, y: 0, z: 1 });

    const norm = normalize3D({ x: 0, y: 3, z: 4 });
    expect(norm.x).toBeCloseTo(0, 5);
    expect(norm.y).toBeCloseTo(0.6, 5);
    expect(norm.z).toBeCloseTo(0.8, 5);
  });
});

describe('3D Lines & Projection', () => {
  it('creates 3D parametric line and finds closest point', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 10, y: 0, z: 0 };
    const line = lineFromTwoPoints3D(p1, p2);

    expect(line.dir.x).toBeCloseTo(1, 5);
    expect(line.dir.y).toBeCloseTo(0, 5);
    expect(line.dir.z).toBeCloseTo(0, 5);

    const testPt = { x: 5, y: 3, z: 4 };
    const closest = closestPointOnLine3D(testPt, line);
    expect(closest.x).toBeCloseTo(5, 5);
    expect(closest.y).toBeCloseTo(0, 5);
    expect(closest.z).toBeCloseTo(0, 5);
  });
});

describe('3D Planes', () => {
  it('constructs plane from 3 points on XY plane (z = 0)', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 2, y: 0, z: 0 };
    const p3 = { x: 0, y: 3, z: 0 };
    const plane = planeFromThreePoints(p1, p2, p3);

    expect(plane.a).toBeCloseTo(0, 5);
    expect(plane.b).toBeCloseTo(0, 5);
    expect(Math.abs(plane.c)).toBeCloseTo(1, 5);
    expect(plane.d).toBeCloseTo(0, 5);
  });

  it('constructs parallel plane through a given point', () => {
    const basePlane = planeFromPointAndNormal({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }); // z = 0
    const parallel = parallelPlaneThroughPoint(basePlane, { x: 5, y: 5, z: 4 });

    expect(parallel.a).toBeCloseTo(0, 5);
    expect(parallel.b).toBeCloseTo(0, 5);
    expect(parallel.c).toBeCloseTo(1, 5);
    expect(parallel.d).toBeCloseTo(-4, 5); // z - 4 = 0 -> z = 4
  });

  it('constructs perpendicular plane through line and point', () => {
    const line = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } }; // X-axis
    const pt = { x: 2, y: 3, z: 0 };
    const perpPlane = perpendicularPlaneThroughLine(line, pt);

    // Normal to X-axis is along X: x = 2
    expect(Math.abs(perpPlane.a)).toBeCloseTo(1, 5);
    expect(perpPlane.b).toBeCloseTo(0, 5);
    expect(perpPlane.c).toBeCloseTo(0, 5);
  });

  it('projects a point orthogonally onto a plane', () => {
    const plane = { a: 0, b: 0, c: 1, d: -5 }; // z = 5
    const pt = { x: 3, y: 4, z: 10 };
    const proj = projectPointOnPlane(pt, plane);

    expect(proj.x).toBeCloseTo(3, 5);
    expect(proj.y).toBeCloseTo(4, 5);
    expect(proj.z).toBeCloseTo(5, 5);
  });
});

describe('3D Intersections', () => {
  it('finds intersection between 3D line and plane', () => {
    const line = {
      p1: { x: 0, y: 0, z: 0 },
      p2: { x: 2, y: 2, z: 2 },
    };
    const plane = { a: 0, b: 0, c: 1, d: -5 }; // z = 5
    const hit = intersectLinePlane3D(line, plane);

    expect(hit).not.toBeNull();
    expect(hit!.x).toBeCloseTo(5, 5);
    expect(hit!.y).toBeCloseTo(5, 5);
    expect(hit!.z).toBeCloseTo(5, 5);
  });

  it('finds intersection of two intersecting 3D lines', () => {
    const l1 = {
      p1: { x: -5, y: 0, z: 2 },
      p2: { x: 5, y: 0, z: 2 },
    };
    const l2 = {
      p1: { x: 0, y: -5, z: 2 },
      p2: { x: 0, y: 5, z: 2 },
    };
    const hit = intersectLineLine3D(l1, l2);

    expect(hit).not.toBeNull();
    expect(hit!.x).toBeCloseTo(0, 5);
    expect(hit!.y).toBeCloseTo(0, 5);
    expect(hit!.z).toBeCloseTo(2, 5);
  });

  it('returns null for skew lines that do not intersect', () => {
    const l1 = {
      p1: { x: -5, y: 0, z: 0 },
      p2: { x: 5, y: 0, z: 0 },
    };
    const l2 = {
      p1: { x: 0, y: -5, z: 5 },
      p2: { x: 0, y: 5, z: 5 },
    };
    const hit = intersectLineLine3D(l1, l2);
    expect(hit).toBeNull();
  });
});
