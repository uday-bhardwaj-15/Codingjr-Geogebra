import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { resolvePoint } from '../../geometry/Point';
import { getNextPointLabel, getNextLineLabel } from '../../construction/labelGenerator';

function createLineTool(id: string, type: 'segment' | 'line' | 'ray' | 'vector'): ToolHandler {
  return {
    id,
    createsPoints: true,
    clicksRequired: 2,
    commit: (selections: GeoObject[], cm: ConstructionManager) => {
      const p1 = selections[0];
      const p2 = selections[1];
      const label = getNextLineLabel(cm.getObjects());

      const newObj: GeoObject = {
        id: `${type}_${Date.now()}`,
        label,
        type: type,
        definition: '',
        dependsOn: [p1.id, p2.id],
        value: { p1: p1.value, p2: p2.value },
        visible: true,
        labelVisible: true,
        style: { color: type === 'vector' ? '#1565ef' : '#4b5563', thickness: 2.5, opacity: 1 },
        createdByToolId: id,
        createdAt: Date.now(),
      };

      cm.addObject(newObj);
    },
  };
}

export const segmentTool = createLineTool('segment', 'segment');
export const lineTool = createLineTool('line', 'line');
export const rayTool = createLineTool('ray', 'ray');
export const vectorTool = createLineTool('vector', 'vector');

export const segmentGivenLengthTool: ToolHandler = {
  id: 'segment-given-length',
  name: 'Segment with Given Length',
  instruction: 'Select point, then enter length',
  clicksRequired: 1,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const ptObj = selections[0];

    useUIStore.getState().openValueInputModal({
      title: 'Segment with Given Length',
      label: 'Length',
      defaultValue: '5',
      inputType: 'number',
      onConfirm: (val) => {
        const length = parseFloat(val) || 5;
        const pt = resolvePoint(ptObj.value as any);
        const bPt = { x: pt.x + length, y: pt.y };

        const bLabel = getNextPointLabel(cm.getObjects());
        const bId = `pt_${Date.now()}`;

        // MVP note: endpoint B is a free point at creation with default horizontal distance
        cm.addObject({
          id: bId,
          label: bLabel,
          type: 'point',
          definition: '',
          dependsOn: [],
          value: { kind: 'free', x: bPt.x, y: bPt.y },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: 'point',
          createdAt: Date.now(),
        });

        const segLabel = getNextLineLabel(cm.getObjects());
        cm.addObject({
          id: `segment_${Date.now()}`,
          label: segLabel,
          type: 'segment',
          definition: `Length = ${length}`,
          dependsOn: [ptObj.id, bId],
          value: { p1: pt, p2: bPt },
          visible: true,
          labelVisible: true,
          style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
          createdByToolId: 'segment-given-length',
          createdAt: Date.now() + 1,
        });
      },
    });
  },
};

export const vectorFromPointTool: ToolHandler = {
  id: 'vector-from-point',
  name: 'Vector from Point',
  instruction: 'Select point and vector',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const ptObj = selections.find((s) => s.type === 'point') || selections[0];
    const vecObj = selections.find((s) => s.type === 'vector' || s.type === 'segment') || selections[1];

    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `vector_${Date.now()}`,
      label,
      type: 'vector',
      definition: '',
      dependsOn: [ptObj.id, vecObj.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 2.5, opacity: 1 },
      createdByToolId: 'vector-from-point',
      createdAt: Date.now(),
    });
  },
};

export const polarDiameterLineTool: ToolHandler = {
  id: 'polar-diameter-line',
  name: 'Polar or Diameter Line',
  instruction: 'Select point or line, then circle or conic',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const ptObj = selections.find((s) => s.type === 'point') || selections[0];
    const circleObj = selections.find((s) => s.type === 'circle') || selections[1];

    const label = getNextLineLabel(cm.getObjects());
    cm.addObject({
      id: `line_${Date.now()}`,
      label,
      type: 'line',
      definition: `Polar(${ptObj.label}, ${circleObj.label})`,
      dependsOn: [ptObj.id, circleObj.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'polar-diameter-line',
      createdAt: Date.now(),
    });
  },
};

let polylinePoints: GeoObject[] = [];

export const polylineTool: ToolHandler = {
  id: 'polyline',
  name: 'Polyline',
  instruction: 'Select all vertices, then click first vertex again or double click',
  clicksRequired: 0,
  onPointerDown: (pos, target, cm) => {
    if (!cm) return;

    let vertex = target;
    if (!vertex) {
      const label = getNextPointLabel(cm.getObjects());
      vertex = {
        id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label,
        type: 'point',
        definition: '',
        dependsOn: [],
        value: { kind: 'free', x: pos.x, y: pos.y },
        visible: true,
        labelVisible: true,
        style: { color: '#1565ef', thickness: 5, opacity: 1 },
        createdByToolId: 'polyline',
        createdAt: Date.now(),
      };
      cm.addObject(vertex);
    }

    if (polylinePoints.length > 0 && polylinePoints[0].id === vertex.id) {
      // Completed loop or finish
      const pts = polylinePoints.map((p) => resolvePoint(p.value as any));
      pts.push(resolvePoint(vertex.value as any));

      cm.addObject({
        id: `polyline_${Date.now()}`,
        label: 'poly',
        type: 'polyline',
        definition: '',
        dependsOn: polylinePoints.map((p) => p.id),
        value: { points: pts },
        visible: true,
        labelVisible: false,
        style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
        createdByToolId: 'polyline',
        createdAt: Date.now(),
      });
      polylinePoints = [];
    } else {
      polylinePoints.push(vertex);
      if (polylinePoints.length >= 2) {
        const pts = polylinePoints.map((p) => resolvePoint(p.value as any));
        // Create or update polyline
        cm.addObject({
          id: `polyline_${Date.now()}`,
          label: 'poly',
          type: 'polyline',
          definition: '',
          dependsOn: polylinePoints.map((p) => p.id),
          value: { points: pts },
          visible: true,
          labelVisible: false,
          style: { color: '#4b5563', thickness: 2.5, opacity: 1 },
          createdByToolId: 'polyline',
          createdAt: Date.now(),
        });
      }
    }
  },
  reset: () => {
    polylinePoints = [];
  },
};
