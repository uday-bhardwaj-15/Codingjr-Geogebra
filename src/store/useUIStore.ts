import { create } from 'zustand';
import { PointCoords } from '../core/geometry/Point';

export interface AlertModalProps {
  title: string;
  message: string;
  onOk?: () => void;
}

export interface ValueInputModalProps {
  title: string;
  label?: string;
  defaultValue?: string;
  inputType?: 'text' | 'number' | 'angle';
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export type ActiveModal =
  | { type: 'alert'; props: AlertModalProps }
  | { type: 'valueInput'; props: ValueInputModalProps }
  | null;

export interface UIState {
  toolsPanelOpen: boolean;
  toolsExpanded: boolean;
  activeLeftTab: 'algebra' | 'tools' | 'table' | 'spreadsheet';
  currentMouseWorld: PointCoords | null;
  sliderModalPos: PointCoords | null;
  activeModal: ActiveModal;
  toggleToolsPanel: () => void;
  toggleToolsExpanded: () => void;
  setToolsPanelOpen: (open: boolean) => void;
  setActiveLeftTab: (tab: 'algebra' | 'tools' | 'table' | 'spreadsheet') => void;
  setCurrentMouseWorld: (pos: PointCoords | null) => void;
  openSliderModal: (pos: PointCoords) => void;
  closeSliderModal: () => void;
  openAlertModal: (title: string, message: string, onOk?: () => void) => void;
  openValueInputModal: (config: ValueInputModalProps) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toolsPanelOpen: true,
  toolsExpanded: false,
  activeLeftTab: 'tools',
  currentMouseWorld: null,
  sliderModalPos: null,
  activeModal: null,
  toggleToolsPanel: () => set((state) => ({ toolsPanelOpen: !state.toolsPanelOpen })),
  toggleToolsExpanded: () => set((state) => ({ toolsExpanded: !state.toolsExpanded })),
  setToolsPanelOpen: (open) => set({ toolsPanelOpen: open }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setCurrentMouseWorld: (pos) => set({ currentMouseWorld: pos }),
  openSliderModal: (pos) => set({ sliderModalPos: pos }),
  closeSliderModal: () => set({ sliderModalPos: null }),
  openAlertModal: (title, message, onOk) =>
    set({
      activeModal: {
        type: 'alert',
        props: { title, message, onOk },
      },
    }),
  openValueInputModal: (config) =>
    set({
      activeModal: {
        type: 'valueInput',
        props: config,
      },
    }),
  closeModal: () => set({ activeModal: null }),
}));
