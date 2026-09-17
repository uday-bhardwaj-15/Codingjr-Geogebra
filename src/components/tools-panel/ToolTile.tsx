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
    case 'pen':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      );
    case 'freehand-shape':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 16c4-12 8-12 12 0 3-8 5-8 6-6" stroke="#e53935" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 6l6 14M17 5l3 3" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'relation':
      return (
        <div className="flex flex-col items-center justify-center w-6 h-6 leading-none">
          <span className="text-[10px] font-bold text-[#e53935] leading-none mb-0.5">?</span>
          <span className="text-[9px] font-bold text-[#3c4043] leading-none tracking-tight">a = b</span>
        </div>
      );
    case 'button':
      return (
        <div className="w-6 h-5 border border-[#3c4043] rounded flex items-center justify-center bg-white shadow-xs">
          <span className="text-[8px] font-bold text-[#3c4043]">OK</span>
        </div>
      );
    case 'check-box':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="w-3.5 h-3.5 border border-[#3c4043] rounded-xs flex items-center justify-center mr-1">
            <span className="text-[9px] font-bold text-[#3c4043]">✓</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#6557d2]" />
        </div>
      );
    case 'input-box':
      return (
        <div className="flex items-center justify-center w-6 h-6 gap-0.5">
          <span className="text-[9px] font-medium text-[#3c4043]">a=</span>
          <div className="px-1 py-0.5 border border-[#9ca3af] rounded text-[8px] font-bold text-[#3c4043] bg-white">1</div>
        </div>
      );
    case 'copy-visual-style':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 6H5V5h14v4zM6 13h12v2H6zm0 4h8v2H6z" />
          <path d="M18 17l4 4-1.4 1.4L18 19.8l-2.6 2.6L14 21l4-4z" />
        </svg>
      );
    case 'segment':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth="2" />
          <circle cx="4" cy="20" r="2.5" fill="#1565ef" />
          <circle cx="20" cy="4" r="2.5" fill="#1565ef" />
        </svg>
      );
    case 'line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="2" y1="22" x2="22" y2="2" stroke={color} strokeWidth="1.8" />
          <circle cx="7" cy="17" r="2.2" fill="#1565ef" />
          <circle cx="17" cy="7" r="2.2" fill="#1565ef" />
        </svg>
      );
    case 'ray':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="20" x2="22" y2="2" stroke={color} strokeWidth="1.8" />
          <circle cx="4" cy="20" r="2.5" fill="#1565ef" />
          <circle cx="15" cy="9" r="2" fill="#1565ef" />
        </svg>
      );
    case 'vector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="20" x2="19" y2="5" stroke={color} strokeWidth="2" />
          <polygon points="19,5 14,6 18,10" fill={color} />
          <circle cx="4" cy="20" r="2.2" fill="#1565ef" />
        </svg>
      );
    case 'polygon':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="4,19 20,19 12,4" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.8" />
          <circle cx="4" cy="19" r="2" fill="#1565ef" />
          <circle cx="20" cy="19" r="2" fill="#1565ef" />
          <circle cx="12" cy="4" r="2" fill="#1565ef" />
        </svg>
      );
    case 'regular-polygon':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="12,3 21,9 18,19 6,19 3,9" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.8" />
          <circle cx="6" cy="19" r="1.8" fill="#1565ef" />
          <circle cx="18" cy="19" r="1.8" fill="#1565ef" />
        </svg>
      );
    case 'vector-polygon':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="4,19 20,19 12,4" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.8" />
          <polygon points="12,19 11,17 13,17" fill={color} />
          <polygon points="16,11.5 16,13.5 14,12.5" fill={color} />
          <circle cx="4" cy="19" r="2" fill="#1565ef" />
          <circle cx="20" cy="19" r="2" fill="#1565ef" />
          <circle cx="12" cy="4" r="2" fill="#1565ef" />
        </svg>
      );
    case 'rigid-polygon':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="4,19 20,19 12,4" fill={isActive ? '#6557d250' : '#1565ef40'} stroke={color} strokeWidth="2" />
          <circle cx="4" cy="19" r="2" fill="#1565ef" />
          <circle cx="20" cy="19" r="2" fill="#1565ef" />
          <circle cx="12" cy="4" r="2" fill="#1565ef" />
        </svg>
      );
    case 'circle-center-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2" fill="#1565ef" />
          <circle cx="21" cy="12" r="2" fill="#1565ef" />
        </svg>
      );
    case 'circle-center-radius':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2" fill="#1565ef" />
          <line x1="12" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
          <text x="15" y="10" fontSize="7" fill={color} fontWeight="bold">r</text>
        </svg>
      );
    case 'compass':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <circle cx="12" cy="4" r="2" fill={color} />
          <line x1="12" y1="6" x2="5" y2="21" />
          <line x1="12" y1="6" x2="19" y2="21" />
          <path d="M8 15h8" strokeWidth="1.2" />
        </svg>
      );
    case 'semicircle':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 16a9 9 0 0 1 18 0" stroke={color} strokeWidth="1.8" fill={isActive ? '#6557d220' : '#1565ef15'} />
          <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1.8" />
          <circle cx="3" cy="16" r="2" fill="#1565ef" />
          <circle cx="21" cy="16" r="2" fill="#1565ef" />
        </svg>
      );
    case 'circular-sector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M12 12L20 7A9 9 0 0 0 7 4L12 12Z" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.6" />
          <circle cx="12" cy="12" r="1.8" fill="#1565ef" />
        </svg>
      );
    case 'circular-arc':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M20 7A9 9 0 0 0 7 4" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="12" r="1.8" fill="#1565ef" />
          <circle cx="20" cy="7" r="1.8" fill="#1565ef" />
          <circle cx="7" cy="4" r="1.8" fill="#1565ef" />
        </svg>
      );
    case 'circle-three-points':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          <circle cx="3" cy="12" r="2" fill="#dc2626" />
          <circle cx="12" cy="3" r="2" fill="#dc2626" />
          <circle cx="19" cy="17" r="2" fill="#dc2626" />
        </svg>
      );
    case 'circumcircular-arc':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 17a9 9 0 0 1 15-8" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="4" cy="17" r="2" fill="#dc2626" />
          <circle cx="11" cy="8.5" r="2" fill="#dc2626" />
          <circle cx="19" cy="9" r="2" fill="#dc2626" />
        </svg>
      );
    case 'circumcircular-sector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M12 14L4 17a9 9 0 0 1 15-8L12 14Z" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.6" />
          <circle cx="4" cy="17" r="1.8" fill="#dc2626" />
          <circle cx="19" cy="9" r="1.8" fill="#dc2626" />
        </svg>
      );
    case 'ellipse':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="6" stroke={color} strokeWidth="1.8" />
          <circle cx="7" cy="12" r="1.8" fill="#dc2626" />
          <circle cx="17" cy="12" r="1.8" fill="#dc2626" />
          <circle cx="12" cy="6" r="1.8" fill="#1565ef" />
        </svg>
      );
    case 'parabola':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 5c5 14 13 14 18 0" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="11" r="2" fill="#dc2626" />
          <line x1="3" y1="20" x2="21" y2="20" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'hyperbola':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 4c4 4 4 12 0 16M21 4c-4 4-4 12 0 16" stroke={color} strokeWidth="1.8" />
          <circle cx="7.5" cy="12" r="1.8" fill="#dc2626" />
          <circle cx="16.5" cy="12" r="1.8" fill="#dc2626" />
        </svg>
      );
    case 'conic-five-points':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="9.5" ry="6.5" stroke={color} strokeWidth="1.6" />
          <circle cx="5" cy="9" r="1.6" fill="#dc2626" />
          <circle cx="9" cy="17.5" r="1.6" fill="#dc2626" />
          <circle cx="15" cy="17.5" r="1.6" fill="#dc2626" />
          <circle cx="20" cy="10" r="1.6" fill="#dc2626" />
          <circle cx="12" cy="5.5" r="1.6" fill="#dc2626" />
        </svg>
      );
    case 'midpoint-center':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.8" />
          <circle cx="4" cy="12" r="2" fill="#1565ef" />
          <circle cx="20" cy="12" r="2" fill="#1565ef" />
          <circle cx="12" cy="12" r="2.5" fill="#dc2626" />
        </svg>
      );
    case 'perpendicular-line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.8" />
          <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="1.8" />
          <rect x="12" y="14" width="4" height="4" stroke={color} strokeWidth="1" fill="none" />
          <circle cx="12" cy="8" r="2" fill="#1565ef" />
        </svg>
      );
    case 'perpendicular-bisector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth="1.8" />
          <line x1="12" y1="4" x2="12" y2="20" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="2 2" />
          <circle cx="4" cy="17" r="2" fill="#1565ef" />
          <circle cx="20" cy="17" r="2" fill="#1565ef" />
        </svg>
      );
    case 'parallel-line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="3" y1="8" x2="21" y2="8" stroke={color} strokeWidth="1.8" />
          <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="8" r="2" fill="#1565ef" />
        </svg>
      );
    case 'angle-bisector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1.6" />
          <line x1="4" y1="20" x2="16" y2="5" stroke={color} strokeWidth="1.6" />
          <line x1="4" y1="20" x2="20" y2="10" stroke="#dc2626" strokeWidth="1.6" />
          <circle cx="4" cy="20" r="2" fill="#1565ef" />
        </svg>
      );
    case 'tangents':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="14" cy="14" r="7" stroke={color} strokeWidth="1.6" />
          <line x1="3" y1="4" x2="21" y2="7" stroke="#dc2626" strokeWidth="1.8" />
          <circle cx="3" cy="4" r="2" fill="#1565ef" />
        </svg>
      );
    case 'locus':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 18C8 6 16 6 20 18" stroke={color} strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="12" cy="9" r="2" fill="#dc2626" />
        </svg>
      );
    case 'angle':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="5" y1="19" x2="21" y2="19" stroke={color} strokeWidth="1.8" />
          <line x1="5" y1="19" x2="17" y2="6" stroke={color} strokeWidth="1.8" />
          <path d="M10 19A6 6 0 0 0 8.5 15" stroke="#dc2626" strokeWidth="1.8" />
          <circle cx="5" cy="19" r="2" fill="#1565ef" />
        </svg>
      );
    case 'angle-given-size':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="19" x2="20" y2="19" stroke={color} strokeWidth="1.6" />
            <line x1="4" y1="19" x2="16" y2="6" stroke={color} strokeWidth="1.6" />
            <path d="M9 19A6 6 0 0 0 8 15.5" stroke="#dc2626" strokeWidth="1.6" />
          </svg>
          <span className="absolute top-1 right-0 text-[8px] font-bold text-[#dc2626]">α</span>
        </div>
      );
    case 'distance-length':
      return (
        <div className="flex flex-col items-center justify-center w-6 h-6 leading-none">
          <span className="text-[9px] font-bold text-[#1565ef] mb-0.5">cm</span>
          <div className="w-5 h-0.5 bg-[#3c4043] flex justify-between items-center">
            <div className="w-0.5 h-1.5 bg-[#3c4043]" />
            <div className="w-0.5 h-1.5 bg-[#3c4043]" />
          </div>
        </div>
      );
    case 'area':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <polygon points="4,18 20,18 17,6 7,6" fill={isActive ? '#6557d230' : '#1565ef25'} stroke={color} strokeWidth="1.6" />
          </svg>
          <span className="absolute text-[8px] font-bold text-[#1565ef]">cm²</span>
        </div>
      );
    case 'slope':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <line x1="3" y1="20" x2="21" y2="5" stroke={color} strokeWidth="1.8" />
            <polyline points="10,14.5 17,14.5 17,8" stroke="#dc2626" strokeWidth="1.5" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[8px] font-bold text-[#dc2626]">m</span>
        </div>
      );
    case 'point-on-object':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 17C8 7 16 7 21 17" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="11" r="2.5" fill="#dc2626" />
        </svg>
      );
    case 'attach-detach-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="8" r="2.5" fill="#dc2626" />
          <path d="M12 11v5" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        </svg>
      );
    case 'segment-given-length':
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="16" x2="20" y2="16" stroke={color} strokeWidth="2" />
            <circle cx="4" cy="16" r="2.2" fill="#1565ef" />
          </svg>
          <span className="absolute top-1 text-[9px] font-bold text-[#1565ef]">a = 4</span>
        </div>
      );
    case 'vector-from-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="18" r="2.5" fill="#dc2626" />
          <line x1="5" y1="18" x2="19" y2="6" stroke={color} strokeWidth="1.8" />
          <polygon points="19,6 14,7 18,11" fill={color} />
        </svg>
      );
    case 'polar-diameter-line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.6" />
          <line x1="2" y1="20" x2="22" y2="4" stroke="#dc2626" strokeWidth="1.8" />
        </svg>
      );
    case 'polyline':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polyline points="4,18 9,6 16,14 21,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="4" cy="18" r="1.8" fill="#1565ef" />
          <circle cx="9" cy="6" r="1.8" fill="#1565ef" />
          <circle cx="16" cy="14" r="1.8" fill="#1565ef" />
          <circle cx="21" cy="7" r="1.8" fill="#1565ef" />
        </svg>
      );
    case 'translate-vector':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="4,18 10,18 7,12" stroke="#9ca3af" strokeWidth="1.4" fill="none" />
          <polygon points="14,12 20,12 17,6" stroke={color} strokeWidth="1.6" fill={isActive ? '#6557d220' : '#1565ef20'} />
          <line x1="7" y1="12" x2="17" y2="6" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
        </svg>
      );
    case 'rotate-around-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <polygon points="6,18 12,18 9,12" stroke={color} strokeWidth="1.6" fill={isActive ? '#6557d220' : '#1565ef20'} />
          <circle cx="18" cy="16" r="2" fill="#dc2626" />
          <path d="M12 9a7 7 0 0 1 7 4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'reflect-line':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="2" x2="12" y2="22" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2 2" />
          <polygon points="4,16 9,16 7,8" stroke={color} strokeWidth="1.6" fill={isActive ? '#6557d220' : '#1565ef20'} />
          <polygon points="20,16 15,16 17,8" stroke={color} strokeWidth="1.6" fill={isActive ? '#6557d220' : '#1565ef20'} />
        </svg>
      );
    case 'reflect-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2.2" fill="#dc2626" />
          <circle cx="4" cy="18" r="2.2" fill="#1565ef" />
          <circle cx="20" cy="6" r="2.2" fill="#1565ef" />
          <line x1="4" y1="18" x2="20" y2="6" stroke="#9ca3af" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    case 'dilate-from-point':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="3" cy="21" r="2" fill="#dc2626" />
          <polygon points="8,17 12,17 10,13" stroke={color} strokeWidth="1.2" fill="none" />
          <polygon points="14,13 22,13 18,5" stroke={color} strokeWidth="1.6" fill={isActive ? '#6557d220' : '#1565ef20'} />
        </svg>
      );
    case 'reflect-about-circle':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.6" />
          <circle cx="12" cy="8" r="2" fill="#1565ef" />
          <circle cx="12" cy="1" r="2" fill="#dc2626" />
        </svg>
      );
    case 'cube':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <path d="M12 2L3 7l9 5 9-5-9-5z" fill={isActive ? '#6557d220' : '#1565ef20'} />
          <path d="M3 7v10l9 5V12L3 7z" fill={isActive ? '#6557d230' : '#1565ef30'} />
          <path d="M21 7v10l-9 5V12l9-5z" fill={isActive ? '#6557d240' : '#1565ef40'} />
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
          <path d="M12 12l9-5M12 12v10M12 12L3 7" />
        </svg>
      );
    case 'tetrahedron':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <path d="M12 3L3 18l9 3 9-3L12 3z" fill={isActive ? '#6557d220' : '#1565ef20'} />
          <path d="M12 3v18" />
          <path d="M12 3L3 18h18L12 3z" />
        </svg>
      );
    case 'pyramid':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <path d="M12 3L2 17l10 4 10-4L12 3z" fill={isActive ? '#6557d220' : '#ff704320'} />
          <path d="M12 3v18" />
          <path d="M12 3L2 17h20L12 3z" />
          <path d="M2 17l10 4 10-4" />
        </svg>
      );
    case 'prism':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <path d="M6 4l12 0L21 8l-12 0L6 4z" fill={isActive ? '#6557d220' : '#ff704320'} />
          <path d="M6 4v12l3 4 12 0v-12L9 8v12M21 8v12l-12 0" />
        </svg>
      );
    case 'sphere-center-point':
    case 'sphere-center-radius':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <circle cx="12" cy="12" r="9" fill={isActive ? '#6557d220' : '#e5393520'} />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </svg>
      );
    case 'cone':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <path d="M12 3L4 18c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5L12 3z" fill={isActive ? '#6557d220' : '#00897b20'} />
          <ellipse cx="12" cy="18" rx="8" ry="3" />
          <path d="M4 18L12 3l8 15" />
        </svg>
      );
    case 'cylinder':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <ellipse cx="12" cy="6" rx="7" ry="2.5" fill={isActive ? '#6557d220' : '#00897b20'} />
          <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" fill={isActive ? '#6557d210' : '#00897b10'} />
          <ellipse cx="12" cy="18" rx="7" ry="2.5" />
          <path d="M5 6v12M19 6v12" />
        </svg>
      );
    case 'plane-three-points':
    case 'plane':
    case 'parallel-plane':
    case 'perpendicular-plane':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.6" fill="none">
          <polygon points="4,15 16,19 20,9 8,5" fill={isActive ? '#6557d220' : '#00acc120'} />
          <circle cx="7" cy="11" r="1.2" fill={color} />
          <circle cx="14" cy="15" r="1.2" fill={color} />
          <circle cx="15" cy="8" r="1.2" fill={color} />
        </svg>
      );
    case 'rotate-3d-view':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8" fill="none">
          <path d="M21 12a9 9 0 1 1-6.2-8.6" />
          <polyline points="21 3 21 9 15 9" />
        </svg>
      );
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


