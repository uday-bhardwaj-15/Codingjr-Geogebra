export type GeoObjectType = 'point' | 'line' | 'segment' | 'ray' | 'vector' | 'circle' | 'polygon' | 'angle' | 'function' | 'text' | 'image' | 'measurement' | 'slider';

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
