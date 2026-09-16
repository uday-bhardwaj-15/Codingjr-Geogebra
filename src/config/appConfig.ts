export type AppId = 'graphing' | 'geometry' | 'probability' | 'scientific' | 'cas';

export interface GeometryCategoryGroup {
  id: string;
  label: string;
  toolIds: string[];
}

export interface AppConfig {
  id: AppId;
  label: string;
  icon: string;
  route: string;
  hasCanvas: boolean;
  hasToolsPanel: boolean;
  leftRailTabs: Array<'algebra' | 'tools' | 'table' | 'spreadsheet' | 'distribution'>;
  algebraVariant?: 'sidebar' | 'fullpage' | 'cas';
  geometryCategories?: {
    collapsed: GeometryCategoryGroup[];
    expanded: GeometryCategoryGroup[];
  };
  defaultAxesVisible?: boolean;
}

export const GEOMETRY_CATEGORIES = {
  collapsed: [
    {
      id: 'basic',
      label: 'Basic Tools',
      toolIds: ['move', 'point', 'segment', 'line', 'polygon', 'circle-center-point'],
    },
    {
      id: 'edit',
      label: 'Edit',
      toolIds: ['select-objects', 'show-hide-label', 'show-hide-object', 'delete'],
    },
    {
      id: 'construct',
      label: 'Construct',
      toolIds: [
        'midpoint-center',
        'perpendicular-line',
        'perpendicular-bisector',
        'parallel-line',
        'angle-bisector',
        'tangents',
      ],
    },
    {
      id: 'measure',
      label: 'Measure',
      toolIds: ['angle', 'distance-length', 'area'],
    },
    {
      id: 'lines',
      label: 'Lines',
      toolIds: ['segment', 'ray', 'vector', 'line'],
    },
    {
      id: 'circles',
      label: 'Circles',
      toolIds: ['circle-center-point', 'compass', 'semicircle'],
    },
  ],
  expanded: [
    {
      id: 'basic',
      label: 'Basic Tools',
      toolIds: ['move', 'point', 'segment', 'line', 'polygon', 'circle-center-point'],
    },
    {
      id: 'edit',
      label: 'Edit',
      toolIds: ['select-objects', 'show-hide-label', 'show-hide-object', 'delete'],
    },
    {
      id: 'construct',
      label: 'Construct',
      toolIds: [
        'midpoint-center',
        'perpendicular-line',
        'perpendicular-bisector',
        'parallel-line',
        'angle-bisector',
        'tangents',
      ],
    },
    {
      id: 'measure',
      label: 'Measure',
      toolIds: ['angle', 'angle-given-size', 'distance-length', 'area'],
    },
    {
      id: 'lines',
      label: 'Lines',
      toolIds: ['segment', 'segment-given-length', 'ray', 'vector', 'line'],
    },
    {
      id: 'circles',
      label: 'Circles',
      toolIds: [
        'circle-center-point',
        'compass',
        'semicircle',
        'circle-center-radius',
        'circular-arc',
        'circumcircular-arc',
        'circular-sector',
        'circumcircular-sector',
      ],
    },
    {
      id: 'polygons',
      label: 'Polygons',
      toolIds: ['polygon', 'regular-polygon'],
    },
    {
      id: 'transform',
      label: 'Transform',
      toolIds: [
        'reflect-line',
        'reflect-point',
        'translate-vector',
        'rotate-around-point',
        'dilate-from-point',
      ],
    },
    {
      id: 'media',
      label: 'Media',
      toolIds: ['image', 'text'],
    },
  ],
};

export const APPS: Record<AppId, AppConfig> = {
  graphing: {
    id: 'graphing',
    label: 'Graphing',
    icon: 'graphing',
    route: '/graphing',
    hasCanvas: true,
    hasToolsPanel: true,
    leftRailTabs: ['algebra', 'tools', 'table', 'spreadsheet'],
    algebraVariant: 'sidebar',
    defaultAxesVisible: true,
  },
  geometry: {
    id: 'geometry',
    label: 'Geometry',
    icon: 'geometry',
    route: '/geometry',
    hasCanvas: true,
    hasToolsPanel: true,
    leftRailTabs: ['algebra', 'tools'],
    algebraVariant: 'sidebar',
    geometryCategories: GEOMETRY_CATEGORIES,
    defaultAxesVisible: false,
  },
  probability: {
    id: 'probability',
    label: 'Probability',
    icon: 'probability',
    route: '/probability',
    hasCanvas: false,
    hasToolsPanel: false,
    leftRailTabs: ['distribution'],
  },
  scientific: {
    id: 'scientific',
    label: 'Scientific',
    icon: 'scientific',
    route: '/scientific',
    hasCanvas: false,
    hasToolsPanel: false,
    leftRailTabs: ['algebra', 'table'],
    algebraVariant: 'fullpage',
  },
  cas: {
    id: 'cas',
    label: 'CAS',
    icon: 'cas',
    route: '/cas',
    hasCanvas: true,
    hasToolsPanel: false,
    leftRailTabs: ['algebra', 'table', 'spreadsheet'],
    algebraVariant: 'cas',
    defaultAxesVisible: true,
  },
};
