import { describe, it, expect } from 'vitest';
import { invertPointAboutCircle } from '../../src/core/geometry/transforms';

describe('Circle Inversion', () => {
  it('should invert a point across unit circle centered at origin', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    // Point at distance 4 from center on x-axis
    const pt = { x: 4, y: 0 };
    // Inverted point should be at distance R^2 / d = 4 / 4 = 1
    const inverted = invertPointAboutCircle(pt, circle);
    expect(inverted.x).toBeCloseTo(1);
    expect(inverted.y).toBeCloseTo(0);
  });

  it('should invert a point across an offset circle', () => {
    const circle = { center: { x: 1, y: 1 }, radius: 3 };
    const pt = { x: 1, y: 4 }; // distance = 3 (on circle)
    // Point on circle inverts to itself
    const inverted = invertPointAboutCircle(pt, circle);
    expect(inverted.x).toBeCloseTo(1);
    expect(inverted.y).toBeCloseTo(4);
  });
});
