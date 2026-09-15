import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { getNextPointLabel, getNextLineLabel } from '../../construction/labelGenerator';
import { bestFitLine } from '../../geometry/Line';
import { resolvePoint } from '../../geometry/Point';
import { intersectLineLine, intersectLineCircle, intersectCircleCircle } from '../../geometry/intersections';
import { useViewStore } from '../../../store/useViewStore';
import { UpdateObjectCommand } from '../../construction/commands/commands';

export const pointTool: ToolHandler = {
  id: 'point',
  name: 'Point',
  instruction: 'Select position or line, function, or curve',
  clicksRequired: 1,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    if (selections.length > 0) {
      const target = selections[0];
      if (target.label === 'P') {
        const nextLabel = getNextPointLabel(cm.getObjects().filter((o) => o.id !== target.id));
        cm.updateObject(target.id, { label: nextLabel });
      }
    }
  },
  onPointerDown: (pos, target, cm) => {
    if (!cm) return;
    if (!target) {
      const nextLabel = getNextPointLabel(cm.getObjects());
      cm.addObject({
        id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label: nextLabel,
        type: 'point',
        definition: '',
        dependsOn: [],
        value: { kind: 'free', x: pos.x, y: pos.y },
        visible: true,
        labelVisible: true,
        style: { color: '#1565ef', thickness: 5, opacity: 1 },
        createdByToolId: 'point',
        createdAt: Date.now(),
      });
    }
  },
};

interface DragState {
  target: (GeoObject & { hitPart?: 'thumb' | 'track' }) | null;
  startWorldPos: { x: number; y: number };
  lastWorldPos: { x: number; y: number };
  initialValue?: any;
  sliderPosOffset?: { x: number; y: number };
  dragOffset?: { x: number; y: number };
  isPanning?: boolean;
}

let activeDrag: DragState | null = null;

export const moveTool: ToolHandler = {
  id: 'move',
  name: 'Move',
  instruction: 'Drag or select object',
  clicksRequired: 0,
  onPointerDown: (pos, target) => {
    if (target) {
      const val = target.value as any;
      activeDrag = {
        target,
        startWorldPos: { ...pos },
        lastWorldPos: { ...pos },
        initialValue: val ? JSON.parse(JSON.stringify(val)) : null,
      };

      if (target.type === 'slider') {
        activeDrag.sliderPosOffset = {
          x: pos.x - (val?.x ?? 0),
          y: pos.y - (val?.y ?? 0),
        };
      } else if (target.type === 'text' || target.type === 'image') {
        activeDrag.dragOffset = {
          x: pos.x - (val?.x ?? 0),
          y: pos.y - (val?.y ?? 0),
        };
      }
    } else {
      activeDrag = {
        target: null,
        startWorldPos: { ...pos },
        lastWorldPos: { ...pos },
        isPanning: true,
      };
    }
  },
  onPointerMove: (pos, _target, cm) => {
    if (!activeDrag) return;

    if (activeDrag.isPanning) {
      const dx = pos.x - activeDrag.lastWorldPos.x;
      const dy = pos.y - activeDrag.lastWorldPos.y;
      useViewStore.getState().pan(dx, dy);
      activeDrag.lastWorldPos = { ...pos };
      return;
    }

    if (!cm || !activeDrag.target) return;
    const { target } = activeDrag;

    if (target.type === 'point') {
      cm.rawUpdateObject(target.id, {
        value: { kind: 'free', x: pos.x, y: pos.y },
      });
    } else if (target.type === 'text' || target.type === 'image') {
      const val = target.value as any;
      if (!val) return;
      const offset = activeDrag.dragOffset || { x: 0, y: 0 };
      cm.rawUpdateObject(target.id, {
        value: {
          ...val,
          x: pos.x - offset.x,
          y: pos.y - offset.y,
        },
      });
    } else if (target.type === 'slider') {
      const sliderVal = target.value as any;
      if (!sliderVal) return;

      if (target.hitPart === 'track') {
        const offset = activeDrag.sliderPosOffset || { x: 0, y: 0 };
        cm.rawUpdateObject(target.id, {
          value: {
            ...sliderVal,
            x: pos.x - offset.x,
            y: pos.y - offset.y,
          },
        });
      } else {
        const viewport = useViewStore.getState().viewport;
        const worldWidth = viewport.xMax - viewport.xMin;
        const trackWorldLength = worldWidth * 0.18 || 3.5;
        const sliderOriginX = sliderVal.x ?? 0;
        const relativeX = pos.x - sliderOriginX;
        const fraction = Math.max(0, Math.min(1, relativeX / trackWorldLength));

        const min = sliderVal.min ?? -5;
        const max = sliderVal.max ?? 5;
        const step = sliderVal.step ?? 0.1;
        let newVal = min + fraction * (max - min);

        if (step > 0) {
          newVal = Math.round((newVal - min) / step) * step + min;
        }
        newVal = Math.max(min, Math.min(max, newVal));

        cm.rawUpdateObject(target.id, {
          value: { ...sliderVal, val: newVal },
        });
      }
    }
  },
  onPointerUp: (_pos, _target, cm) => {
    if (activeDrag && activeDrag.target && cm && activeDrag.initialValue) {
      const currentObj = cm.getObject(activeDrag.target.id);
      if (currentObj && JSON.stringify(currentObj.value) !== JSON.stringify(activeDrag.initialValue)) {
        cm.executeCommand(
          new UpdateObjectCommand(
            activeDrag.target.id,
            { value: currentObj.value },
            { value: activeDrag.initialValue }
          )
        );
      }
    }
    activeDrag = null;
  },
  reset: () => {
    activeDrag = null;
  },
};

export const sliderTool: ToolHandler = {
  id: 'slider',
  name: 'Slider',
  instruction: 'Select position',
  clicksRequired: 0,
  onPointerDown: (pos) => {
    const { useUIStore } = require('../../../store/useUIStore');
    useUIStore.getState().openSliderModal(pos);
  },
};

export const bestFitLineTool: ToolHandler = {
  id: 'best-fit-line',
  name: 'Best Fit Line',
  instruction: 'Select several points or list of points',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const points = selections
      .filter((s) => s.type === 'point' && s.value)
      .map((s) => resolvePoint(s.value));

    if (points.length >= 2) {
      const lineVal = bestFitLine(points);
      const label = getNextLineLabel(cm.getObjects());
      const sign = (lineVal.intercept ?? 0) >= 0 ? '+' : '-';
      const def =
        lineVal.slope !== undefined && lineVal.intercept !== undefined
          ? `y = ${lineVal.slope.toFixed(2)}x ${sign} ${Math.abs(lineVal.intercept).toFixed(2)}`
          : `x = ${points[0].x.toFixed(2)}`;

      cm.addObject({
        id: `line_${Date.now()}`,
        label,
        type: 'line',
        definition: def,
        dependsOn: selections.map((s) => s.id),
        value: lineVal,
        visible: true,
        labelVisible: true,
        style: { color: '#dc2626', thickness: 2.5, opacity: 1 },
        createdByToolId: 'best-fit-line',
        createdAt: Date.now(),
      });
    }
  },
};

export const intersectTool: ToolHandler = {
  id: 'intersect',
  name: 'Intersect',
  instruction: 'Select intersection or two objects successively',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const obj1 = selections[0];
    const obj2 = selections[1];
    if (!obj1 || !obj2) return;

    let ptCoords: { x: number; y: number } | null = null;

    if (
      (obj1.type === 'line' || obj1.type === 'segment') &&
      (obj2.type === 'line' || obj2.type === 'segment')
    ) {
      const v1 = obj1.value as any;
      const v2 = obj2.value as any;
      if (v1 && v2 && typeof v1.a === 'number' && typeof v2.a === 'number') {
        ptCoords = intersectLineLine(v1, v2);
      }
    }

    if (ptCoords) {
      const label = getNextPointLabel(cm.getObjects());
      cm.addObject({
        id: `pt_${Date.now()}`,
        label,
        type: 'point',
        definition: '',
        dependsOn: [obj1.id, obj2.id],
        value: { kind: 'dependent', x: ptCoords.x, y: ptCoords.y },
        visible: true,
        labelVisible: true,
        style: { color: '#7c3aed', thickness: 5, opacity: 1 },
        createdByToolId: 'intersect',
        createdAt: Date.now(),
      });
    }
  },
};

export const extremumTool: ToolHandler = {
  id: 'extremum',
  name: 'Extremum',
  instruction: 'Select a function or curve',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const target = selections[0];
    if (!target) return;
    const label = getNextPointLabel(cm.getObjects());
    const pt = resolvePoint(target.value);
    cm.addObject({
      id: `pt_${Date.now()}`,
      label,
      type: 'point',
      definition: '',
      dependsOn: [target.id],
      value: { kind: 'dependent', x: pt.x, y: pt.y },
      visible: true,
      labelVisible: true,
      style: { color: '#059669', thickness: 5, opacity: 1 },
      createdByToolId: 'extremum',
      createdAt: Date.now(),
    });
  },
};

export const rootsTool: ToolHandler = {
  id: 'roots',
  name: 'Roots',
  instruction: 'Select a function',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const target = selections[0];
    if (!target) return;
    const label = getNextPointLabel(cm.getObjects());
    const pt = resolvePoint(target.value);
    cm.addObject({
      id: `pt_${Date.now()}`,
      label,
      type: 'point',
      definition: '',
      dependsOn: [target.id],
      value: { kind: 'dependent', x: pt.x, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#d97706', thickness: 5, opacity: 1 },
      createdByToolId: 'roots',
      createdAt: Date.now(),
    });
  },
};
