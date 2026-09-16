'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useProbabilityStore } from '../../store/useProbabilityStore';

interface IntervalHandlesProps {
  xMin: number;
  xMax: number;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export const IntervalHandles: React.FC<IntervalHandlesProps> = ({
  xMin,
  xMax,
  width,
  height,
  padding,
}) => {
  const { lowerBound, upperBound, setLowerBound, setUpperBound, intervalMode } = useProbabilityStore();
  const [draggingHandle, setDraggingHandle] = useState<'lower' | 'upper' | null>(null);

  const plotWidth = width - padding.left - padding.right;
  const baseY = height - padding.bottom;

  const xToScreen = useCallback(
    (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth,
    [padding.left, xMin, xMax, plotWidth]
  );

  const screenToX = useCallback(
    (sx: number) => {
      const clampedSx = Math.max(padding.left, Math.min(width - padding.right, sx));
      const normalized = (clampedSx - padding.left) / plotWidth;
      const rawX = xMin + normalized * (xMax - xMin);
      return Math.round(rawX * 1000) / 1000;
    },
    [padding.left, width, padding.right, plotWidth, xMin, xMax]
  );

  const handlePointerDown = (handle: 'lower' | 'upper') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingHandle(handle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingHandle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const newX = screenToX(clientX);

    if (draggingHandle === 'lower') {
      const clamped = intervalMode === 'interval' ? Math.min(newX, upperBound) : newX;
      setLowerBound(clamped);
    } else {
      const clamped = intervalMode === 'interval' ? Math.max(newX, lowerBound) : newX;
      setUpperBound(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingHandle(null);
    }
  };

  const lowerX = xToScreen(lowerBound);
  const upperX = xToScreen(upperBound);

  return (
    <div
      className="absolute inset-0 pointer-events-auto select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Lower Bound Handle */}
      {(intervalMode === 'interval' || intervalMode === 'right') && (
        <div
          onPointerDown={handlePointerDown('lower')}
          style={{ left: `${lowerX}px`, top: `${baseY}px` }}
          className="absolute -translate-x-1/2 cursor-ew-resize group z-20 flex flex-col items-center"
          title={`Lower bound: ${lowerBound.toFixed(3)}`}
        >
          {/* Draggable Triangle Marker */}
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 22"
            className={`fill-[#6557d2] filter drop-shadow hover:scale-115 transition-transform ${
              draggingHandle === 'lower' ? 'scale-120 fill-[#5345c2]' : ''
            }`}
          >
            <polygon points="10,0 20,18 0,18" />
            <circle cx="10" cy="12" r="2.5" fill="white" />
          </svg>
          <span className="text-[10px] font-mono font-semibold text-[#6557d2] bg-white px-1 rounded shadow-xs mt-0.5 border border-[#dadce0]">
            {lowerBound.toFixed(2)}
          </span>
        </div>
      )}

      {/* Upper Bound Handle */}
      {(intervalMode === 'interval' || intervalMode === 'left') && (
        <div
          onPointerDown={handlePointerDown('upper')}
          style={{ left: `${upperX}px`, top: `${baseY}px` }}
          className="absolute -translate-x-1/2 cursor-ew-resize group z-20 flex flex-col items-center"
          title={`Upper bound: ${upperBound.toFixed(3)}`}
        >
          {/* Draggable Triangle Marker */}
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 22"
            className={`fill-[#6557d2] filter drop-shadow hover:scale-115 transition-transform ${
              draggingHandle === 'upper' ? 'scale-120 fill-[#5345c2]' : ''
            }`}
          >
            <polygon points="10,0 20,18 0,18" />
            <circle cx="10" cy="12" r="2.5" fill="white" />
          </svg>
          <span className="text-[10px] font-mono font-semibold text-[#6557d2] bg-white px-1 rounded shadow-xs mt-0.5 border border-[#dadce0]">
            {upperBound.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
