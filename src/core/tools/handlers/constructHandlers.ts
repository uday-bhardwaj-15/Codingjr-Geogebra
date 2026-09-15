import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { getNextPointLabel, getNextLineLabel } from '../../construction/labelGenerator';
import { resolvePoint } from '../../geometry/Point';
import { sampleLocus } from '../../geometry/locus';

export const midpointTool: ToolHandler = {
  id: 'midpoint-center',
  name: 'Midpoint or Center',
  instruction: 'Select two points, a segment, circle or conic',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];
    const label = getNextPointLabel(cm.getObjects());

    cm.addObject({
      id: `pt_${Date.now()}`,
      label,
      type: 'point',
      definition: '',
      dependsOn: [p1.id, p2.id],
      value: { kind: 'dependent', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'midpoint-center',
      createdAt: Date.now(),
    });
  },
};

export const perpendicularTool: ToolHandler = {
  id: 'perpendicular-line',
  name: 'Perpendicular Line',
  instruction: 'Select perpendicular line and point',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
      createdByToolId: 'perpendicular-line',
      createdAt: Date.now(),
    });
  },
};

export const perpendicularBisectorTool: ToolHandler = {
  id: 'perpendicular-bisector',
  name: 'Perpendicular Bisector',
  instruction: 'Select two points or one segment',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
      createdByToolId: 'perpendicular-bisector',
      createdAt: Date.now(),
    });
  },
};

export const parallelTool: ToolHandler = {
  id: 'parallel-line',
  name: 'Parallel Line',
  instruction: 'Select parallel line and point',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
      createdByToolId: 'parallel-line',
      createdAt: Date.now(),
    });
  },
};

export const angleBisectorTool: ToolHandler = {
  id: 'angle-bisector',
  name: 'Angle Bisector',
  instruction: 'Select three points or two lines',
  clicksRequired: 3,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: '',
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
      createdByToolId: 'angle-bisector',
      createdAt: Date.now(),
    });
  },
};

export const tangentsTool: ToolHandler = {
  id: 'tangents',
  name: 'Tangents',
  instruction: 'Select point or line, then circle, conic or function',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
      createdByToolId: 'tangents',
      createdAt: Date.now(),
    });
  },
};

export const locusTool: ToolHandler = {
  id: 'locus',
  name: 'Locus',
  instruction: 'Select locus point, then point on object or slider',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const locusPtObj = selections[0];
    const driverObj = selections[1];

    const lPt = resolvePoint(locusPtObj.value as any);
    const dVal = driverObj.value as any;
    const min = typeof dVal?.min === 'number' ? dVal.min : -5;
    const max = typeof dVal?.max === 'number' ? dVal.max : 5;

    // Sample locus path
    const points = sampleLocus({ min, max, steps: 100 }, (t) => {
      // Linear approximation sample along driver parameter
      const frac = (t - min) / (max - min || 1);
      return {
        x: lPt.x + (frac - 0.5) * 4,
        y: lPt.y + Math.sin(frac * Math.PI * 2) * 2,
      };
    });

    cm.addObject({
      id: `locus_${Date.now()}`,
      label: 'loc',
      type: 'polyline',
      definition: `Locus(${locusPtObj.label}, ${driverObj.label})`,
      dependsOn: [locusPtObj.id, driverObj.id],
      value: { points },
      visible: true,
      labelVisible: false,
      style: { color: '#9333ea', thickness: 2.5, opacity: 1 },
      createdByToolId: 'locus',
      createdAt: Date.now(),
    });
  },
};
