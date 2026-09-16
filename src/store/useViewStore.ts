import { create } from 'zustand';
import { Viewport } from '../types/geo';

interface ViewState {
  viewport: Viewport;
  showAxes: boolean;
  showGrid: boolean;
  setViewport: (viewport: Viewport) => void;
  setShowAxes: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  toggleAxes: () => void;
  toggleGrid: () => void;
  initForApp: (defaultAxesVisible?: boolean) => void;
  zoom: (factor: number, centerX: number, centerY: number) => void;
  pan: (dx: number, dy: number) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewport: {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  },
  showAxes: true,
  showGrid: true,
  setViewport: (viewport) => set({ viewport }),
  setShowAxes: (showAxes) => set({ showAxes }),
  setShowGrid: (showGrid) => set({ showGrid }),
  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  initForApp: (defaultAxesVisible = true) =>
    set({
      showAxes: defaultAxesVisible,
      showGrid: true,
      viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    }),
  pan: (dx, dy) =>
    set((state) => ({
      viewport: {
        xMin: state.viewport.xMin - dx,
        xMax: state.viewport.xMax - dx,
        yMin: state.viewport.yMin - dy,
        yMax: state.viewport.yMax - dy,
      },
    })),
  zoom: (factor, centerX, centerY) =>
    set((state) => {
      const width = (state.viewport.xMax - state.viewport.xMin) * factor;
      const height = (state.viewport.yMax - state.viewport.yMin) * factor;
      return {
        viewport: {
          xMin: centerX - width / 2,
          xMax: centerX + width / 2,
          yMin: centerY - height / 2,
          yMax: centerY + height / 2,
        },
      };
    }),
}));
