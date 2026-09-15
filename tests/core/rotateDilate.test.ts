import { describe, it, expect } from 'vitest';
import { rotatePoint, dilatePoint } from '../../src/core/geometry/transforms';

describe('Rotate and Dilate', () => {
  it('should rotate a point 90 degrees counterclockwise around origin', () => {
    const pt = { x: 1, y: 0 };
    const center = { x: 0, y: 0 };
    const rotated = rotatePoint(pt, center, Math.PI / 2);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });

  it('should rotate a point around a non-origin center', () => {
    const pt = { x: 3, y: 2 };
    const center = { x: 2, y: 2 };
    const rotated = rotatePoint(pt, center, Math.PI);
    expect(rotated.x).toBeCloseTo(1);
    expect(rotated.y).toBeCloseTo(2);
  });

  it('should dilate a point from center by factor 2', () => {
    const pt = { x: 3, y: 4 };
    const center = { x: 1, y: 2 };
    const dilated = dilatePoint(pt, center, 2);
    expect(dilated.x).toBe(5);
    expect(dilated.y).toBe(6);
  });
});
