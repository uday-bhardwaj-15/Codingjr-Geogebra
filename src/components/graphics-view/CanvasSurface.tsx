'use client';

import React, { useRef, useEffect } from 'react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useViewStore } from '../../store/useViewStore';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { usePanZoom } from '../../hooks/usePanZoom';
import { worldToScreen } from '../../lib/coords/coordTransform';
import { resolvePoint } from '../../core/geometry/Point';
import { renderLivePreview } from './renderers/previewRenderer';

const imageCache: Map<string, HTMLImageElement> = new Map();

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
      for (let x = startX; x <= endX; x++) {
        const pt = worldToScreen(x, 0, w, h, viewport);
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, h);
      }
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

      // 3. Draw Geometry Objects
      objects.forEach((obj) => {
        if (!obj.visible || !obj.value) return;

        if (obj.type === 'circle') {
          const circleVal = obj.value as any;
          if (circleVal?.center && typeof circleVal?.radius === 'number') {
            const sCenter = worldToScreen(circleVal.center.x, circleVal.center.y, w, h, viewport);
            const pixelScale = w / (viewport.xMax - viewport.xMin);
            const pixelRadius = circleVal.radius * pixelScale;

            ctx.beginPath();
            ctx.arc(sCenter.x, sCenter.y, pixelRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2;
            ctx.stroke();

            if (obj.labelVisible && obj.label) {
              ctx.fillStyle = obj.style.color || '#4b5563';
              ctx.font = 'italic 12px Inter, sans-serif';
              ctx.fillText(obj.label, sCenter.x + pixelRadius * 0.7 + 5, sCenter.y - pixelRadius * 0.7 - 5);
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
            const pts: { x: number; y: number }[] = [];
            if (Math.abs(b) > 1e-9) {
              const y1 = (-c - a * viewport.xMin) / b;
              if (y1 >= viewport.yMin && y1 <= viewport.yMax) pts.push({ x: viewport.xMin, y: y1 });
              const y2 = (-c - a * viewport.xMax) / b;
              if (y2 >= viewport.yMin && y2 <= viewport.yMax) pts.push({ x: viewport.xMax, y: y2 });
            }
            if (Math.abs(a) > 1e-9) {
              const x1 = (-c - b * viewport.yMin) / a;
              if (x1 >= viewport.xMin && x1 <= viewport.xMax) pts.push({ x: x1, y: viewport.yMin });
              const x2 = (-c - b * viewport.yMax) / a;
              if (x2 >= viewport.xMin && x2 <= viewport.xMax) pts.push({ x: x2, y: viewport.yMax });
            }

            if (pts.length >= 2) {
              const s1 = worldToScreen(pts[0].x, pts[0].y, w, h, viewport);
              const s2 = worldToScreen(pts[1].x, pts[1].y, w, h, viewport);

              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();

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
            ctx.lineWidth = obj.style.thickness || 2.5;
            ctx.stroke();

            if (obj.labelVisible && obj.label) {
              ctx.fillStyle = obj.style.color || '#4b5563';
              ctx.font = 'italic 12px Inter, sans-serif';
              ctx.fillText(obj.label, (s1.x + s2.x) / 2 + 6, (s1.y + s2.y) / 2 - 6);
            }
          }
        } else if (obj.type === 'polyline') {
          const val = obj.value as any;
          if (val?.points && val.points.length >= 2) {
            ctx.beginPath();
            const s0 = worldToScreen(val.points[0].x, val.points[0].y, w, h, viewport);
            ctx.moveTo(s0.x, s0.y);
            for (let i = 1; i < val.points.length; i++) {
              const s = worldToScreen(val.points[i].x, val.points[i].y, w, h, viewport);
              ctx.lineTo(s.x, s.y);
            }
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2.5;
            ctx.stroke();
          }
        } else if (obj.type === 'ray') {
          const val = obj.value as any;
          if (val?.p1 && val?.p2) {
            const s1 = worldToScreen(val.p1.x, val.p1.y, w, h, viewport);
            const s2 = worldToScreen(val.p2.x, val.p2.y, w, h, viewport);

            const dx = s2.x - s1.x;
            const dy = s2.y - s1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              const rayEnd = { x: s1.x + (dx / len) * 3000, y: s1.y + (dy / len) * 3000 };
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(rayEnd.x, rayEnd.y);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();
            }
          }
        } else if (obj.type === 'vector') {
          const val = obj.value as any;
          if (val?.p1 && val?.p2) {
            const s1 = worldToScreen(val.p1.x, val.p1.y, w, h, viewport);
            const s2 = worldToScreen(val.p2.x, val.p2.y, w, h, viewport);

            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = obj.style.color || '#1565ef';
            ctx.lineWidth = obj.style.thickness || 2.5;
            ctx.stroke();

            const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x);
            const headLen = 12;
            ctx.beginPath();
            ctx.moveTo(s2.x, s2.y);
            ctx.lineTo(s2.x - headLen * Math.cos(angle - Math.PI / 6), s2.y - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(s2.x - headLen * Math.cos(angle + Math.PI / 6), s2.y - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = obj.style.color || '#1565ef';
            ctx.fill();
          }
        } else if (obj.type === 'angle') {
          const val = obj.value as any;
          if (val?.vertex && val?.p1 && val?.p2) {
            const sV = worldToScreen(val.vertex.x, val.vertex.y, w, h, viewport);
            const s1 = worldToScreen(val.p1.x, val.p1.y, w, h, viewport);
            const s2 = worldToScreen(val.p2.x, val.p2.y, w, h, viewport);

            const a1 = Math.atan2(s1.y - sV.y, s1.x - sV.x);
            const a2 = Math.atan2(s2.y - sV.y, s2.x - sV.x);
            const arcR = 28;

            ctx.beginPath();
            ctx.moveTo(sV.x, sV.y);
            ctx.arc(sV.x, sV.y, arcR, a1, a2, false);
            ctx.closePath();
            ctx.fillStyle = 'rgba(21, 101, 239, 0.2)';
            ctx.fill();
            ctx.strokeStyle = '#1565ef';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const midAngle = (a1 + a2) / 2;
            ctx.fillStyle = '#0f172a';
            ctx.font = '600 12px Inter, sans-serif';
            ctx.fillText(`${val.deg ? val.deg.toFixed(1) : 0}°`, sV.x + (arcR + 12) * Math.cos(midAngle), sV.y + (arcR + 12) * Math.sin(midAngle));
          }
        } else if (obj.type === 'measurement') {
          const val = obj.value as any;
          if (val?.p1 && val?.p2) {
            const s1 = worldToScreen(val.p1.x, val.p1.y, w, h, viewport);
            const s2 = worldToScreen(val.p2.x, val.p2.y, w, h, viewport);
            const midX = (s1.x + s2.x) / 2;
            const midY = (s1.y + s2.y) / 2;

            ctx.fillStyle = '#1e293b';
            ctx.font = '600 12px Inter, sans-serif';
            ctx.fillText(obj.definition || `d = ${val.distance?.toFixed(2)}`, midX + 8, midY - 8);
          } else if (val?.area !== undefined) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '600 12px Inter, sans-serif';
            ctx.fillText(obj.definition || `Area = ${val.area.toFixed(2)}`, 20, h - 20);
          } else if (val?.slope !== undefined) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '600 12px Inter, sans-serif';
            ctx.fillText(obj.definition || `m = ${val.slope.toFixed(2)}`, 20, h - 40);
          }
        } else if (obj.type === 'text') {
          const val = obj.value as any;
          if (val && typeof val.x === 'number') {
            const sPt = worldToScreen(val.x, val.y, w, h, viewport);
            ctx.fillStyle = obj.style.color || '#1a1a1a';
            ctx.font = '14px Inter, sans-serif';
            ctx.fillText(val.text || 'Text', sPt.x, sPt.y);
          }
        } else if (obj.type === 'image') {
          const val = obj.value as any;
          if (val && val.src) {
            let img = imageCache.get(val.src);
            if (!img) {
              img = new Image();
              img.src = val.src;
              img.onload = () => draw();
              imageCache.set(val.src, img);
            }
            if (img.complete && img.naturalWidth > 0) {
              const sPt = worldToScreen(val.x, val.y, w, h, viewport);
              const pixelScale = w / (viewport.xMax - viewport.xMin);
              const imgW = (val.width || 4) * pixelScale;
              const imgH = (val.height || 3) * pixelScale;
              ctx.drawImage(img, sPt.x, sPt.y - imgH, imgW, imgH);
            }
          }
        }
      });

      // 4. Draw Sliders and Points on top
      objects.forEach((obj) => {
        if (!obj.visible || !obj.value) return;

        if (obj.type === 'point') {
          const pt = resolvePoint(obj.value);
          const screenPt = worldToScreen(pt.x, pt.y, w, h, viewport);
          const radius = 4.5;

          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, radius + 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = obj.style.color || '#1565ef';
          ctx.fill();

          if (obj.labelVisible && obj.label) {
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(obj.label, screenPt.x + 7, screenPt.y - 7);
          }
        } else if (obj.type === 'slider') {
          const sliderVal = obj.value as any;
          if (sliderVal && typeof sliderVal.x === 'number') {
            const screenPt = worldToScreen(sliderVal.x, sliderVal.y, w, h, viewport);
            const sliderWidth = 140;

            ctx.beginPath();
            ctx.moveTo(screenPt.x, screenPt.y);
            ctx.lineTo(screenPt.x + sliderWidth, screenPt.y);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

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

            ctx.beginPath();
            ctx.arc(thumbX, screenPt.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(thumbX, screenPt.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = obj.style.color || '#1565ef';
            ctx.fill();

            if (obj.labelVisible) {
              ctx.fillStyle = '#0f172a';
              ctx.font = '600 12px Inter, sans-serif';
              ctx.fillText(`${obj.label} = ${Number(currentVal).toFixed(1)}`, screenPt.x, screenPt.y - 10);
            }
          }
        }
      });

      // 5. Draw Live Preview for multi-click tools
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
