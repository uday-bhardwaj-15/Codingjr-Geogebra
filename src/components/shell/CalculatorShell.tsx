'use client';

import React, { useEffect } from 'react';
import { TopNavBar } from './TopNavBar';
import { LeftIconRail } from './LeftIconRail';
import { useUIStore } from '../../store/useUIStore';
import { useToolStore } from '../../store/useToolStore';
import { useViewStore } from '../../store/useViewStore';
import { useConstructionStore } from '../../store/useConstructionStore';
import { TOOLS } from '../tools-panel/toolsConfig';
import { TOOLS_3D } from '../tools-panel/tools3dConfig';
import { ToolsPanel } from '../tools-panel/ToolsPanel';
import { GraphicsView } from '../graphics-view/GraphicsView';
import { GraphicsView3D } from '../graphics-view-3d/GraphicsView3D';
import { CasRowList } from '../cas-view/CasRowList';
import { AlgebraView } from '../algebra-view/AlgebraView';
import { TableView } from '../table-view/TableView';
import { SpreadsheetView } from '../spreadsheet-view/SpreadsheetView';
import { DistributionCanvas } from '../probability-view/DistributionCanvas';
import { DistributionPanel } from '../probability-view/DistributionPanel';
import { DistributionViewControls } from '../probability-view/DistributionViewControls';
import { SliderModal } from '../ui/SliderModal';
import { AlertModal } from '../ui/AlertModal';
import { ValueInputModal } from '../ui/ValueInputModal';
import { MathKeyboard } from '../ui/MathKeyboard';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { AppId, APPS } from '../../config/appConfig';

interface CalculatorShellProps {
  appId?: AppId;
}

export const CalculatorShell: React.FC<CalculatorShellProps> = ({ appId = 'graphing' }) => {
  const { toolsPanelOpen, activeLeftTab, setActiveLeftTab } = useUIStore();
  const { switchApp } = useConstructionStore();
  const { initForApp } = useViewStore();
  useKeyboardShortcuts();

  const config = APPS[appId] || APPS.graphing;

  // Initialize and synchronize state for active app
  useEffect(() => {
    switchApp(appId);
    initForApp(config.defaultAxesVisible ?? true);

    // If current tab is not valid for this app, reset to first available tab
    if (!config.leftRailTabs.includes(activeLeftTab)) {
      setActiveLeftTab(config.leftRailTabs[0]);
    }
  }, [appId, config, switchApp, initForApp, activeLeftTab, setActiveLeftTab]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white select-none">
      <TopNavBar appId={appId} />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftIconRail appId={appId} />

        {/* 1. App with Graphics Canvas (Graphing, Geometry, CAS & 3D Calculator) */}
        {config.hasCanvas && (
          <>
            {/* Flyout Sidebar Panel */}
            {toolsPanelOpen && (
              <div className="flex-shrink-0 h-full overflow-hidden bg-white border-r border-[#e0e0e0]">
                {activeLeftTab === 'tools' && <ToolsPanel appId={appId} />}
                {activeLeftTab === 'algebra' && (
                  appId === 'cas' ? (
                    <CasRowList />
                  ) : (
                    <div className="w-80 h-full bg-white overflow-y-auto">
                      <AlgebraView variant="sidebar" />
                    </div>
                  )
                )}
                {activeLeftTab === 'table' && (
                  <div className="w-80 h-full bg-white overflow-y-auto">
                    <TableView variant="sidebar" />
                  </div>
                )}
                {activeLeftTab === 'spreadsheet' && (
                  <div className="w-80 h-full bg-white overflow-y-auto">
                    <SpreadsheetView />
                  </div>
                )}
              </div>
            )}

            {/* Main Graphics Canvas Area: 3D or 2D Canvas */}
            {config.canvasType === '3d' ? <GraphicsView3D /> : <GraphicsView />}
          </>
        )}

        {/* 2. Probability App (Left Distribution Panel + Main Bell Curve Canvas) */}
        {appId === 'probability' && (
          <div className="flex flex-1 h-full overflow-hidden relative">
            {toolsPanelOpen && <DistributionPanel />}
            <div className="flex-1 h-full relative overflow-hidden bg-white">
              <DistributionCanvas />
              <DistributionViewControls />
            </div>
          </div>
        )}

        {/* 3. Scientific Calculator App (Full-Page Algebra or Table View) */}
        {appId === 'scientific' && (
          <div className="flex-1 h-full overflow-hidden bg-white">
            {activeLeftTab === 'algebra' && <AlgebraView variant="fullpage" />}
            {activeLeftTab === 'table' && <TableView variant="fullpage" />}
          </div>
        )}

        {/* Modals & Keyboard */}
        <SliderModal />
        <AlertModal />
        <ValueInputModal />
        <MathKeyboard />
      </div>

      {/* Tool Guidance Bar for Canvas Apps */}
      {config.hasCanvas && <BottomTooltip />}
    </div>
  );
};

const BottomTooltip: React.FC = () => {
  const activeToolId = useToolStore((state) => state.activeToolId);
  const activeTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS_3D.find((t) => t.id === activeToolId);
  if (!activeTool || activeToolId === 'move') return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#202124]/90 backdrop-blur-xs text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 z-40 animate-in fade-in duration-150">
      <span className="font-semibold text-xs text-[#a4a0f4]">{activeTool.label}</span>
      <span className="text-xs text-gray-200">{activeTool.description}</span>
    </div>
  );
};
