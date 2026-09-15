import { PointCoords, distance } from './Point';

export function distanceBetweenPoints(p1: PointCoords, p2: PointCoords): number {
  return distance(p1, p2);
}

export function angleBetweenThreePoints(
  p1: PointCoords,
  vertex: PointCoords,
  p2: PointCoords
): { rad: number; deg: number } {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };

  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);

  let diff = angle2 - angle1;
  while (diff < 0) diff += 2 * Math.PI;
  while (diff >= 2 * Math.PI) diff -= 2 * Math.PI;

  const deg = (diff * 180) / Math.PI;
  return { rad: diff, deg };
}

export function circleArea(radius: number): number {
  return Math.PI * radius * radius;
}

export function circleCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}
