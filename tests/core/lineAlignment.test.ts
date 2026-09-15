import { describe, it, expect } from 'vitest';
import { lineFromTwoPoints } from '../../src/core/geometry/Line';
import { worldToScreen } from '../../src/lib/coords/coordTransform';
import { Viewport } from '../../src/types/geo';

describe('Line coordinate transform alignment', () => {
  it('guarantees that points defining a line lie exactly on the line', () => {
    const p1 = { x: -3.5, y: 4.2 };
    const p2 = { x: 5.1, y: -2.7 };
    const line = lineFromTwoPoints(p1, p2);

    // Verify mathematical equation: a*x + b*y + c === 0
    expect(Math.abs(line.a * p1.x + line.b * p1.y + line.c)).toBeLessThan(1e-10);
    expect(Math.abs(line.a * p2.x + line.b * p2.y + line.c)).toBeLessThan(1e-10);

    // Verify screen transform alignment
    const viewport: Viewport = { xMin: -10, xMax: 10, yMin: -6, yMax: 6 };
    const w = 1000;
    const h = 600;

    const s1 = worldToScreen(p1.x, p1.y, w, h, viewport);
    const s2 = worldToScreen(p2.x, p2.y, w, h, viewport);

    // Screen direction vector
    const dx = s2.x - s1.x;
    const dy = s2.y - s1.y;

    // Check intermediate point at t = 0.4
    const pMidWorld = {
      x: p1.x + 0.4 * (p2.x - p1.x),
      y: p1.y + 0.4 * (p2.y - p1.y),
    };
    const sMidWorld = worldToScreen(pMidWorld.x, pMidWorld.y, w, h, viewport);
    const sMidExpected = {
      x: s1.x + 0.4 * dx,
      y: s1.y + 0.4 * dy,
    };

    expect(Math.abs(sMidWorld.x - sMidExpected.x)).toBeLessThan(1e-9);
    expect(Math.abs(sMidWorld.y - sMidExpected.y)).toBeLessThan(1e-9);
  });
});
