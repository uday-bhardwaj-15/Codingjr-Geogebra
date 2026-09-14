'use client';

import React, { useRef, useEffect } from 'react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useViewStore } from '../../store/useViewStore';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { usePanZoom } from '../../hooks/usePanZoom';
import { worldToScreen } from '../../lib/coords/coordTransform';
import { resolvePoint, PointValue } from '../../core/geometry/Point';
import { renderLivePreview } from './renderers/previewRenderer';

export const CanvasSurface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objects = useConstructionStore((state) => state.objects);
  const viewport = useViewStore((state) => state.viewport);
  const currentMouseWorld = useUIStore((state) => state.currentMouseWorld);

  useCanvasInteraction(canvasRef);
  usePanZoom(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);

    const draw = () => {
      const w = rect.width;
      const h = rect.height;
      
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--gk-bg').trim() || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // 1. Draw Grid
      const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--gk-grid-line').trim() || '#eef0f3';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      
      const startX = Math.floor(viewport.xMin);
      const endX = Math.ceil(viewport.xMax);
      const startY = Math.floor(viewport.yMin);
      const endY = Math.ceil(viewport.yMax);

      ctx.beginPath();
      // Vertical lines
      for (let x = startX; x <= endX; x++) {
        const pt = worldToScreen(x, 0, w, h, viewport);
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, h);
      }
      // Horizontal lines
      for (let y = startY; y <= endY; y++) {
        const pt = worldToScreen(0, y, w, h, viewport);
        ctx.moveTo(0, pt.y);
        ctx.lineTo(w, pt.y);
      }
      ctx.stroke();

      // 2. Draw Axes
      const origin = worldToScreen(0, 0, w, h, viewport);
      const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--gk-axis').trim() || '#4b5563';
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;
      
      // X axis
      if (origin.y >= 0 && origin.y <= h) {
        ctx.beginPath();
        ctx.moveTo(0, origin.y);
        ctx.lineTo(w, origin.y);
        ctx.stroke();
      }
      
      // Y axis
      if (origin.x >= 0 && origin.x <= w) {
        ctx.beginPath();
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, h);
        ctx.stroke();
      }

      // 3. Draw Objects
      objects.forEach((obj) => {
        if (!obj.visible || !obj.value) return;

        if (obj.type === 'point') {
          const pt = resolvePoint(obj.value);
          const screenPt = worldToScreen(pt.x, pt.y, w, h, viewport);
          const radius = obj.style.thickness || 5;

          // Outer halo
          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, radius + 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();

          // Main dot
          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = obj.style.color || '#1565ef';
          ctx.fill();

          // Point label
          if (obj.labelVisible && obj.label) {
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillText(obj.label, screenPt.x + 8, screenPt.y - 8);
          }
        } else if (obj.type === 'slider') {
          const sliderVal = obj.value as any;
          if (sliderVal && typeof sliderVal.x === 'number') {
            const screenPt = worldToScreen(sliderVal.x, sliderVal.y, w, h, viewport);
            const sliderWidth = 140;

            // Track background bar
            ctx.beginPath();
            ctx.moveTo(screenPt.x, screenPt.y);
            ctx.lineTo(screenPt.x + sliderWidth, screenPt.y);
            ctx.strokeStyle = '#cbd5e1'; // slate-300
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Track active progress bar
            const min = sliderVal.min ?? -5;
            const max = sliderVal.max ?? 5;
            const currentVal = sliderVal.val ?? 0;
            const range = max - min || 1;
            const fraction = Math.max(0, Math.min(1, (currentVal - min) / range));
            const thumbX = screenPt.x + fraction * sliderWidth;

            ctx.beginPath();
            ctx.moveTo(screenPt.x, screenPt.y);
            ctx.lineTo(thumbX, screenPt.y);
            ctx.strokeStyle = obj.style.color || '#1565ef';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Thumb shadow/halo
            ctx.beginPath();
            ctx.arc(thumbX, screenPt.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();

            // Thumb
            ctx.beginPath();
            ctx.arc(thumbX, screenPt.y, 6.5, 0, 2 * Math.PI);
            ctx.fillStyle = obj.style.color || '#1565ef';
            ctx.fill();

            // Label
            if (obj.labelVisible) {
              ctx.fillStyle = '#0f172a';
              ctx.font = '600 13px Inter, sans-serif';
              ctx.fillText(`${obj.label} = ${Number(currentVal).toFixed(1)}`, screenPt.x, screenPt.y - 12);
            }
          }
        } else if (obj.type === 'line') {
          const lineVal = obj.value as any;
          let a = lineVal?.a;
          let b = lineVal?.b;
          let c = lineVal?.c;

          if (lineVal?.p1 && lineVal?.p2) {
            const p1 = lineVal.p1;
            const p2 = lineVal.p2;
            a = p1.y - p2.y;
            b = p2.x - p1.x;
            c = p1.x * p2.y - p2.x * p1.y;
          }

          if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number') {
            // Clip line to viewport edges
            const pts: { x: number; y: number }[] = [];
            // Left xMin
            if (Math.abs(b) > 1e-9) {
              const y = (-c - a * viewport.xMin) / b;
              if (y >= viewport.yMin && y <= viewport.yMax) pts.push({ x: viewport.xMin, y });
            }
            // Right xMax
            if (Math.abs(b) > 1e-9) {
              const y = (-c - a * viewport.xMax) / b;
              if (y >= viewport.yMin && y <= viewport.yMax) pts.push({ x: viewport.xMax, y });
            }
            // Bottom yMin
            if (Math.abs(a) > 1e-9) {
              const x = (-c - b * viewport.yMin) / a;
              if (x >= viewport.xMin && x <= viewport.xMax) pts.push({ x, y: viewport.yMin });
            }
            // Top yMax
            if (Math.abs(a) > 1e-9) {
              const x = (-c - b * viewport.yMax) / a;
              if (x >= viewport.xMin && x <= viewport.xMax) pts.push({ x, y: viewport.yMax });
            }

            if (pts.length >= 2) {
              const s1 = worldToScreen(pts[0].x, pts[0].y, w, h, viewport);
              const s2 = worldToScreen(pts[1].x, pts[1].y, w, h, viewport);

              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2.5;
              ctx.stroke();

              // Label
              if (obj.labelVisible && obj.label) {
                ctx.fillStyle = obj.style.color || '#4b5563';
                ctx.font = 'italic 12px Inter, sans-serif';
                ctx.fillText(obj.label, (s1.x + s2.x) / 2 + 10, (s1.y + s2.y) / 2 - 10);
              }
            }
          }
        } else if (obj.type === 'segment') {
          const val = obj.value as any;
          if (val?.p1 && val?.p2) {
            const s1 = worldToScreen(val.p1.x, val.p1.y, w, h, viewport);
            const s2 = worldToScreen(val.p2.x, val.p2.y, w, h, viewport);

            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 3;
            ctx.stroke();
          }
        } else if (obj.type === 'circle') {
          const circleVal = obj.value as any;
          if (circleVal?.center && typeof circleVal?.radius === 'number') {
            const sCenter = worldToScreen(circleVal.center.x, circleVal.center.y, w, h, viewport);
            const pixelRadius = circleVal.radius * (w / (viewport.xMax - viewport.xMin));

            ctx.beginPath();
            ctx.arc(sCenter.x, sCenter.y, pixelRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = obj.style.color || '#1565ef';
            ctx.lineWidth = obj.style.thickness || 2.5;
            ctx.stroke();
          }
        }
      });

      // 4. Draw Live Preview for multi-click tools
      const toolManager = useToolStore.getState().toolManager;
      const activeToolId = toolManager.getActiveToolId();
      const pendingSelections = toolManager.pendingSelections;
      const currentMouseWorld = useUIStore.getState().currentMouseWorld;

      renderLivePreview(
        ctx,
        activeToolId,
        pendingSelections,
        currentMouseWorld,
        viewport,
        w,
        h
      );
    };

    draw();

    const handleResize = () => {
      // Trigger a re-render
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [objects, viewport, currentMouseWorld]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--gk-bg)]">
      <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
    </div>
  );
};
