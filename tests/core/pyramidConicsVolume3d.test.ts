import { describe, it, expect } from 'vitest';
import { ConstructionManager } from '../../src/core/construction/ConstructionManager';
import { GeoObject } from '../../src/types/geo';
import {
  ellipse3DFromFociAndPoint,
  hyperbola3DFromFociAndPoint,
  parabola3DFromFocusAndDirectrix,
  conic3DFromFivePoints,
} from '../../src/core/geometry3d/conics3d';
import { pyramidFromBaseAndApex, prismFromBaseAndTop } from '../../src/core/geometry3d/solids3d';

describe('3D Pyramid, Conics, and Volume / Side Position Tests', () => {
  it('should compute 3D Pyramid geometry and volume correctly', () => {
    const base = [
      { x: 0, y: 0, z: 0 },
      { x: 4, y: 0, z: 0 },
      { x: 4, y: 3, z: 0 },
      { x: 0, y: 3, z: 0 },
    ];
    const apex = { x: 2, y: 1.5, z: 6 };

    const pyr = pyramidFromBaseAndApex(base, apex);
    expect(pyr.type).toBe('pyramid');
    expect(pyr.vertices?.length).toBe(5);
    expect(pyr.faces?.length).toBe(5); // 1 base quad + 4 side triangles
    // Base area = 12, height = 6, volume = (12 * 6) / 3 = 24
    expect(pyr.volume).toBeCloseTo(24, 2);
  });

  it('should evaluate 3D Pyramid constructed via ConstructionManager with 4 points', () => {
    const manager = new ConstructionManager();

    const p1: GeoObject = { id: 'p1', label: 'A', type: 'point', definition: '(0, 0, 0)', value: { x: 0, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 1 };
    const p2: GeoObject = { id: 'p2', label: 'B', type: 'point', definition: '(4, 0, 0)', value: { x: 4, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 2 };
    const p3: GeoObject = { id: 'p3', label: 'C', type: 'point', definition: '(0, 3, 0)', value: { x: 0, y: 3, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 3 };
    const p4: GeoObject = { id: 'p4', label: 'D', type: 'point', definition: '(1, 1, 6)', value: { x: 1, y: 1, z: 6 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 4 };

    manager.addObject(p1);
    manager.addObject(p2);
    manager.addObject(p3);
    manager.addObject(p4);

    const pyrObj: GeoObject = {
      id: 'pyr1',
      label: 'pyr1',
      type: 'pyramid',
      definition: 'Pyramid(A, B, C, D)',
      value: { vertices: [], faces: [] },
      visible: true,
      labelVisible: true,
      style: { color: '#fb8c00', thickness: 2, opacity: 0.5 },
      dependsOn: ['p1', 'p2', 'p3', 'p4'],
      createdByToolId: 'pyramid',
      createdAt: 5,
    };
    manager.addObject(pyrObj);

    const evaluated = manager.getObject('pyr1')?.value as any;
    expect(evaluated?.type).toBe('pyramid');
    expect(evaluated?.vertices.length).toBe(4);
    // Base triangle area = 0.5 * 4 * 3 = 6, height = 6, volume = (6 * 6) / 3 = 12
    expect(evaluated?.volume).toBeCloseTo(12, 1);
  });

  it('should evaluate 3D Ellipse with 3D foci and point', () => {
    const f1 = { x: -2, y: 0, z: 1 };
    const f2 = { x: 2, y: 0, z: 1 };
    const p = { x: 0, y: 3, z: 1 };

    const el = ellipse3DFromFociAndPoint(f1, f2, p);
    expect(el.conicType).toBe('ellipse');
    expect(el.points.length).toBeGreaterThanOrEqual(64);
    expect(el.center?.z).toBeCloseTo(1, 2);
  });

  it('should evaluate 3D Hyperbola and Parabola', () => {
    const f1 = { x: -3, y: 0, z: 0 };
    const f2 = { x: 3, y: 0, z: 0 };
    const p = { x: 2, y: 0, z: 0 };

    const hyp = hyperbola3DFromFociAndPoint(f1, f2, p);
    expect(hyp.conicType).toBe('hyperbola');
    expect(hyp.points.length).toBeGreaterThan(0);

    const focus = { x: 0, y: 1, z: 0 };
    const directrix = { p1: { x: -5, y: -1, z: 0 }, p2: { x: 5, y: -1, z: 0 } };
    const par = parabola3DFromFocusAndDirectrix(focus, directrix);
    expect(par.conicType).toBe('parabola');
    expect(par.points.length).toBeGreaterThan(0);
  });

  it('should evaluate 3D Conic through 5 non-coplanar/coplanar points', () => {
    const pts = [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0.707, y: 0.707, z: 0 },
    ];
    const conic = conic3DFromFivePoints(pts);
    expect(conic.points.length).toBeGreaterThan(0);
  });

  it('should compute Volume and attach target label in ConstructionManager', () => {
    const manager = new ConstructionManager();

    const p1: GeoObject = { id: 'p1', label: 'A', type: 'point', definition: '(0, 0, 0)', value: { x: 0, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 1 };
    const p2: GeoObject = { id: 'p2', label: 'B', type: 'point', definition: '(2, 0, 0)', value: { x: 2, y: 0, z: 0 }, visible: true, labelVisible: true, style: { color: '#000', thickness: 5, opacity: 1 }, dependsOn: [], createdByToolId: 'point', createdAt: 2 };

    manager.addObject(p1);
    manager.addObject(p2);

    const cube: GeoObject = {
      id: 'cube1',
      label: 'cube1',
      type: 'cube',
      definition: 'Cube(A, B)',
      value: { vertices: [], faces: [] },
      visible: true,
      labelVisible: true,
      style: { color: '#e91e63', thickness: 2, opacity: 0.5 },
      dependsOn: ['p1', 'p2'],
      createdByToolId: 'cube',
      createdAt: 3,
    };
    manager.addObject(cube);

    const vol: GeoObject = {
      id: 'vol1',
      label: 'vol1',
      type: 'volume',
      definition: 'Volume(cube1)',
      value: {},
      visible: true,
      labelVisible: true,
      style: { color: '#000', thickness: 2, opacity: 1 },
      dependsOn: ['cube1'],
      createdByToolId: 'volume',
      createdAt: 4,
    };
    manager.addObject(vol);

    const volVal = manager.getObject('vol1')?.value as any;
    expect(volVal?.volume).toBeCloseTo(8, 2); // Side length = 2, volume = 2^3 = 8
    expect(volVal?.targetLabel).toBe('cube1');
  });
});
