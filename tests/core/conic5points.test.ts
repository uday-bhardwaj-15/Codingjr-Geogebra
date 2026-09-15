import { describe, it, expect } from 'vitest';
import { conicFromFivePoints } from '../../src/core/geometry/conics';

describe('Conic through 5 Points', () => {
  it('should recover ellipse for 5 points on a circle centered at origin with radius 2', () => {
    // 5 points on circle x^2 + y^2 = 4
    const points = [
      { x: 2, y: 0 },
      { x: 0, y: 2 },
      { x: -2, y: 0 },
      { x: 0, y: -2 },
      { x: Math.sqrt(2), y: Math.sqrt(2) },
    ];

    const shape = conicFromFivePoints(points);
    expect(shape).toBeDefined();
    expect(shape?.conicType).toBe('ellipse');
    if (shape?.conicType === 'ellipse') {
      expect(shape.center.x).toBeCloseTo(0, 1);
      expect(shape.center.y).toBeCloseTo(0, 1);
      expect(shape.a).toBeCloseTo(2, 1);
      expect(shape.b).toBeCloseTo(2, 1);
    }
  });
});
