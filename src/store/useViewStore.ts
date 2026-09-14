import { create } from 'zustand';
import { Viewport } from '../types/geo';

interface ViewState {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
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
  setViewport: (viewport) => set({ viewport }),
  pan: (dx, dy) => set((state) => ({
    viewport: {
      xMin: state.viewport.xMin - dx,
      xMax: state.viewport.xMax - dx,
      yMin: state.viewport.yMin - dy,
      yMax: state.viewport.yMax - dy,
    },
  })),
  zoom: (factor, centerX, centerY) => set((state) => {
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
