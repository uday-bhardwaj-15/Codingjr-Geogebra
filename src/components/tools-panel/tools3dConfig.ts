import { ToolDefinition } from '../../types/tools';
import { GeometryCategoryGroup } from '../../config/appConfig';

export const TOOLS_3D: ToolDefinition[] = [
  // ==================== Basic Tools ====================
  { id: 'move',               legacyMode: 0,   label: 'Move',                      description: 'Drag or select object, or drag background to rotate view', category: 'basic',   icon: 'move',               clicksRequired: 0, enabled: true, cursor: 'default' },
  { id: 'point',              legacyMode: 1,   label: 'Point',                     description: 'Click on the XY-plane or on an object to create a point',  category: 'basic',   icon: 'point',              clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'pyramid',            legacyMode: 512, label: 'Pyramid',                   description: 'Select a polygon for bottom, then select top point',      category: 'basic',   icon: 'pyramid',            clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'cube',               legacyMode: 514, label: 'Cube',                      description: 'Select two points',                                       category: 'basic',   icon: 'cube',               clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'sphere-center-point',legacyMode: 510, label: 'Sphere: Center & Point',    description: 'Select center point, then point on sphere',               category: 'basic',   icon: 'sphere-center-point',clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'plane-three-points', legacyMode: 513, label: 'Plane through 3 Points',    description: 'Select three points',                                     category: 'basic',   icon: 'plane-three-points', clicksRequired: 3, enabled: true, cursor: 'crosshair' },
  { id: 'intersect',          legacyMode: 5,   label: 'Intersect',                 description: 'Select intersection or two objects successively',         category: 'basic',   icon: 'intersect',          clicksRequired: 2, enabled: true, cursor: 'crosshair' },

  // ==================== Edit ====================
  { id: 'select-objects',     legacyMode: 77,  label: 'Select Objects',            description: 'Click on object to select it or drag a rectangle',       category: 'edit',    icon: 'select-objects',     clicksRequired: 0, enabled: true },
  { id: 'rotate-3d-view',     legacyMode: 501, label: 'Rotate 3D Graphics View',   description: 'Drag background to rotate 3D view',                       category: 'edit',    icon: 'rotate-3d-view',     clicksRequired: 0, enabled: true },
  { id: 'move-graphics-view', legacyMode: 40,  label: 'Move Graphics View',        description: 'Drag background with Shift or right-click to pan',       category: 'edit',    icon: 'move-graphics-view',  clicksRequired: 0, enabled: true },
  { id: 'delete',             legacyMode: 6,   label: 'Delete',                    description: 'Select object which should be deleted',                   category: 'edit',    icon: 'delete',             clicksRequired: 1, enabled: true },
  { id: 'show-hide-label',    legacyMode: 28,  label: 'Show / Hide Label',         description: 'Select object',                                           category: 'edit',    icon: 'show-hide-label',    clicksRequired: 1, enabled: true },
  { id: 'show-hide-object',   legacyMode: 27,  label: 'Show / Hide Object',        description: 'Select objects to hide, then switch to another tool',     category: 'edit',    icon: 'show-hide-object',   clicksRequired: 1, enabled: true },
  { id: 'copy-visual-style',  legacyMode: 35,  label: 'Copy Visual Style',         description: 'Select sample object, then click on other objects',        category: 'edit',    icon: 'copy-visual-style',  clicksRequired: 2, enabled: true },

  // ==================== Points ====================
  { id: 'point-on-object',    legacyMode: 502, label: 'Point on Object',           description: 'Click inside object or on its surface',                  category: 'points',  icon: 'point-on-object',    clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'attach-detach-point',legacyMode: 67,  label: 'Attach / Detach Point',     description: 'Select point, then object to attach to',                  category: 'points',  icon: 'attach-detach-point',clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'midpoint-center',    legacyMode: 19,  label: 'Midpoint or Center',        description: 'Select two points, a segment, or a sphere',              category: 'points',  icon: 'midpoint-center',    clicksRequired: 2, enabled: true },

  // ==================== Lines and Polygons ====================
  { id: 'segment',            legacyMode: 2,   label: 'Segment',                   description: 'Select two points',                                       category: 'lines-and-polygons', icon: 'segment',            clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'segment-given-length',legacyMode: 45, label: 'Segment with Given Length', description: 'Select point, then enter length',                         category: 'lines-and-polygons', icon: 'segment-given-length', clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'line',               legacyMode: 3,   label: 'Line',                      description: 'Select two points',                                       category: 'lines-and-polygons', icon: 'line',               clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'ray',                legacyMode: 4,   label: 'Ray',                       description: 'Select starting point, then point on ray',                category: 'lines-and-polygons', icon: 'ray',                clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'vector',             legacyMode: 7,   label: 'Vector',                    description: 'Select start point, then endpoint',                       category: 'lines-and-polygons', icon: 'vector',             clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'polygon',            legacyMode: 16,  label: 'Polygon',                   description: 'Select all vertices, then click first vertex again',      category: 'lines-and-polygons', icon: 'polygon',            clicksRequired: 3, enabled: true, cursor: 'crosshair' },
  { id: 'regular-polygon',    legacyMode: 51,  label: 'Regular Polygon',           description: 'Select two points and enter number of vertices',          category: 'lines-and-polygons', icon: 'regular-polygon',    clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'perpendicular-line', legacyMode: 4,   label: 'Perpendicular Line',        description: 'Select point and perpendicular line',                     category: 'lines-and-polygons', icon: 'perpendicular-line', clicksRequired: 2, enabled: true },
  { id: 'parallel-line',      legacyMode: 3,   label: 'Parallel Line',             description: 'Select point and parallel line',                          category: 'lines-and-polygons', icon: 'parallel-line',      clicksRequired: 2, enabled: true },
  { id: 'angle-bisector',     legacyMode: 9,   label: 'Angle Bisector',            description: 'Select three points or two lines',                        category: 'lines-and-polygons', icon: 'angle-bisector',     clicksRequired: 3, enabled: true },
  { id: 'tangents',           legacyMode: 13,  label: 'Tangents',                  description: 'Select point and circle/sphere',                          category: 'lines-and-polygons', icon: 'tangents',           clicksRequired: 2, enabled: true },

  // ==================== Solids ====================
  { id: 'tetrahedron',        legacyMode: 527, label: 'Tetrahedron',               description: 'Select two points',                                       category: 'solids',  icon: 'tetrahedron',        clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'prism',              legacyMode: 517, label: 'Prism',                     description: 'Select a polygon for bottom, then select top point',      category: 'solids',  icon: 'prism',              clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'sphere-center-radius',legacyMode: 520,label: 'Sphere: Center & Radius',   description: 'Select center point, then enter radius',                  category: 'solids',  icon: 'sphere-center-radius',clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'cone',               legacyMode: 518, label: 'Cone',                      description: 'Select base center point, apex point, then radius',       category: 'solids',  icon: 'cone',               clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'cylinder',           legacyMode: 519, label: 'Cylinder',                  description: 'Select two center points, then enter radius',             category: 'solids',  icon: 'cylinder',           clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'extrude-to-pyramid', legacyMode: 522, label: 'Extrude to Pyramid',        description: 'Drag polygon or select polygon and enter altitude',       category: 'solids',  icon: 'extrude-to-pyramid', clicksRequired: 1, enabled: true },
  { id: 'extrude-to-prism',   legacyMode: 521, label: 'Extrude to Prism',          description: 'Drag polygon or select polygon and enter altitude',       category: 'solids',  icon: 'extrude-to-prism',   clicksRequired: 1, enabled: true },
  { id: 'net',                legacyMode: 523, label: 'Net',                       description: 'Select a polyhedron',                                     category: 'solids',  icon: 'net',                clicksRequired: 1, enabled: true },
  { id: 'surface-of-revolution',legacyMode: 528,label: 'Surface of Revolution',    description: 'Select line to rotate, then axis line',                  category: 'solids',  icon: 'surface-of-revolution',clicksRequired: 2, enabled: true },

  // ==================== Planes ====================
  { id: 'plane',              legacyMode: 511, label: 'Plane',                     description: 'Select three points, or a point and a line',              category: 'planes',  icon: 'plane',              clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'parallel-plane',     legacyMode: 515, label: 'Parallel Plane',            description: 'Select point and parallel plane',                         category: 'planes',  icon: 'parallel-plane',     clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'perpendicular-plane',legacyMode: 516, label: 'Perpendicular Plane',       description: 'Select point and perpendicular line',                     category: 'planes',  icon: 'perpendicular-plane',clicksRequired: 2, enabled: true, cursor: 'crosshair' },

  // ==================== Circles ====================
  { id: 'circle-axis-point',  legacyMode: 530, label: 'Circle with Axis through Point', description: 'Select axis line, then point on circle',             category: 'circles', icon: 'circle-axis-point',  clicksRequired: 2, enabled: true },
  { id: 'circle-center-radius-direction', legacyMode: 531, label: 'Circle with Center, Radius & Direction', description: 'Select center, direction, then enter radius', category: 'circles', icon: 'circle-center-radius', clicksRequired: 2, enabled: true },
  { id: 'circle-three-points',legacyMode: 11,  label: 'Circle through 3 Points',   description: 'Select three points',                                     category: 'circles', icon: 'circle-three-points',clicksRequired: 3, enabled: true },
  { id: 'circular-arc',       legacyMode: 20,  label: 'Circular Arc',              description: 'Select center and two points',                            category: 'circles', icon: 'circular-arc',       clicksRequired: 3, enabled: true },
  { id: 'circumcircular-arc', legacyMode: 22,  label: 'Circumcircular Arc',        description: 'Select three points on arc',                              category: 'circles', icon: 'circumcircular-arc', clicksRequired: 3, enabled: true },
  { id: 'circular-sector',    legacyMode: 21,  label: 'Circular Sector',           description: 'Select center and two points',                            category: 'circles', icon: 'circular-sector',    clicksRequired: 3, enabled: true },
  { id: 'circumcircular-sector',legacyMode: 23,label: 'Circumcircular Sector',     description: 'Select three points on sector',                           category: 'circles', icon: 'circumcircular-sector',clicksRequired: 3, enabled: true },

  // ==================== Curves ====================
  { id: 'ellipse',            legacyMode: 55,  label: 'Ellipse',                   description: 'Select two foci and a point on ellipse',                  category: 'curves',  icon: 'ellipse',            clicksRequired: 3, enabled: true },
  { id: 'conic-five-points',  legacyMode: 12,  label: 'Conic through 5 Points',    description: 'Select five points',                                      category: 'curves',  icon: 'conic-five-points',  clicksRequired: 5, enabled: true },
  { id: 'parabola',           legacyMode: 57,  label: 'Parabola',                  description: 'Select point and directrix line',                         category: 'curves',  icon: 'parabola',           clicksRequired: 2, enabled: true },
  { id: 'hyperbola',          legacyMode: 56,  label: 'Hyperbola',                 description: 'Select two foci and a point on hyperbola',                category: 'curves',  icon: 'hyperbola',          clicksRequired: 3, enabled: true },
  { id: 'locus',              legacyMode: 47,  label: 'Locus',                     description: 'Select locus point, then point on object',                category: 'curves',  icon: 'locus',              clicksRequired: 2, enabled: true },
  { id: 'intersect-two-surfaces', legacyMode: 532, label: 'Intersect Two Surfaces',description: 'Select two surfaces to find intersection curve',         category: 'curves',  icon: 'intersect',          clicksRequired: 2, enabled: true },

  // ==================== Transform ====================
  { id: 'reflect-plane',      legacyMode: 525, label: 'Reflect about Plane',       description: 'Select object to reflect, then plane of reflection',      category: 'transform',icon: 'reflect-line',       clicksRequired: 2, enabled: true },
  { id: 'reflect-point',      legacyMode: 29,  label: 'Reflect about Point',       description: 'Select object to reflect, then center point',              category: 'transform',icon: 'reflect-point',      clicksRequired: 2, enabled: true },
  { id: 'rotate-around-line', legacyMode: 524, label: 'Rotate around Line',        description: 'Select object to rotate, then line, and enter angle',     category: 'transform',icon: 'rotate-around-point',clicksRequired: 2, enabled: true },
  { id: 'translate-vector',   legacyMode: 31,  label: 'Translate by Vector',       description: 'Select object to translate, then vector',                 category: 'transform',icon: 'translate-vector',   clicksRequired: 2, enabled: true },
  { id: 'dilate-from-point',  legacyMode: 33,  label: 'Dilate from Point',         description: 'Select object to dilate, then center point, and enter factor', category: 'transform',icon: 'dilate-from-point', clicksRequired: 2, enabled: true },
  { id: 'reflect-line',       legacyMode: 30,  label: 'Reflect about Line',        description: 'Select object to reflect, then line of reflection',       category: 'transform',icon: 'reflect-line',       clicksRequired: 2, enabled: true },

  // ==================== Measure ====================
  { id: 'angle',              legacyMode: 36,  label: 'Angle',                     description: 'Select three points or two lines',                           category: 'measure', icon: 'angle',            clicksRequired: 3, enabled: true },
  { id: 'distance-length',    legacyMode: 38,  label: 'Distance or Length',        description: 'Select two points, a segment, polygon or circle',            category: 'measure', icon: 'distance-length',  clicksRequired: 2, enabled: true },
  { id: 'area',               legacyMode: 49,  label: 'Area',                      description: 'Select polygon, circle or conic',                            category: 'measure', icon: 'area',             clicksRequired: 1, enabled: true },
  { id: 'volume',             legacyMode: 526, label: 'Volume',                    description: 'Select solid (pyramid, prism, sphere, cone, cylinder)',  category: 'measure',  icon: 'area',               clicksRequired: 1, enabled: true },

  // ==================== Others ====================
  { id: 'text',               legacyMode: 17,  label: 'Text',                      description: 'Select position or existing point',                          category: 'others',  icon: 'text',              clicksRequired: 1, enabled: true },

  // ==================== Special Lines ====================
  { id: 'vector-from-point',  legacyMode: 39,  label: 'Vector from Point',         description: 'Select point and vector',                                 category: 'special-lines', icon: 'vector-from-point', clicksRequired: 2, enabled: true },
  { id: 'polyline',           legacyMode: 65,  label: 'Polyline',                  description: 'Select all vertices, then click first vertex again',      category: 'special-lines', icon: 'polyline',          clicksRequired: 3, enabled: true },
  { id: 'polar-diameter-line',legacyMode: 44,  label: 'Polar or Diameter Line',    description: 'Select point or line, then circle or conic',             category: 'special-lines', icon: 'polar-diameter-line',clicksRequired: 2, enabled: true },
];

export const CATEGORIES_3D = {
  collapsed: [
    {
      id: 'basic',
      label: 'Basic Tools',
      toolIds: ['move', 'point', 'pyramid', 'cube', 'sphere-center-point', 'plane-three-points', 'intersect'],
    },
    {
      id: 'edit',
      label: 'Edit',
      toolIds: ['rotate-3d-view', 'move-graphics-view', 'delete', 'show-hide-label', 'show-hide-object'],
    },
    {
      id: 'points',
      label: 'Points',
      toolIds: ['point', 'intersect', 'midpoint-center'],
    },
    {
      id: 'lines-and-polygons',
      label: 'Lines and Polygons',
      toolIds: ['segment', 'line', 'ray', 'vector', 'polygon'],
    },
    {
      id: 'solids',
      label: 'Solids',
      toolIds: ['pyramid', 'prism', 'tetrahedron', 'cube', 'sphere-center-point', 'sphere-center-radius', 'cone', 'cylinder'],
    },
    {
      id: 'planes',
      label: 'Planes',
      toolIds: ['plane-three-points', 'plane', 'parallel-plane', 'perpendicular-plane'],
    },
  ] as GeometryCategoryGroup[],

  expanded: [
    {
      id: 'basic',
      label: 'Basic Tools',
      toolIds: ['move', 'point', 'pyramid', 'cube', 'sphere-center-point', 'plane-three-points', 'intersect'],
    },
    {
      id: 'edit',
      label: 'Edit',
      toolIds: ['select-objects', 'rotate-3d-view', 'move-graphics-view', 'delete', 'show-hide-label', 'show-hide-object', 'copy-visual-style'],
    },
    {
      id: 'points',
      label: 'Points',
      toolIds: ['point', 'intersect', 'midpoint-center', 'point-on-object', 'attach-detach-point'],
    },
    {
      id: 'lines-and-polygons',
      label: 'Lines and Polygons',
      toolIds: [
        'segment',
        'segment-given-length',
        'line',
        'ray',
        'vector',
        'polygon',
        'regular-polygon',
        'perpendicular-line',
        'parallel-line',
        'angle-bisector',
        'tangents',
      ],
    },
    {
      id: 'solids',
      label: 'Solids',
      toolIds: [
        'pyramid',
        'prism',
        'tetrahedron',
        'cube',
        'sphere-center-point',
        'sphere-center-radius',
        'cone',
        'cylinder',
        'extrude-to-pyramid',
        'extrude-to-prism',
        'net',
        'surface-of-revolution',
      ],
    },
    {
      id: 'planes',
      label: 'Planes',
      toolIds: ['plane-three-points', 'plane', 'parallel-plane', 'perpendicular-plane'],
    },
    {
      id: 'circles',
      label: 'Circles',
      toolIds: [
        'circle-axis-point',
        'circle-center-radius-direction',
        'circle-three-points',
        'circular-arc',
        'circumcircular-arc',
        'circular-sector',
        'circumcircular-sector',
      ],
    },
    {
      id: 'curves',
      label: 'Curves',
      toolIds: [
        'ellipse',
        'conic-five-points',
        'parabola',
        'hyperbola',
        'locus',
        'intersect-two-surfaces',
      ],
    },
    {
      id: 'transform',
      label: 'Transform',
      toolIds: [
        'reflect-plane',
        'reflect-point',
        'rotate-around-line',
        'translate-vector',
        'dilate-from-point',
        'reflect-line',
      ],
    },
    {
      id: 'measure',
      label: 'Measure',
      toolIds: ['angle', 'distance-length', 'area', 'volume'],
    },
    {
      id: 'others',
      label: 'Others',
      toolIds: ['rotate-3d-view', 'move-graphics-view', 'copy-visual-style', 'text'],
    },
    {
      id: 'special-lines',
      label: 'Special Lines',
      toolIds: ['vector-from-point', 'polyline', 'polar-diameter-line'],
    },
  ] as GeometryCategoryGroup[],
};
