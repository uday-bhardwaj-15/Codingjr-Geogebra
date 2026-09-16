import { create } from 'zustand';
import { GeoObject } from '../types/geo';
import { ConstructionManager } from '../core/construction/ConstructionManager';
import { localStorageAdapter } from '../lib/storage/localStorageAdapter';

interface ConstructionState {
  currentAppId: string;
  objects: GeoObject[];
  canUndo: boolean;
  canRedo: boolean;
  manager: ConstructionManager;
  switchApp: (appId: string) => void;
  addObject: (obj: GeoObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, newDef: Partial<GeoObject>, prevDef?: Partial<GeoObject>) => void;
  toggleVisibility: (ids: string[]) => void;
  toggleLabel: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
}

const cm = new ConstructionManager();
let currentActiveAppId = 'graphing';

function persistCurrentState() {
  if (typeof window === 'undefined') return;
  const objects = cm.getObjects();
  localStorageAdapter.saveConstruction(
    {
      schemaVersion: 1,
      id: `const_${currentActiveAppId}`,
      name: `${currentActiveAppId} construction`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      objects,
    },
    currentActiveAppId
  );
}

export const useConstructionStore = create<ConstructionState>((set) => {
  // Initial load if in browser
  if (typeof window !== 'undefined') {
    const saved = localStorageAdapter.getConstruction(currentActiveAppId);
    if (saved && saved.objects) {
      cm.loadObjects(saved.objects);
    }
  }

  // Subscribe to manager updates to sync Zustand state & persist
  cm.subscribe(() => {
    set({
      objects: cm.getObjects(),
      canUndo: cm.canUndo(),
      canRedo: cm.canRedo(),
    });
    persistCurrentState();
  });

  return {
    currentAppId: currentActiveAppId,
    objects: cm.getObjects(),
    canUndo: cm.canUndo(),
    canRedo: cm.canRedo(),
    manager: cm,
    switchApp: (appId: string) => {
      if (appId === currentActiveAppId) return;
      // 1. Save current app state
      persistCurrentState();

      // 2. Switch app ID
      currentActiveAppId = appId;
      set({ currentAppId: appId });

      // 3. Load target app data from storage
      const saved = localStorageAdapter.getConstruction(appId);
      if (saved && saved.objects && saved.objects.length > 0) {
        cm.loadObjects(saved.objects);
      } else {
        cm.clearAll();
      }
    },
    addObject: (obj) => cm.addObject(obj),
    removeObject: (id) => cm.removeObject(id),
    updateObject: (id, def, prevDef) => cm.updateObject(id, def, prevDef),
    toggleVisibility: (ids) => cm.toggleVisibility(ids),
    toggleLabel: (ids) => cm.toggleLabel(ids),
    undo: () => cm.undo(),
    redo: () => cm.redo(),
  };
});
