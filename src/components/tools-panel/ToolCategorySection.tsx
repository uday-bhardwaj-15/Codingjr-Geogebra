import React from 'react';
import { ToolDefinition } from '../../types/tools';
import { ToolTile } from './ToolTile';

interface ToolCategorySectionProps {
  label: string;
  tools: ToolDefinition[];
  activeToolId: string;
  onSelectTool: (id: string) => void;
}

export const ToolCategorySection: React.FC<ToolCategorySectionProps> = ({
  label,
  tools,
  activeToolId,
  onSelectTool,
}) => {
  if (tools.length === 0) return null;
  
  return (
    <div className="mb-5">
      <h3 className="text-[13px] font-semibold text-[#202124] mb-2 px-1 tracking-tight">
        {label}
      </h3>
      <div className="grid grid-cols-3 gap-x-1 gap-y-2">
        {tools.map((tool) => (
          <ToolTile
            key={tool.id}
            tool={tool}
            isActive={tool.id === activeToolId}
            onSelect={onSelectTool}
          />
        ))}
      </div>
    </div>
  );
};


