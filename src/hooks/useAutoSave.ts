import { useEffect } from 'react';
import { useConstructionStore } from '../store/useConstructionStore';
import { useViewStore } from '../store/useViewStore';
import { localStorageAdapter } from '../lib/storage/localStorageAdapter';

export function useAutoSave() {
  const objects = useConstructionStore((state) => state.objects);
  const viewport = useViewStore((state) => state.viewport);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorageAdapter.saveConstruction({
        schemaVersion: 1,
        id: 'default',
        name: 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewport,
        objects,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [objects, viewport]);
}
