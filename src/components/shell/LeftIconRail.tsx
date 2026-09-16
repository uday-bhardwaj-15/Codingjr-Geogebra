'use client';

import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { AppId, APPS } from '../../config/appConfig';
import { clsx } from 'clsx';

interface LeftIconRailProps {
  appId?: AppId;
}

export const LeftIconRail: React.FC<LeftIconRailProps> = ({ appId = 'graphing' }) => {
  const { activeLeftTab, setActiveLeftTab, toggleToolsPanel, toolsPanelOpen } = useUIStore();
  const config = APPS[appId] || APPS.graphing;

  const handleTabClick = (tab: 'algebra' | 'tools' | 'table' | 'spreadsheet' | 'distribution') => {
    if (activeLeftTab === tab) {
      toggleToolsPanel();
    } else {
      setActiveLeftTab(tab);
      if (!toolsPanelOpen) toggleToolsPanel();
    }
  };

  const allTabs = [
    {
      id: 'algebra',
      label: 'Algebra',
      isActive: activeLeftTab === 'algebra' && toolsPanelOpen,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm4-8h2v2h-2zm0 4h2v6h-2z" />
        </svg>
      ),
    },
    {
      id: 'tools',
      label: 'Tools',
      isActive: activeLeftTab === 'tools' && toolsPanelOpen,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      ),
    },
    {
      id: 'table',
      label: 'Table',
      isActive: activeLeftTab === 'table' && toolsPanelOpen,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
        </svg>
      ),
    },
    {
      id: 'spreadsheet',
      label: 'Spreadsheet',
      isActive: activeLeftTab === 'spreadsheet' && toolsPanelOpen,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 19H5v-4h4v4zm0-6H5V9h4v4zm0-6H5V5h4v2zm6 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2zm4 12h-2v-4h2v4zm0-6h-2V9h2v4zm0-6h-2V5h2v2z" />
        </svg>
      ),
    },
    {
      id: 'distribution',
      label: 'Distribution',
      isActive: activeLeftTab === 'distribution' && toolsPanelOpen,
      icon: (
        <svg className="w-5 h-5 fill-current stroke-current" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M4 20c4-1 6-16 8-16s4 15 8 16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ] as const;

  const visibleTabs = allTabs.filter((tab) =>
    config.leftRailTabs.includes(tab.id as any)
  );

  return (
    <aside className="w-14 bg-white border-r border-[#e0e0e0] flex flex-col items-center py-2 shrink-0 z-20 select-none">
      {visibleTabs.map((tab) => {
        const isActive = tab.isActive;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as any)}
            className={clsx(
              'flex flex-col items-center justify-center w-full py-2.5 transition-colors cursor-pointer group',
              isActive
                ? 'text-[#6557d2] font-semibold'
                : 'text-[#5f6368] hover:text-[#202124] hover:bg-gray-50'
            )}
            title={tab.label}
          >
            <div className="flex items-center justify-center mb-1">
              {tab.icon}
            </div>
            <span
              className={clsx(
                'text-[10px] tracking-tight',
                isActive ? 'font-semibold text-[#6557d2]' : 'font-normal text-[#5f6368]'
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
