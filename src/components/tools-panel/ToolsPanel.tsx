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
    <div className="w-72 h-full bg-white border-r border-[#e0e0e0] px-4 py-4 overflow-y-auto flex flex-col justify-between select-none">
      <div>
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
      </div>

      <div className="mt-4 mb-2 flex justify-center">
        <button
          onClick={toggleToolsExpanded}
          className="flex items-center gap-1.5 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#6557d2] hover:bg-[#f3f1fd] rounded-full border border-[#dadce0] transition-colors cursor-pointer"
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


