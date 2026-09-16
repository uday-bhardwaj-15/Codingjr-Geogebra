import { describe, it, expect, beforeEach } from 'vitest';
import { useCasStore } from '../../src/store/useCasStore';
import { useConstructionStore } from '../../src/store/useConstructionStore';

// Mock localStorage & window for Node environment
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

describe('CAS to Graphics View Bridge', () => {
  beforeEach(() => {
    mockStorage.clear();
    useConstructionStore.getState().switchApp('cas');
  });

  it('automatically adds plottable function to construction store when defined in CAS row', () => {
    const rowId = useCasStore.getState().addRow('f(x) := x^2');

    const objects = useConstructionStore.getState().objects;
    const bridgedObj = objects.find((o) => o.id === `cas_bridge_${rowId}`);

    expect(bridgedObj).toBeDefined();
    expect(bridgedObj?.label).toBe('f');
    expect(bridgedObj?.type).toBe('function');
    expect(bridgedObj?.definition).toBe('f(x) = x^2');
  });

  it('removes plottable function when CAS row is deleted', () => {
    const rowId = useCasStore.getState().addRow('g(x) := 2*x + 1');
    expect(
      useConstructionStore.getState().objects.some((o) => o.id === `cas_bridge_${rowId}`)
    ).toBe(true);

    useCasStore.getState().deleteRow(rowId);

    expect(
      useConstructionStore.getState().objects.some((o) => o.id === `cas_bridge_${rowId}`)
    ).toBe(false);
  });

  it('keeps scalar assignments CAS-local without cluttering canvas', () => {
    const rowId = useCasStore.getState().addRow('a := 5');

    const objects = useConstructionStore.getState().objects;
    const bridgedObj = objects.find((o) => o.id === `cas_bridge_${rowId}`);

    expect(bridgedObj).toBeUndefined();
  });
});
