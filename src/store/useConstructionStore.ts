import { create } from 'zustand';
import { GeoObject } from '../types/geo';
import { ConstructionManager } from '../core/construction/ConstructionManager';

interface ConstructionState {
  objects: GeoObject[];
  canUndo: boolean;
  canRedo: boolean;
  manager: ConstructionManager;
  addObject: (obj: GeoObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, newDef: Partial<GeoObject>, prevDef?: Partial<GeoObject>) => void;
  toggleVisibility: (ids: string[]) => void;
  toggleLabel: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
}

const cm = new ConstructionManager();

export const useConstructionStore = create<ConstructionState>((set) => {
  // Subscribe to manager updates to sync Zustand state
  cm.subscribe(() => {
    set({
      objects: cm.getObjects(),
      canUndo: cm.canUndo(),
      canRedo: cm.canRedo(),
    });
  });

  return {
    objects: cm.getObjects(),
    canUndo: cm.canUndo(),
    canRedo: cm.canRedo(),
    manager: cm,
    addObject: (obj) => cm.addObject(obj),
    removeObject: (id) => cm.removeObject(id),
    updateObject: (id, def, prevDef) => cm.updateObject(id, def, prevDef),
    toggleVisibility: (ids) => cm.toggleVisibility(ids),
    toggleLabel: (ids) => cm.toggleLabel(ids),
    undo: () => cm.undo(),
    redo: () => cm.redo(),
  };
});
