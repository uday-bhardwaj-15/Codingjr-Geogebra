import { describe, it, expect } from 'vitest';
import { perpendicularLine, perpendicularBisector, lineFromTwoPoints } from '../../src/core/geometry/Line';

describe('Perpendicular', () => {
  it('should construct a perpendicular line through a given point', () => {
    // Horizontal line y = 2: 0x + 1y - 2 = 0
    const horizLine = { a: 0, b: 1, c: -2 };
    const pt = { x: 3, y: 5 };
    const perp = perpendicularLine(horizLine, pt);

    // Perpendicular line to y = 2 through (3, 5) must be vertical line x = 3
    // ax + by + c = 0 => -1*x + 0*y + 3 = 0 (or equivalent scale)
    const evaluatedAtPt = perp.a * pt.x + perp.b * pt.y + perp.c;
    expect(evaluatedAtPt).toBeCloseTo(0);

    // Check dot product of normal vectors is zero
    const dot = horizLine.a * perp.a + horizLine.b * perp.b;
    expect(dot).toBeCloseTo(0);
  });

  it('should construct a perpendicular bisector between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 4, y: 0 };
    const bisector = perpendicularBisector(p1, p2);

    // Midpoint is (2, 0)
    const mid = { x: 2, y: 0 };
    const evaluatedAtMid = bisector.a * mid.x + bisector.b * mid.y + bisector.c;
    expect(evaluatedAtMid).toBeCloseTo(0);

    // Segment line
    const segLine = lineFromTwoPoints(p1, p2);
    const dot = segLine.a * bisector.a + segLine.b * bisector.b;
    expect(dot).toBeCloseTo(0);
  });
});
