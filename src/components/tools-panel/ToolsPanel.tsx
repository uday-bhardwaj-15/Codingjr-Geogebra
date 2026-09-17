'use client';

import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { COLLAPSED_CATEGORIES, ALL_TOOL_CATEGORIES, TOOLS } from './toolsConfig';
import { CATEGORIES_3D, TOOLS_3D } from './tools3dConfig';
import { ToolCategorySection } from './ToolCategorySection';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AppId, APPS } from '../../config/appConfig';
import { ToolDefinition } from '../../types/tools';

interface ToolsPanelProps {
  appId?: AppId;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ appId = 'graphing' }) => {
  const { activeToolId, setActiveToolId } = useToolStore();
  const { toolsExpanded, toggleToolsExpanded } = useUIStore();
  const config = APPS[appId] || APPS.graphing;

  const isGeometry = appId === 'geometry' && config.geometryCategories;
  const is3D = appId === '3d';

  return (
    <div className="w-72 h-full bg-white border-r border-[#e0e0e0] px-4 py-4 overflow-y-auto flex flex-col justify-between select-none">
      <div>
        {is3D ? (
          // 3D Custom Category Layout
          (toolsExpanded ? CATEGORIES_3D.expanded : CATEGORIES_3D.collapsed).map((cat) => {
            const categoryTools = cat.toolIds
              .map((id) => TOOLS_3D.find((t) => t.id === id))
              .filter((t): t is ToolDefinition => !!t);

            if (categoryTools.length === 0) return null;

            return (
              <ToolCategorySection
                key={cat.id}
                label={cat.label}
                tools={categoryTools}
                activeToolId={activeToolId}
                onSelectTool={setActiveToolId}
              />
            );
          })
        ) : isGeometry && config.geometryCategories ? (
          // Geometry Custom Category Layout
          (toolsExpanded
            ? config.geometryCategories.expanded
            : config.geometryCategories.collapsed
          ).map((cat) => {
            const categoryTools = cat.toolIds
              .map((id) => TOOLS.find((t) => t.id === id))
              .filter((t): t is ToolDefinition => !!t);

            if (categoryTools.length === 0) return null;

            return (
              <ToolCategorySection
                key={cat.id}
                label={cat.label}
                tools={categoryTools}
                activeToolId={activeToolId}
                onSelectTool={setActiveToolId}
              />
            );
          })
        ) : (
          // Standard / Graphing Category Layout
          (toolsExpanded ? ALL_TOOL_CATEGORIES : COLLAPSED_CATEGORIES).map((category) => {
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
          })
        )}
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
