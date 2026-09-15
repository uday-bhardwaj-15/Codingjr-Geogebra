import { GeoObject, Viewport } from '../../../types/geo';
import { PointCoords, PointValue, resolvePoint, distance } from '../../../core/geometry/Point';
import { worldToScreen } from '../../../lib/coords/coordTransform';
import { circleFromThreePoints, circumcircularArc } from '../../../core/geometry/Circle';
import { regularPolygonVertices } from '../../../core/geometry/polygons';
import { ellipseFromFociAndPoint, hyperbolaFromFociAndPoint } from '../../../core/geometry/conics';
import { getActiveInkPoints } from '../../../core/tools/handlers/otherHandlers';

export function drawAnchorHalo(ctx: CanvasRenderingContext2D, screenPt: PointCoords) {
  ctx.save();
  // Outer selection ring
  ctx.beginPath();
  ctx.arc(screenPt.x, screenPt.y, 11, 0, 2 * Math.PI);
  ctx.strokeStyle = '#1565ef';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.stroke();

  // Soft blue inner glow
  ctx.beginPath();
  ctx.arc(screenPt.x, screenPt.y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(21, 101, 239, 0.22)';
  ctx.fill();

  // Solid center dot
  ctx.beginPath();
  ctx.arc(screenPt.x, screenPt.y, 4.5, 0, 2 * Math.PI);
  ctx.fillStyle = '#1565ef';
  ctx.fill();
  ctx.restore();
}

export function drawGhostCircle(
  ctx: CanvasRenderingContext2D,
  screenCenter: PointCoords,
  pixelRadius: number,
  strokeStyle: string = 'rgba(75, 85, 99, 0.45)',
  fillStyle?: string
) {
  if (pixelRadius <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(screenCenter.x, screenCenter.y, pixelRadius, 0, 2 * Math.PI);
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.restore();
}

export function renderLivePreview(
  ctx: CanvasRenderingContext2D,
  toolId: string,
  pendingSelections: GeoObject[],
  currentMouseWorld: PointCoords | null,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
) {
  const w = canvasWidth;
  const h = canvasHeight;

  // 0. Live Ink Drawing for Pen and Freehand Shape
  if (toolId === 'pen' || toolId === 'freehand-shape') {
    const ink = getActiveInkPoints();
    if (ink.length >= 2) {
      const sPts = ink.map((p) => worldToScreen(p.x, p.y, w, h, viewport));
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = toolId === 'pen' ? '#0f172a' : '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(sPts[0].x, sPts[0].y);
      if (sPts.length === 2) {
        ctx.lineTo(sPts[1].x, sPts[1].y);
      } else {
        for (let i = 1; i < sPts.length - 1; i++) {
          const xc = (sPts[i].x + sPts[i + 1].x) / 2;
          const yc = (sPts[i].y + sPts[i + 1].y) / 2;
          ctx.quadraticCurveTo(sPts[i].x, sPts[i].y, xc, yc);
        }
        const last = sPts[sPts.length - 1];
        const secondLast = sPts[sPts.length - 2];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
      }
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  if (!currentMouseWorld || pendingSelections.length === 0) return;

  const pixelScale = w / (viewport.xMax - viewport.xMin);
  const mouseScreen = worldToScreen(currentMouseWorld.x, currentMouseWorld.y, w, h, viewport);

  // 1. Draw Anchor Halos for all pending point selections
  const resolvedPoints: PointCoords[] = [];
  const screenPoints: PointCoords[] = [];

  pendingSelections.forEach((obj) => {
    if (obj.type === 'point' && obj.value) {
      const pt = resolvePoint(obj.value as PointValue);
      const sPt = worldToScreen(pt.x, pt.y, w, h, viewport);
      resolvedPoints.push(pt);
      screenPoints.push(sPt);
      drawAnchorHalo(ctx, sPt);
    }
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(21, 101, 239, 0.7)';
  ctx.fillStyle = 'rgba(21, 101, 239, 0.15)';
  ctx.lineWidth = 1.8;

  // 2. Line Family Previews
  if (
    toolId === 'segment' ||
    toolId === 'line' ||
    toolId === 'ray' ||
    toolId === 'vector' ||
    toolId === 'perpendicular-bisector' ||
    toolId === 'midpoint-center' ||
    toolId === 'distance-length'
  ) {
    if (screenPoints.length === 1) {
      const s1 = screenPoints[0];
      ctx.setLineDash([5, 4]);

      if (toolId === 'line' || toolId === 'perpendicular-bisector') {
        const dx = mouseScreen.x - s1.x;
        const dy = mouseScreen.y - s1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const ext = Math.max(w, h) * 3;
          ctx.beginPath();
          ctx.moveTo(s1.x - (dx / len) * ext, s1.y - (dy / len) * ext);
          ctx.lineTo(s1.x + (dx / len) * ext, s1.y + (dy / len) * ext);
          ctx.stroke();
        }
      } else if (toolId === 'ray') {
        const dx = mouseScreen.x - s1.x;
        const dy = mouseScreen.y - s1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const ext = Math.max(w, h) * 3;
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s1.x + (dx / len) * ext, s1.y + (dy / len) * ext);
          ctx.stroke();
        }
      } else {
        // Segment / Vector / Midpoint / Distance
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(mouseScreen.x, mouseScreen.y);
        ctx.stroke();
      }
    }
  }

  // 3. Circle & Semicircle Previews
  else if (toolId === 'circle-center-point') {
    if (resolvedPoints.length === 1) {
      const p1 = resolvedPoints[0];
      const s1 = screenPoints[0];
      const r = distance(p1, currentMouseWorld);
      const rPix = r * pixelScale;

      drawGhostCircle(ctx, s1, rPix, 'rgba(21, 101, 239, 0.55)', 'rgba(21, 101, 239, 0.08)');
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    }
  } else if (toolId === 'semicircle') {
    if (resolvedPoints.length === 1) {
      const p1 = resolvedPoints[0];
      const p2 = currentMouseWorld;
      const center: PointCoords = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const radius = distance(p1, p2) / 2;
      const sCenter = worldToScreen(center.x, center.y, w, h, viewport);
      const pixelRadius = radius * pixelScale;

      // Faint ghost circle
      drawGhostCircle(ctx, sCenter, pixelRadius, 'rgba(75, 85, 99, 0.35)');

      // Live Semicircle Arc (solid half-circle from p1 to mouse p2)
      const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
      const endAngle = startAngle + Math.PI;

      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1565ef';
      ctx.arc(sCenter.x, sCenter.y, pixelRadius, -startAngle, -endAngle, true);
      ctx.stroke();

      // Diameter line preview
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(21, 101, 239, 0.5)';
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    }
  } else if (toolId === 'circular-arc' || toolId === 'circular-sector') {
    const isSector = toolId === 'circular-sector';
    if (resolvedPoints.length === 1) {
      // Step 1: Center placed, hovering for radius point
      const sCenter = screenPoints[0];
      const r = distance(resolvedPoints[0], currentMouseWorld);
      const rPix = r * pixelScale;
      drawGhostCircle(ctx, sCenter, rPix, 'rgba(21, 101, 239, 0.45)');

      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sCenter.x, sCenter.y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    } else if (resolvedPoints.length === 2) {
      // Step 2: Center and Start point placed, sweeping to mouse
      const center = resolvedPoints[0];
      const startPt = resolvedPoints[1];
      const sCenter = screenPoints[0];
      const sStart = screenPoints[1];
      const radius = distance(center, startPt);
      const rPix = radius * pixelScale;

      // Ghost full circle
      drawGhostCircle(ctx, sCenter, rPix, 'rgba(75, 85, 99, 0.35)');

      const startAngle = Math.atan2(startPt.y - center.y, startPt.x - center.x);
      const currentAngle = Math.atan2(currentMouseWorld.y - center.y, currentMouseWorld.x - center.x);

      // Arc / Sector preview
      ctx.beginPath();
      if (isSector) {
        ctx.moveTo(sCenter.x, sCenter.y);
        ctx.arc(sCenter.x, sCenter.y, rPix, -startAngle, -currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(21, 101, 239, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#1565ef';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
      } else {
        ctx.arc(sCenter.x, sCenter.y, rPix, -startAngle, -currentAngle, true);
        ctx.strokeStyle = '#1565ef';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();

        // Ghost radius lines
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(21, 101, 239, 0.4)';
        ctx.beginPath();
        ctx.moveTo(sCenter.x, sCenter.y);
        ctx.lineTo(sStart.x, sStart.y);
        ctx.moveTo(sCenter.x, sCenter.y);
        ctx.lineTo(mouseScreen.x, mouseScreen.y);
        ctx.stroke();
      }
    }
  } else if (toolId === 'circumcircular-arc' || toolId === 'circumcircular-sector') {
    const isSector = toolId === 'circumcircular-sector';
    if (resolvedPoints.length === 1) {
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    } else if (resolvedPoints.length === 2) {
      const p1 = resolvedPoints[0];
      const p2 = resolvedPoints[1];
      const p3 = currentMouseWorld;
      const c = circumcircularArc(p1, p2, p3, isSector);

      if (c) {
        const sCenter = worldToScreen(c.center.x, c.center.y, w, h, viewport);
        const rPix = c.radius * pixelScale;

        drawGhostCircle(ctx, sCenter, rPix, 'rgba(75, 85, 99, 0.35)');

        if (c.arc) {
          ctx.beginPath();
          if (isSector) {
            ctx.moveTo(sCenter.x, sCenter.y);
            ctx.arc(sCenter.x, sCenter.y, rPix, -c.arc.startAngle, -c.arc.endAngle, !c.arc.anticlockwise);
            ctx.closePath();
            ctx.fillStyle = 'rgba(21, 101, 239, 0.2)';
            ctx.fill();
            ctx.strokeStyle = '#1565ef';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.stroke();
          } else {
            ctx.arc(sCenter.x, sCenter.y, rPix, -c.arc.startAngle, -c.arc.endAngle, !c.arc.anticlockwise);
            ctx.strokeStyle = '#1565ef';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.stroke();
          }
        }
      }
    }
  } else if (toolId === 'circle-three-points') {
    if (resolvedPoints.length === 1) {
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    } else if (resolvedPoints.length === 2) {
      const c = circleFromThreePoints(resolvedPoints[0], resolvedPoints[1], currentMouseWorld);
      if (c) {
        const sCenter = worldToScreen(c.center.x, c.center.y, w, h, viewport);
        drawGhostCircle(ctx, sCenter, c.radius * pixelScale, 'rgba(21, 101, 239, 0.65)', 'rgba(21, 101, 239, 0.08)');
      }
    }
  } else if (toolId === 'compass') {
    if (resolvedPoints.length === 1) {
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    } else if (resolvedPoints.length === 2) {
      const r = distance(resolvedPoints[0], resolvedPoints[1]);
      drawGhostCircle(ctx, mouseScreen, r * pixelScale, 'rgba(21, 101, 239, 0.65)', 'rgba(21, 101, 239, 0.08)');
    }
  }

  // 4. Polygon Previews
  else if (toolId === 'regular-polygon') {
    if (resolvedPoints.length === 1) {
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    } else if (resolvedPoints.length >= 2) {
      // Wedge/square preview between p1 and p2
      const p1 = resolvedPoints[0];
      const p2 = resolvedPoints[1];
      const squarePts = regularPolygonVertices(p1, p2, 4);
      const sPts = squarePts.map((pt) => worldToScreen(pt.x, pt.y, w, h, viewport));

      ctx.beginPath();
      ctx.moveTo(sPts[0].x, sPts[0].y);
      for (let i = 1; i < sPts.length; i++) ctx.lineTo(sPts[i].x, sPts[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(21, 101, 239, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#1565ef';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    }
  }

  // 5. Conics Previews
  else if (toolId === 'ellipse' && resolvedPoints.length === 2) {
    const f1 = resolvedPoints[0];
    const f2 = resolvedPoints[1];
    const shape = ellipseFromFociAndPoint(f1, f2, currentMouseWorld);
    if (shape && shape.conicType === 'ellipse') {
      const sCenter = worldToScreen(shape.center.x, shape.center.y, w, h, viewport);
      const aScreen = shape.a * pixelScale;
      const bScreen = shape.b * pixelScale;

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.ellipse(sCenter.x, sCenter.y, aScreen, bScreen, -shape.angle, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(21, 101, 239, 0.65)';
      ctx.stroke();
    }
  } else if (toolId === 'hyperbola' && resolvedPoints.length === 2) {
    const f1 = resolvedPoints[0];
    const f2 = resolvedPoints[1];
    const shape = hyperbolaFromFociAndPoint(f1, f2, currentMouseWorld);
    if (shape && shape.conicType === 'hyperbola') {
      const { center, a, b, angle } = shape;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(21, 101, 239, 0.65)';

      // Right branch preview
      ctx.beginPath();
      let first = true;
      for (let t = -2.2; t <= 2.2; t += 0.15) {
        const u = a * Math.cosh(t);
        const v = b * Math.sinh(t);
        const sp = worldToScreen(center.x + u * cosA - v * sinA, center.y + u * sinA + v * cosA, w, h, viewport);
        if (first) {
          ctx.moveTo(sp.x, sp.y);
          first = false;
        } else {
          ctx.lineTo(sp.x, sp.y);
        }
      }
      ctx.stroke();

      // Left branch preview
      ctx.beginPath();
      first = true;
      for (let t = -2.2; t <= 2.2; t += 0.15) {
        const u = -a * Math.cosh(t);
        const v = b * Math.sinh(t);
        const sp = worldToScreen(center.x + u * cosA - v * sinA, center.y + u * sinA + v * cosA, w, h, viewport);
        if (first) {
          ctx.moveTo(sp.x, sp.y);
          first = false;
        } else {
          ctx.lineTo(sp.x, sp.y);
        }
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

