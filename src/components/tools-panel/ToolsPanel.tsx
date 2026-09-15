'use client';

import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { COLLAPSED_CATEGORIES, ALL_TOOL_CATEGORIES, TOOLS } from './toolsConfig';
import { ToolCategorySection } from './ToolCategorySection';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ToolsPanel: React.FC = () => {
  const { activeToolId, setActiveToolId } = useToolStore();
  const { toolsExpanded, toggleToolsExpanded } = useUIStore();

  const categories = toolsExpanded ? ALL_TOOL_CATEGORIES : COLLAPSED_CATEGORIES;

  return (
    <div className="w-80 h-full bg-[var(--gk-bg)] border-r border-[var(--gk-border)] p-4 overflow-y-auto pb-16">
      {categories.map((category) => {
        const categoryTools = TOOLS.filter((t) => {
          if (t.category !== category.id) return false;
          if (!toolsExpanded && t.isExpandedOnly) return false;
          return true;
        });

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

      <div className="mt-6 mb-6 flex justify-center">
        <button
          onClick={toggleToolsExpanded}
          className="flex items-center gap-1.5 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--gk-accent)] rounded-full hover:bg-[#ede9fe] border border-[var(--gk-border)] transition-all cursor-pointer shadow-2xs"
        >
          {toolsExpanded ? (
            <>
              LESS <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              MORE <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
