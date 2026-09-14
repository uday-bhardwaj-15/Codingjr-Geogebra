import { GeoObject } from '../../types/geo';
import { CommandStack } from './commands/CommandStack';
import { Evaluator } from '../math-engine/evaluator';
import { parseExpression } from '../math-engine/parser';

export class ConstructionManager {
  private objects: Map<string, GeoObject> = new Map();
  private commandStack = new CommandStack(this);
  private evaluator = new Evaluator();

  // Listeners for UI updates
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

  public addObject(obj: GeoObject): void {
    this.objects.set(obj.id, obj);
    this.recomputeObject(obj.id); // compute initial value
    this.notify();
  }

  public removeObject(id: string): void {
    // Delete object and dependents
    const dependents = this.getDependents(id);
    for (const depId of dependents) {
      this.objects.delete(depId);
    }
    this.objects.delete(id);
    this.notify();
  }

  public updateObject(id: string, newDef: Partial<GeoObject>): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    Object.assign(obj, newDef);
    this.recomputeObject(id);
    this.notify();
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
    return [...new Set(result)]; // unique
  }

  public recomputeObject(id: string): void {
    const obj = this.objects.get(id);
    if (!obj) return;

    if (obj.definition) {
      try {
        const parsed = parseExpression(obj.definition);
        const val = this.evaluator.evaluate(parsed);
        // If it's not a rich geometric object with its own structure, update value
        if (obj.type !== 'slider' && obj.type !== 'point' && obj.type !== 'line') {
          obj.value = val;
        }
      } catch (e) {
        console.warn('Evaluation error for', id, e);
      }
    }

    // Dynamic geometric recomputation
    if (obj.dependsOn && obj.dependsOn.length > 0) {
      if (obj.createdByToolId === 'best-fit-line' || (obj.type === 'line' && obj.dependsOn.length > 2)) {
        const points = obj.dependsOn
          .map((depId) => this.getObject(depId))
          .filter((dep): dep is GeoObject => !!dep && !!dep.value)
          .map((dep) => {
            const pt = (dep.value as any);
            return { x: pt.x ?? 0, y: pt.y ?? 0 };
          });
        if (points.length >= 2) {
          const { bestFitLine } = require('../geometry/Line');
          const lineVal = bestFitLine(points);
          obj.value = lineVal;
          if (lineVal.slope !== undefined && lineVal.intercept !== undefined) {
            const sign = lineVal.intercept >= 0 ? '+' : '-';
            obj.definition = `y = ${lineVal.slope.toFixed(2)}x ${sign} ${Math.abs(lineVal.intercept).toFixed(2)}`;
          }
        }
      } else if (obj.type === 'segment' || obj.type === 'line' || obj.type === 'ray' || obj.type === 'vector') {
        const p1Obj = this.getObject(obj.dependsOn[0]);
        const p2Obj = this.getObject(obj.dependsOn[1]);
        if (p1Obj?.value && p2Obj?.value) {
          const p1Val = p1Obj.value as any;
          const p2Val = p2Obj.value as any;
          const p1 = { x: p1Val.x ?? 0, y: p1Val.y ?? 0 };
          const p2 = { x: p2Val.x ?? 0, y: p2Val.y ?? 0 };
          const { lineFromTwoPoints } = require('../geometry/Line');
          const eq = lineFromTwoPoints(p1, p2);
          obj.value = { p1, p2, a: eq.a, b: eq.b, c: eq.c };
        }
      } else if (obj.createdByToolId === 'midpoint-center' || obj.createdByToolId === 'midpoint') {
        const p1Obj = this.getObject(obj.dependsOn[0]);
        const p2Obj = this.getObject(obj.dependsOn[1]);
        if (p1Obj?.value && p2Obj?.value) {
          const p1 = (p1Obj.value as any);
          const p2 = (p2Obj.value as any);
          obj.value = {
            kind: 'free',
            x: ((p1.x ?? 0) + (p2.x ?? 0)) / 2,
            y: ((p1.y ?? 0) + (p2.y ?? 0)) / 2,
          };
        }
      }
    }

    // Recompute dependents
    const dependents = this.getDependents(id);
    for (const depId of dependents) {
      this.recomputeObject(depId);
    }
  }

  // Undo/Redo proxy
  public executeCommand(command: import('./commands/Command').Command) {
    this.commandStack.execute(command);
    this.notify();
  }
  public undo() { this.commandStack.undo(); this.notify(); }
  public redo() { this.commandStack.redo(); this.notify(); }
}
