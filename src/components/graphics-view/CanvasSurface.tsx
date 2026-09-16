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
import { renderSubscriptLabel } from './renderers/labelRenderer';
import { TOOLS } from '../tools-panel/toolsConfig';

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

    const w = rect.width;
    const h = rect.height;

    // Dynamic tool cursor
    const activeToolId = useToolStore.getState().toolManager.getActiveToolId();
    const toolDef = TOOLS.find((t) => t.id === activeToolId);
    const activeCursor = toolDef?.cursor || 'crosshair';
    if (canvas.style.cursor !== activeCursor) {
      canvas.style.cursor = activeCursor;
    }

    // Synchronize viewport aspect ratio so 1 unit X == 1 unit Y (isotropic Euclidean space)
    if (w > 0 && h > 0) {
      const expectedHeight = (viewport.xMax - viewport.xMin) * (h / w);
      const currentHeight = viewport.yMax - viewport.yMin;
      if (Math.abs(expectedHeight - currentHeight) > 1e-4) {
        const yMid = (viewport.yMin + viewport.yMax) / 2;
        useViewStore.getState().setViewport({
          ...viewport,
          yMin: yMid - expectedHeight / 2,
          yMax: yMid + expectedHeight / 2,
        });
        return; // Next render will have aligned viewport
      }
    }

    const draw = () => {
      const bgColor = '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // --- DYNAMIC ZOOM-ADAPTIVE GRID & AXIS NUMBERING ---
      // Target screen distance between major grid lines (approx 70-80px)
      const targetPixelStep = 75;
      const xRange = viewport.xMax - viewport.xMin;
      const yRange = viewport.yMax - viewport.yMin;
      const rawStepX = (xRange / w) * targetPixelStep;

      // Function to calculate standard nice step (1, 2, 5 * 10^k)
      const getNiceStep = (raw: number) => {
        if (raw <= 0 || !isFinite(raw)) return 1;
        const exponent = Math.floor(Math.log10(raw));
        const powerOf10 = Math.pow(10, exponent);
        const fraction = raw / powerOf10;
        let niceFraction = 1;
        if (fraction < 1.4) {
          niceFraction = 1;
        } else if (fraction < 3.2) {
          niceFraction = 2;
        } else if (fraction < 7.0) {
          niceFraction = 5;
        } else {
          niceFraction = 10;
        }
        return niceFraction * powerOf10;
      };

      const majorStep = getNiceStep(rawStepX);
      const minorDivisions = (majorStep / Math.pow(10, Math.floor(Math.log10(majorStep))) === 2) ? 4 : 5;
      const minorStep = majorStep / minorDivisions;

      // Precision for number formatting
      const precision = Math.max(0, -Math.floor(Math.log10(majorStep) - 1e-5));
      const formatNumber = (val: number) => {
        if (Math.abs(val) < 1e-9) return '0';
        const str = val.toFixed(precision);
        return parseFloat(str).toString();
      };

      const showAxes = useViewStore.getState().showAxes;
      const showGrid = useViewStore.getState().showGrid;
      const minMajorX = Math.floor(viewport.xMin / majorStep) * majorStep;
      const maxMajorX = Math.ceil(viewport.xMax / majorStep) * majorStep;
      const minMajorY = Math.floor(viewport.yMin / majorStep) * majorStep;
      const maxMajorY = Math.ceil(viewport.yMax / majorStep) * majorStep;

      // 1. Draw Minor Grid Lines
      if (showGrid) {
        ctx.strokeStyle = '#f5f5f5';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const minMinorX = Math.floor(viewport.xMin / minorStep) * minorStep;
        const maxMinorX = Math.ceil(viewport.xMax / minorStep) * minorStep;
        for (let x = minMinorX; x <= maxMinorX; x += minorStep) {
          const pt = worldToScreen(x, 0, w, h, viewport);
          ctx.moveTo(Math.round(pt.x) + 0.5, 0);
          ctx.lineTo(Math.round(pt.x) + 0.5, h);
        }
        const minMinorY = Math.floor(viewport.yMin / minorStep) * minorStep;
        const maxMinorY = Math.ceil(viewport.yMax / minorStep) * minorStep;
        for (let y = minMinorY; y <= maxMinorY; y += minorStep) {
          const pt = worldToScreen(0, y, w, h, viewport);
          ctx.moveTo(0, Math.round(pt.y) + 0.5);
          ctx.lineTo(w, Math.round(pt.y) + 0.5);
        }
        ctx.stroke();

        // 2. Draw Major Grid Lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (let x = minMajorX; x <= maxMajorX; x += majorStep) {
          const pt = worldToScreen(x, 0, w, h, viewport);
          ctx.moveTo(Math.round(pt.x) + 0.5, 0);
          ctx.lineTo(Math.round(pt.x) + 0.5, h);
        }
        for (let y = minMajorY; y <= maxMajorY; y += majorStep) {
          const pt = worldToScreen(0, y, w, h, viewport);
          ctx.moveTo(0, Math.round(pt.y) + 0.5);
          ctx.lineTo(w, Math.round(pt.y) + 0.5);
        }
        ctx.stroke();
      }

      // 3. Draw Axes with Arrows and Labels
      if (showAxes) {
        const origin = worldToScreen(0, 0, w, h, viewport);
        const axisColor = '#666666'; // GeoGebra sharp neutral axis color
        ctx.strokeStyle = axisColor;
        ctx.fillStyle = axisColor;
        ctx.lineWidth = 1.2;

        const isXOnScreen = origin.y >= 0 && origin.y <= h;
        const isYOnScreen = origin.x >= 0 && origin.x <= w;
        const axisY = Math.max(15, Math.min(h - 20, origin.y));
        const axisX = Math.max(30, Math.min(w - 20, origin.x));

        // X-Axis Line
        if (isXOnScreen) {
          ctx.beginPath();
          ctx.moveTo(0, origin.y);
          ctx.lineTo(w, origin.y);
          ctx.stroke();

          // Right Arrowhead (positive X)
          ctx.beginPath();
          ctx.moveTo(w - 2, origin.y);
          ctx.lineTo(w - 10, origin.y - 4);
          ctx.lineTo(w - 10, origin.y + 4);
          ctx.closePath();
          ctx.fill();
        }

        // Y-Axis Line
        if (isYOnScreen) {
          ctx.beginPath();
          ctx.moveTo(origin.x, h);
          ctx.lineTo(origin.x, 0);
          ctx.stroke();

          // Top Arrowhead (positive Y)
          ctx.beginPath();
          ctx.moveTo(origin.x, 2);
          ctx.lineTo(origin.x - 4, 10);
          ctx.lineTo(origin.x + 4, 10);
          ctx.closePath();
          ctx.fill();
        }

        // 4. Draw Axis Number Labels & Ticks
        ctx.font = '500 11px Arial, Inter, -apple-system, sans-serif';
        ctx.fillStyle = '#666666';
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;

        // X-Axis Numbers & Ticks
        for (let x = minMajorX; x <= maxMajorX; x += majorStep) {
          if (Math.abs(x) < 1e-9) continue; // Skip origin here, drawn separately
          const pt = worldToScreen(x, 0, w, h, viewport);
          if (pt.x < 25 || pt.x > w - 25) continue;

          // Tick
          if (isXOnScreen) {
            ctx.beginPath();
            ctx.moveTo(Math.round(pt.x) + 0.5, origin.y - 3);
            ctx.lineTo(Math.round(pt.x) + 0.5, origin.y + 3);
            ctx.stroke();
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const labelY = isXOnScreen ? Math.min(h - 16, origin.y + 5) : (axisY > h / 2 ? h - 18 : 6);
          ctx.fillText(formatNumber(x), pt.x, labelY);
        }

        // Y-Axis Numbers & Ticks
        for (let y = minMajorY; y <= maxMajorY; y += majorStep) {
          if (Math.abs(y) < 1e-9) continue; // Skip origin
          const pt = worldToScreen(0, y, w, h, viewport);
          if (pt.y < 25 || pt.y > h - 25) continue;

          // Tick
          if (isYOnScreen) {
            ctx.beginPath();
            ctx.moveTo(origin.x - 3, Math.round(pt.y) + 0.5);
            ctx.lineTo(origin.x + 3, Math.round(pt.y) + 0.5);
            ctx.stroke();
          }

          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          const labelX = isYOnScreen ? Math.max(22, origin.x - 6) : (axisX > w / 2 ? w - 8 : 24);
          ctx.fillText(formatNumber(y), labelX, pt.y);
        }

        // Origin '0'
        if (isXOnScreen && isYOnScreen) {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText('0', origin.x - 5, origin.y + 4);
        }
      }

      // 3. Draw Geometry Objects
      objects.forEach((obj) => {
        if (!obj.visible || !obj.value) return;

        if (obj.type === 'circle' || obj.type === 'conic') {
          const circleVal = obj.value as any;
          const pixelScale = w / (viewport.xMax - viewport.xMin);

          if ((circleVal?.conicType === 'ellipse' || circleVal?.type === 'ellipse') && circleVal?.center) {
            const sCenter = worldToScreen(circleVal.center.x, circleVal.center.y, w, h, viewport);
            const aScreen = circleVal.a * pixelScale;
            const bScreen = circleVal.b * pixelScale;

            ctx.beginPath();
            ctx.ellipse(sCenter.x, sCenter.y, aScreen, bScreen, -circleVal.angle, 0, 2 * Math.PI);
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2;
            ctx.stroke();

            if (obj.labelVisible && obj.label) {
              renderSubscriptLabel(ctx, obj.label, sCenter.x + aScreen * 0.7 + 5, sCenter.y - bScreen * 0.7 - 5, {
                isItalic: true,
                color: obj.style.color || '#4b5563',
                fontSize: 12,
              });
            }
          } else if ((circleVal?.conicType === 'parabola' || circleVal?.type === 'parabola') && circleVal?.vertex) {
            const { vertex, p, angle } = circleVal;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            ctx.beginPath();
            let first = true;
            for (let t = -15; t <= 15; t += 0.2) {
              const u = 2 * p * t;
              const v = p * t * t;
              const wx = vertex.x + u * cosA - v * sinA;
              const wy = vertex.y + u * sinA + v * cosA;
              const sp = worldToScreen(wx, wy, w, h, viewport);
              if (first) {
                ctx.moveTo(sp.x, sp.y);
                first = false;
              } else {
                ctx.lineTo(sp.x, sp.y);
              }
            }
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2;
            ctx.stroke();

            if (obj.labelVisible && obj.label) {
              const sVertex = worldToScreen(vertex.x, vertex.y, w, h, viewport);
              renderSubscriptLabel(ctx, obj.label, sVertex.x + 8, sVertex.y - 8, {
                isItalic: true,
                color: obj.style.color || '#4b5563',
                fontSize: 12,
              });
            }
          } else if ((circleVal?.conicType === 'hyperbola' || circleVal?.type === 'hyperbola') && circleVal?.center) {
            const { center, a, b, angle } = circleVal;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            // Right branch
            ctx.beginPath();
            let first = true;
            for (let t = -2.5; t <= 2.5; t += 0.1) {
              const u = a * Math.cosh(t);
              const v = b * Math.sinh(t);
              const wx = center.x + u * cosA - v * sinA;
              const wy = center.y + u * sinA + v * cosA;
              const sp = worldToScreen(wx, wy, w, h, viewport);
              if (first) {
                ctx.moveTo(sp.x, sp.y);
                first = false;
              } else {
                ctx.lineTo(sp.x, sp.y);
              }
            }
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2;
            ctx.stroke();

            // Left branch
            ctx.beginPath();
            first = true;
            for (let t = -2.5; t <= 2.5; t += 0.1) {
              const u = -a * Math.cosh(t);
              const v = b * Math.sinh(t);
              const wx = center.x + u * cosA - v * sinA;
              const wy = center.y + u * sinA + v * cosA;
              const sp = worldToScreen(wx, wy, w, h, viewport);
              if (first) {
                ctx.moveTo(sp.x, sp.y);
                first = false;
              } else {
                ctx.lineTo(sp.x, sp.y);
              }
            }
            ctx.strokeStyle = obj.style.color || '#4b5563';
            ctx.lineWidth = obj.style.thickness || 2;
            ctx.stroke();

            if (obj.labelVisible && obj.label) {
              const sCenter = worldToScreen(center.x, center.y, w, h, viewport);
              renderSubscriptLabel(ctx, obj.label, sCenter.x + 8, sCenter.y - 8, {
                isItalic: true,
                color: obj.style.color || '#4b5563',
                fontSize: 12,
              });
            }
          } else if (circleVal?.center && typeof circleVal?.radius === 'number') {
            const sCenter = worldToScreen(circleVal.center.x, circleVal.center.y, w, h, viewport);
            const pixelRadius = circleVal.radius * pixelScale;

            if (circleVal.arc) {
              const startScreen = -circleVal.arc.startAngle;
              const endScreen = -circleVal.arc.endAngle;
              const anticlockwise = !circleVal.arc.anticlockwise;

              ctx.beginPath();
              if (circleVal.filled || circleVal.hasRadiusLines) {
                ctx.moveTo(sCenter.x, sCenter.y);
                ctx.arc(sCenter.x, sCenter.y, pixelRadius, startScreen, endScreen, anticlockwise);
                ctx.closePath();
                ctx.fillStyle = obj.style.color ? `${obj.style.color}33` : 'rgba(21, 101, 239, 0.2)';
                ctx.fill();
                ctx.strokeStyle = obj.style.color || '#4b5563';
                ctx.lineWidth = obj.style.thickness || 2;
                ctx.stroke();
              } else {
                ctx.arc(sCenter.x, sCenter.y, pixelRadius, startScreen, endScreen, anticlockwise);
                ctx.strokeStyle = obj.style.color || '#4b5563';
                ctx.lineWidth = obj.style.thickness || 2;
                ctx.stroke();
              }
            } else {
              ctx.beginPath();
              ctx.arc(sCenter.x, sCenter.y, pixelRadius, 0, 2 * Math.PI);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();
            }

            if (obj.labelVisible && obj.label) {
              renderSubscriptLabel(ctx, obj.label, sCenter.x + pixelRadius * 0.7 + 5, sCenter.y - pixelRadius * 0.7 - 5, {
                isItalic: true,
                color: obj.style.color || '#4b5563',
                fontSize: 12,
              });
            }
          }
        } else if (obj.type === 'polygon') {
          const polyVal = obj.value as any;
          if (polyVal?.vertices && polyVal.vertices.length >= 3) {
            const screenPts = polyVal.vertices.map((v: any) =>
              worldToScreen(v.x, v.y, w, h, viewport)
            );

            // Fill
            ctx.beginPath();
            ctx.moveTo(screenPts[0].x, screenPts[0].y);
            for (let i = 1; i < screenPts.length; i++) {
              ctx.lineTo(screenPts[i].x, screenPts[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = obj.style.color ? `${obj.style.color}26` : 'rgba(21, 101, 239, 0.15)';
            ctx.fill();

            // Edges
            if (polyVal.edgeStyle === 'vector') {
              for (let i = 0; i < screenPts.length; i++) {
                const s1 = screenPts[i];
                const s2 = screenPts[(i + 1) % screenPts.length];
                ctx.beginPath();
                ctx.moveTo(s1.x, s1.y);
                ctx.lineTo(s2.x, s2.y);
                ctx.strokeStyle = obj.style.color || '#1565ef';
                ctx.lineWidth = obj.style.thickness || 2;
                ctx.stroke();

                const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x);
                const headLen = 10;
                ctx.beginPath();
                ctx.moveTo(s2.x, s2.y);
                ctx.lineTo(s2.x - headLen * Math.cos(angle - Math.PI / 6), s2.y - headLen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(s2.x - headLen * Math.cos(angle + Math.PI / 6), s2.y - headLen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fillStyle = obj.style.color || '#1565ef';
                ctx.fill();
              }
            } else {
              ctx.beginPath();
              ctx.moveTo(screenPts[0].x, screenPts[0].y);
              for (let i = 1; i < screenPts.length; i++) {
                ctx.lineTo(screenPts[i].x, screenPts[i].y);
              }
              ctx.closePath();
              ctx.strokeStyle = obj.style.color || '#1565ef';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();
            }

            if (obj.labelVisible && obj.label) {
              const cx = screenPts.reduce((sum: number, p: any) => sum + p.x, 0) / screenPts.length;
              const cy = screenPts.reduce((sum: number, p: any) => sum + p.y, 0) / screenPts.length;
              ctx.fillStyle = obj.style.color || '#1565ef';
              ctx.font = 'italic 12px Inter, sans-serif';
              ctx.fillText(obj.label, cx, cy);
            }
          }
        } else if (obj.type === 'line') {
          const lineVal = obj.value as any;
          let p1 = lineVal?.p1;
          let p2 = lineVal?.p2;

          if (p1 && p2) {
            const s1 = worldToScreen(p1.x, p1.y, w, h, viewport);
            const s2 = worldToScreen(p2.x, p2.y, w, h, viewport);
            const dx = s2.x - s1.x;
            const dy = s2.y - s1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              const ext = Math.max(w, h) * 4;
              ctx.beginPath();
              ctx.moveTo(s1.x - (dx / len) * ext, s1.y - (dy / len) * ext);
              ctx.lineTo(s2.x + (dx / len) * ext, s2.y + (dy / len) * ext);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();

              if (obj.labelVisible && obj.label) {
                renderSubscriptLabel(ctx, obj.label, (s1.x + s2.x) / 2 + 10, (s1.y + s2.y) / 2 - 10, {
                  isItalic: true,
                  color: obj.style.color || '#4b5563',
                  fontSize: 12,
                });
              }
            }
          } else if (typeof lineVal?.a === 'number' && typeof lineVal?.b === 'number' && typeof lineVal?.c === 'number') {
            const a = lineVal.a;
            const b = lineVal.b;
            const c = lineVal.c;
            const norm = Math.sqrt(a * a + b * b);
            if (norm > 0) {
              const x0 = (-a * c) / (norm * norm);
              const y0 = (-b * c) / (norm * norm);
              const uX = -b / norm;
              const uY = a / norm;
              const ext = Math.max(viewport.xMax - viewport.xMin, viewport.yMax - viewport.yMin) * 3;
              const s1 = worldToScreen(x0 - uX * ext, y0 - uY * ext, w, h, viewport);
              const s2 = worldToScreen(x0 + uX * ext, y0 + uY * ext, w, h, viewport);

              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.strokeStyle = obj.style.color || '#4b5563';
              ctx.lineWidth = obj.style.thickness || 2;
              ctx.stroke();

              if (obj.labelVisible && obj.label) {
                renderSubscriptLabel(ctx, obj.label, (s1.x + s2.x) / 2 + 10, (s1.y + s2.y) / 2 - 10, {
                  isItalic: true,
                  color: obj.style.color || '#4b5563',
                  fontSize: 12,
                });
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
            const screenPoints = val.points.map((p: any) => worldToScreen(p.x, p.y, w, h, viewport));
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = obj.style.color || '#0f172a';
            ctx.lineWidth = obj.style.thickness || 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            if (screenPoints.length === 2) {
              ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
            } else {
              for (let i = 1; i < screenPoints.length - 1; i++) {
                const xc = (screenPoints[i].x + screenPoints[i + 1].x) / 2;
                const yc = (screenPoints[i].y + screenPoints[i + 1].y) / 2;
                ctx.quadraticCurveTo(screenPoints[i].x, screenPoints[i].y, xc, yc);
              }
              const last = screenPoints[screenPoints.length - 1];
              const secondLast = screenPoints[screenPoints.length - 2];
              ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
            }
            ctx.stroke();
            ctx.restore();
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
            const isComplex = (obj.value as any)?.isComplex;
            const sign = pt.y >= 0 ? '+' : '-';
            const labelText = isComplex
              ? `${obj.label} = ${Number(pt.x.toFixed(2))} ${sign} ${Number(Math.abs(pt.y).toFixed(2))}i`
              : obj.label;
            renderSubscriptLabel(ctx, labelText, screenPt.x + 9, screenPt.y - 8, {
              isBold: true,
              color: '#0f172a',
              fontSize: 13,
            });
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
