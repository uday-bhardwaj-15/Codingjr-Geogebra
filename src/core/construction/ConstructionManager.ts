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

  public loadObjects(objs: GeoObject[]): void {
    this.objects.clear();
    this.commandStack.clear();
    for (const obj of objs) {
      this.objects.set(obj.id, obj);
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
    this.objects.set(obj.id, obj);
    this.recomputeObject(obj.id);
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          obj.value = {
            kind: 'dependent',
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          };
        } else if (depObjs.length === 1 && depObjs[0].type === 'circle') {
          const cVal = depObjs[0].value as any;
          if (cVal?.center) {
            obj.value = {
              kind: 'dependent',
              x: cVal.center.x,
              y: cVal.center.y,
            };
          }
        }
        break;
      }

      case 'perpendicular':
      case 'perpendicular-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const lineVal = lineObj.value as LineValue;
          obj.value = perpendicularLine(lineVal, pt);
        }
        break;
      }

      case 'parallel':
      case 'parallel-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const lineVal = lineObj.value as LineValue;
          obj.value = parallelLine(lineVal, pt);
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const vertex = resolvePoint(depObjs[1].value as any);
          const p2 = resolvePoint(depObjs[2].value as any);
          obj.value = angleBisector(p1, vertex, p2);
        }
        break;
      }

      case 'tangents': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const circleObj = depObjs.find((d) => d.type === 'circle');
        if (ptObj?.value && circleObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const cVal = circleObj.value as { center: PointCoords; radius: number };
          const lines = tangentsToCircle(pt, cVal);
          if (lines.length > 0) {
            obj.value = lines[0];
          }
        }
        break;
      }

      case 'reflect-line': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
        if (ptObj?.value && lineObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const lineVal = lineObj.value as LineValue;
          const reflected = reflectPointAboutLine(pt, lineVal);
          obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y };
        }
        break;
      }

      case 'reflect-point': {
        if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
          const pt = resolvePoint(depObjs[0].value as any);
          const center = resolvePoint(depObjs[1].value as any);
          const reflected = reflectPointAboutPoint(pt, center);
          obj.value = { kind: 'dependent', x: reflected.x, y: reflected.y };
        }
        break;
      }

      case 'translate-vector': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const vecObj = depObjs.find((d) => d.type === 'vector' || d.type === 'segment');
        if (ptObj?.value && vecObj?.value) {
          const pt = resolvePoint(ptObj.value as any);
          const vVal = vecObj.value as any;
          const dx = vVal.dx ?? (vVal.p2 && vVal.p1 ? vVal.p2.x - vVal.p1.x : 0);
          const dy = vVal.dy ?? (vVal.p2 && vVal.p1 ? vVal.p2.y - vVal.p1.y : 0);
          const translated = translatePoint(pt, { dx, dy });
          obj.value = { kind: 'dependent', x: translated.x, y: translated.y };
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
          const targetPt = resolvePoint(depObjs[0].value as any);
          const centerPt = resolvePoint(depObjs[1].value as any);
          const factor = (obj.value as any)?.factor ?? 2;
          const dilated = dilatePoint(targetPt, centerPt, factor);
          obj.value = { kind: 'dependent', x: dilated.x, y: dilated.y, factor };
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const vertex = resolvePoint(depObjs[1].value as any);
          const p2 = resolvePoint(depObjs[2].value as any);
          const res = angleBetweenThreePoints(p1, vertex, p2);
          obj.value = { p1, vertex, p2, deg: res.deg, rad: res.rad };
          obj.definition = `α = ${res.deg.toFixed(1)}°`;
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const d = distanceBetweenPoints(p1, p2);
          obj.value = { p1, p2, distance: d };
          obj.definition = `d = ${d.toFixed(2)}`;
        } else if (depObjs.length === 1 && depObjs[0].type === 'segment') {
          const segVal = depObjs[0].value as any;
          if (segVal?.p1 && segVal?.p2) {
            const d = distanceBetweenPoints(segVal.p1, segVal.p2);
            obj.value = { p1: segVal.p1, p2: segVal.p2, distance: d };
            obj.definition = `d = ${d.toFixed(2)}`;
          }
        }
        break;
      }

      case 'area': {
        if (depObjs.length >= 1 && depObjs[0].type === 'circle') {
          const cVal = depObjs[0].value as any;
          if (cVal && typeof cVal.radius === 'number') {
            const a = circleArea(cVal.radius);
            obj.value = { area: a };
            obj.definition = `Area = ${a.toFixed(2)}`;
          }
        }
        break;
      }

      case 'vector-from-point': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const vecObj = depObjs.find((d) => d.type === 'vector' || d.type === 'segment');
        if (ptObj?.value && vecObj?.value) {
          const p1 = resolvePoint(ptObj.value as any);
          const vVal = vecObj.value as any;
          const dx = vVal.dx ?? (vVal.p2 && vVal.p1 ? vVal.p2.x - vVal.p1.x : 1);
          const dy = vVal.dy ?? (vVal.p2 && vVal.p1 ? vVal.p2.y - vVal.p1.y : 0);
          const p2 = { x: p1.x + dx, y: p1.y + dy };
          obj.value = { p1, p2, dx, dy };
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
        const pts = depObjs.map((d) => resolvePoint(d.value as any));
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
          if ((o1.type === 'line' || o1.type === 'segment') && (o2.type === 'line' || o2.type === 'segment')) {
            ptCoords = intersectLineLine(o1.value as any, o2.value as any);
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
            obj.value = { kind: 'dependent', x: ptCoords.x, y: ptCoords.y };
          }
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const p3 = resolvePoint(depObjs[2].value as any);
          const c = circleFromThreePoints(p1, p2, p3);
          if (c) obj.value = c;
        }
        break;
      }

      case 'circular-arc': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const center = resolvePoint(depObjs[0].value as any);
          const p1 = resolvePoint(depObjs[1].value as any);
          const p2 = resolvePoint(depObjs[2].value as any);
          obj.value = circularArcFromCenter(center, p1, p2, false);
        }
        break;
      }

      case 'circumcircular-arc': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const p3 = resolvePoint(depObjs[2].value as any);
          const c = circumcircularArc(p1, p2, p3, false);
          if (c) obj.value = c;
        }
        break;
      }

      case 'circular-sector': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const center = resolvePoint(depObjs[0].value as any);
          const p1 = resolvePoint(depObjs[1].value as any);
          const p2 = resolvePoint(depObjs[2].value as any);
          obj.value = circularArcFromCenter(center, p1, p2, true);
        }
        break;
      }

      case 'circumcircular-sector': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const p3 = resolvePoint(depObjs[2].value as any);
          const c = circumcircularArc(p1, p2, p3, true);
          if (c) obj.value = c;
        }
        break;
      }

      case 'compass': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const center = resolvePoint(depObjs[2].value as any);
          const r = distanceBetweenPoints(p1, p2);
          obj.value = circleFromCenterAndRadius(center, r);
        }
        break;
      }

      case 'polygon':
      case 'vector-polygon':
      case 'rigid-polygon': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint(d.value as any));
        if (pts.length >= 3) {
          const area = polygonArea(pts);
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
          const p1 = resolvePoint(depObjs[0].value as any);
          const p2 = resolvePoint(depObjs[1].value as any);
          const n = (obj.value as any)?.n || 4;
          const pts = regularPolygonVertices(p1, p2, n);
          const area = polygonArea(pts);
          obj.value = {
            vertices: pts,
            edgeStyle: 'segment',
            area,
            n,
          };
        }
        break;
      }

      case 'ellipse': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const f1 = resolvePoint(depObjs[0].value as any);
          const f2 = resolvePoint(depObjs[1].value as any);
          const p = resolvePoint(depObjs[2].value as any);
          obj.value = ellipseFromFociAndPoint(f1, f2, p);
        }
        break;
      }

      case 'hyperbola': {
        if (depObjs.length >= 3 && depObjs[0].value && depObjs[1].value && depObjs[2].value) {
          const f1 = resolvePoint(depObjs[0].value as any);
          const f2 = resolvePoint(depObjs[1].value as any);
          const p = resolvePoint(depObjs[2].value as any);
          obj.value = hyperbolaFromFociAndPoint(f1, f2, p);
        }
        break;
      }

      case 'parabola': {
        const ptObj = depObjs.find((d) => d.type === 'point');
        const lineObj = depObjs.find((d) => d.type === 'line' || d.type === 'segment');
        if (ptObj?.value && lineObj?.value) {
          const focus = resolvePoint(ptObj.value as any);
          const lineVal = lineObj.value as LineValue;
          obj.value = parabolaFromFocusAndDirectrix(focus, lineVal);
        }
        break;
      }

      case 'conic-five-points': {
        const pts = depObjs.filter((d) => d.type === 'point' && d.value).map((d) => resolvePoint(d.value as any));
        if (pts.length >= 5) {
          obj.value = conicFromFivePoints(pts);
        }
        break;
      }

      default: {
        if (obj.type === 'segment' || obj.type === 'line' || obj.type === 'ray' || obj.type === 'vector') {
          if (depObjs.length >= 2 && depObjs[0].value && depObjs[1].value) {
            const p1 = resolvePoint(depObjs[0].value as any);
            const p2 = resolvePoint(depObjs[1].value as any);
            const eq = lineFromTwoPoints(p1, p2);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            obj.value = { p1, p2, a: eq.a, b: eq.b, c: eq.c, dx, dy };
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
