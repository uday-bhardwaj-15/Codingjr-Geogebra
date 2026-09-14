'use client';

import React from 'react';
import { TopNavBar } from './TopNavBar';
import { LeftIconRail } from './LeftIconRail';
import { useUIStore } from '../../store/useUIStore';
import { ToolsPanel } from '../tools-panel/ToolsPanel';
import { GraphicsView } from '../graphics-view/GraphicsView';
import { AlgebraView } from '../algebra-view/AlgebraView';
import { TableView } from '../table-view/TableView';
import { SpreadsheetView } from '../spreadsheet-view/SpreadsheetView';
import { SliderModal } from '../ui/SliderModal';

export const CalculatorShell: React.FC = () => {
  const { toolsPanelOpen, activeLeftTab } = useUIStore();

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <TopNavBar />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftIconRail />
        
        {/* Flyout Panel */}
        {toolsPanelOpen && (
          <div className="flex-shrink-0 h-full overflow-y-auto border-r border-[var(--gk-border)]">
            {activeLeftTab === 'tools' && <ToolsPanel />}
            {activeLeftTab === 'algebra' && <AlgebraView />}
            {activeLeftTab === 'table' && <TableView />}
            {activeLeftTab === 'spreadsheet' && <SpreadsheetView />}
          </div>
        )}

        {/* Main Canvas */}
        <GraphicsView />
        
        {/* Bottom Tooltip */}
        <BottomTooltip />
        
        {/* Modals */}
        <SliderModal />
      </div>
    </div>
  );
};

const BottomTooltip: React.FC = () => {
  const { activeToolId: storeActiveToolId } = require('../../store/useToolStore').useToolStore();
  const { TOOLS } = require('../tools-panel/toolsConfig');
  
  const activeTool = TOOLS.find((t: any) => t.id === storeActiveToolId);
  if (!activeTool || storeActiveToolId === 'move') return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#292929] text-white p-4 flex justify-between items-center z-50">
      <div>
        <div className="font-bold text-sm">{activeTool.label}</div>
        <div className="text-gray-300 text-sm mt-1">{activeTool.description}</div>
      </div>
      <button className="text-[#a4a0f4] text-sm font-medium hover:text-white transition-colors">
        Help
      </button>
    </div>
  );
};
