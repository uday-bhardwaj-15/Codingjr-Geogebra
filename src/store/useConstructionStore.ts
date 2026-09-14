import { create } from 'zustand';
import { GeoObject } from '../types/geo';
import { ConstructionManager } from '../core/construction/ConstructionManager';

interface ConstructionState {
  objects: GeoObject[];
  manager: ConstructionManager;
  addObject: (obj: GeoObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, newDef: Partial<GeoObject>) => void;
  undo: () => void;
  redo: () => void;
}

const cm = new ConstructionManager();

export const useConstructionStore = create<ConstructionState>((set) => {
  // Subscribe to manager updates to sync Zustand state
  cm.subscribe(() => {
    set({ objects: cm.getObjects() });
  });

  return {
    objects: cm.getObjects(),
    manager: cm,
    addObject: (obj) => cm.addObject(obj),
    removeObject: (id) => cm.removeObject(id),
    updateObject: (id, def) => cm.updateObject(id, def),
    undo: () => cm.undo(),
    redo: () => cm.redo(),
  };
});
