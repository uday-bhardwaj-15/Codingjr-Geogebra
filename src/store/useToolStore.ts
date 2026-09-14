import { create } from 'zustand';
import { ToolManager } from '../core/tools/ToolManager';
import { useConstructionStore } from './useConstructionStore';

interface ToolState {
  activeToolId: string;
  setActiveToolId: (id: string) => void;
  toolManager: ToolManager;
}

import { allTools } from '../core/tools/handlers';

// Ensure toolManager uses the same construction manager instance
const toolManager = new ToolManager(useConstructionStore.getState().manager);
allTools.forEach(tool => toolManager.registerHandler(tool));

export const useToolStore = create<ToolState>((set) => ({
  activeToolId: 'move',
  toolManager,
  setActiveToolId: (id: string) => {
    toolManager.setActiveTool(id);
    set({ activeToolId: id });
  },
}));
