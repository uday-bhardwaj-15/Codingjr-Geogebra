import { GeoObject, Viewport } from '../../../types/geo';
import { PointCoords, PointValue, resolvePoint } from '../../../core/geometry/Point';
import { worldToScreen } from '../../../lib/coords/coordTransform';

export function renderLivePreview(
  ctx: CanvasRenderingContext2D,
  toolId: string,
  pendingSelections: GeoObject[],
  currentMouseWorld: PointCoords | null,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!currentMouseWorld || pendingSelections.length === 0) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(21, 101, 239, 0.6)';
  ctx.fillStyle = 'rgba(21, 101, 239, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);

  const mouseScreen = worldToScreen(currentMouseWorld.x, currentMouseWorld.y, canvasWidth, canvasHeight, viewport);

  if (
    toolId === 'segment' ||
    toolId === 'line' ||
    toolId === 'ray' ||
    toolId === 'vector' ||
    toolId === 'perpendicular-bisector' ||
    toolId === 'midpoint-center' ||
    toolId === 'distance-length'
  ) {
    if (pendingSelections.length === 1 && pendingSelections[0].type === 'point') {
      const p1 = pendingSelections[0].value as PointValue;
      const resolvedP1 = resolvePoint(p1);
      const screenP1 = worldToScreen(resolvedP1.x, resolvedP1.y, canvasWidth, canvasHeight, viewport);

      ctx.beginPath();
      ctx.moveTo(screenP1.x, screenP1.y);
      ctx.lineTo(mouseScreen.x, mouseScreen.y);
      ctx.stroke();
    }
  } else if (toolId === 'circle-center-point' || toolId === 'semicircle') {
    if (pendingSelections.length === 1 && pendingSelections[0].type === 'point') {
      const p1 = pendingSelections[0].value as PointValue;
      const resolvedP1 = resolvePoint(p1);
      const screenP1 = worldToScreen(resolvedP1.x, resolvedP1.y, canvasWidth, canvasHeight, viewport);

      const dx = mouseScreen.x - screenP1.x;
      const dy = mouseScreen.y - screenP1.y;
      const rScreen = Math.sqrt(dx * dx + dy * dy);

      ctx.beginPath();
      ctx.arc(screenP1.x, screenP1.y, rScreen, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }

  ctx.restore();
}
