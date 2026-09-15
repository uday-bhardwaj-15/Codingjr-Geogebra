import { PointCoords, distance } from './Point';
import { LineValue, lineFromTwoPoints } from './Line';

export function tangentsToCircle(
  point: PointCoords,
  circle: { center: PointCoords; radius: number }
): LineValue[] {
  const d = distance(point, circle.center);
  const R = circle.radius;

  if (d < R - 1e-9) {
    // Point inside circle - no real tangents
    return [];
  }

  if (Math.abs(d - R) <= 1e-9) {
    // Point is on circle - 1 tangent
    const normalX = point.x - circle.center.x;
    const normalY = point.y - circle.center.y;
    // Equation: normalX * (x - point.x) + normalY * (y - point.y) = 0
    return [
      {
        a: normalX,
        b: normalY,
        c: -normalX * point.x - normalY * point.y,
      },
    ];
  }

  // External point - 2 tangents
  const theta = Math.atan2(point.y - circle.center.y, point.x - circle.center.x);
  const alpha = Math.acos(Math.min(1, Math.max(-1, R / d)));

  // Contact points on circle
  // Angle of contact points relative to center: theta +- (PI - alpha) or center to P offset
  // Actually, angle from center to contact point:
  // In right triangle (Center, ContactPoint, Point):
  // Angle at Center is alpha = acos(R / d).
  // So contact points are at theta + alpha and theta - alpha
  const t1Angle = theta + alpha;
  const t2Angle = theta - alpha;

  const t1: PointCoords = {
    x: circle.center.x + R * Math.cos(t1Angle),
    y: circle.center.y + R * Math.sin(t1Angle),
  };

  const t2: PointCoords = {
    x: circle.center.x + R * Math.cos(t2Angle),
    y: circle.center.y + R * Math.sin(t2Angle),
  };

  return [lineFromTwoPoints(point, t1), lineFromTwoPoints(point, t2)];
}
