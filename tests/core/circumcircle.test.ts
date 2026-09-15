import { describe, it, expect } from 'vitest';
import { circleFromThreePoints } from '../../src/core/geometry/Circle';

describe('Circumcircle through 3 Points', () => {
  it('should find center and radius of circumcircle for a right triangle', () => {
    // Right triangle with vertices (0,0), (4,0), (0,3) -> hypotenuse midpoint is (2, 1.5), radius = 2.5
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 4, y: 0 };
    const p3 = { x: 0, y: 3 };

    const circle = circleFromThreePoints(p1, p2, p3);
    expect(circle).toBeDefined();
    expect(circle?.center.x).toBeCloseTo(2);
    expect(circle?.center.y).toBeCloseTo(1.5);
    expect(circle?.radius).toBeCloseTo(2.5);
  });
});
