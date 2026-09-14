import { GeoObject, Viewport } from './geo';

export interface StoredConstructionV1 {
  schemaVersion: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  viewport: Viewport;
  objects: GeoObject[];
}

export interface StoredSettingsV1 {
  schemaVersion: 1;
  theme: 'light' | 'dark';
  angleUnit: 'degree' | 'radian';
  roundingDigits: number;
}
