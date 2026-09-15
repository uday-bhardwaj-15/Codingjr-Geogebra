import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { getNextPointLabel } from '../../construction/labelGenerator';
import { resolvePoint } from '../../geometry/Point';

export const pointOnObjectTool: ToolHandler = {
  id: 'point-on-object',
  name: 'Point on Object',
  instruction: 'Click inside object or on its perimeter',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const target = selections[0];
    const label = getNextPointLabel(cm.getObjects());

    let ptVal = { x: 0, y: 0 };
    if (target.type === 'circle') {
      const cVal = target.value as any;
      if (cVal?.center && typeof cVal?.radius === 'number') {
        ptVal = { x: cVal.center.x + cVal.radius, y: cVal.center.y };
      }
    } else if (target.type === 'segment' || target.type === 'line') {
      const lVal = target.value as any;
      if (lVal?.p1) {
        ptVal = { x: lVal.p1.x, y: lVal.p1.y };
      }
    }

    cm.addObject({
      id: `pt_${Date.now()}`,
      label,
      type: 'point',
      definition: `PointOn(${target.label})`,
      dependsOn: [target.id],
      value: { kind: 'dependent', x: ptVal.x, y: ptVal.y },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point-on-object',
      createdAt: Date.now(),
    });
  },
};

export const attachDetachPointTool: ToolHandler = {
  id: 'attach-detach-point',
  name: 'Attach / Detach Point',
  instruction: 'Select point, then object to attach to (or select attached point to detach)',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const ptObj = selections[0];
    if (ptObj.type !== 'point') return;

    if (ptObj.dependsOn.length > 0) {
      // Detach: convert to free point
      const pt = resolvePoint(ptObj.value as any);
      cm.updateObject(ptObj.id, {
        dependsOn: [],
        value: { kind: 'free', x: pt.x, y: pt.y },
        definition: '',
      });
    }
  },
};

export const complexNumberTool: ToolHandler = {
  id: 'complex-number',
  name: 'Complex Number',
  instruction: 'Click on graphics view to create complex number',
  clicksRequired: 0,
  onPointerDown: (pos, _target, cm) => {
    if (!cm) return;
    const label = `z_${Date.now().toString().slice(-2)}`;
    cm.addObject({
      id: `z_${Date.now()}`,
      label,
      type: 'point',
      definition: `${pos.x.toFixed(2)} + ${pos.y.toFixed(2)}i`,
      dependsOn: [],
      value: { kind: 'free', x: pos.x, y: pos.y, isComplex: true },
      visible: true,
      labelVisible: true,
      style: { color: '#7c3aed', thickness: 5, opacity: 1 },
      createdByToolId: 'complex-number',
      createdAt: Date.now(),
    });
  },
};

let listSelections: GeoObject[] = [];

export const listTool: ToolHandler = {
  id: 'list',
  name: 'List',
  instruction: 'Select objects to create a list, press Enter or click canvas to finish',
  clicksRequired: 0,
  onPointerDown: (_pos, target, cm) => {
    if (!cm) return;
    if (target) {
      if (!listSelections.some((s) => s.id === target.id)) {
        listSelections.push(target);
      }
    } else if (listSelections.length > 0) {
      // Finish list on clicking background
      const labels = listSelections.map((s) => s.label).join(', ');
      cm.addObject({
        id: `list_${Date.now()}`,
        label: `L_${Date.now().toString().slice(-2)}`,
        type: 'text',
        definition: `{${labels}}`,
        dependsOn: listSelections.map((s) => s.id),
        value: { x: -8, y: 8, text: `{${labels}}` },
        visible: true,
        labelVisible: false,
        style: { color: '#0f172a', thickness: 1, opacity: 1 },
        createdByToolId: 'list',
        createdAt: Date.now(),
      });
      listSelections = [];
    }
  },
  reset: () => {
    listSelections = [];
  },
};
