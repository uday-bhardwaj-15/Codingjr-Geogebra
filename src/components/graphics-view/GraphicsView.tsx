'use client';

import React from 'react';
import { CanvasSurface } from './CanvasSurface';
import { Settings, Maximize, ZoomIn, ZoomOut, Home, Undo, Redo } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useViewStore } from '../../store/useViewStore';

export const GraphicsView: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useConstructionStore();
  const { setViewport } = useViewStore();

  return (
    <div className="flex-1 relative flex flex-col">
      <CanvasSurface />

      {/* Undo/Redo overlay */}
      <div className="absolute top-4 left-4 flex shadow-sm bg-white rounded-lg border border-[var(--gk-border)]">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-l-lg border-r border-[var(--gk-border)] transition-opacity ${
            canUndo ? 'hover:bg-gray-100 cursor-pointer opacity-100' : 'cursor-not-allowed opacity-35'
          }`}
        >
          <Undo className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          className={`p-2 rounded-r-lg transition-opacity ${
            canRedo ? 'hover:bg-gray-100 cursor-pointer opacity-100' : 'cursor-not-allowed opacity-35'
          }`}
        >
          <Redo className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
      </div>

      {/* Settings overlay */}
      <div className="absolute top-4 right-4 shadow-sm bg-white rounded-lg border border-[var(--gk-border)]">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
      </div>

      {/* Zoom/View Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col shadow-sm bg-white rounded-lg border border-[var(--gk-border)]">
        <button 
          onClick={() => setViewport({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 })}
          className="p-2 hover:bg-gray-100 border-b border-[var(--gk-border)] rounded-t-lg"
        >
          <Home className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <button className="p-2 hover:bg-gray-100 border-b border-[var(--gk-border)]">
          <ZoomIn className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <button className="p-2 hover:bg-gray-100 border-b border-[var(--gk-border)]">
          <ZoomOut className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-b-lg">
          <Maximize className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
      </div>
    </div>
  );
};
