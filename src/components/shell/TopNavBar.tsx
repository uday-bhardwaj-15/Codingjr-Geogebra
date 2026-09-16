'use client';

import React from "react";
import { Menu, RotateCcw, RotateCw, Settings } from "lucide-react";
import Image from "next/image";
import { AppSwitcherDropdown } from "./AppSwitcherDropdown";
import { AppId, APPS } from "../../config/appConfig";
import { useConstructionStore } from "../../store/useConstructionStore";

interface TopNavBarProps {
  appId?: AppId;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ appId = 'graphing' }) => {
  const { undo, redo, canUndo, canRedo } = useConstructionStore();
  const config = APPS[appId] || APPS.graphing;

  return (
    <header className="h-13 bg-white border-b border-[#e0e0e0] flex items-center justify-between px-4 shrink-0 z-30 select-none">
      {/* Left Section: Menu + GeoGebra Logo + Mode Selector Dropdown */}
      <div className="flex items-center gap-4">
        <button
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#5f6368] transition-colors cursor-pointer"
          aria-label="Main Menu"
          title="Main Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[21px] font-medium tracking-tight text-[#202124] flex items-center gap-1.5">
              <Image
                src="/codingjr.webp"
                alt="Coding jr logo"
                height={32}
                width={100}
                style={{ height: 'auto', width: 'auto', maxHeight: '32px' }}
                priority
              />
            </span>
          </div>

          {/* App Switcher Dropdown */}
          <AppSwitcherDropdown currentAppId={appId} />
        </div>
      </div>

      {/* Right Section: Toolbar items for canvas-less apps like Scientific */}
      {!config.hasCanvas && (
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-full transition-colors ${
              canUndo
                ? 'hover:bg-gray-100 text-[#5f6368] hover:text-[#202124] cursor-pointer'
                : 'cursor-not-allowed opacity-30 text-[#80868b]'
            }`}
          >
            <RotateCcw className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-full transition-colors ${
              canRedo
                ? 'hover:bg-gray-100 text-[#5f6368] hover:text-[#202124] cursor-pointer'
                : 'cursor-not-allowed opacity-30 text-[#80868b]'
            }`}
          >
            <RotateCw className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      )}
    </header>
  );
};
