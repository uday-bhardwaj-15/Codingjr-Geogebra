import React from 'react';
import { ToolDefinition } from '../../types/tools';
import { clsx } from 'clsx';
import {
  MousePointer2, Dot, SlidersHorizontal, Plus, Maximize, Scissors, TrendingUp,
  MousePointer, Move, Trash2, Type, EyeOff, Image as ImageIcon,
  Angle, Ruler, Spline, FlipHorizontal, FlipVertical, Navigation,
  CircleDot, SplitSquareHorizontal, MoveDiagonal, ScissorsLineDashed,
  Spline as SplineIcon, Circle, PenLine, Divide, ArrowUpRight
} from 'lucide-react'; // Placeholder icons for now

interface ToolTileProps {
  tool: ToolDefinition;
  isActive: boolean;
  onSelect: (toolId: string) => void;
}

// Map tool ids to lucide icons temporarily
const iconMap: Record<string, React.FC<any>> = {
  move: MousePointer2,
  point: Dot,
  slider: SlidersHorizontal,
  intersect: Plus,
  extremum: Maximize,
  roots: Scissors,
  'best-fit-line': TrendingUp,
  'select-objects': MousePointer,
  'move-graphics-view': Move,
  delete: Trash2,
  'show-hide-label': Type,
  'show-hide-object': EyeOff,
  image: ImageIcon,
  text: Type,
  angle: Ruler,
  'distance-length': Ruler,
  area: Maximize,
  'reflect-line': FlipHorizontal,
  'reflect-point': FlipVertical,
  'translate-vector': Navigation,
  'midpoint-center': CircleDot,
  'perpendicular-line': SplitSquareHorizontal,
  'perpendicular-bisector': ScissorsLineDashed,
  'parallel-line': MoveDiagonal,
  'angle-bisector': SplineIcon,
  tangents: TrendingUp,
  segment: PenLine,
  line: Divide,
  ray: ArrowUpRight,
  vector: Navigation,
  'circle-center-point': Circle,
  compass: CircleDot,
  semicircle: Circle,
};

export const ToolTile: React.FC<ToolTileProps> = ({ tool, isActive, onSelect }) => {
  const Icon = iconMap[tool.id] || MousePointer2;
  
  return (
    <button
      onClick={() => onSelect(tool.id)}
      className={clsx(
        'flex flex-col items-center justify-center p-2 rounded-lg transition-colors border border-transparent h-20',
        isActive ? 'bg-[#efecff] text-[#6d4aff] border-[#dcd6ff]' : 'hover:bg-gray-100 text-[var(--gk-text)]',
      )}
      aria-label={`${tool.label}. ${tool.description}`}
      title={tool.description}
    >
      <Icon className="w-6 h-6 mb-2" strokeWidth={1.5} />
      <span className="text-[11px] leading-tight text-center px-1">
        {tool.label}
      </span>
    </button>
  );
};
