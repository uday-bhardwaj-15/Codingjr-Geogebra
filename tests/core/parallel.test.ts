import { describe, it, expect } from 'vitest';
import { parallelLine } from '../../src/core/geometry/Line';

describe('Parallel', () => {
  it('should construct a parallel line through a given point', () => {
    // Line 2x - 3y + 6 = 0
    const line = { a: 2, b: -3, c: 6 };
    const pt = { x: 1, y: 4 };
    const par = parallelLine(line, pt);

    // Parallel lines have identical normal direction (a, b)
    expect(par.a).toBe(line.a);
    expect(par.b).toBe(line.b);

    // Evaluated at (1, 4): 2(1) - 3(4) + c = 0 => 2 - 12 + c = 0 => c = 10
    const evalAtPt = par.a * pt.x + par.b * pt.y + par.c;
    expect(evalAtPt).toBeCloseTo(0);
    expect(par.c).toBe(10);
  });
});
