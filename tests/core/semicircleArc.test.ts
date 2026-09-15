import { describe, it, expect } from 'vitest';
import { semicircleFromDiameter, circularArcFromCenter } from '../../src/core/geometry/Circle';

describe('Semicircle and Arc', () => {
  it('should construct semicircle with exact start and end angles', () => {
    const p1 = { x: -2, y: 0 };
    const p2 = { x: 2, y: 0 };
    const semi = semicircleFromDiameter(p1, p2);

    expect(semi.center.x).toBeCloseTo(0);
    expect(semi.center.y).toBeCloseTo(0);
    expect(semi.radius).toBeCloseTo(2);
    expect(semi.arc).toBeDefined();
    expect(semi.arc?.startAngle).toBeCloseTo(Math.PI);
    expect(semi.arc?.endAngle).toBeCloseTo(2 * Math.PI);
    expect(semi.filled).toBe(false);
  });

  it('should construct circular arc from center and two points', () => {
    const center = { x: 0, y: 0 };
    const start = { x: 3, y: 0 }; // angle 0
    const end = { x: 0, y: 3 };   // angle PI/2
    const arc = circularArcFromCenter(center, start, end);

    expect(arc.radius).toBeCloseTo(3);
    expect(arc.arc?.startAngle).toBeCloseTo(0);
    expect(arc.arc?.endAngle).toBeCloseTo(Math.PI / 2);
  });
});
