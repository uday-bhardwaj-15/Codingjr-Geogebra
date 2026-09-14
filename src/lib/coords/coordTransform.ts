import { Viewport } from '../../types/geo';
import { PointCoords } from '../../core/geometry/Point';

export function screenToWorld(
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: Viewport
): PointCoords {
  const x = viewport.xMin + (screenX / canvasWidth) * (viewport.xMax - viewport.xMin);
  const y = viewport.yMax - (screenY / canvasHeight) * (viewport.yMax - viewport.yMin);
  return { x, y };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: Viewport
): PointCoords {
  const x = ((worldX - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasWidth;
  const y = ((viewport.yMax - worldY) / (viewport.yMax - viewport.yMin)) * canvasHeight;
  return { x, y };
}
