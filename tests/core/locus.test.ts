import { describe, it, expect } from 'vitest';
import { sampleLocus } from '../../src/core/geometry/locus';

describe('Locus', () => {
  it('should sample locus points of a moving point', () => {
    // A point moving on segment from (0, 0) to (10, 0), locus point is midpoint to (0, 4)
    const points = sampleLocus({ min: 0, max: 10, steps: 10 }, (t) => {
      const movingPt = { x: t, y: 0 };
      const fixedPt = { x: 0, y: 4 };
      return {
        x: (movingPt.x + fixedPt.x) / 2,
        y: (movingPt.y + fixedPt.y) / 2,
      };
    });

    expect(points.length).toBe(11);
    expect(points[0]).toEqual({ x: 0, y: 2 });
    expect(points[10]).toEqual({ x: 5, y: 2 });
  });
});
