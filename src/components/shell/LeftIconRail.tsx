import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { Calculator, Wrench, Table, Grid } from 'lucide-react';
import { clsx } from 'clsx';

export const LeftIconRail: React.FC = () => {
  const { activeLeftTab, setActiveLeftTab, toggleToolsPanel, toolsPanelOpen } = useUIStore();

  const handleTabClick = (tab: 'algebra' | 'tools' | 'table' | 'spreadsheet') => {
    if (activeLeftTab === tab) {
      toggleToolsPanel(); // Toggle if clicking the same active tab
    } else {
      setActiveLeftTab(tab);
      if (!toolsPanelOpen) toggleToolsPanel();
    }
  };

  const tabs = [
    { id: 'algebra', icon: Calculator, label: 'Algebra', disabled: false },
    { id: 'tools', icon: Wrench, label: 'Tools', disabled: false },
    { id: 'table', icon: Table, label: 'Table', disabled: false },
    { id: 'spreadsheet', icon: Grid, label: 'Spreadsheet', disabled: false },
  ] as const;

  return (
    <div className="w-16 bg-[var(--gk-bg)] border-r border-[var(--gk-border)] flex flex-col items-center py-2 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeLeftTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id as any)}
            disabled={tab.disabled}
            className={clsx(
              'flex flex-col items-center justify-center w-14 h-14 rounded-lg mb-2 transition-colors',
              isActive ? 'text-[var(--gk-accent)] font-semibold' : 'text-[var(--gk-text-muted)] hover:bg-gray-50',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
            title={tab.disabled ? 'Coming soon' : tab.label}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
