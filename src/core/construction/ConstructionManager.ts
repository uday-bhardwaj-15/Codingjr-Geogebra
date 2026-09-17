import { GeoObject } from '../../types/geo';
import { CommandStack } from './commands/CommandStack';
import { Command } from './commands/Command';
import {
  AddObjectCommand,
  DeleteObjectCommand,
  UpdateObjectCommand,
  ToggleVisibilityCommand,
  ToggleLabelCommand,
} from './commands/commands';
import { Evaluator } from '../math-engine/evaluator';
import { parseExpression } from '../math-engine/parser';
import { resolvePoint, PointCoords } from '../geometry/Point';
import {
  lineFromTwoPoints,
  perpendicularLine,
  parallelLine,
  perpendicularBisector,
  angleBisector,
  polarLineOfPoint,
  bestFitLine,
  LineValue,
} from '../geometry/Line';
import {
  circleFromCenterAndPoint,
  circleFromCenterAndRadius,
  circleFromThreePoints,
  semicircleFromDiameter,
  circularArcFromCenter,
  circumcircularArc,
} from '../geometry/Circle';
import {
  regularPolygonVertices,
  polygonArea,
} from '../geometry/polygons';
import {
  ellipseFromFociAndPoint,
  hyperbolaFromFociAndPoint,
  parabolaFromFocusAndDirectrix,
  conicFromFivePoints,
} from '../geometry/conics';
import { tangentsToCircle } from '../geometry/tangents';
import {
  reflectPointAboutLine,
  reflectPointAboutPoint,
  translatePoint,
  rotatePoint,
  dilatePoint,
  invertPointAboutCircle,
} from '../geometry/transforms';
import {
  distanceBetweenPoints,
  angleBetweenThreePoints,
  circleArea,
} from '../geometry/measure';
import {
  intersectLineLine,
  intersectLineCircle,
  intersectCircleCircle,
} from '../geometry/intersections';
import { sampleLocus } from '../geometry/locus';
import { resolvePoint3D, distance3D, midpoint3D } from '../geometry3d/point3d';
import { lineFromTwoPoints3D } from '../geometry3d/line3d';
import {
  planeFromThreePoints,
  parallelPlaneThroughPoint,
  perpendicularPlaneThroughLine,
} from '../geometry3d/plane3d';
import {
  cubeFromTwoPoints,
  tetrahedronFromTwoPoints,
  pyramidFromBaseAndApex,
  prismFromBaseAndTop,
  cylinderFromPointsAndRadius,
  coneFromBaseAndApex,
  polygon3DArea,
  regularPolygon3DVertices,
  extrudePolygonToPrism,
  extrudePolygonToPyramid,
  surfaceOfRevolutionFromLine,
} from '../geometry3d/solids3d';
import { intersectLineLine3D, intersectLinePlane3D, intersectPlanes3D } from '../geometry3d/intersections3d';
import {
  circle3DFromAxisAndPoint,
  circle3DFromCenterRadiusDirection,
  circle3DFromThreePoints,
  circularArc3DFromCenter,
} from '../geometry3d/circle3d';
import {
  reflectPointAboutPlane,
  reflectPointAboutPoint3D,
  reflectPointAboutLine3D,
  rotatePointAroundLine3D,
  translatePoint3D,
  dilatePoint3D,
} from '../geometry3d/transforms3d';
import {
  parallelLine3D,
  perpendicularLineToLine3D,
  angleBisector3D,
  tangentsToSphere3D,
} from '../geometry3d/lines3d';
import {
  ellipse3DFromFociAndPoint,
  hyperbola3DFromFociAndPoint,
  parabola3DFromFocusAndDirectrix,
  conic3DFromFivePoints,
} from '../geometry3d/conics3d';

export class ConstructionManager {
  private objects: Map<string, GeoObject> = new Map();
  private commandStack = new CommandStack(this);
  private evaluator = new Evaluator();

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getObjects(): GeoObject[] {
    return Array.from(this.objects.values());
  }

  public getObject(id: string): GeoObject | undefined {
    return this.objects.get(id);
  }

  private normalizeObject(obj: GeoObject): GeoObject {
    if (!obj.style) {
      obj.style = {
        color: (obj as any).color || '#1565ef',
        thickness: (obj as any).thickness || (obj as any).strokeWidth || 2,
        opacity: (obj as any).opacity ?? 0.3,
      };
    } else {
      if (!obj.style.color) obj.style.color = (obj as any).color || '#1565ef';
      if (typeof obj.style.thickness !== 'number') obj.style.thickness = (obj as any).thickness || (obj as any).strokeWidth || 2;
      if (typeof obj.style.opacity !== 'number') obj.style.opacity = (obj as any).opacity ?? 0.3;
    }
    if (!obj.label && (obj as any).name) {
      obj.label = (obj as any).name;
    }
    return obj;
  }

  public loadObjects(objs: GeoObject[]): void {
    this.objects.clear();
    this.commandStack.clear();
    for (const obj of objs) {
      const normalized = this.normalizeObject(obj);
      this.objects.set(normalized.id, normalized);
    }
    for (const obj of objs) {
      this.recomputeObject(obj.id);
    }
    this.notify();
  }

  public clearAll(): void {
    this.objects.clear();
    this.commandStack.clear();
    this.notify();
  }

  // --- Low-level raw mutations ---

  public rawAddObject(obj: GeoObject): void {
    const normalized = this.normalizeObject(obj);
    this.objects.set(normalized.id, normalized);
    this.recomputeObject(normalized.id);
    this.notify();
  }

  public rawRemoveObject(id: string): void {
    const dependents = this.getDependents(id);
    for (const depId of dependents) {
      this.objects.delete(depId);
    }
    this.objects.delete(id);
    this.notify();
  }

  public rawUpdateObject(id: string, newDef: Partial<GeoObject>): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    Object.assign(obj, newDef);
    this.recomputeObject(id);
    this.notify();
  }

  // --- High-level command-driven mutations ---

  public addObject(obj: GeoObject): void {
    this.executeCommand(new AddObjectCommand(obj));
  }

  public removeObject(id: string): void {
    this.executeCommand(new DeleteObjectCommand(id));
  }

  public updateObject(id: string, newDef: Partial<GeoObject>, prevDef?: Partial<GeoObject>): void {
    this.executeCommand(new UpdateObjectCommand(id, newDef, prevDef));
  }

  public toggleVisibility(ids: string[]): void {
    this.executeCommand(new ToggleVisibilityCommand(ids));
  }

  public toggleLabel(ids: string[]): void {
    this.executeCommand(new ToggleLabelCommand(ids));
  }

  public executeCommand(command: Command): void {
    this.commandStack.execute(command);
    this.notify();
  }

  public undo(): void {
    this.commandStack.undo();
    this.notify();
  }

  public redo(): void {
    this.commandStack.redo();
    this.notify();
  }

  public canUndo(): boolean {
    return this.commandStack.canUndo();
  }

  public canRedo(): boolean {
    return this.commandStack.canRedo();
  }

  public getDependents(id: string, visited: Set<string> = new Set()): string[] {
    if (visited.has(id)) return [];
    visited.add(id);

    const result: string[] = [];
    for (const [objId, obj] of this.objects.entries()) {
      if (obj.dependsOn.includes(id) && !visited.has(objId)) {
        result.push(objId);
        result.push(...this.getDependents(objId, visited));
      }
    }
    return [...new Set(result)];
  }

  public recomputeObject(id: string): void {
    const obj = this.objects.get(id);
    if (!obj) return;

    // 1. Math evaluator for free expressions or functions
    if (obj.definition && obj.dependsOn.length === 0 && obj.type !== 'point' && obj.type !== 'slider') {
      try {
        const parsed = parseExpression(obj.definition);
        const val = this.evaluator.evaluate(parsed);
        if (typeof val === 'number') {
          obj.value = val;
        }
      } catch (e) {
        // Keep previous value if parse error
      }
    }

    // 2. Geometric Dependency Dispatch
    if (obj.dependsOn && obj.dependsOn.length > 0) {
      this.recomputeGeometricObject(obj);
    }

    // 3. Cascade recomputation to all dependents
    const dependents = this.getDependents(id);
    for (const depId of dependents) {
      const depObj = this.objects.get(depId);
      if (depObj) {
        this.recomputeGeometricObject(depObj);
      }
    }
  }

  private recomputeGeometricObject(obj: GeoObject): void {
    const depObjs = obj.dependsOn.map((id) => this.getObject(id)).filter((d): d is GeoObject => !!d);

    switch (obj.createdByToolId) {
      case 'midpoint':
      case 'midpoint-center': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          obj.value = {
            kind: 'dependent',
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
            z: (p1.z + p2.z) / 2,
          };
        } else if (depObjs.length === 1 && (depObjs[0].type === 'circle' || depObjs[0].type === 'sphere')) {
          const cVal = depObjs[0].value as any;
          if (cVal?.center) {
            obj.value = {
              kind: 'dependent',
              x: cVal.center.x,
              y: cVal.center.y,
              z: cVal.center.z ?? 0,
            };
          }
        }
        break;
      }


      case 'parallel':
      case 'parallel-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const lVal = lineObj.value as any;
          if (lVal.p1 && lVal.p2) {
            const res = parallelLine3D({ p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) }, pt);
            obj.value = { p1: res.p1, p2: res.p2, is3D: true };
          } else {
            obj.value = parallelLine(lineObj.value as LineValue, resolvePoint(ptObj.value as any));
          }
        }
        break;
      }

      case 'perpendicular':
      case 'perpendicular-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const lVal = lineObj.value as any;
          if (lVal.p1 && lVal.p2) {
            const res = perpendicularLineToLine3D({ p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) }, pt);
            obj.value = { p1: res.p1, p2: res.p2, is3D: true };
          } else {
            obj.value = perpendicularLine(lineObj.value as LineValue, resolvePoint(ptObj.value as any));
          }
        }
        break;
      }

      case 'perpendicular-bisector': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          obj.value = perpendicularBisector(p1, p2);
        }
        break;
      }

      case 'angle-bisector': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const vertex = resolvePoint3D(depObjs[1].value as any);
          const p2 = resolvePoint3D(depObjs[2].value as any);
          const res = angleBisector3D(p1, vertex, p2);
          obj.value = { p1: res.p1, p2: res.p2, is3D: true };
        }
        break;
      }

      case 'tangents': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const sphereObj = depObjs.find((d) => d.type === 'sphere' || d.type === 'circle');
        if (ptObj?.value && sphereObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const sVal = sphereObj.value as any;
          if (sphereObj.type === 'sphere' && sVal.center) {
            const res = tangentsToSphere3D(pt, sVal);
            if (res) obj.value = { p1: res.p1, p2: res.p2, is3D: true };
          } else {
            const lines = tangentsToCircle(resolvePoint(ptObj.value as any), sVal);
            if (lines.length > 0) obj.value = lines[0];
          }
        }
        break;
      }

      case 'reflect-plane': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const planeObj = depObjs.find((d) => d.type === 'plane');
        if (ptObj?.value && planeObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const reflected = reflectPointAboutPlane(pt, planeObj.value as any);
          obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y, z: reflected.z };
        }
        break;
      }

      case 'reflect-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const lVal = lineObj.value as any;
          if (lVal.p1 && lVal.p2) {
            const reflected = reflectPointAboutLine3D(pt, { p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) });
            obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y, z: reflected.z };
          } else {
            const reflected = reflectPointAboutLine(resolvePoint(ptObj.value as any), lineObj.value as LineValue);
            obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y };
          }
        }
        break;
      }

      case 'reflect-point': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const pt = resolvePoint3D(depObjs[0].value as any);
          const center = resolvePoint3D(depObjs[1].value as any);
          const reflected = reflectPointAboutPoint3D(pt, center);
          obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y, z: reflected.z };
        }
        break;
      }

      case 'rotate-around-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const lVal = lineObj.value as any;
          const angleRad = (obj.value as any)?.angleRad ?? Math.PI / 4;
          if (lVal.p1 && lVal.p2) {
            const rotated = rotatePointAroundLine3D(pt, { p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) }, angleRad);
            obj.value = { kind: 'dependent', x: rotated.x, y: rotated.y, z: rotated.z, angleRad };
          }
        }
        break;
      }

      case 'translate-vector': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const vecObj = depObjs.find((d) => d.type === 'vector' || d.type === 'segment');
        if (ptObj?.value && vecObj?.value) {
          const pt = resolvePoint3D(ptObj.value as any);
          const vVal = vecObj.value as any;
          const dx = vVal.dx ?? (vVal.p2 && vVal.p1 ? (vVal.p2.x - vVal.p1.x) : 0);
          const dy = vVal.dy ?? (vVal.p2 && vVal.p1 ? (vVal.p2.y - vVal.p1.y) : 0);
          const dz = vVal.dz ?? (vVal.p2 && vVal.p1 ? ((vVal.p2.z ?? 0) - (vVal.p1.z ?? 0)) : 0);
          const translated = translatePoint3D(pt, { x: dx, y: dy, z: dz });
          obj.value = { kind: 'dependent', x: translated.x, y: translated.y, z: translated.z };
        }
        break;
      }

      case 'rotate-around-point': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const targetPt = resolvePoint(depObjs[0].value as any);
          const centerPt = resolvePoint(depObjs[1].value as any);
          const angleRad = (obj.value as any)?.angleRad ?? Math.PI / 4;
          const rotated = rotatePoint(targetPt, centerPt, angleRad);
          obj.value = { kind: 'dependent', x: rotated.x, y: rotated.y, angleRad };
        }
        break;
      }

      case 'dilate-from-point': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const targetPt = resolvePoint3D(depObjs[0].value as any);
          const centerPt = resolvePoint3D(depObjs[1].value as any);
          const factor = (obj.value as any)?.factor ?? 2;
          const dilated = dilatePoint3D(targetPt, centerPt, factor);
          obj.value = { kind: 'dependent', x: dilated.x, y: dilated.y, z: dilated.z, factor };
        }
        break;
      }

      case 'reflect-about-circle': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const circleObj = depObjs.find((d) => d.type === 'circle');
        if (ptObj?.value && circleObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const cVal = circleObj.value as any;
          if (cVal?.center && typeof cVal?.radius === 'number') {
            const inverted = invertPointAboutCircle(pt, cVal);
            obj.value = { kind: 'dependent', x: inverted.x, y: inverted.y };
          }
        }
        break;
      }

      case 'angle': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const vertex = resolvePoint3D(depObjs[1].value as any);
          const p2 = resolvePoint3D(depObjs[2].value as any);
          const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y, z: p1.z - vertex.z };
          const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y, z: p2.z - vertex.z };
          const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
          const l1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) || 1;
          const l2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z) || 1;
          const cos = Math.max(-1, Math.min(1, dot / (l1 * l2)));
          const rad = Math.acos(cos);
          const deg = (rad * 180) / Math.PI;
          obj.value = { p1, vertex, p2, deg, rad };
          obj.definition = `α = ${deg.toFixed(1)}°`;
        }
        break;
      }

      case 'slope': {
        if (depObjs.length >= 1 && depObjs[0].value) {
          const lineVal = depObjs[0].value as any;
          if (lineVal && typeof lineVal.a === 'number' && typeof lineVal.b === 'number') {
            const m = Math.abs(lineVal.b) > 1e-9 ? -lineVal.a / lineVal.b : undefined;
            obj.value = { slope: m };
            obj.definition = m !== undefined ? `m = ${m.toFixed(2)}` : 'm = undefined (vertical)';
          }
        }
        break;
      }

      case 'distance':
      case 'distance-length': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const d = distance3D(p1, p2);
          obj.value = { p1, p2, distance: d };
          obj.definition = `d = ${d.toFixed(2)}`;
        } else if (depObjs.length === 1 && depObjs[0].value) {
          const dep = depObjs[0];
          const val = dep.value as any;
          if ((dep.type === 'segment' || dep.type === 'line' || dep.type === 'vector') && val?.p1 && val?.p2) {
            const d = distance3D(resolvePoint3D(val.p1), resolvePoint3D(val.p2));
            obj.value = { p1: val.p1, p2: val.p2, distance: d };
            obj.definition = `Length = ${d.toFixed(2)}`;
          } else if (dep.type === 'circle' && typeof val?.radius === 'number') {
            const circ = 2 * Math.PI * val.radius;
            obj.value = { circumference: circ };
            obj.definition = `Circumference = ${circ.toFixed(2)}`;
          } else if (dep.type === 'polygon' && Array.isArray(val?.vertices)) {
            let perim = 0;
            const pts = val.vertices.map((v: any) => resolvePoint3D(v));
            for (let i = 0; i < pts.length; i++) {
              perim += distance3D(pts[i], pts[(i + 1) % pts.length]);
            }
            obj.value = { perimeter: perim };
            obj.definition = `Perimeter = ${perim.toFixed(2)}`;
          }
        }
        break;
      }

      case 'area': {
        if (depObjs.length >= 1 && depObjs[0].value) {
          const dep = depObjs[0];
          const val = dep.value as any;
          let a = 0;
          if (typeof val?.area === 'number') {
            a = val.area;
          } else if (dep.type === 'circle' && typeof val?.radius === 'number') {
            a = Math.PI * val.radius * val.radius;
          } else if (dep.type === 'polygon' && Array.isArray(val?.vertices)) {
            a = polygon3DArea(val.vertices.map((v: any) => resolvePoint3D(v)));
          } else if (dep.type === 'sphere' && typeof val?.radius === 'number') {
            a = 4 * Math.PI * val.radius * val.radius;
          }
          obj.value = { ...val, area: a, targetLabel: dep.label };
          obj.definition = `Area = ${a.toFixed(2)}`;
        }
        break;
      }

      case 'volume': {
        if (depObjs.length >= 1 && depObjs[0].value) {
          const target = depObjs[0];
          const val = target.value as any;
          let vol = 0;
          if (typeof val?.volume === 'number') {
            vol = val.volume;
          } else if (target.type === 'cube' || val.solidType === 'cube') {
            const s = distance3D(val.p1 || { x: 0, y: 0, z: 0 }, val.p2 || { x: 1, y: 0, z: 0 });
            vol = Math.pow(s, 3);
          } else if (target.type === 'tetrahedron' || val.solidType === 'tetrahedron') {
            const s = distance3D(val.p1 || { x: 0, y: 0, z: 0 }, val.p2 || { x: 1, y: 0, z: 0 });
            vol = Math.pow(s, 3) / (6 * Math.SQRT2);
          } else if (target.type === 'sphere' || (val.center && typeof val.radius === 'number')) {
            vol = (4 / 3) * Math.PI * Math.pow(val.radius, 3);
          } else if (target.type === 'cone') {
            const h = distance3D(val.baseCenter || { x: 0, y: 0, z: 0 }, val.apex || { x: 0, y: 0, z: 1 });
            vol = (1 / 3) * Math.PI * Math.pow(val.radius || 1, 2) * h;
          } else if (target.type === 'cylinder') {
            const h = distance3D(val.p1 || { x: 0, y: 0, z: 0 }, val.p2 || { x: 0, y: 0, z: 1 });
            vol = Math.PI * Math.pow(val.radius || 1, 2) * h;
          } else if (target.type === 'pyramid' && val.base && val.apex) {
            const baseArea = polygon3DArea(val.base);
            const h = Math.abs(val.apex.z - (val.base[0]?.z || 0)) || 1;
            vol = (1 / 3) * baseArea * h;
          } else if (target.type === 'prism' && val.base && val.top) {
            const baseArea = polygon3DArea(val.base);
            const h = distance3D(val.base[0] || { x: 0, y: 0, z: 0 }, val.top[0] || { x: 0, y: 0, z: 1 });
            vol = baseArea * h;
          }
          obj.value = { ...val, volume: vol, targetLabel: target.label };
          obj.definition = `Volume = ${vol.toFixed(2)}`;
        }
        break;
      }

      case 'vector-from-point': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const vecObj = depObjs.find((d) => d.type === 'vector' || d.type === 'segment');
        if (ptObj?.value && vecObj?.value) {
          const p1 = resolvePoint3D(ptObj.value as any);
          const vVal = vecObj.value as any;
          const dx = vVal.dx ?? (vVal.p2 && vVal.p1 ? vVal.p2.x - vVal.p1.x : 1);
          const dy = vVal.dy ?? (vVal.p2 && vVal.p1 ? vVal.p2.y - vVal.p1.y : 0);
          const dz = vVal.dz ?? (vVal.p2 && vVal.p1 ? (vVal.p2.z ?? 0) - (vVal.p1.z ?? 0) : 0);
          const p2 = { x: p1.x + dx, y: p1.y + dy, z: p1.z + dz };
          obj.value = { p1, p2, dx, dy, dz };
        }
        break;
      }

      case 'polar-diameter-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const circleObj = depObjs.find((d) => d.type === 'circle');
        if (ptObj?.value && circleObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const cVal = circleObj.value as any;
          if (cVal?.center && typeof cVal?.radius === 'number') {
            obj.value = polarLineOfPoint(pt, cVal);
          }
        }
        break;
      }

      case 'polyline': {
        const pts = depObjs.map((d) => resolvePoint3D(d.value as any));
        obj.value = { points: pts };
        break;
      }

      case 'locus': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const lPt = resolvePoint(depObjs[0].value as any);
          const dVal = depObjs[1].value as any;
          const min = typeof dVal?.min === 'number' ? dVal.min : -5;
          const max = typeof dVal?.max === 'number' ? dVal.max : 5;
          const points = sampleLocus({ min, max, steps: 100 }, (t) => {
            const frac = (t - min) / (max - min || 1);
            return {
              x: lPt.x + (frac - 0.5) * 4,
              y: lPt.y + Math.sin(frac * Math.PI * 2) * 2,
            };
          });
          obj.value = { points };
        }
        break;
      }

      case 'best-fit-line': {
        const points = depObjs
          .filter((dep) => dep.type === 'point' && dep.value)
          .map((dep) => resolvePoint(dep.value as any));
        if (points.length >= 2) {
          const lineVal = bestFitLine(points);
          obj.value = lineVal;
          if (lineVal.slope !== undefined && lineVal.intercept !== undefined) {
            const sign = lineVal.intercept >= 0 ? '+' : '-';
            obj.definition = `y = ${lineVal.slope.toFixed(2)}x ${sign} ${Math.abs(lineVal.intercept).toFixed(2)}`;
          }
        }
        break;
      }

      case 'intersect': {
        if (depObjs.length >= 2) {
          const o1 = depObjs[0];
          const o2 = depObjs[1];
          let ptCoords: PointCoords | null = null;
          
          // Check for 3D plane-line or line-line
          if (o1.type === 'plane' && (o2.type === 'line' || o2.type === 'segment' || o2.type === 'ray')) {
            const lVal = o2.value as any;
            if (lVal?.p1 && lVal?.p2 && o1.value) {
              ptCoords = intersectLinePlane3D({ p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) }, o1.value as any);
            }
          } else if ((o1.type === 'line' || o1.type === 'segment' || o1.type === 'ray') && o2.type === 'plane') {
            const lVal = o1.value as any;
            if (lVal?.p1 && lVal?.p2 && o2.value) {
              ptCoords = intersectLinePlane3D({ p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) }, o2.value as any);
            }
          } else if ((o1.type === 'line' || o1.type === 'segment' || o1.type === 'ray') && (o2.type === 'line' || o2.type === 'segment' || o2.type === 'ray')) {
            const l1 = o1.value as any;
            const l2 = o2.value as any;
            if (l1?.p1 && l1?.p2 && l2?.p1 && l2?.p2 && ((l1.p1.z !== undefined && l1.p1.z !== 0) || (l2.p1.z !== undefined && l2.p1.z !== 0))) {
              ptCoords = intersectLineLine3D(
                { p1: resolvePoint3D(l1.p1), p2: resolvePoint3D(l1.p2) },
                { p1: resolvePoint3D(l2.p1), p2: resolvePoint3D(l2.p2) }
              );
            } else {
              ptCoords = intersectLineLine(o1.value as any, o2.value as any);
            }
          } else if ((o1.type === 'line' || o1.type === 'segment') && o2.type === 'circle') {
            const pts = intersectLineCircle(o1.value as any, o2.value as any);
            if (pts.length > 0) ptCoords = pts[0];
          } else if (o1.type === 'circle' && (o2.type === 'line' || o2.type === 'segment')) {
            const pts = intersectLineCircle(o2.value as any, o1.value as any);
            if (pts.length > 0) ptCoords = pts[0];
          } else if (o1.type === 'circle' && o2.type === 'circle') {
            const pts = intersectCircleCircle(o1.value as any, o2.value as any);
            if (pts.length > 0) ptCoords = pts[0];
          }
          if (ptCoords) {
            obj.value = { kind: 'dependent', x: ptCoords.x, y: ptCoords.y, z: ptCoords.z ?? 0 };
          }
        }
        break;
      }

      // --- 3D Planes ---
      case 'plane-three-points':
      case 'plane': {
        const pointDeps = depObjs.filter((d) => d.type === 'point' && d.value);
        if (pointDeps.length >= 3) {
          const p1 = resolvePoint3D(pointDeps[0].value as any);
          const p2 = resolvePoint3D(pointDeps[1].value as any);
          const p3 = resolvePoint3D(pointDeps[2].value as any);
          obj.value = planeFromThreePoints(p1, p2, p3);
        } else {
          const lineDep = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
          const ptDep = depObjs.find((d) => d.type === 'point');
          if (lineDep?.value && ptDep?.value) {
            const lVal = lineDep.value as any;
            if (lVal?.p1 && lVal?.p2) {
              const p1 = resolvePoint3D(lVal.p1);
              const p2 = resolvePoint3D(lVal.p2);
              const p3 = resolvePoint3D(ptDep.value as any);
              obj.value = planeFromThreePoints(p1, p2, p3);
            }
          }
        }
        break;
      }

      case 'parallel-plane': {
        const planeDep = depObjs.find((d) => d.type === 'plane');
        const ptDep = depObjs.find((d) => d.type === 'point');
        if (planeDep?.value && ptDep?.value) {
          const pt = resolvePoint3D(ptDep.value as any);
          obj.value = parallelPlaneThroughPoint(planeDep.value as any, pt);
        }
        break;
      }

      case 'perpendicular-plane': {
        const lineDep = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
        const ptDep = depObjs.find((d) => d.type === 'point');
        if (lineDep?.value && ptDep?.value) {
          const lVal = lineDep.value as any;
          if (lVal?.p1 && lVal?.p2) {
            const line = { p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) };
            const pt = resolvePoint3D(ptDep.value as any);
            obj.value = perpendicularPlaneThroughLine(line, pt);
          }
        }
        break;
      }

      // --- 3D Solids ---
      case 'cube': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 2) {
          obj.value = cubeFromTwoPoints(pts[0], pts[1]);
        }
        break;
      }

      case 'tetrahedron': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 2) {
          obj.value = tetrahedronFromTwoPoints(pts[0], pts[1]);
        }
        break;
      }

      case 'sphere-center-point': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 2) {
          const center = pts[0];
          const radius = distance3D(pts[0], pts[1]);
          obj.value = { center, radius };
        }
        break;
      }

      case 'sphere-center-radius': {
        const pt = depObjs.find((d) => d.type === 'point');
        if (pt?.value) {
          const center = resolvePoint3D(pt.value as any);
          const radius = (obj.value as any)?.radius ?? 3;
          obj.value = { center, radius };
        }
        break;
      }

      case 'cone': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 2) {
          const radius = (obj.value as any)?.radius ?? (pts.length >= 3 ? distance3D(pts[0], pts[2]) : 2);
          obj.value = coneFromBaseAndApex(pts[0], pts[1], radius);
        }
        break;
      }

      case 'cylinder': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 2) {
          const radius = (obj.value as any)?.radius ?? (pts.length >= 3 ? distance3D(pts[0], pts[2]) : 2);
          obj.value = cylinderFromPointsAndRadius(pts[0], pts[1], radius);
        }
        break;
      }

      case 'pyramid': {
        const polyDep = depObjs.find((d) => d.type === 'polygon');
        const ptDeps = depObjs.filter((d) => d.type === 'point' && d.value);
        if (polyDep?.value && ptDeps.length >= 1) {
          const polyVal = polyDep.value as any;
          if (polyVal?.vertices && polyVal.vertices.length >= 3) {
            const base = polyVal.vertices.map((v: any) => resolvePoint3D(v));
            const apex = resolvePoint3D(ptDeps[ptDeps.length - 1].value as any);
            obj.value = pyramidFromBaseAndApex(base, apex);
          }
        } else if (ptDeps.length >= 4) {
          const pts = ptDeps.map((d) => resolvePoint3D(d.value as any));
          const base = pts.slice(0, pts.length - 1);
          const apex = pts[pts.length - 1];
          obj.value = pyramidFromBaseAndApex(base, apex);
        }
        break;
      }

      case 'prism': {
        const polyDep = depObjs.find((d) => d.type === 'polygon');
        const ptDeps = depObjs.filter((d) => d.type === 'point' && d.value);
        if (polyDep?.value && ptDeps.length >= 1) {
          const polyVal = polyDep.value as any;
          if (polyVal?.vertices && polyVal.vertices.length >= 3) {
            const base = polyVal.vertices.map((v: any) => resolvePoint3D(v));
            const top = resolvePoint3D(ptDeps[ptDeps.length - 1].value as any);
            obj.value = prismFromBaseAndTop(base, top);
          }
        } else if (ptDeps.length >= 4) {
          const pts = ptDeps.map((d) => resolvePoint3D(d.value as any));
          const base = pts.slice(0, pts.length - 1);
          const top = pts[pts.length - 1];
          obj.value = prismFromBaseAndTop(base, top);
        }
        break;
      }

      case 'circle-axis-point': {
        const lineDep = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        const ptDep = depObjs.find((d) => d.type === 'point');
        if (lineDep?.value && ptDep?.value) {
          const lVal = lineDep.value as any;
          if (lVal.p1 && lVal.p2) {
            const axis = { p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) };
            const pt = resolvePoint3D(ptDep.value as any);
            obj.value = circle3DFromAxisAndPoint(axis, pt);
          }
        }
        break;
      }

      case 'circle-center-radius-direction': {
        const ptDep = depObjs.find((d) => d.type === 'point');
        const lineDep = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        const planeDep = depObjs.find((d) => d.type === 'plane');
        if (ptDep?.value) {
          const center = resolvePoint3D(ptDep.value as any);
          const radius = (obj.value as any)?.radius ?? 3;
          let normal = { x: 0, y: 0, z: 1 };
          if (planeDep?.value) {
            const pl = planeDep.value as any;
            normal = pl.normal || { x: pl.a, y: pl.b, z: pl.c };
          } else if (lineDep?.value) {
            const lVal = lineDep.value as any;
            if (lVal.p1 && lVal.p2) {
              const p1 = resolvePoint3D(lVal.p1);
              const p2 = resolvePoint3D(lVal.p2);
              normal = { x: p2.x - p1.x, y: p2.y - p1.y, z: (p2.z ?? 0) - (p1.z ?? 0) };
            }
          }
          obj.value = circle3DFromCenterRadiusDirection(center, radius, normal);
        }
        break;
      }

      case 'semicircle': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          obj.value = semicircleFromDiameter(p1, p2);
        }
        break;
      }

      case 'circle-center-radius': {
        if (depObjs.length >= 1 && depObjs[0].value) {
          const center = resolvePoint(depObjs[0].value as any);
          const radius = (obj.value as any)?.radius ?? 3;
          obj.value = circleFromCenterAndRadius(center, radius);
        }
        break;
      }

      case 'circle-three-points': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const p3 = resolvePoint3D(depObjs[2].value as any);
          const is3D = (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (p3.z !== undefined && Math.abs(p3.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            const c = circle3DFromThreePoints(p1, p2, p3);
            if (c) obj.value = c;
          } else {
            const c = circleFromThreePoints(resolvePoint(p1), resolvePoint(p2), resolvePoint(p3));
            if (c) obj.value = c;
          }
        }
        break;
      }

      case 'circular-arc': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const center = resolvePoint3D(depObjs[0].value as any);
          const p1 = resolvePoint3D(depObjs[1].value as any);
          const p2 = resolvePoint3D(depObjs[2].value as any);
          const is3D = (center.z !== undefined && Math.abs(center.z) > 1e-4) ||
                       (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = circularArc3DFromCenter(center, p1, p2, false);
          } else {
            obj.value = circularArcFromCenter(resolvePoint(center), resolvePoint(p1), resolvePoint(p2), false);
          }
        }
        break;
      }

      case 'circumcircular-arc': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const p3 = resolvePoint3D(depObjs[2].value as any);
          const is3D = (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (p3.z !== undefined && Math.abs(p3.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            const c = circle3DFromThreePoints(p1, p2, p3);
            if (c) obj.value = { ...c, isSector: false };
          } else {
            const c = circumcircularArc(resolvePoint(p1), resolvePoint(p2), resolvePoint(p3), false);
            if (c) obj.value = c;
          }
        }
        break;
      }

      case 'circular-sector': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const center = resolvePoint3D(depObjs[0].value as any);
          const p1 = resolvePoint3D(depObjs[1].value as any);
          const p2 = resolvePoint3D(depObjs[2].value as any);
          const is3D = (center.z !== undefined && Math.abs(center.z) > 1e-4) ||
                       (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = circularArc3DFromCenter(center, p1, p2, true);
          } else {
            obj.value = circularArcFromCenter(resolvePoint(center), resolvePoint(p1), resolvePoint(p2), true);
          }
        }
        break;
      }

      case 'circumcircular-sector': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const p3 = resolvePoint3D(depObjs[2].value as any);
          const is3D = (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (p3.z !== undefined && Math.abs(p3.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            const c = circle3DFromThreePoints(p1, p2, p3);
            if (c) obj.value = { ...c, isSector: true };
          } else {
            const c = circumcircularArc(resolvePoint(p1), resolvePoint(p2), resolvePoint(p3), true);
            if (c) obj.value = c;
          }
        }
        break;
      }

      case 'compass': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const center = resolvePoint3D(depObjs[2].value as any);
          const r = distance3D(p1, p2);
          const is3D = (p1.z !== undefined && Math.abs(p1.z) > 1e-4) ||
                       (p2.z !== undefined && Math.abs(p2.z) > 1e-4) ||
                       (center.z !== undefined && Math.abs(center.z) > 1e-4) ||
                       (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = circle3DFromCenterRadiusDirection(center, r, { x: 0, y: 0, z: 1 });
          } else {
            obj.value = circleFromCenterAndRadius(resolvePoint(center), r);
          }
        }
        break;
      }

      case 'polygon':
      case 'vector-polygon':
      case 'rigid-polygon': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 3) {
          const area = polygon3DArea(pts);
          const prevVal = (obj.value as any) || {};
          obj.value = {
            ...prevVal,
            vertices: pts,
            area,
          };
        }
        break;
      }

      case 'regular-polygon': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const p1 = resolvePoint3D(depObjs[0].value as any);
          const p2 = resolvePoint3D(depObjs[1].value as any);
          const n = (obj.value as any)?.n || 4;
          const is3D = Math.abs(p1.z || 0) > 1e-4 || Math.abs(p2.z || 0) > 1e-4 || (obj.value as any)?.is3D;
          const pts = is3D ? regularPolygon3DVertices(p1, p2, n) : regularPolygonVertices(p1, p2, n);
          const area = polygon3DArea(pts as any);
          obj.value = {
            vertices: pts,
            edgeStyle: 'segment',
            area,
            n,
            is3D,
          };
        }
        break;
      }

      case 'ellipse': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const f1 = resolvePoint3D(depObjs[0].value as any);
          const f2 = resolvePoint3D(depObjs[1].value as any);
          const p = resolvePoint3D(depObjs[2].value as any);
          const is3D = Math.abs(f1.z || 0) > 1e-4 || Math.abs(f2.z || 0) > 1e-4 || Math.abs(p.z || 0) > 1e-4 || (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = ellipse3DFromFociAndPoint(f1, f2, p);
          } else {
            obj.value = ellipseFromFociAndPoint(resolvePoint(f1), resolvePoint(f2), resolvePoint(p));
          }
        }
        break;
      }

      case 'hyperbola': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const f1 = resolvePoint3D(depObjs[0].value as any);
          const f2 = resolvePoint3D(depObjs[1].value as any);
          const p = resolvePoint3D(depObjs[2].value as any);
          const is3D = Math.abs(f1.z || 0) > 1e-4 || Math.abs(f2.z || 0) > 1e-4 || Math.abs(p.z || 0) > 1e-4 || (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = hyperbola3DFromFociAndPoint(f1, f2, p);
          } else {
            obj.value = hyperbolaFromFociAndPoint(resolvePoint(f1), resolvePoint(f2), resolvePoint(p));
          }
        }
        break;
      }

      case 'parabola': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment' || d.type === 'ray');
        if (ptObj?.value && lineObj?.value) {
          const focus = resolvePoint3D(ptObj.value as any);
          const lVal = lineObj.value as any;
          const p1 = resolvePoint3D(lVal.p1 || { x: 0, y: 0, z: 0 });
          const p2 = resolvePoint3D(lVal.p2 || { x: 1, y: 0, z: 0 });
          const is3D = Math.abs(focus.z || 0) > 1e-4 || Math.abs(p1.z || 0) > 1e-4 || Math.abs(p2.z || 0) > 1e-4 || (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = parabola3DFromFocusAndDirectrix(focus, { p1, p2, dir: { x: p2.x - p1.x, y: p2.y - p1.y, z: (p2.z ?? 0) - (p1.z ?? 0) } });
          } else {
            obj.value = parabolaFromFocusAndDirectrix(resolvePoint(focus), lineObj.value as LineValue);
          }
        }
        break;
      }

      case 'conic-five-points': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint3D(d.value as any));
        if (pts.length >= 5) {
          const is3D = pts.some((p) => Math.abs(p.z || 0) > 1e-4) || (obj.value as any)?.is3D;
          if (is3D) {
            obj.value = conic3DFromFivePoints(pts);
          } else {
            obj.value = conicFromFivePoints(pts.map((p) => resolvePoint(p)));
          }
        }
        break;
      }

      case 'extrude-to-prism': {
        const polyDep = depObjs.find((d) => d.type === 'polygon');
        if (polyDep?.value) {
          const polyVal = polyDep.value as any;
          const altitude = (obj.value as any)?.altitude ?? 3;
          if (polyVal.vertices && polyVal.vertices.length >= 3) {
            obj.value = extrudePolygonToPrism(polyVal.vertices.map((v: any) => resolvePoint3D(v)), altitude);
          }
        }
        break;
      }

      case 'extrude-to-pyramid': {
        const polyDep = depObjs.find((d) => d.type === 'polygon');
        if (polyDep?.value) {
          const polyVal = polyDep.value as any;
          const altitude = (obj.value as any)?.altitude ?? 3;
          if (polyVal.vertices && polyVal.vertices.length >= 3) {
            obj.value = extrudePolygonToPyramid(polyVal.vertices.map((v: any) => resolvePoint3D(v)), altitude);
          }
        }
        break;
      }

      case 'surface-of-revolution': {
        const lineDep = depObjs.find((d) => d.type === 'segment' || d.type === 'line' || d.type === 'ray');
        const axisDep = depObjs.length >= 2 ? depObjs[1] : null;
        if (lineDep?.value) {
          const lVal = lineDep.value as any;
          const line = { p1: resolvePoint3D(lVal.p1), p2: resolvePoint3D(lVal.p2) };
          let axis = { p1: { x: 0, y: 0, z: 0 }, p2: { x: 0, y: 0, z: 1 } };
          if (axisDep?.value) {
            const aVal = axisDep.value as any;
            if (aVal.p1 && aVal.p2) axis = { p1: resolvePoint3D(aVal.p1), p2: resolvePoint3D(aVal.p2) };
          }
          obj.value = surfaceOfRevolutionFromLine(line, axis);
        }
        break;
      }

      case 'intersect-two-surfaces':
      case 'intersect-surfaces': {
        const planeDeps = depObjs.filter((d) => d.type === 'plane');
        if (planeDeps.length >= 2 && planeDeps[0].value && planeDeps[1].value) {
          const pl1 = planeDeps[0].value as any;
          const pl2 = planeDeps[1].value as any;
          const res = intersectPlanes3D(pl1, pl2);
          if (res) obj.value = res;
        }
        break;
      }

      default: {
        if (obj.type === 'segment' || obj.type === 'line' || obj.type === 'ray' || obj.type === 'vector') {
          if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
            const p1 = resolvePoint3D(depObjs[0].value as any);
            const p2 = resolvePoint3D(depObjs[1].value as any);
            const eq = lineFromTwoPoints(p1, p2);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dz = (p2.z ?? 0) - (p1.z ?? 0);
            obj.value = { p1, p2, a: eq.a, b: eq.b, c: eq.c, dx, dy, dz };
          }
        } else if (obj.type === 'circle') {
          if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
            const center = resolvePoint(depObjs[0].value as any);
            const ptOnCircle = resolvePoint(depObjs[1].value as any);
            obj.value = circleFromCenterAndPoint(center, ptOnCircle);
          }
        }
        break;
      }
    }
  }
}
