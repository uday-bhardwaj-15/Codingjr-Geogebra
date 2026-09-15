import { describe, it, expect } from 'vitest';
import { regularPolygonVertices, polygonArea, polygonPerimeter } from '../../src/core/geometry/polygons';

describe('Regular Polygon', () => {
  it('should generate 4 vertices of a square with side length 2', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 2, y: 0 };
    const vertices = regularPolygonVertices(p1, p2, 4);

    expect(vertices.length).toBe(4);
    expect(vertices[0].x).toBeCloseTo(0);
    expect(vertices[0].y).toBeCloseTo(0);

    expect(vertices[1].x).toBeCloseTo(2);
    expect(vertices[1].y).toBeCloseTo(0);

    expect(vertices[2].x).toBeCloseTo(2);
    expect(vertices[2].y).toBeCloseTo(2);

    expect(vertices[3].x).toBeCloseTo(0);
    expect(vertices[3].y).toBeCloseTo(2);

    expect(polygonArea(vertices)).toBeCloseTo(4);
    expect(polygonPerimeter(vertices)).toBeCloseTo(8);
  });
});
