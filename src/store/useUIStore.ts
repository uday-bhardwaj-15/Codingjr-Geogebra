import { create } from 'zustand';
import { PointCoords } from '../core/geometry/Point';

export interface UIState {
  toolsPanelOpen: boolean;
  activeLeftTab: 'algebra' | 'tools' | 'table' | 'spreadsheet';
  currentMouseWorld: PointCoords | null;
  sliderModalPos: PointCoords | null;
  toggleToolsPanel: () => void;
  setToolsPanelOpen: (open: boolean) => void;
  setActiveLeftTab: (tab: 'algebra' | 'tools' | 'table' | 'spreadsheet') => void;
  setCurrentMouseWorld: (pos: PointCoords | null) => void;
  openSliderModal: (pos: PointCoords) => void;
  closeSliderModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toolsPanelOpen: true,
  activeLeftTab: 'tools',
  currentMouseWorld: null,
  sliderModalPos: null,
  toggleToolsPanel: () => set((state) => ({ toolsPanelOpen: !state.toolsPanelOpen })),
  setToolsPanelOpen: (open) => set({ toolsPanelOpen: open }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setCurrentMouseWorld: (pos) => set({ currentMouseWorld: pos }),
  openSliderModal: (pos) => set({ sliderModalPos: pos }),
  closeSliderModal: () => set({ sliderModalPos: null }),
}));
