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
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-[var(--gk-text-muted)] uppercase tracking-wider mb-3 px-1">
        {label}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
