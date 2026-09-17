export type AppId = 'graphing' | 'geometry' | 'probability' | 'scientific' | 'cas' | '3d';

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
  canvasType?: '2d' | '3d';
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
      id: 'points',
      label: 'Points',
      toolIds: ['point', 'intersect', 'point-on-object'],
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
    {
      id: 'polygons',
      label: 'Polygons',
      toolIds: ['polygon', 'regular-polygon'],
    },
    {
      id: 'conics',
      label: 'Conics',
      toolIds: ['ellipse', 'parabola'],
    },
    {
      id: 'transform',
      label: 'Transform',
      toolIds: ['translate-vector', 'reflect-line', 'reflect-point'],
    },
    {
      id: 'media',
      label: 'Media',
      toolIds: ['slider', 'image', 'text'],
    },
    {
      id: 'others',
      label: 'Others',
      toolIds: ['pen', 'freehand-shape'],
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
      toolIds: [
        'select-objects',
        'show-hide-label',
        'show-hide-object',
        'delete',
        'move-graphics-view',
        'copy-visual-style',
      ],
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
        'locus',
      ],
    },
    {
      id: 'measure',
      label: 'Measure',
      toolIds: ['angle', 'angle-given-size', 'distance-length', 'area', 'slope'],
    },
    {
      id: 'points',
      label: 'Points',
      toolIds: [
        'point',
        'intersect',
        'point-on-object',
        'attach-detach-point',
        'extremum',
        'roots',
        'complex-number',
        'list',
      ],
    },
    {
      id: 'lines',
      label: 'Lines',
      toolIds: [
        'segment',
        'segment-given-length',
        'line',
        'ray',
        'vector',
        'vector-from-point',
        'polar-diameter-line',
        'polyline',
        'best-fit-line',
      ],
    },
    {
      id: 'circles',
      label: 'Circles',
      toolIds: [
        'circle-center-point',
        'circle-center-radius',
        'compass',
        'semicircle',
        'circular-sector',
        'circular-arc',
        'circle-three-points',
        'circumcircular-sector',
        'circumcircular-arc',
      ],
    },
    {
      id: 'polygons',
      label: 'Polygons',
      toolIds: ['polygon', 'regular-polygon', 'vector-polygon', 'rigid-polygon'],
    },
    {
      id: 'conics',
      label: 'Conics',
      toolIds: ['ellipse', 'conic-five-points', 'parabola', 'hyperbola'],
    },
    {
      id: 'transform',
      label: 'Transform',
      toolIds: [
        'translate-vector',
        'rotate-around-point',
        'reflect-line',
        'reflect-point',
        'dilate-from-point',
        'reflect-about-circle',
      ],
    },
    {
      id: 'media',
      label: 'Media',
      toolIds: ['slider', 'image', 'text'],
    },
    {
      id: 'others',
      label: 'Others',
      toolIds: ['pen', 'freehand-shape', 'relation', 'button', 'check-box', 'input-box'],
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
  '3d': {
    id: '3d',
    label: '3D Calculator',
    icon: '3d',
    route: '/3d',
    hasCanvas: true,
    canvasType: '3d',
    hasToolsPanel: true,
    leftRailTabs: ['algebra', 'tools', 'table'],
    algebraVariant: 'sidebar',
    defaultAxesVisible: true,
  },
};
