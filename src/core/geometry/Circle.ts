import { PointCoords, distance } from './Point';

export interface CircleValue {
  center: PointCoords;
  radius: number;
  arc?: { startAngle: number; endAngle: number };
}

export function circleFromCenterAndPoint(center: PointCoords, pointOnCircle: PointCoords): CircleValue {
  return {
    center,
    radius: distance(center, pointOnCircle),
  };
}
