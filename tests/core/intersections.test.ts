import { describe, it, expect } from 'vitest';
import { intersectLineLine, intersectLineCircle, intersectCircleCircle } from '../../src/core/geometry/intersections';
import { lineFromTwoPoints } from '../../src/core/geometry/Line';

describe('Intersections', () => {
  it('should find intersection of two lines', () => {
    // y = x (passes through 0,0 and 1,1)
    const l1 = lineFromTwoPoints({ x: 0, y: 0 }, { x: 1, y: 1 });
    // y = -x (passes through 0,0 and -1,1)
    const l2 = lineFromTwoPoints({ x: 0, y: 0 }, { x: -1, y: 1 });
    
    const intersection = intersectLineLine(l1, l2);
    expect(intersection).not.toBeNull();
    expect(intersection?.x).toBeCloseTo(0);
    expect(intersection?.y).toBeCloseTo(0);
  });

  it('should handle parallel lines', () => {
    const l1 = lineFromTwoPoints({ x: 0, y: 0 }, { x: 1, y: 0 }); // y = 0
    const l2 = lineFromTwoPoints({ x: 0, y: 1 }, { x: 1, y: 1 }); // y = 1
    
    const intersection = intersectLineLine(l1, l2);
    expect(intersection).toBeNull();
  });

  it('should intersect line and circle (2 points)', () => {
    const l = lineFromTwoPoints({ x: -2, y: 0 }, { x: 2, y: 0 }); // y = 0
    const c = { center: { x: 0, y: 0 }, radius: 1 }; // x^2 + y^2 = 1
    
    const pts = intersectLineCircle(l, c);
    expect(pts.length).toBe(2);
    // points should be (-1,0) and (1,0) in any order
  });

  it('should intersect circle and circle', () => {
    const c1 = { center: { x: -1, y: 0 }, radius: 2 };
    const c2 = { center: { x: 1, y: 0 }, radius: 2 };
    
    const pts = intersectCircleCircle(c1, c2);
    expect(pts.length).toBe(2);
  });
});
