import { describe, it, expect } from 'vitest';
import { reflectPointAboutPoint, reflectPointAboutLine, translatePoint } from '../../src/core/geometry/transforms';
import { lineFromTwoPoints } from '../../src/core/geometry/Line';

describe('Transforms', () => {
  it('should translate point', () => {
    const pt = translatePoint({ x: 1, y: 1 }, { dx: 2, dy: -3 });
    expect(pt.x).toBe(3);
    expect(pt.y).toBe(-2);
  });

  it('should reflect point about point', () => {
    const pt = reflectPointAboutPoint({ x: 1, y: 1 }, { x: 2, y: 2 });
    expect(pt.x).toBe(3);
    expect(pt.y).toBe(3);
  });

  it('should reflect point about line', () => {
    // Line x = 0 (y-axis)
    const line = lineFromTwoPoints({ x: 0, y: -1 }, { x: 0, y: 1 });
    const pt = reflectPointAboutLine({ x: 5, y: 3 }, line);
    expect(pt.x).toBeCloseTo(-5);
    expect(pt.y).toBeCloseTo(3);
  });
});
