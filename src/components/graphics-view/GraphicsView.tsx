'use client';

import React from 'react';
import { CanvasSurface } from './CanvasSurface';
import { Maximize, ZoomIn, ZoomOut, Home, RotateCcw, RotateCw, Settings, Eye } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useViewStore } from '../../store/useViewStore';

export const GraphicsView: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useConstructionStore();
  const { viewport, setViewport, zoom, showAxes, showGrid, toggleAxes, toggleGrid } = useViewStore();
  const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
  const [showGridMenu, setShowGridMenu] = React.useState(false);

  const handleZoomIn = () => {
    const centerX = (viewport.xMin + viewport.xMax) / 2;
    const centerY = (viewport.yMin + viewport.yMax) / 2;
    zoom(0.8, centerX, centerY);
  };

  const handleZoomOut = () => {
    const centerX = (viewport.xMin + viewport.xMax) / 2;
    const centerY = (viewport.yMin + viewport.yMax) / 2;
    zoom(1.25, centerX, centerY);
  };

  const handleHome = () => {
    setViewport({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-white">
      <CanvasSurface />

      {/* Top-Left Floating Undo / Redo controls */}
      <div className="absolute top-3 left-3 flex items-center gap-1 z-10 select-none">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded-full transition-colors ${
            canUndo
              ? 'hover:bg-gray-200/80 text-[#5f6368] hover:text-[#202124] cursor-pointer'
              : 'cursor-not-allowed opacity-30 text-[#80868b]'
          }`}
        >
          <RotateCcw className="w-5 h-5 stroke-[2.2]" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          className={`p-1.5 rounded-full transition-colors ${
            canRedo
              ? 'hover:bg-gray-200/80 text-[#5f6368] hover:text-[#202124] cursor-pointer'
              : 'cursor-not-allowed opacity-30 text-[#80868b]'
          }`}
        >
          <RotateCw className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Top-Right Floating Settings Gear */}
      <div className="absolute top-3 right-3 z-10 select-none">
        <button
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          title="Settings"
          className="p-1.5 hover:bg-gray-200/80 rounded-full text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>

        {showSettingsMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#dadce0] rounded-xl shadow-lg p-2 text-xs text-[#3c4043] z-50">
            <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={toggleAxes}
                className="accent-[#6557d2] rounded"
              />
              <span>Show Axes</span>
            </label>
            <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={toggleGrid}
                className="accent-[#6557d2] rounded"
              />
              <span>Show Grid</span>
            </label>
          </div>
        )}
      </div>

      {/* Bottom-Right Floating Zoom & View controls pill */}
      <div className="absolute bottom-4 right-3 flex flex-col items-center bg-white border border-[#dadce0] rounded-xl shadow-md p-0.5 z-10 select-none">
        <button
          onClick={handleHome}
          title="Standard View"
          className="p-2 hover:bg-gray-100 rounded-lg text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <Home className="w-4.5 h-4.5 stroke-[2]" />
        </button>
        <div className="w-4 h-px bg-[#e0e0e0]" />
        
        <div className="relative">
          <button
            onClick={() => setShowGridMenu(!showGridMenu)}
            title="Toggle Grid / Axes"
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
              showAxes || showGrid ? 'text-[#6557d2]' : 'text-[#5f6368]'
            }`}
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM10 7H8v3h2V7zm0 4H8v3h2v-3zm0 4H8v3h2v-3zm6-8h-2v3h2V7zm0 4h-2v3h2v-3zm0 4h-2v3h2v-3z" />
            </svg>
          </button>

          {showGridMenu && (
            <div className="absolute right-full bottom-0 mr-2 w-44 bg-white border border-[#dadce0] rounded-xl shadow-lg p-2 text-xs text-[#3c4043] z-50">
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={toggleAxes}
                  className="accent-[#6557d2] rounded"
                />
                <span>Show Axes</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={toggleGrid}
                  className="accent-[#6557d2] rounded"
                />
                <span>Show Grid</span>
              </label>
            </div>
          )}
        </div>

        <div className="w-4 h-px bg-[#e0e0e0]" />
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 hover:bg-gray-100 rounded-lg text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4.5 h-4.5 stroke-[2]" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 hover:bg-gray-100 rounded-lg text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4.5 h-4.5 stroke-[2]" />
        </button>
        <div className="w-4 h-px bg-[#e0e0e0]" />
        <button
          onClick={handleFullscreen}
          title="Full Screen"
          className="p-2 hover:bg-gray-100 rounded-lg text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <Maximize className="w-4.5 h-4.5 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};


