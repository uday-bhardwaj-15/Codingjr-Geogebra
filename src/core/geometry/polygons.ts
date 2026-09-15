import { PointCoords, distance } from './Point';

export function regularPolygonVertices(
  p1: PointCoords,
  p2: PointCoords,
  n: number
): PointCoords[] {
  if (n < 3) return [p1, p2];

  const s = distance(p1, p2);
  if (s === 0) return Array(n).fill(p1);

  const R = s / (2 * Math.sin(Math.PI / n));
  const apothem = s / (2 * Math.tan(Math.PI / n));

  const mid = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };

  const ux = (p2.x - p1.x) / s;
  const uy = (p2.y - p1.y) / s;

  // Normal vector to the left of p1 -> p2 (so vertices go counterclockwise)
  const nx = -uy;
  const ny = ux;

  const center: PointCoords = {
    x: mid.x + apothem * nx,
    y: mid.y + apothem * ny,
  };

  const theta0 = Math.atan2(p1.y - center.y, p1.x - center.x);
  const dTheta = (2 * Math.PI) / n;

  const vertices: PointCoords[] = [];
  for (let k = 0; k < n; k++) {
    const angle = theta0 + k * dTheta;
    vertices.push({
      x: center.x + R * Math.cos(angle),
      y: center.y + R * Math.sin(angle),
    });
  }

  return vertices;
}

export function polygonArea(vertices: PointCoords[]): number {
  const n = vertices.length;
  if (n < 3) return 0;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

export function polygonPerimeter(vertices: PointCoords[]): number {
  const n = vertices.length;
  if (n < 2) return 0;

  let perim = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perim += distance(vertices[i], vertices[j]);
  }
  return perim;
}
