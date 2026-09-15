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

// Custom GeoGebra specific icon renderers for pixel-perfect match to screenshot
const renderCustomGeoGebraIcon = (toolId: string, isActive: boolean) => {
  const activeColor = '#6557d2';
  const defaultColor = '#3c4043';
  const color = isActive ? activeColor : defaultColor;

  switch (toolId) {
    case 'move':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
          <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
        </svg>
      );
    case 'point':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1565ef] shadow-xs" />
          <span className="absolute top-0 right-0 text-[9px] font-bold text-[#1565ef] leading-none">A</span>
        </div>
      );
    case 'slider':
      return (
        <div className="flex flex-col items-center justify-center w-6 h-6">
          <span className="text-[9px] font-medium text-[#5f6368] leading-none mb-0.5">a = 2</span>
          <div className="w-5 h-0.5 bg-[#5f6368] relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3c4043]" />
          </div>
        </div>
      );
    case 'intersect':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8" fill="none">
          <path d="M4 20L20 4M4 4l16 16" />
          <circle cx="12" cy="12" r="2.5" fill="#dc2626" stroke="#dc2626" />
        </svg>
      );
    case 'extremum':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8" fill="none">
          <path d="M3 19c4-14 8-14 12 0 3-10 6-10 6-10" />
          <circle cx="9" cy="7" r="2" fill="#dc2626" stroke="#dc2626" />
          <circle cx="15" cy="19" r="2" fill="#dc2626" stroke="#dc2626" />
        </svg>
      );
    case 'roots':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8" fill="none">
          <path d="M3 12h18" stroke="#9ca3af" strokeDasharray="2 2" />
          <path d="M4 6c3 12 6 12 9 0s5 12 7 0" />
          <circle cx="7" cy="12" r="2" fill="#dc2626" stroke="#dc2626" />
          <circle cx="16" cy="12" r="2" fill="#dc2626" stroke="#dc2626" />
        </svg>
      );
    case 'best-fit-line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="18" r="1.5" fill="#1565ef" />
          <circle cx="8" cy="13" r="1.5" fill="#dc2626" />
          <circle cx="12" cy="15" r="1.5" fill="#1565ef" />
          <circle cx="15" cy="9" r="1.5" fill="#dc2626" />
          <circle cx="19" cy="6" r="1.5" fill="#1565ef" />
          <path d="M3 20L21 4" stroke="#6557d2" strokeWidth="1.8" />
        </svg>
      );
    case 'select-objects':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="3 2">
          <rect x="3" y="4" width="18" height="16" rx="1" />
        </svg>
      );
    case 'move-graphics-view':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3 3h-2v4h4V7l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2L4 10l3-3v2h4V5H9l3-3z" />
        </svg>
      );
    case 'delete':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" />
        </svg>
      );
    case 'show-hide-label':
      return (
        <div className="flex items-center justify-center font-bold text-sm text-[#3c4043] tracking-tighter">
          <span>A</span><span className="text-xs">A</span>
        </div>
      );
    case 'show-hide-object':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#1565ef]/40 border border-[#1565ef]" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-[#1565ef]" />
        </div>
      );
    case 'image':
      return <ImageIcon className="w-6 h-6 stroke-[1.8]" stroke={color} />;
    case 'text':
      return <span className="font-bold text-xs text-[#3c4043]">ABC</span>;
    default:
      return null;
  }
};

const fallbackIconMap: Record<string, React.FC<any>> = {
  segment: PenLine,
  line: Divide,
  ray: ArrowUpRight,
  vector: Navigation,
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
};

export const ToolTile: React.FC<ToolTileProps> = ({ tool, isActive, onSelect }) => {
  const customIcon = renderCustomGeoGebraIcon(tool.id, isActive);
  const FallbackIcon = fallbackIconMap[tool.id] || MousePointer2;
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
        'group flex flex-col items-center justify-start p-1.5 rounded-lg transition-colors cursor-pointer w-full min-h-[70px]',
        !isEnabled && 'opacity-40 cursor-not-allowed',
        isActive
          ? 'text-[#6557d2]'
          : 'text-[#3c4043] hover:bg-gray-100/80 hover:text-[#202124]'
      )}
      aria-label={`${tool.label}. ${tool.description}`}
      title={isEnabled ? tool.description : `${tool.label} (Coming soon)`}
    >
      <div className="w-8 h-8 flex items-center justify-center mb-1">
        {customIcon || <FallbackIcon className={clsx('w-6 h-6 stroke-[1.8]', isActive ? 'text-[#6557d2]' : 'text-[#3c4043]')} />}
      </div>

      <span
        className={clsx(
          'text-[11px] leading-tight text-center px-0.5 line-clamp-2',
          isActive ? 'text-[#6557d2] font-semibold' : 'text-[#3c4043] font-normal group-hover:text-[#202124]'
        )}
      >
        {tool.label}
      </span>
    </button>
  );
};


