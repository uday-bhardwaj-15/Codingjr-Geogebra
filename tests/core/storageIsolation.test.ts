import { describe, it, expect, beforeEach } from 'vitest';
import {
  localStorageAdapter,
  LocalStorageKeys,
  migrateLegacyStorageIfNeeded,
} from '../../src/lib/storage/localStorageAdapter';
import { StoredConstructionV1 } from '../../src/types/storage';

// In Node/Vitest environment, mock browser localStorage & window
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();
(global as any).localStorage = mockStorage;
(global as any).window = global;

describe('Storage Migration & Multi-App Isolation', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('migrates legacy active construction to graphing bucket if graphing bucket does not exist', () => {
    const legacyMockData: StoredConstructionV1 = {
      schemaVersion: 1,
      id: 'legacy_1',
      name: 'Old User Construction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      objects: [
        {
          id: 'pt_1',
          label: 'A',
          type: 'point',
          definition: '(1, 2)',
          value: { kind: 'free', x: 1, y: 2 },
          dependsOn: [],
          visible: true,
          labelVisible: true,
          style: { color: '#000', thickness: 3, opacity: 1 },
          createdByToolId: 'point',
          createdAt: Date.now(),
        },
      ],
    };

    mockStorage.setItem(
      LocalStorageKeys.LEGACY_ACTIVE_CONSTRUCTION,
      JSON.stringify(legacyMockData)
    );

    // Call migration
    migrateLegacyStorageIfNeeded();

    // Verify graphing key has the data and legacy key is removed
    const graphingData = localStorageAdapter.getConstruction('graphing');
    expect(graphingData).not.toBeNull();
    expect(graphingData?.name).toBe('Old User Construction');
    expect(graphingData?.objects.length).toBe(1);
    expect(mockStorage.getItem(LocalStorageKeys.LEGACY_ACTIVE_CONSTRUCTION)).toBeNull();
  });

  it('maintains independent isolation between graphing and geometry buckets', () => {
    const graphingData: StoredConstructionV1 = {
      schemaVersion: 1,
      id: 'const_graphing',
      name: 'Graphing construction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      objects: [
        {
          id: 'g_pt',
          label: 'GraphingPoint',
          type: 'point',
          definition: '(5, 5)',
          value: { kind: 'free', x: 5, y: 5 },
          dependsOn: [],
          visible: true,
          labelVisible: true,
          style: { color: '#6557d2', thickness: 3, opacity: 1 },
          createdByToolId: 'point',
          createdAt: Date.now(),
        },
      ],
    };

    const geometryData: StoredConstructionV1 = {
      schemaVersion: 1,
      id: 'const_geometry',
      name: 'Geometry construction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      objects: [
        {
          id: 'geo_seg',
          label: 'GeometrySegment',
          type: 'segment',
          definition: 'Segment(A, B)',
          value: null,
          dependsOn: [],
          visible: true,
          labelVisible: true,
          style: { color: '#1e88e5', thickness: 3, opacity: 1 },
          createdByToolId: 'segment',
          createdAt: Date.now(),
        },
      ],
    };

    localStorageAdapter.saveConstruction(graphingData, 'graphing');
    localStorageAdapter.saveConstruction(geometryData, 'geometry');

    const loadedGraphing = localStorageAdapter.getConstruction('graphing');
    const loadedGeometry = localStorageAdapter.getConstruction('geometry');

    expect(loadedGraphing?.objects[0].label).toBe('GraphingPoint');
    expect(loadedGeometry?.objects[0].label).toBe('GeometrySegment');
    expect(loadedGraphing?.objects.length).toBe(1);
    expect(loadedGeometry?.objects.length).toBe(1);
  });
});
