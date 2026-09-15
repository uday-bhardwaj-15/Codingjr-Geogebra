import { describe, it, expect } from 'vitest';
import { angleBisector } from '../../src/core/geometry/Line';

describe('Angle Bisector', () => {
  it('should bisector a right angle at origin between positive x and y axes', () => {
    const p1 = { x: 5, y: 0 };
    const vertex = { x: 0, y: 0 };
    const p2 = { x: 0, y: 5 };

    const bisector = angleBisector(p1, vertex, p2);

    // Bisector of 90 deg angle between positive x and y axes is line y = x (x - y = 0)
    // Passes through (0,0) and (1,1)
    const testPoint = { x: 3, y: 3 };
    const evalAtTest = bisector.a * testPoint.x + bisector.b * testPoint.y + bisector.c;
    expect(evalAtTest).toBeCloseTo(0);

    const evalAtVertex = bisector.a * vertex.x + bisector.b * vertex.y + bisector.c;
    expect(evalAtVertex).toBeCloseTo(0);
  });
});
