'use client';

import React from 'react';
import { TopNavBar } from './TopNavBar';
import { LeftIconRail } from './LeftIconRail';
import { useUIStore } from '../../store/useUIStore';
import { useToolStore } from '../../store/useToolStore';
import { TOOLS } from '../tools-panel/toolsConfig';
import { ToolsPanel } from '../tools-panel/ToolsPanel';
import { GraphicsView } from '../graphics-view/GraphicsView';
import { AlgebraView } from '../algebra-view/AlgebraView';
import { TableView } from '../table-view/TableView';
import { SpreadsheetView } from '../spreadsheet-view/SpreadsheetView';
import { SliderModal } from '../ui/SliderModal';
import { AlertModal } from '../ui/AlertModal';
import { ValueInputModal } from '../ui/ValueInputModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const CalculatorShell: React.FC = () => {
  const { toolsPanelOpen, activeLeftTab } = useUIStore();
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white select-none">
      <TopNavBar />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftIconRail />

        {/* Flyout Sidebar Panel */}
        {toolsPanelOpen && (
          <div className="flex-shrink-0 h-full overflow-hidden bg-white border-r border-[#e0e0e0]">
            {activeLeftTab === 'tools' && <ToolsPanel />}
            {activeLeftTab === 'algebra' && (
              <div className="w-80 h-full bg-white overflow-y-auto">
                <AlgebraView />
              </div>
            )}
            {activeLeftTab === 'table' && (
              <div className="w-80 h-full bg-white overflow-y-auto">
                <TableView />
              </div>
            )}
            {activeLeftTab === 'spreadsheet' && (
              <div className="w-80 h-full bg-white overflow-y-auto">
                <SpreadsheetView />
              </div>
            )}
          </div>
        )}

        {/* Main Canvas Area */}
        <GraphicsView />

        {/* Modals */}
        <SliderModal />
        <AlertModal />
        <ValueInputModal />
      </div>

      {/* Subtle Tool Guidance Bar at bottom */}
      <BottomTooltip />
    </div>
  );
};

const BottomTooltip: React.FC = () => {
  const activeToolId = useToolStore((state) => state.activeToolId);
  const activeTool = TOOLS.find((t) => t.id === activeToolId);
  if (!activeTool || activeToolId === 'move') return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#202124]/90 backdrop-blur-xs text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 z-40 animate-in fade-in duration-150">
      <span className="font-semibold text-xs text-[#a4a0f4]">{activeTool.label}</span>
      <span className="text-xs text-gray-200">{activeTool.description}</span>
    </div>
  );
};

