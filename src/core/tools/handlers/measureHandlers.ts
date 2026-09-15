import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { resolvePoint } from '../../geometry/Point';
import { rotatePoint } from '../../geometry/transforms';
import { getNextPointLabel } from '../../construction/labelGenerator';

export const angleTool: ToolHandler = {
  id: 'angle',
  name: 'Angle',
  instruction: 'Select three points or two lines',
  clicksRequired: 3,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `angle_${Date.now()}`,
      label: 'α',
      type: 'angle',
      definition: 'α',
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 3, opacity: 0.2 },
      createdByToolId: 'angle',
      createdAt: Date.now(),
    });
  },
};

export const angleGivenSizeTool: ToolHandler = {
  id: 'angle-given-size',
  name: 'Angle with Given Size',
  instruction: 'Select leg point, vertex, then enter size',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const legPtObj = selections[0];
    const vertexObj = selections[1];

    useUIStore.getState().openValueInputModal({
      title: 'Angle with Given Size',
      label: 'Angle (degrees)',
      defaultValue: '45°',
      inputType: 'angle',
      onConfirm: (val) => {
        const deg = parseFloat(val.replace('°', '')) || 45;
        const rad = (deg * Math.PI) / 180;

        const legPt = resolvePoint(legPtObj.value as any);
        const vertex = resolvePoint(vertexObj.value as any);
        const rotated = rotatePoint(legPt, vertex, rad);

        const newLabel = getNextPointLabel(cm.getObjects());
        const newPtId = `pt_${Date.now()}`;

        // 1. Create rotated point A'
        cm.addObject({
          id: newPtId,
          label: `${legPtObj.label}'`,
          type: 'point',
          definition: '',
          dependsOn: [legPtObj.id, vertexObj.id],
          value: { kind: 'dependent', x: rotated.x, y: rotated.y, angleRad: rad },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: 'rotate-around-point',
          createdAt: Date.now(),
        });

        // 2. Create angle object between legPt, vertex, and new rotated point
        cm.addObject({
          id: `angle_${Date.now()}`,
          label: 'α',
          type: 'angle',
          definition: `α = ${deg.toFixed(1)}°`,
          dependsOn: [legPtObj.id, vertexObj.id, newPtId],
          value: null,
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 3, opacity: 0.2 },
          createdByToolId: 'angle',
          createdAt: Date.now() + 1,
        });
      },
    });
  },
};

export const slopeTool: ToolHandler = {
  id: 'slope',
  name: 'Slope',
  instruction: 'Select line',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const lineObj = selections[0];
    cm.addObject({
      id: `slope_${Date.now()}`,
      label: 'm',
      type: 'measurement',
      definition: 'm',
      dependsOn: [lineObj.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 1, opacity: 1 },
      createdByToolId: 'slope',
      createdAt: Date.now(),
    });
  },
};

export const distanceTool: ToolHandler = {
  id: 'distance-length',
  name: 'Distance or Length',
  instruction: 'Select two points, a segment, polygon or circle',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `measure_${Date.now()}`,
      label: 'd',
      type: 'measurement',
      definition: 'd',
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 1, opacity: 1 },
      createdByToolId: 'distance-length',
      createdAt: Date.now(),
    });
  },
};

export const areaTool: ToolHandler = {
  id: 'area',
  name: 'Area',
  instruction: 'Select polygon, circle or conic',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `measure_${Date.now()}`,
      label: 'Area',
      type: 'measurement',
      definition: 'Area',
      dependsOn: [selections[0].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 1, opacity: 1 },
      createdByToolId: 'area',
      createdAt: Date.now(),
    });
  },
};
