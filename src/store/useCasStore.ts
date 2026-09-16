import { create } from 'zustand';
import {
  evaluateCasInput,
  expandCas,
  substituteCas,
  solveEquation,
  CasRowResult,
  formatExactResult,
} from '../core/math-engine/symbolic';
import { useConstructionStore } from './useConstructionStore';
import * as math from 'mathjs';

export interface CasRowItem {
  id: string;
  input: string;
  result: CasRowResult | null;
  isNumeric: boolean;
  createdAt: number;
}

interface StoredCasData {
  rows: { id: string; input: string; isNumeric: boolean }[];
}

const CAS_STORAGE_KEY = 'graphkit:cas:rows';

function loadStoredRows(): CasRowItem[] {
  if (typeof window === 'undefined') {
    return [
      { id: 'row_1', input: '1/3 + 1/6', result: evaluateCasInput('1/3 + 1/6'), isNumeric: false, createdAt: 1 },
      { id: 'row_2', input: 'z', result: evaluateCasInput('z'), isNumeric: false, createdAt: 2 },
    ];
  }
  try {
    const raw = localStorage.getItem(CAS_STORAGE_KEY);
    if (!raw) {
      return [
        { id: 'row_1', input: '1/3 + 1/6', result: evaluateCasInput('1/3 + 1/6'), isNumeric: false, createdAt: 1 },
        { id: 'row_2', input: 'z', result: evaluateCasInput('z'), isNumeric: false, createdAt: 2 },
      ];
    }
    const data: StoredCasData = JSON.parse(raw);
    const scope = new Map<string, any>();
    return data.rows.map((r, i) => {
      const res = evaluateCasInput(r.input, scope, { numeric: r.isNumeric });
      return {
        id: r.id,
        input: r.input,
        result: res,
        isNumeric: r.isNumeric,
        createdAt: i + 1,
      };
    });
  } catch {
    return [
      { id: 'row_1', input: '1/3 + 1/6', result: evaluateCasInput('1/3 + 1/6'), isNumeric: false, createdAt: 1 },
      { id: 'row_2', input: 'z', result: evaluateCasInput('z'), isNumeric: false, createdAt: 2 },
    ];
  }
}

function persistCasRows(rows: CasRowItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredCasData = {
      rows: rows.map((r) => ({
        id: r.id,
        input: r.input,
        isNumeric: r.isNumeric,
      })),
    };
    localStorage.setItem(CAS_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save CAS rows to localStorage', e);
  }
}

/**
 * Syncs plottable functions from CAS rows to ConstructionManager (Canvas Bridge)
 */
function syncCasRowToCanvasBridge(rowId: string, result: CasRowResult | null) {
  const constructionStore = useConstructionStore.getState();

  if (result && result.isFunction && result.assignedName && result.definition) {
    const geoId = `cas_bridge_${rowId}`;
    const existing = constructionStore.manager.getObject(geoId);
    if (existing) {
      constructionStore.updateObject(geoId, {
        label: result.assignedName,
        definition: `${result.assignedName}(x) = ${result.definition}`,
      });
    } else {
      constructionStore.addObject({
        id: geoId,
        label: result.assignedName,
        type: 'function',
        definition: `${result.assignedName}(x) = ${result.definition}`,
        dependsOn: [],
        value: null,
        visible: true,
        labelVisible: true,
        style: { color: '#6557d2', thickness: 2.5, opacity: 1 },
        createdByToolId: 'cas-bridge',
        createdAt: Date.now(),
      });
    }
  } else {
    // Remove if it previously had a bridged object
    const geoId = `cas_bridge_${rowId}`;
    if (constructionStore.manager.getObject(geoId)) {
      constructionStore.removeObject(geoId);
    }
  }
}

interface CasState {
  rows: CasRowItem[];
  addRow: (initialInput?: string) => string;
  updateRow: (id: string, input: string) => void;
  deleteRow: (id: string) => void;
  toggleRowNumeric: (id: string) => void;
  applyRowCommand: (
    id: string,
    command: 'simplify' | 'expand' | 'derivative' | 'numeric' | 'solve'
  ) => void;
  substituteRow: (id: string, varName: string, valueExpr: string) => void;
  recomputeAll: () => void;
}

export const useCasStore = create<CasState>((set, get) => {
  const initialRows = loadStoredRows();

  // Initial sync of bridge functions on load
  initialRows.forEach((r) => {
    if (r.result?.isFunction) {
      syncCasRowToCanvasBridge(r.id, r.result);
    }
  });

  return {
    rows: initialRows,
    addRow: (initialInput = '') => {
      const id = 'cas_' + Date.now();
      const newRow: CasRowItem = {
        id,
        input: initialInput,
        result: initialInput ? evaluateCasInput(initialInput) : null,
        isNumeric: false,
        createdAt: Date.now(),
      };
      const updated = [...get().rows, newRow];
      set({ rows: updated });
      persistCasRows(updated);
      if (newRow.result) {
        syncCasRowToCanvasBridge(id, newRow.result);
      }
      return id;
    },
    updateRow: (id: string, input: string) => {
      const rows = get().rows;
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) return;

      // Recompute all rows sequentially with cumulative scope
      const scope = new Map<string, any>();
      const nextRows = rows.map((r, i) => {
        const curInput = r.id === id ? input : r.input;
        const res = evaluateCasInput(curInput, scope, { numeric: r.isNumeric });
        syncCasRowToCanvasBridge(r.id, res);
        return {
          ...r,
          input: curInput,
          result: res,
        };
      });

      set({ rows: nextRows });
      persistCasRows(nextRows);
    },
    deleteRow: (id: string) => {
      const rows = get().rows.filter((r) => r.id !== id);
      syncCasRowToCanvasBridge(id, null);
      set({ rows });
      persistCasRows(rows);
    },
    toggleRowNumeric: (id: string) => {
      const rows = get().rows;
      const target = rows.find((r) => r.id === id);
      if (!target) return;

      const newNumeric = !target.isNumeric;
      const scope = new Map<string, any>();
      const nextRows = rows.map((r) => {
        const isNum = r.id === id ? newNumeric : r.isNumeric;
        const res = evaluateCasInput(r.input, scope, { numeric: isNum });
        return {
          ...r,
          isNumeric: isNum,
          result: res,
        };
      });

      set({ rows: nextRows });
      persistCasRows(nextRows);
    },
    applyRowCommand: (id, command) => {
      const rows = get().rows;
      const target = rows.find((r) => r.id === id);
      if (!target || !target.input) return;

      let newInput = target.input;
      if (command === 'simplify') {
        try {
          const sim = math.simplify(target.input);
          newInput = sim.toString();
        } catch {}
      } else if (command === 'expand') {
        newInput = expandCas(target.input);
      } else if (command === 'derivative') {
        newInput = `Derivative(${target.input}, x)`;
      } else if (command === 'solve') {
        newInput = `Solve(${target.input})`;
      } else if (command === 'numeric') {
        get().toggleRowNumeric(id);
        return;
      }

      get().updateRow(id, newInput);
    },
    substituteRow: (id: string, varName: string, valueExpr: string) => {
      const rows = get().rows;
      const target = rows.find((r) => r.id === id);
      if (!target || !target.input) return;

      const subbed = substituteCas(target.input, varName, valueExpr);
      get().updateRow(id, subbed);
    },
    recomputeAll: () => {
      const scope = new Map<string, any>();
      const nextRows = get().rows.map((r) => {
        const res = evaluateCasInput(r.input, scope, { numeric: r.isNumeric });
        syncCasRowToCanvasBridge(r.id, res);
        return { ...r, result: res };
      });
      set({ rows: nextRows });
      persistCasRows(nextRows);
    },
  };
});
