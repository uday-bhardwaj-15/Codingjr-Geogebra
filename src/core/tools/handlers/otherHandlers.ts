import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { PointCoords, distance } from '../../geometry/Point';

let activeInkPoints: PointCoords[] = [];

export function getActiveInkPoints(): PointCoords[] {
  return activeInkPoints;
}

function smoothPoints(rawPoints: PointCoords[]): PointCoords[] {
  if (rawPoints.length <= 2) return rawPoints;
  const smoothed: PointCoords[] = [rawPoints[0]];
  for (let i = 1; i < rawPoints.length - 1; i++) {
    smoothed.push({
      x: rawPoints[i - 1].x * 0.25 + rawPoints[i].x * 0.5 + rawPoints[i + 1].x * 0.25,
      y: rawPoints[i - 1].y * 0.25 + rawPoints[i].y * 0.5 + rawPoints[i + 1].y * 0.25,
    });
  }
  smoothed.push(rawPoints[rawPoints.length - 1]);
  return smoothed;
}

export const penTool: ToolHandler = {
  id: 'pen',
  name: 'Pen',
  instruction: 'Draw freehand on graphics view',
  clicksRequired: 0,
  onPointerDown: (pos) => {
    activeInkPoints = [{ ...pos }];
  },
  onPointerMove: (pos) => {
    if (activeInkPoints.length > 0) {
      // Avoid clustering identical points
      const last = activeInkPoints[activeInkPoints.length - 1];
      if (Math.hypot(pos.x - last.x, pos.y - last.y) > 0.01) {
        activeInkPoints.push({ ...pos });
      }
    }
  },
  onPointerUp: (_pos, _target, cm) => {
    if (cm && activeInkPoints.length >= 2) {
      const smoothed = smoothPoints(smoothPoints(activeInkPoints));
      cm.addObject({
        id: `ink_${Date.now()}`,
        label: 'pen',
        type: 'polyline',
        definition: 'Pen Stroke',
        dependsOn: [],
        value: { points: smoothed },
        visible: true,
        labelVisible: false,
        style: { color: '#0f172a', thickness: 2.5, opacity: 1 },
        createdByToolId: 'pen',
        createdAt: Date.now(),
      });
    }
    activeInkPoints = [];
  },
  reset: () => {
    activeInkPoints = [];
  },
};

export const freehandShapeTool: ToolHandler = {
  id: 'freehand-shape',
  name: 'Freehand Shape',
  instruction: 'Sketch a function or geometric object',
  clicksRequired: 0,
  onPointerDown: (pos) => {
    activeInkPoints = [{ ...pos }];
  },
  onPointerMove: (pos) => {
    if (activeInkPoints.length > 0) {
      const last = activeInkPoints[activeInkPoints.length - 1];
      if (Math.hypot(pos.x - last.x, pos.y - last.y) > 0.01) {
        activeInkPoints.push({ ...pos });
      }
    }
  },
  onPointerUp: (_pos, _target, cm) => {
    if (cm && activeInkPoints.length >= 2) {
      const smoothed = smoothPoints(smoothPoints(activeInkPoints));
      cm.addObject({
        id: `shape_${Date.now()}`,
        label: 'sketch',
        type: 'polyline',
        definition: 'Freehand Sketch',
        dependsOn: [],
        value: { points: smoothed },
        visible: true,
        labelVisible: false,
        style: { color: '#2563eb', thickness: 2.5, opacity: 1 },
        createdByToolId: 'freehand-shape',
        createdAt: Date.now(),
      });
    }
    activeInkPoints = [];
  },
  reset: () => {
    activeInkPoints = [];
  },
};


export const relationTool: ToolHandler = {
  id: 'relation',
  name: 'Relation',
  instruction: 'Select two objects',
  clicksRequired: 2,
  commit: (selections: GeoObject[]) => {
    const o1 = selections[0];
    const o2 = selections[1];
    let relMsg = `${o1.label} and ${o2.label} have no simple relation.`;

    if ((o1.type === 'line' || o1.type === 'segment') && (o2.type === 'line' || o2.type === 'segment')) {
      const v1 = o1.value as any;
      const v2 = o2.value as any;
      if (v1 && v2 && typeof v1.a === 'number' && typeof v2.a === 'number') {
        const dot = v1.a * v2.a + v1.b * v2.b;
        const cross = v1.a * v2.b - v1.b * v2.a;
        if (Math.abs(cross) < 1e-4) {
          relMsg = `${o1.label} is parallel to ${o2.label}`;
        } else if (Math.abs(dot) < 1e-4) {
          relMsg = `${o1.label} is perpendicular to ${o2.label}`;
        } else {
          relMsg = `${o1.label} and ${o2.label} intersect.`;
        }
      }
    } else if (o1.type === 'point' && (o2.type === 'line' || o2.type === 'circle')) {
      relMsg = `${o1.label} lies near ${o2.label}`;
    }

    useUIStore.getState().openAlertModal(`Relation: ${o1.label}, ${o2.label}`, relMsg);
  },
};

export const buttonTool: ToolHandler = {
  id: 'button',
  name: 'Button',
  instruction: 'Click on graphics view to insert button',
  clicksRequired: 0,
  onPointerDown: (pos, _target, cm) => {
    if (!cm) return;
    useUIStore.getState().openValueInputModal({
      title: 'Button',
      label: 'Caption',
      defaultValue: 'Click Me',
      inputType: 'text',
      onConfirm: (caption) => {
        cm.addObject({
          id: `btn_${Date.now()}`,
          label: 'button',
          type: 'text',
          definition: `Button("${caption}")`,
          dependsOn: [],
          value: { x: pos.x, y: pos.y, text: `[ ${caption} ]` },
          visible: true,
          labelVisible: false,
          style: { color: '#1565ef', thickness: 1, opacity: 1 },
          createdByToolId: 'button',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const checkBoxTool: ToolHandler = {
  id: 'check-box',
  name: 'Check Box',
  instruction: 'Click on graphics view to insert check box',
  clicksRequired: 0,
  onPointerDown: (pos, _target, cm) => {
    if (!cm) return;
    useUIStore.getState().openValueInputModal({
      title: 'Check Box',
      label: 'Caption / Object Label',
      defaultValue: 'b = true',
      inputType: 'text',
      onConfirm: (caption) => {
        cm.addObject({
          id: `chk_${Date.now()}`,
          label: 'checkbox',
          type: 'text',
          definition: `CheckBox("${caption}")`,
          dependsOn: [],
          value: { x: pos.x, y: pos.y, text: `☑ ${caption}` },
          visible: true,
          labelVisible: false,
          style: { color: '#0f172a', thickness: 1, opacity: 1 },
          createdByToolId: 'check-box',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const inputBoxTool: ToolHandler = {
  id: 'input-box',
  name: 'Input Box',
  instruction: 'Click on graphics view to insert input box',
  clicksRequired: 0,
  onPointerDown: (pos, _target, cm) => {
    if (!cm) return;
    useUIStore.getState().openValueInputModal({
      title: 'Input Box',
      label: 'Caption / Linked Variable',
      defaultValue: 'a',
      inputType: 'text',
      onConfirm: (linkedVar) => {
        cm.addObject({
          id: `input_${Date.now()}`,
          label: 'inputbox',
          type: 'text',
          definition: `InputBox(${linkedVar})`,
          dependsOn: [],
          value: { x: pos.x, y: pos.y, text: `${linkedVar}: [ ... ]` },
          visible: true,
          labelVisible: false,
          style: { color: '#0f172a', thickness: 1, opacity: 1 },
          createdByToolId: 'input-box',
          createdAt: Date.now(),
        });
      },
    });
  },
};
