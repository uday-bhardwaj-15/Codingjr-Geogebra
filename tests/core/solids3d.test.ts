import { describe, it, expect } from 'vitest';
import {
  cubeFromTwoPoints,
  tetrahedronFromTwoPoints,
  regularPolygon3DVertices,
  pyramidFromBaseAndApex,
  prismFromBaseAndTop,
  cylinderFromPointsAndRadius,
  coneFromBaseAndApex,
} from '../../src/core/geometry3d/solids3d';

describe('3D Solids Construction', () => {
  it('constructs a 3D Cube from two opposite base points', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 2, y: 0, z: 0 };
    const cube = cubeFromTwoPoints(p1, p2);

    expect(cube.vertices!.length).toBe(8);
    expect(cube.faces!.length).toBe(6);
    expect(cube.volume).toBeCloseTo(8, 5); // edge = 2 -> 2^3 = 8
  });

  it('constructs a 3D Pyramid from a polygon base and apex', () => {
    const base = [
      { x: 0, y: 0, z: 0 },
      { x: 4, y: 0, z: 0 },
      { x: 4, y: 4, z: 0 },
      { x: 0, y: 4, z: 0 },
    ];
    const apex = { x: 2, y: 2, z: 6 };
    const pyramid = pyramidFromBaseAndApex(base, apex);

    expect(pyramid.vertices!.length).toBe(5); // 4 base + 1 apex
    expect(pyramid.faces!.length).toBe(5); // 1 quad base + 4 triangular sides
    expect(pyramid.volume).toBeCloseTo((16 * 6) / 3, 5); // 32
  });

  it('constructs a 3D Prism from a polygon base and extrusion vector', () => {
    const base = [
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
      { x: 0, y: 2, z: 0 },
    ]; // right triangle area = 2
    const topPt = { x: 0, y: 0, z: 5 }; // height = 5
    const prism = prismFromBaseAndTop(base, topPt);

    expect(prism.vertices!.length).toBe(6); // 3 bottom + 3 top
    expect(prism.faces!.length).toBe(5); // 2 triangular bases + 3 quad sides
    expect(prism.volume).toBeCloseTo(2 * 5, 5); // 10
  });

  it('constructs a 3D Cylinder from center points and radius', () => {
    const baseCenter = { x: 0, y: 0, z: 0 };
    const topCenter = { x: 0, y: 0, z: 10 };
    const radius = 3;
    const cyl = cylinderFromPointsAndRadius(baseCenter, topCenter, radius);

    expect(cyl.radius).toBe(3);
    expect(cyl.height).toBeCloseTo(10, 5);
    expect(cyl.volume).toBeCloseTo(Math.PI * 9 * 10, 5);
  });

  it('constructs a 3D Tetrahedron from two points defining an edge', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 2, y: 0, z: 0 };
    const tetra = tetrahedronFromTwoPoints(p1, p2);

    expect(tetra.vertices!.length).toBe(4);
    expect(tetra.faces!.length).toBe(4);
    expect(tetra.volume).toBeCloseTo((8) / (6 * Math.SQRT2), 4);
  });

  it('constructs a 3D Regular Polygon (e.g. square / hexagon) from two points and n', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 2, y: 0, z: 0 };
    const square = regularPolygon3DVertices(p1, p2, 4);

    expect(square.length).toBe(4);
    expect(square[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(square[1]).toEqual({ x: 2, y: 0, z: 0 });
  });
});
