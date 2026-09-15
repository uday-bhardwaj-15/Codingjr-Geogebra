import { describe, it, expect } from 'vitest';
import { tangentsToCircle } from '../../src/core/geometry/tangents';
import { distance } from '../../src/core/geometry/Point';

describe('Tangents', () => {
  it('should find two tangents from external point to unit circle', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 1 };
    const pt = { x: 2, y: 0 };
    const lines = tangentsToCircle(pt, circle);

    expect(lines.length).toBe(2);

    // Both lines must pass through pt (2, 0)
    for (const line of lines) {
      const evalAtPt = line.a * pt.x + line.b * pt.y + line.c;
      expect(evalAtPt).toBeCloseTo(0);

      // Distance from center (0, 0) to tangent line must equal radius = 1
      const distFromCenter = Math.abs(line.c) / Math.sqrt(line.a * line.a + line.b * line.b);
      expect(distFromCenter).toBeCloseTo(1);
    }
  });

  it('should find one tangent for a point on the circle', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const pt = { x: 0, y: 2 };
    const lines = tangentsToCircle(pt, circle);

    expect(lines.length).toBe(1);
    // Tangent at (0, 2) is horizontal line y = 2
    const line = lines[0];
    const evalAtPt = line.a * pt.x + line.b * pt.y + line.c;
    expect(evalAtPt).toBeCloseTo(0);
    expect(line.a).toBeCloseTo(0);
    expect(Math.abs(line.b)).toBeGreaterThan(0);
  });

  it('should return empty array for a point inside the circle', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const pt = { x: 1, y: 1 };
    const lines = tangentsToCircle(pt, circle);
    expect(lines.length).toBe(0);
  });
});
