import { describe, it, expect } from 'vitest';
import {
  distanceBetweenPoints,
  angleBetweenThreePoints,
  circleArea,
  circleCircumference,
} from '../../src/core/geometry/measure';

describe('Measure', () => {
  it('should calculate distance between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(distanceBetweenPoints(p1, p2)).toBe(5);
  });

  it('should calculate 90 degree angle correctly', () => {
    const p1 = { x: 4, y: 0 };
    const vertex = { x: 0, y: 0 };
    const p2 = { x: 0, y: 4 };
    const angle = angleBetweenThreePoints(p1, vertex, p2);
    expect(angle.deg).toBeCloseTo(90);
    expect(angle.rad).toBeCloseTo(Math.PI / 2);
  });

  it('should calculate circle area and circumference', () => {
    const radius = 3;
    expect(circleArea(radius)).toBeCloseTo(Math.PI * 9);
    expect(circleCircumference(radius)).toBeCloseTo(2 * Math.PI * 3);
  });
});
