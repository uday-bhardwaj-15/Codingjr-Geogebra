import { PointCoords3D, SolidValue } from '../../types/geo';
import {
  distance3D,
  sub3D,
  add3D,
  scale3D,
  cross3D,
  normalize3D,
  dot3D,
  length3D,
  Vector3D,
} from './point3d';

/**
 * Calculates 3D polygon area using Newell's / cross product method
 */
export function polygon3DArea(vertices: PointCoords3D[]): number {
  if (vertices.length < 3) return 0;
  let totalCross = { x: 0, y: 0, z: 0 };
  const p0 = vertices[0];
  for (let i = 1; i < vertices.length - 1; i++) {
    const v1 = sub3D(vertices[i], p0);
    const v2 = sub3D(vertices[i + 1], p0);
    const c = cross3D(v1, v2);
    totalCross = add3D(totalCross, c);
  }
  return 0.5 * length3D(totalCross);
}

/**
 * Computes vertices for a 3D regular n-gon given first edge (p1, p2) and vertex count n.
 */
export function regularPolygon3DVertices(
  p1: PointCoords3D,
  p2: PointCoords3D,
  n: number
): PointCoords3D[] {
  if (n < 3) return [p1, p2];

  const edge = sub3D(p2, p1);
  const s = distance3D(p1, p2);
  if (s < 1e-6) return [p1, p2];

  // Pick normal vector: ground plane (0,0,1) if on XY plane, else perpendicular
  let normal: Vector3D = { x: 0, y: 0, z: 1 };
  if (Math.abs(p1.z) > 1e-4 || Math.abs(p2.z) > 1e-4) {
    let perp = { x: -edge.y, y: edge.x, z: 0 };
    if (length3D(perp) < 1e-6) perp = { x: 1, y: 0, z: 0 };
    normal = normalize3D(cross3D(edge, perp));
  }

  // Vector in the polygon plane perpendicular to edge
  const inPlanePerp = normalize3D(cross3D(normal, edge));

  // Center of the regular polygon: midpoint of p1,p2 + inPlanePerp * (s / (2 * tan(pi/n)))
  const mid = scale3D(add3D(p1, p2), 0.5);
  const distToCenter = s / (2 * Math.tan(Math.PI / n));
  const center = add3D(mid, scale3D(inPlanePerp, distToCenter));

  // Radius vector from center to p1
  const r0 = sub3D(p1, center);
  const u = normalize3D(r0);
  const v = normalize3D(cross3D(normal, u));
  const R = length3D(r0);

  const vertices: PointCoords3D[] = [];
  const angleStep = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    const offset = add3D(
      scale3D(u, R * Math.cos(angle)),
      scale3D(v, R * Math.sin(angle))
    );
    const pt = add3D(center, offset);
    vertices.push({
      x: parseFloat(pt.x.toFixed(3)),
      y: parseFloat(pt.y.toFixed(3)),
      z: parseFloat(pt.z.toFixed(3)),
    });
  }

  return vertices;
}

/**
 * Creates a cube from two points (p1 and p2 defining the base edge and orientation).
 */
export function cubeFromTwoPoints(p1: PointCoords3D, p2: PointCoords3D): SolidValue {
  const edgeVec = sub3D(p2, p1);
  const s = distance3D(p1, p2);

  // Determine perpendicular vectors in XY plane or 3D
  let u = normalize3D({ x: -edgeVec.y, y: edgeVec.x, z: 0 });
  if (Math.abs(edgeVec.x) < 1e-6 && Math.abs(edgeVec.y) < 1e-6) {
    u = { x: 1, y: 0, z: 0 };
  }
  const uVec = scale3D(u, s);
  const w = cross3D(normalize3D(edgeVec), u);
  const wVec = scale3D(normalize3D(w), s);

  const p3 = add3D(p2, uVec);
  const p4 = add3D(p1, uVec);

  const p5 = add3D(p1, wVec);
  const p6 = add3D(p2, wVec);
  const p7 = add3D(p3, wVec);
  const p8 = add3D(p4, wVec);

  const vertices = [p1, p2, p3, p4, p5, p6, p7, p8];
  const faces = [
    [0, 1, 2, 3], // Bottom
    [4, 5, 6, 7], // Top
    [0, 1, 5, 4], // Front
    [2, 3, 7, 6], // Back
    [0, 3, 7, 4], // Left
    [1, 2, 6, 5], // Right
  ];

  return {
    type: 'cube',
    vertices,
    faces,
    volume: s * s * s,
    p1,
    p2,
  };
}

/**
 * Creates a regular tetrahedron from two points (p1 and p2 defining one edge).
 */
export function tetrahedronFromTwoPoints(p1: PointCoords3D, p2: PointCoords3D): SolidValue {
  const edgeVec = sub3D(p2, p1);
  const s = distance3D(p1, p2);

  // Compute perpendicular horizontal vector and vertical normal
  let u = normalize3D({ x: -edgeVec.y, y: edgeVec.x, z: 0 });
  if (Math.abs(edgeVec.x) < 1e-6 && Math.abs(edgeVec.y) < 1e-6) {
    u = { x: 1, y: 0, z: 0 };
  }
  const w = normalize3D(cross3D(normalize3D(edgeVec), u));

  // Third vertex of equilateral base triangle: midpoint + altitude along u
  const mid = scale3D(add3D(p1, p2), 0.5);
  const hBase = (Math.sqrt(3) / 2) * s;
  const p3 = add3D(mid, scale3D(u, hBase));

  // Apex vertex: base centroid + height along w
  const centroid = scale3D(add3D(add3D(p1, p2), p3), 1 / 3);
  const hTetra = Math.sqrt(2 / 3) * s;
  const p4 = add3D(centroid, scale3D(w, hTetra));

  const vertices = [p1, p2, p3, p4];
  const faces = [
    [0, 1, 2], // Base
    [0, 1, 3], // Front-left
    [1, 2, 3], // Front-right
    [2, 0, 3], // Back
  ];

  const volume = (s * s * s) / (6 * Math.SQRT2);

  return {
    type: 'tetrahedron',
    vertices,
    faces,
    volume,
    p1,
    p2,
  };
}

/**
 * Creates a pyramid from a base polygon and an apex point.
 */
export function pyramidFromBaseAndApex(
  baseVertices: PointCoords3D[],
  apex: PointCoords3D
): SolidValue {
  const n = baseVertices.length;
  const vertices = [...baseVertices, apex];
  const apexIdx = n;

  const faces: number[][] = [];
  // Base face
  faces.push(Array.from({ length: n }, (_, i) => i));

  // Side triangular faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    faces.push([i, next, apexIdx]);
  }

  // Calculate volume
  const baseArea = polygon3DArea(baseVertices);
  let height = 0;
  if (baseVertices.length >= 3) {
    const v1 = sub3D(baseVertices[1], baseVertices[0]);
    const v2 = sub3D(baseVertices[2], baseVertices[0]);
    const normal = normalize3D(cross3D(v1, v2));
    height = Math.abs(dot3D(sub3D(apex, baseVertices[0]), normal));
  } else {
    height = distance3D(apex, baseVertices[0] || { x: 0, y: 0, z: 0 });
  }
  const volume = (baseArea * height) / 3;

  return {
    type: 'pyramid',
    vertices,
    faces,
    baseVertices,
    apex,
    volume,
  };
}

/**
 * Creates a prism from a base polygon and a top vector / point.
 */
export function prismFromBaseAndTop(
  baseVertices: PointCoords3D[],
  topPointOrVec: PointCoords3D
): SolidValue {
  const n = baseVertices.length;
  // Calculate extrusion vector
  const p0 = baseVertices[0];
  const extVec = sub3D(topPointOrVec, p0);

  const topVertices = baseVertices.map((v) => add3D(v, extVec));
  const vertices = [...baseVertices, ...topVertices];

  const faces: number[][] = [];
  // Bottom face
  faces.push(Array.from({ length: n }, (_, i) => i));
  // Top face
  faces.push(Array.from({ length: n }, (_, i) => i + n));

  // Side quad faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    faces.push([i, next, next + n, i + n]);
  }

  const baseArea = polygon3DArea(baseVertices);
  let height = 0;
  if (baseVertices.length >= 3) {
    const v1 = sub3D(baseVertices[1], baseVertices[0]);
    const v2 = sub3D(baseVertices[2], baseVertices[0]);
    const normal = normalize3D(cross3D(v1, v2));
    height = Math.abs(dot3D(extVec, normal));
  } else {
    height = length3D(extVec);
  }
  const volume = baseArea * height;

  return {
    type: 'prism',
    vertices,
    faces,
    baseVertices,
    apex: topPointOrVec,
    volume,
  };
}

/**
 * Creates a cylinder between p1 and p2 with given radius.
 */
export function cylinderFromPointsAndRadius(
  p1: PointCoords3D,
  p2: PointCoords3D,
  radius: number
): SolidValue {
  const height = distance3D(p1, p2);
  const volume = Math.PI * radius * radius * height;
  return {
    type: 'cylinder',
    p1,
    p2,
    baseCenter: p1,
    topCenter: p2,
    radius,
    height,
    volume,
  };
}

/**
 * Creates a cone from base center and apex with given radius.
 */
export function coneFromBaseAndApex(
  center: PointCoords3D,
  apex: PointCoords3D,
  radius: number
): SolidValue {
  const height = distance3D(center, apex);
  const volume = (Math.PI * radius * radius * height) / 3;
  return {
    type: 'cone',
    center,
    baseCenter: center,
    apex,
    radius,
    height,
    volume,
  };
}

/**
 * Extrudes a base polygon along its normal by a given altitude to create a Prism.
 */
export function extrudePolygonToPrism(
  baseVertices: PointCoords3D[],
  altitude: number
): SolidValue {
  let normal: Vector3D = { x: 0, y: 0, z: 1 };
  if (baseVertices.length >= 3) {
    const v1 = sub3D(baseVertices[1], baseVertices[0]);
    const v2 = sub3D(baseVertices[2], baseVertices[0]);
    normal = normalize3D(cross3D(v1, v2));
  }
  const topPoint = add3D(baseVertices[0], scale3D(normal, altitude));
  return prismFromBaseAndTop(baseVertices, topPoint);
}

/**
 * Extrudes a base polygon along its normal by a given altitude to an apex point to create a Pyramid.
 */
export function extrudePolygonToPyramid(
  baseVertices: PointCoords3D[],
  altitude: number
): SolidValue {
  let normal: Vector3D = { x: 0, y: 0, z: 1 };
  if (baseVertices.length >= 3) {
    const v1 = sub3D(baseVertices[1], baseVertices[0]);
    const v2 = sub3D(baseVertices[2], baseVertices[0]);
    normal = normalize3D(cross3D(v1, v2));
  }
  // Centroid of base polygon
  let sum = { x: 0, y: 0, z: 0 };
  baseVertices.forEach((v) => {
    sum = add3D(sum, v);
  });
  const centroid = scale3D(sum, 1 / (baseVertices.length || 1));
  const apex = add3D(centroid, scale3D(normal, altitude));
  return pyramidFromBaseAndApex(baseVertices, apex);
}

/**
 * Generates a surface of revolution mesh from a line/segment revolving around an axis line.
 */
export function surfaceOfRevolutionFromLine(
  line: { p1: PointCoords3D; p2: PointCoords3D },
  axis: { p1: PointCoords3D; p2: PointCoords3D },
  steps: number = 24
): SolidValue {
  const vertices: PointCoords3D[] = [];
  const faces: number[][] = [];
  const angleStep = (2 * Math.PI) / steps;

  // Revolution of line.p1 and line.p2 around axis
  const axisP1 = axis.p1;
  const k = normalize3D(sub3D(axis.p2, axis.p1));

  for (let i = 0; i <= steps; i++) {
    const angle = i * angleStep;
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);

    // Rotate line.p1
    const v1 = sub3D(line.p1, axisP1);
    const r1 = add3D(
      axisP1,
      add3D(
        add3D(scale3D(v1, cosT), scale3D(cross3D(k, v1), sinT)),
        scale3D(k, dot3D(k, v1) * (1 - cosT))
      )
    );

    // Rotate line.p2
    const v2 = sub3D(line.p2, axisP1);
    const r2 = add3D(
      axisP1,
      add3D(
        add3D(scale3D(v2, cosT), scale3D(cross3D(k, v2), sinT)),
        scale3D(k, dot3D(k, v2) * (1 - cosT))
      )
    );

    vertices.push(r1, r2);
  }

  for (let i = 0; i < steps; i++) {
    const i1 = i * 2;
    const i2 = i * 2 + 1;
    const i3 = (i + 1) * 2 + 1;
    const i4 = (i + 1) * 2;
    faces.push([i1, i2, i3, i4]);
  }

  return {
    type: 'cylinder',
    vertices,
    faces,
    volume: 0,
  };
}
