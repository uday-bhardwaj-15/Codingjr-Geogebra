import React from 'react';
import { ToolDefinition } from '../../types/tools';
import { clsx } from 'clsx';
import {
  MousePointer2,
  Dot,
  SlidersHorizontal,
  Plus,
  Maximize,
  Scissors,
  TrendingUp,
  MousePointer,
  Move,
  Trash2,
  Type,
  EyeOff,
  Image as ImageIcon,
  Ruler,
  FlipHorizontal,
  FlipVertical,
  Navigation,
  CircleDot,
  SplitSquareHorizontal,
  MoveDiagonal,
  ScissorsLineDashed,
  Spline as SplineIcon,
  Circle,
  PenLine,
  Divide,
  ArrowUpRight,
  Sparkles,
  Layers,
  Shapes,
  PenTool,
  CheckSquare,
} from 'lucide-react';

interface ToolTileProps {
  tool: ToolDefinition;
  isActive: boolean;
  onSelect: (toolId: string) => void;
}

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
  'copy-visual-style': Sparkles,
  image: ImageIcon,
  text: Type,
  angle: Ruler,
  'distance-length': Ruler,
  area: Maximize,
  'angle-given-size': Ruler,
  slope: TrendingUp,
  'reflect-line': FlipHorizontal,
  'reflect-point': FlipVertical,
  'translate-vector': Navigation,
  'rotate-around-point': Navigation,
  'dilate-from-point': Maximize,
  'reflect-about-circle': CircleDot,
  'midpoint-center': CircleDot,
  'perpendicular-line': SplitSquareHorizontal,
  'perpendicular-bisector': ScissorsLineDashed,
  'parallel-line': MoveDiagonal,
  'angle-bisector': SplineIcon,
  tangents: TrendingUp,
  locus: SplineIcon,
  segment: PenLine,
  line: Divide,
  ray: ArrowUpRight,
  vector: Navigation,
  'segment-given-length': PenLine,
  'vector-from-point': Navigation,
  'polar-diameter-line': Divide,
  polyline: PenLine,
  'circle-center-point': Circle,
  compass: CircleDot,
  semicircle: Circle,
  'circle-center-radius': Circle,
  'circle-three-points': Circle,
  'circular-arc': Circle,
  'circumcircular-arc': Circle,
  'circular-sector': CircleDot,
  'circumcircular-sector': CircleDot,
  'point-on-object': Dot,
  'attach-detach-point': Dot,
  'complex-number': Dot,
  list: Layers,
  polygon: Shapes,
  'regular-polygon': Shapes,
  'vector-polygon': Shapes,
  'rigid-polygon': Shapes,
  ellipse: CircleDot,
  'conic-five-points': CircleDot,
  parabola: SplineIcon,
  hyperbola: SplineIcon,
  pen: PenTool,
  'freehand-shape': PenTool,
  relation: Sparkles,
  button: CheckSquare,
  'check-box': CheckSquare,
  'input-box': Type,
};

export const ToolTile: React.FC<ToolTileProps> = ({ tool, isActive, onSelect }) => {
  const Icon = iconMap[tool.id] || MousePointer2;
  const isEnabled = tool.enabled !== false;

  return (
    <button
      onClick={() => {
        if (isEnabled) {
          onSelect(tool.id);
        }
      }}
      disabled={!isEnabled}
      className={clsx(
        'relative flex flex-col items-center justify-center p-2 rounded-lg transition-all border h-20 group',
        !isEnabled && 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 hover:bg-gray-50',
        isEnabled && isActive && 'bg-[#efecff] text-[#6d4aff] border-[#dcd6ff] shadow-xs',
        isEnabled && !isActive && 'border-transparent hover:bg-gray-100 text-[var(--gk-text)] cursor-pointer'
      )}
      aria-label={`${tool.label}. ${tool.description}`}
      title={isEnabled ? tool.description : `${tool.label} (Coming soon)`}
    >
      <Icon className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
      <span className="text-[11px] leading-tight text-center px-0.5 line-clamp-2">
        {tool.label}
      </span>
      {!isEnabled && (
        <span className="absolute -top-1 -right-1 text-[9px] font-semibold bg-gray-200 text-gray-600 px-1 py-0.2 rounded-full scale-85">
          Soon
        </span>
      )}
    </button>
  );
};
