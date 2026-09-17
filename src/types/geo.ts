export type GeoObjectType =
  | 'point'
  | 'line'
  | 'segment'
  | 'ray'
  | 'vector'
  | 'circle'
  | 'conic'
  | 'polygon'
  | 'polyline'
  | 'locus'
  | 'angle'
  | 'function'
  | 'text'
  | 'image'
  | 'measurement'
  | 'slider'
  | 'plane'
  | 'sphere'
  | 'cube'
  | 'tetrahedron'
  | 'cone'
  | 'cylinder'
  | 'pyramid'
  | 'prism'
  | 'polyhedron'
  | 'circular-arc'
  | 'circular-sector'
  | 'semicircle'
  | 'circumcircular-arc'
  | 'circumcircular-sector'
  | 'arc'
  | 'ellipse'
  | 'hyperbola'
  | 'parabola'
  | 'surface-of-revolution'
  | 'surface'
  | 'distance'
  | 'area'
  | 'volume'
  | 'conic-five-points';

export interface ObjectStyle {
  color: string;
  thickness: number;
  pointStyle?: 'dot' | 'cross' | 'diamond';
  opacity: number;
}

export interface GeoObject {
  id: string;
  label: string;
  type: GeoObjectType;
  definition: string;
  dependsOn: string[];
  value: unknown;
  visible: boolean;
  labelVisible: boolean;
  style: ObjectStyle;
  createdByToolId: string;
  createdAt: number;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PointCoords3D {
  x: number;
  y: number;
  z: number;
}

export interface PlaneValue {
  a: number;
  b: number;
  c: number;
  d: number;
  normal?: PointCoords3D;
  point?: PointCoords3D;
}

export interface SphereValue {
  center: PointCoords3D;
  radius: number;
}

export interface SolidValue {
  type: 'cube' | 'tetrahedron' | 'sphere' | 'cone' | 'cylinder' | 'pyramid' | 'prism';
  vertices?: PointCoords3D[];
  faces?: number[][];
  baseVertices?: PointCoords3D[];
  apex?: PointCoords3D;
  center?: PointCoords3D;
  baseCenter?: PointCoords3D;
  topCenter?: PointCoords3D;
  radius?: number;
  height?: number;
  volume?: number;
  p1?: PointCoords3D;
  p2?: PointCoords3D;
}
