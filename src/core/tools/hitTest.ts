import { GeoObject, Viewport } from '../../types/geo';
import { PointCoords, resolvePoint } from '../geometry/Point';
import { worldToScreen } from '../../lib/coords/coordTransform';

export interface HitResult {
  object: GeoObject;
  distanceSq: number;
}

export function hitTest(
  worldPos: PointCoords,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number,
  objects: GeoObject[],
  pixelTolerance: number = 14
): (GeoObject & { hitPart?: 'thumb' | 'track' }) | null {
  const clickScreen = worldToScreen(worldPos.x, worldPos.y, canvasWidth, canvasHeight, viewport);
  const toleranceSq = pixelTolerance * pixelTolerance;

  let bestHit: { object: GeoObject & { hitPart?: 'thumb' | 'track' }; distanceSq: number } | null = null;

  for (const obj of objects) {
    if (!obj.visible || !obj.value) continue;

    let distSq = Infinity;
    let hitPart: 'thumb' | 'track' | undefined = undefined;

    if (obj.type === 'point') {
      const resolvedPt = resolvePoint(obj.value);
      const screenPt = worldToScreen(resolvedPt.x, resolvedPt.y, canvasWidth, canvasHeight, viewport);
      const dx = screenPt.x - clickScreen.x;
      const dy = screenPt.y - clickScreen.y;
      distSq = dx * dx + dy * dy;
    } else if (obj.type === 'slider') {
      const sliderVal = obj.value as any;
      if (sliderVal && typeof sliderVal.x === 'number') {
        const screenPt = worldToScreen(sliderVal.x, sliderVal.y, canvasWidth, canvasHeight, viewport);
        const sliderWidth = 140;
        const min = sliderVal.min ?? -5;
        const max = sliderVal.max ?? 5;
        const currentVal = sliderVal.val ?? 0;
        const range = max - min || 1;
        const fraction = Math.max(0, Math.min(1, (currentVal - min) / range));
        const thumbX = screenPt.x + fraction * sliderWidth;
        const thumbY = screenPt.y;

        const thumbDx = thumbX - clickScreen.x;
        const thumbDy = thumbY - clickScreen.y;
        const thumbDistSq = thumbDx * thumbDx + thumbDy * thumbDy;

        if (thumbDistSq <= 16 * 16) {
          distSq = thumbDistSq;
          hitPart = 'thumb';
        } else if (
          clickScreen.x >= screenPt.x - 10 &&
          clickScreen.x <= screenPt.x + sliderWidth + 10 &&
          clickScreen.y >= screenPt.y - 20 &&
          clickScreen.y <= screenPt.y + 16
        ) {
          distSq = 25;
          hitPart = 'track';
        }
      }
    } else if (obj.type === 'text') {
      const val = obj.value as any;
      if (val && typeof val.x === 'number') {
        const screenPt = worldToScreen(val.x, val.y, canvasWidth, canvasHeight, viewport);
        const textLen = (val.text || 'Text').length;
        const boxWidth = Math.max(40, textLen * 9);
        const boxHeight = 22;

        if (
          clickScreen.x >= screenPt.x - 6 &&
          clickScreen.x <= screenPt.x + boxWidth + 6 &&
          clickScreen.y >= screenPt.y - boxHeight - 4 &&
          clickScreen.y <= screenPt.y + 6
        ) {
          distSq = 0; // High priority hit
        }
      }
    } else if (obj.type === 'image') {
      const val = obj.value as any;
      if (val && typeof val.x === 'number') {
        const screenPt = worldToScreen(val.x, val.y, canvasWidth, canvasHeight, viewport);
        const pixelScale = canvasWidth / (viewport.xMax - viewport.xMin);
        const imgW = (val.width || 4) * pixelScale;
        const imgH = (val.height || 3) * pixelScale;

        if (
          clickScreen.x >= screenPt.x - 4 &&
          clickScreen.x <= screenPt.x + imgW + 4 &&
          clickScreen.y >= screenPt.y - imgH - 4 &&
          clickScreen.y <= screenPt.y + 4
        ) {
          distSq = 1;
        }
      }
    } else if (obj.type === 'segment' || obj.type === 'line' || obj.type === 'ray' || obj.type === 'vector') {
      const lineVal = obj.value as any;
      if (lineVal && lineVal.p1 && lineVal.p2) {
        const s1 = worldToScreen(lineVal.p1.x, lineVal.p1.y, canvasWidth, canvasHeight, viewport);
        const s2 = worldToScreen(lineVal.p2.x, lineVal.p2.y, canvasWidth, canvasHeight, viewport);
        const l2 = (s2.x - s1.x) ** 2 + (s2.y - s1.y) ** 2;
        if (l2 === 0) {
          distSq = (clickScreen.x - s1.x) ** 2 + (clickScreen.y - s1.y) ** 2;
        } else {
          let t = ((clickScreen.x - s1.x) * (s2.x - s1.x) + (clickScreen.y - s1.y) * (s2.y - s1.y)) / l2;
          if (obj.type === 'segment') {
            t = Math.max(0, Math.min(1, t));
          } else if (obj.type === 'ray') {
            t = Math.max(0, t);
          }
          const projX = s1.x + t * (s2.x - s1.x);
          const projY = s1.y + t * (s2.y - s1.y);
          distSq = (clickScreen.x - projX) ** 2 + (clickScreen.y - projY) ** 2;
        }
      } else if (lineVal && typeof lineVal.a === 'number' && typeof lineVal.b === 'number') {
        const { a, b, c } = lineVal;
        const norm = Math.sqrt(a * a + b * b);
        if (norm > 0) {
          const worldDist = Math.abs(a * worldPos.x + b * worldPos.y + c) / norm;
          const pixelScale = canvasWidth / (viewport.xMax - viewport.xMin);
          const pixelDist = worldDist * pixelScale;
          distSq = pixelDist * pixelDist;
        }
      }
    } else if (obj.type === 'circle') {
      const circleVal = obj.value as any;
      if (circleVal && circleVal.center && typeof circleVal.radius === 'number') {
        const centerScreen = worldToScreen(circleVal.center.x, circleVal.center.y, canvasWidth, canvasHeight, viewport);
        const pixelScale = canvasWidth / (viewport.xMax - viewport.xMin);
        const radiusScreen = circleVal.radius * pixelScale;
        const clickDist = Math.sqrt((clickScreen.x - centerScreen.x) ** 2 + (clickScreen.y - centerScreen.y) ** 2);
        const diff = Math.abs(clickDist - radiusScreen);
        distSq = diff * diff;
      }
    }

    if (distSq <= toleranceSq) {
      if (!bestHit || distSq < bestHit.distanceSq) {
        bestHit = { object: { ...obj, hitPart }, distanceSq: distSq };
      }
    }
  }

  return bestHit ? bestHit.object : null;
}
