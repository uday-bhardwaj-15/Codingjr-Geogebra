import { PointCoords, distance } from './Point';
import { perpendicularBisector, lineFromTwoPoints } from './Line';
import { intersectLineLine } from './intersections';

export interface CircleValue {
  center: PointCoords;
  radius: number;
  arc?: {
    startAngle: number; // in world/math radians (CCW from +x)
    endAngle: number;   // in world/math radians
    anticlockwise?: boolean;
  };
  filled?: boolean;
  hasRadiusLines?: boolean;
}

export function circleFromCenterAndPoint(
  center: PointCoords,
  pointOnCircle: PointCoords
): CircleValue {
  return {
    center,
    radius: distance(center, pointOnCircle),
  };
}

export function circleFromCenterAndRadius(
  center: PointCoords,
  radius: number
): CircleValue {
  return {
    center,
    radius: Math.max(0, radius),
  };
}

export function circleFromThreePoints(
  p1: PointCoords,
  p2: PointCoords,
  p3: PointCoords
): CircleValue | null {
  const bisector1 = perpendicularBisector(p1, p2);
  const bisector2 = perpendicularBisector(p2, p3);

  const center = intersectLineLine(bisector1, bisector2);
  if (!center) return null;

  const radius = distance(center, p1);
  return { center, radius };
}

export function semicircleFromDiameter(
  p1: PointCoords,
  p2: PointCoords
): CircleValue {
  const center: PointCoords = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
  const radius = distance(p1, p2) / 2;
  const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
  const endAngle = startAngle + Math.PI;

  return {
    center,
    radius,
    arc: { startAngle, endAngle },
    filled: false,
  };
}

export function circularArcFromCenter(
  center: PointCoords,
  startPt: PointCoords,
  endPt: PointCoords,
  filled: boolean = false
): CircleValue {
  const radius = distance(center, startPt);
  const startAngle = Math.atan2(startPt.y - center.y, startPt.x - center.x);
  const endAngle = Math.atan2(endPt.y - center.y, endPt.x - center.x);

  return {
    center,
    radius,
    arc: { startAngle, endAngle },
    filled,
    hasRadiusLines: filled,
  };
}

export function circumcircularArc(
  p1: PointCoords,
  p2: PointCoords,
  p3: PointCoords,
  filled: boolean = false
): CircleValue | null {
  const circ = circleFromThreePoints(p1, p2, p3);
  if (!circ) return null;

  const a1 = Math.atan2(p1.y - circ.center.y, p1.x - circ.center.x);
  const a2 = Math.atan2(p2.y - circ.center.y, p2.x - circ.center.x);
  const a3 = Math.atan2(p3.y - circ.center.y, p3.x - circ.center.x);

  // Normalize angles to [0, 2pi) relative to a1
  const normA2 = (a2 - a1 + 4 * Math.PI) % (2 * Math.PI);
  const normA3 = (a3 - a1 + 4 * Math.PI) % (2 * Math.PI);

  let startAngle = a1;
  let endAngle = a3;
  let anticlockwise = false;

  if (normA2 > normA3) {
    // If going CCW from a1 to a3 does NOT include a2, then arc passes through a2 going clockwise
    anticlockwise = true;
  }

  return {
    center: circ.center,
    radius: circ.radius,
    arc: { startAngle, endAngle, anticlockwise },
    filled,
    hasRadiusLines: filled,
  };
}
