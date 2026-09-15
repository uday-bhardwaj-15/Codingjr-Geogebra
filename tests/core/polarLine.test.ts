import { describe, it, expect } from 'vitest';
import { polarLineOfPoint } from '../../src/core/geometry/Line';

describe('Polar Line', () => {
  it('should find polar line of point relative to circle centered at origin', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const pt = { x: 4, y: 0 };
    const line = polarLineOfPoint(pt, circle);

    // Polar line of (4, 0) for circle with R=2 is vertical line x = R^2 / 4 = 1
    // ax + by + c = 0 => 4x + 0y - 4 = 0 => x = 1
    expect(line.b).toBeCloseTo(0);
    // Intersection with x-axis is -c / a = 4 / 4 = 1
    expect(-line.c / line.a).toBeCloseTo(1);
  });
});
