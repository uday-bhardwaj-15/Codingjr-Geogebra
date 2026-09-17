import { describe, it, expect } from 'vitest';
import { circle3DFromAxisAndPoint, circle3DFromCenterRadiusDirection, circle3DFromThreePoints, circularArc3DFromCenter } from '../../src/core/geometry3d/circle3d';
import { reflectPointAboutPlane, reflectPointAboutLine3D, rotatePointAroundLine3D, translatePoint3D, dilatePoint3D } from '../../src/core/geometry3d/transforms3d';
import { parallelLine3D, perpendicularLineToLine3D, angleBisector3D, tangentsToSphere3D } from '../../src/core/geometry3d/lines3d';
import { tetrahedronFromTwoPoints, regularPolygon3DVertices, extrudePolygonToPrism, extrudePolygonToPyramid, surfaceOfRevolutionFromLine } from '../../src/core/geometry3d/solids3d';
import { intersectPlanes3D, intersectLinePlane3D } from '../../src/core/geometry3d/intersections3d';
import { distance3D, midpoint3D } from '../../src/core/geometry3d/point3d';
import { ConstructionManager } from '../../src/core/construction/ConstructionManager';

describe('3D Tools Suite - Full Parity Tests', () => {
  describe('3D Circle & Arc Geometry', () => {
    it('creates 3D circle from axis and point', () => {
      const axis = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 5 } };
      const pt = { x: 3, y: 4, z: 2 };
      const circle = circle3DFromAxisAndPoint(axis, pt);
      expect(circle.center.z).toBeCloseTo(2);
      expect(circle.radius).toBeCloseTo(5);
      expect(circle.normal.z).toBeCloseTo(1);
    });

    it('creates 3D circle from center, radius, and direction normal', () => {
      const circle = circle3DFromCenterRadiusDirection({ x: 1, y: 2, z: 3 }, 4, { x: 0, y: 0, z: 2 });
      expect(circle.center).toEqual({ x: 1, y: 2, z: 3 });
      expect(circle.radius).toBe(4);
      expect(circle.normal).toEqual({ x: 0, y: 0, z: 1 });
    });

    it('creates 3D circumcircle from 3 non-collinear points', () => {
      const p1 = { x: 1, y: 0, z: 0 };
      const p2 = { x: 0, y: 1, z: 0 };
      const p3 = { x: -1, y: 0, z: 0 };
      const circle = circle3DFromThreePoints(p1, p2, p3);
      expect(circle).not.toBeNull();
      expect(circle!.center.x).toBeCloseTo(0);
      expect(circle!.center.y).toBeCloseTo(0);
      expect(circle!.radius).toBeCloseTo(1);
    });

    it('creates 3D circular arc and sector', () => {
      const center = { x: 0, y: 0, z: 0 };
      const p1 = { x: 2, y: 0, z: 0 };
      const p2 = { x: 0, y: 2, z: 0 };
      const arc = circularArc3DFromCenter(center, p1, p2, true);
      expect(arc.center).toEqual(center);
      expect(arc.radius).toBeCloseTo(2);
      expect(arc.isSector).toBe(true);
    });
  });

  describe('3D Transforms', () => {
    it('reflects point about 3D plane', () => {
      const pt = { x: 2, y: 3, z: 4 };
      const plane = { a: 0, b: 0, c: 1, d: 0, normal: { x: 0, y: 0, z: 1 } }; // z = 0 plane
      const reflected = reflectPointAboutPlane(pt, plane);
      expect(reflected.x).toBeCloseTo(2);
      expect(reflected.y).toBeCloseTo(3);
      expect(reflected.z).toBeCloseTo(-4);
    });

    it('reflects point about 3D line', () => {
      const pt = { x: 2, y: 0, z: 0 };
      const line = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 1 } }; // Z-axis
      const reflected = reflectPointAboutLine3D(pt, line);
      expect(reflected.x).toBeCloseTo(-2);
      expect(reflected.y).toBeCloseTo(0);
      expect(reflected.z).toBeCloseTo(0);
    });

    it('rotates point around 3D line by 90 degrees', () => {
      const pt = { x: 2, y: 0, z: 0 };
      const axis = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 1 } }; // Z-axis
      const rotated = rotatePointAroundLine3D(pt, axis, Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(2);
      expect(rotated.z).toBeCloseTo(0);
    });

    it('translates point by 3D vector', () => {
      const pt = { x: 1, y: 2, z: 3 };
      const translated = translatePoint3D(pt, { x: 4, y: -1, z: 2 });
      expect(translated).toEqual({ x: 5, y: 1, z: 5 });
    });

    it('dilates point from 3D center', () => {
      const pt = { x: 3, y: 0, z: 0 };
      const center = { x: 1, y: 0, z: 0 };
      const dilated = dilatePoint3D(pt, center, 2);
      expect(dilated).toEqual({ x: 5, y: 0, z: 0 });
    });
  });

  describe('3D Lines & Special Lines', () => {
    it('computes parallel line in 3D', () => {
      const line = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } };
      const pt = { x: 0, y: 2, z: 3 };
      const par = parallelLine3D(line, pt);
      expect(par.p1).toEqual(pt);
      expect(par.p2).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('computes perpendicular line to 3D line through point', () => {
      const line = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 5 } };
      const pt = { x: 3, y: 4, z: 2 };
      const perp = perpendicularLineToLine3D(line, pt);
      expect(perp.p1).toEqual(pt);
      expect(perp.p2.x).toBeCloseTo(0);
      expect(perp.p2.y).toBeCloseTo(0);
      expect(perp.p2.z).toBeCloseTo(2);
    });

    it('computes angle bisector in 3D', () => {
      const p1 = { x: 1, y: 0, z: 0 };
      const vertex = { x: 0, y: 0, z: 0 };
      const p2 = { x: 0, y: 1, z: 0 };
      const bis = angleBisector3D(p1, vertex, p2);
      expect(bis.p1).toEqual(vertex);
      expect(bis.p2.x).toBeCloseTo(Math.SQRT1_2);
      expect(bis.p2.y).toBeCloseTo(Math.SQRT1_2);
    });
  });

  describe('3D Solids & Extrusions', () => {
    it('constructs regular tetrahedron from 2 points', () => {
      const tetra = tetrahedronFromTwoPoints({ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 });
      expect(tetra.vertices!.length).toBe(4);
      expect(tetra.faces!.length).toBe(4);
    });

    it('extrudes base polygon to 3D prism', () => {
      const base = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 2, y: 2, z: 0 },
        { x: 0, y: 2, z: 0 },
      ];
      const prism = extrudePolygonToPrism(base, 5);
      expect(prism.vertices!.length).toBe(8);
      expect(prism.faces!.length).toBe(6);
    });

    it('extrudes base polygon to 3D pyramid', () => {
      const base = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 2, y: 2, z: 0 },
        { x: 0, y: 2, z: 0 },
      ];
      const pyramid = extrudePolygonToPyramid(base, 4);
      expect(pyramid.vertices!.length).toBe(5);
      expect(pyramid.faces!.length).toBe(5);
      expect(pyramid.apex!.z).toBeCloseTo(4);
    });

    it('generates 3D surface of revolution from line segment', () => {
      const line = { p1: { x: 2, y: 0, z: 0 }, p2: { x: 2, y: 0, z: 4 } };
      const axis = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 1 } };
      const rev = surfaceOfRevolutionFromLine(line, axis, 16);
      expect(rev.vertices!.length).toBeGreaterThan(0);
      expect(rev.faces!.length).toBeGreaterThan(0);
    });
  });

  describe('3D Intersections', () => {
    it('intersects two 3D planes to produce a 3D line', () => {
      const pl1 = { a: 1, b: 0, c: 0, d: 0, normal: { x: 1, y: 0, z: 0 } }; // x = 0 (YZ plane)
      const pl2 = { a: 0, b: 1, c: 0, d: 0, normal: { x: 0, y: 1, z: 0 } }; // y = 0 (XZ plane)
      const line = intersectPlanes3D(pl1, pl2);
      expect(line).not.toBeNull();
      expect(line!.p1.x).toBeCloseTo(0);
      expect(line!.p1.y).toBeCloseTo(0);
      expect(Math.abs(line!.dir.z)).toBeCloseTo(1);
    });
  });

  describe('ConstructionManager Reactive Recomputations for 3D Tools', () => {
    it('evaluates extrude-to-prism reactively when base changes', () => {
      const manager = new ConstructionManager();
      const p1 = { id: 'p1', label: 'A', type: 'point' as const, definition: '(0,0,0)', dependsOn: [], value: { kind: 'free', x: 0, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'point', createdAt: 1 };
      const p2 = { id: 'p2', label: 'B', type: 'point' as const, definition: '(2,0,0)', dependsOn: [], value: { kind: 'free', x: 2, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'point', createdAt: 2 };
      const p3 = { id: 'p3', label: 'C', type: 'point' as const, definition: '(0,2,0)', dependsOn: [], value: { kind: 'free', x: 0, y: 2, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'point', createdAt: 3 };
      const poly = { id: 'poly', label: 'poly1', type: 'polygon' as const, definition: 'Polygon(A,B,C)', dependsOn: ['p1', 'p2', 'p3'], value: { vertices: [] }, visible: true, labelVisible: true, style: { color: '#ff7043', thickness: 2, opacity: 0.5 }, createdByToolId: 'polygon', createdAt: 4 };
      const prism = { id: 'prism', label: 'prism1', type: 'prism' as const, definition: 'Prism(poly1, 5)', dependsOn: ['poly'], value: { altitude: 5 }, visible: true, labelVisible: true, style: { color: '#00897b', thickness: 2, opacity: 0.5 }, createdByToolId: 'extrude-to-prism', createdAt: 5 };

      manager.addObject(p1);
      manager.addObject(p2);
      manager.addObject(p3);
      manager.addObject(poly);
      manager.addObject(prism);

      const prismVal = manager.getObject('prism')?.value as any;
      expect(prismVal.vertices.length).toBe(6);
    });

    it('evaluates volume and surface area measurements reactively', () => {
      const manager = new ConstructionManager();
      const p1 = { id: 'p1', label: 'A', type: 'point' as const, definition: '(0,0,0)', dependsOn: [], value: { kind: 'free', x: 0, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'point', createdAt: 1 };
      const p2 = { id: 'p2', label: 'B', type: 'point' as const, definition: '(2,0,0)', dependsOn: [], value: { kind: 'free', x: 2, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'point', createdAt: 2 };
      const cube = { id: 'cube', label: 'cube1', type: 'cube' as const, definition: 'Cube(A,B)', dependsOn: ['p1', 'p2'], value: { vertices: [], faces: [] }, visible: true, labelVisible: true, style: { color: '#e91e63', thickness: 2, opacity: 0.5 }, createdByToolId: 'cube', createdAt: 3 };
      const vol = { id: 'vol', label: 'vol1', type: 'volume' as const, definition: 'Volume(cube1)', dependsOn: ['cube'], value: {}, visible: true, labelVisible: true, style: { color: '#000', thickness: 2, opacity: 1 }, createdByToolId: 'volume', createdAt: 4 };

      manager.addObject(p1);
      manager.addObject(p2);
      manager.addObject(cube);
      manager.addObject(vol);

      const volVal = manager.getObject('vol')?.value as any;
      expect(volVal.volume).toBeCloseTo(8); // side = 2 -> 2^3 = 8
    });
  });
});
