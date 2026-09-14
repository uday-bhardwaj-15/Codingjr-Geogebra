'use client';

import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { TOOL_CATEGORIES, TOOLS } from './toolsConfig';
import { ToolCategorySection } from './ToolCategorySection';

export const ToolsPanel: React.FC = () => {
  const { activeToolId, setActiveToolId } = useToolStore();

  return (
    <div className="w-80 h-full bg-[var(--gk-bg)] border-r border-[var(--gk-border)] p-4 overflow-y-auto">
      {TOOL_CATEGORIES.map((category) => {
        const categoryTools = TOOLS.filter((t) => t.category === category.id);
        return (
          <ToolCategorySection
            key={category.id}
            label={category.label}
            tools={categoryTools}
            activeToolId={activeToolId}
            onSelectTool={setActiveToolId}
          />
        );
      })}
      
      <div className="mt-8 mb-4 flex justify-center">
        <button className="px-6 py-2 text-sm font-medium text-[var(--gk-accent)] rounded-full hover:bg-gray-100 border border-[var(--gk-border)]">
          MORE
        </button>
      </div>
    </div>
  );
};
