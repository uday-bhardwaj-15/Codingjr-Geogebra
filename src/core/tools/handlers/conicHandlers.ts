import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { resolvePoint } from '../../geometry/Point';
import {
  ellipseFromFociAndPoint,
  hyperbolaFromFociAndPoint,
  parabolaFromFocusAndDirectrix,
  conicFromFivePoints,
} from '../../geometry/conics';
import { LineValue } from '../../geometry/Line';

export const ellipseTool: ToolHandler = {
  id: 'ellipse',
  name: 'Ellipse',
  instruction: 'Select two foci and a point on ellipse',
  clicksRequired: 3,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const f1 = resolvePoint(selections[0].value as any);
    const f2 = resolvePoint(selections[1].value as any);
    const p = resolvePoint(selections[2].value as any);

    const shape = ellipseFromFociAndPoint(f1, f2, p);
    cm.addObject({
      id: `conic_${Date.now()}`,
      label: 'c',
      type: 'conic',
      definition: `Ellipse(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: shape,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'ellipse',
      createdAt: Date.now(),
    });
  },
};

export const hyperbolaTool: ToolHandler = {
  id: 'hyperbola',
  name: 'Hyperbola',
  instruction: 'Select two foci and a point on hyperbola',
  clicksRequired: 3,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const f1 = resolvePoint(selections[0].value as any);
    const f2 = resolvePoint(selections[1].value as any);
    const p = resolvePoint(selections[2].value as any);

    const shape = hyperbolaFromFociAndPoint(f1, f2, p);
    cm.addObject({
      id: `conic_${Date.now()}`,
      label: 'c',
      type: 'conic',
      definition: `Hyperbola(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: shape,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'hyperbola',
      createdAt: Date.now(),
    });
  },
};

export const parabolaTool: ToolHandler = {
  id: 'parabola',
  name: 'Parabola',
  instruction: 'Select point and directrix',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const ptObj = selections.find((s) => s.type === 'point') || selections[0];
    const lineObj = selections.find((s) => s.type === 'line' || s.type === 'segment') || selections[1];

    const focus = resolvePoint(ptObj.value as any);
    let lineVal: LineValue;

    if (lineObj && (lineObj.type === 'line' || lineObj.type === 'segment') && lineObj.value) {
      lineVal = lineObj.value as LineValue;
    } else {
      // If second click was a point, directrix is horizontal line through that point
      const p2 = resolvePoint(lineObj.value as any);
      lineVal = { a: 0, b: 1, c: -p2.y };
    }

    const shape = parabolaFromFocusAndDirectrix(focus, lineVal);
    cm.addObject({
      id: `conic_${Date.now()}`,
      label: 'c',
      type: 'conic',
      definition: `Parabola(${ptObj.label}, ${lineObj.label})`,
      dependsOn: [ptObj.id, lineObj.id],
      value: shape,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'parabola',
      createdAt: Date.now(),
    });
  },
};

export const conicFivePointsTool: ToolHandler = {
  id: 'conic-five-points',
  name: 'Conic through 5 Points',
  instruction: 'Select five points',
  clicksRequired: 5,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const points = selections.map((s) => resolvePoint(s.value as any));
    const shape = conicFromFivePoints(points);

    cm.addObject({
      id: `conic_${Date.now()}`,
      label: 'c',
      type: 'conic',
      definition: `Conic(${selections.map((s) => s.label).join(', ')})`,
      dependsOn: selections.map((s) => s.id),
      value: shape,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'conic-five-points',
      createdAt: Date.now(),
    });
  },
};
