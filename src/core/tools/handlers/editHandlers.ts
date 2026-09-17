import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useViewStore } from '../../../store/useViewStore';

let panStartPos: { x: number; y: number } | null = null;

export const moveGraphicsViewTool: ToolHandler = {
  id: 'move-graphics-view',
  name: 'Move Graphics View',
  instruction: 'Drag white background or axis',
  clicksRequired: 0,
  onPointerDown: (pos) => {
    panStartPos = { ...pos };
  },
  onPointerMove: (pos) => {
    if (!panStartPos) return;
    const dx = pos.x - panStartPos.x;
    const dy = pos.y - panStartPos.y;
    useViewStore.getState().pan(dx, dy);
    panStartPos = { ...pos };
  },
  onPointerUp: () => {
    panStartPos = null;
  },
  reset: () => {
    panStartPos = null;
  },
};

export const selectObjectsTool: ToolHandler = {
  id: 'select-objects',
  name: 'Select Objects',
  instruction: 'Click on object to select it or drag a rectangle',
  clicksRequired: 0,
  onPointerDown: (_pos, target, _cm) => {
    // If an object is clicked, highlight or focus it
    if (target) {
      console.log('Selected object:', target.id);
    }
  },
};

export const deleteTool: ToolHandler = {
  id: 'delete',
  name: 'Delete',
  instruction: 'Select object which should be deleted',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    if (selections[0]) {
      cm.removeObject(selections[0].id);
    }
  },
  onPointerDown: (_pos, target, cm) => {
    if (target && cm) {
      cm.removeObject(target.id);
    }
  },
};

export const showHideObjectTool: ToolHandler = {
  id: 'show-hide-object',
  name: 'Show / Hide Object',
  instruction: 'Select objects to hide, then switch to another tool',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    if (selections[0]) {
      cm.updateObject(selections[0].id, { visible: !selections[0].visible });
    }
  },
  onPointerDown: (_pos, target, cm) => {
    if (target && cm) {
      cm.updateObject(target.id, { visible: !target.visible });
    }
  },
};

export const showHideLabelTool: ToolHandler = {
  id: 'show-hide-label',
  name: 'Show / Hide Label',
  instruction: 'Select object',
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    if (selections[0]) {
      cm.updateObject(selections[0].id, { labelVisible: !selections[0].labelVisible });
    }
  },
  onPointerDown: (_pos, target, cm) => {
    if (target && cm) {
      cm.updateObject(target.id, { labelVisible: !target.labelVisible });
    }
  },
};

let copiedStyle: GeoObject['style'] | null = null;

export const copyVisualStyleTool: ToolHandler = {
  id: 'copy-visual-style',
  name: 'Copy Visual Style',
  instruction: 'Select sample object, then click on other objects',
  clicksRequired: 0,
  onPointerDown: (_pos, target, cm) => {
    if (!target || !cm) return;
    if (!copiedStyle) {
      copiedStyle = target.style ? { ...target.style } : { color: '#1565ef', thickness: 2, opacity: 1 };
    } else {
      cm.updateObject(target.id, {
        style: {
          ...target.style,
          ...copiedStyle,
        },
      });
    }
  },
  reset: () => {
    copiedStyle = null;
  },
};

