import { ToolCategory, ToolDefinition } from '../../types/tools';

export const PEN_CURSOR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231e293b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E\") 2 22, crosshair";

export const COLLAPSED_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'basic',     label: 'Basic Tools' },
  { id: 'edit',      label: 'Edit' },
  { id: 'media',     label: 'Media' },
  { id: 'measure',   label: 'Measure' },
  { id: 'transform', label: 'Transform' },
  { id: 'construct', label: 'Construct' },
  { id: 'lines',     label: 'Lines' },
  { id: 'circles',   label: 'Circles' },
];

export const EXPANDED_NEW_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'points',    label: 'Points' },
  { id: 'polygons',  label: 'Polygons' },
  { id: 'conics',    label: 'Conics' },
  { id: 'others',    label: 'Others' },
];

export const ALL_TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  ...COLLAPSED_CATEGORIES,
  ...EXPANDED_NEW_CATEGORIES,
];

export const TOOL_CATEGORIES = ALL_TOOL_CATEGORIES;

export const TOOLS: ToolDefinition[] = [
  // ==================== Basic Tools ====================
  { id: 'move',              legacyMode: 0,  label: 'Move',              description: 'Drag or select object',                                     category: 'basic', icon: 'move',              clicksRequired: 0, enabled: true, cursor: 'default' },
  { id: 'point',             legacyMode: 1,  label: 'Point',             description: 'Select position or line, function, or curve',               category: 'basic', icon: 'point',             clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'slider',            legacyMode: 25, label: 'Slider',            description: 'Select position',                                            category: 'basic', icon: 'slider',            clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'intersect',         legacyMode: 5,  label: 'Intersect',         description: 'Select intersection or two objects successively',            category: 'basic', icon: 'intersect',         clicksRequired: 2, enabled: true, cursor: 'crosshair' },
  { id: 'extremum',          legacyMode: 75, label: 'Extremum',          description: 'Select a function',                                          category: 'basic', icon: 'extremum',          clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'roots',             legacyMode: 76, label: 'Roots',             description: 'Select a function',                                          category: 'basic', icon: 'roots',             clicksRequired: 1, enabled: true, cursor: 'crosshair' },
  { id: 'best-fit-line',     legacyMode: 58, label: 'Best Fit Line',     description: 'Select several points or list of points',                    category: 'basic', icon: 'best-fit-line',     clicksRequired: 2, enabled: true, cursor: 'crosshair' },

  // ==================== Edit ====================
  { id: 'select-objects',    legacyMode: 77, label: 'Select Objects',    description: 'Click on object to select it or drag a rectangle',          category: 'edit',  icon: 'select-objects',    clicksRequired: 0, enabled: true },
  { id: 'move-graphics-view',legacyMode: 40, label: 'Move Graphics View',description: 'Drag white background or axis',                              category: 'edit',  icon: 'move-graphics-view', clicksRequired: 0, enabled: true },
  { id: 'delete',            legacyMode: 6,  label: 'Delete',            description: 'Select object which should be deleted',                      category: 'edit',  icon: 'delete',            clicksRequired: 1, enabled: true },
  { id: 'show-hide-label',   legacyMode: 28, label: 'Show / Hide Label', description: 'Select object',                                              category: 'edit',  icon: 'show-hide-label',   clicksRequired: 1, enabled: true },
  { id: 'show-hide-object',  legacyMode: 27, label: 'Show / Hide Object',description: 'Select objects to hide, then switch to another tool',        category: 'edit',  icon: 'show-hide-object',  clicksRequired: 1, enabled: true },
  // Expanded Edit
  { id: 'copy-visual-style', legacyMode: 35, label: 'Copy Visual Style', description: 'Select sample object, then click on other objects',        category: 'edit',  icon: 'copy-visual-style', clicksRequired: 2, enabled: false, isExpandedOnly: true },

  // ==================== Media ====================
  { id: 'image',             legacyMode: 26, label: 'Image',             description: 'Select image from files',                                   category: 'media', icon: 'image',             clicksRequired: 1, enabled: true },
  { id: 'text',              legacyMode: 17, label: 'Text',              description: 'Select position or existing point',                          category: 'media', icon: 'text',              clicksRequired: 1, enabled: true },

  // ==================== Measure ====================
  { id: 'angle',              legacyMode: 36, label: 'Angle',             description: 'Select three points or two lines',                           category: 'measure', icon: 'angle',            clicksRequired: 3, enabled: true },
  { id: 'distance-length',    legacyMode: 38, label: 'Distance or Length',description: 'Select two points, a segment, polygon or circle',            category: 'measure', icon: 'distance-length',  clicksRequired: 2, enabled: true },
  { id: 'area',               legacyMode: 49, label: 'Area',              description: 'Select polygon, circle or conic',                            category: 'measure', icon: 'area',             clicksRequired: 1, enabled: true },
  // Promoted Measure
  { id: 'angle-given-size',   legacyMode: 46, label: 'Angle with Given Size', description: 'Select leg point, vertex, then enter size',             category: 'measure', icon: 'angle-given-size', clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'slope',              legacyMode: 50, label: 'Slope',             description: 'Select line',                                               category: 'measure', icon: 'slope',            clicksRequired: 1, enabled: true, isExpandedOnly: true },

  // ==================== Transform ====================
  { id: 'reflect-line',        legacyMode: 30, label: 'Reflect about Line',  description: 'Select object to reflect, then line of reflection',       category: 'transform', icon: 'reflect-line',   clicksRequired: 2, enabled: true },
  { id: 'reflect-point',       legacyMode: 29, label: 'Reflect about Point', description: 'Select object to reflect, then center point',              category: 'transform', icon: 'reflect-point',  clicksRequired: 2, enabled: true },
  { id: 'translate-vector',    legacyMode: 31, label: 'Translate by Vector', description: 'Select object to translate, then vector',                 category: 'transform', icon: 'translate-vector', clicksRequired: 2, enabled: true },
  // Promoted Transform
  { id: 'rotate-around-point', legacyMode: 32, label: 'Rotate around Point', description: 'Select object to rotate, then center point, and enter angle', category: 'transform', icon: 'rotate-around-point', clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'dilate-from-point',   legacyMode: 33, label: 'Dilate from Point',   description: 'Select object to dilate, then center point, and enter factor', category: 'transform', icon: 'dilate-from-point', clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'reflect-about-circle',legacyMode: 54, label: 'Reflect about Circle',description: 'Select object to reflect, then circle',                  category: 'transform', icon: 'reflect-about-circle', clicksRequired: 2, enabled: true, isExpandedOnly: true },

  // ==================== Construct ====================
  { id: 'midpoint-center',        legacyMode: 19, label: 'Midpoint or Center',      description: 'Select two points, a segment, circle or conic', category: 'construct', icon: 'midpoint-center',        clicksRequired: 1, enabled: true },
  { id: 'perpendicular-line',     legacyMode: 4,  label: 'Perpendicular Line',      description: 'Select perpendicular line and point',            category: 'construct', icon: 'perpendicular-line',     clicksRequired: 2, enabled: true },
  { id: 'perpendicular-bisector', legacyMode: 8,  label: 'Perpendicular Bisector',  description: 'Select two points or one segment',               category: 'construct', icon: 'perpendicular-bisector', clicksRequired: 2, enabled: true },
  { id: 'parallel-line',          legacyMode: 3,  label: 'Parallel Line',           description: 'Select parallel line and point',                 category: 'construct', icon: 'parallel-line',          clicksRequired: 2, enabled: true },
  { id: 'angle-bisector',         legacyMode: 9,  label: 'Angle Bisector',          description: 'Select three points or two lines',               category: 'construct', icon: 'angle-bisector',         clicksRequired: 3, enabled: true },
  { id: 'tangents',               legacyMode: 13, label: 'Tangents',                description: 'Select point or line, then circle or conic',     category: 'construct', icon: 'tangents',               clicksRequired: 2, enabled: true },
  // Promoted Construct
  { id: 'locus',                  legacyMode: 47, label: 'Locus',                   description: 'Select locus point, then point on object or slider', category: 'construct', icon: 'locus',              clicksRequired: 2, enabled: true, isExpandedOnly: true },

  // ==================== Lines ====================
  { id: 'segment',               legacyMode: 15, label: 'Segment',                 description: 'Select two points or positions',                 category: 'lines', icon: 'segment',                    clicksRequired: 2, enabled: true },
  { id: 'line',                  legacyMode: 2,  label: 'Line',                    description: 'Select two points or positions',                 category: 'lines', icon: 'line',                       clicksRequired: 2, enabled: true },
  { id: 'ray',                   legacyMode: 18, label: 'Ray',                     description: 'Select starting point, then point on ray',       category: 'lines', icon: 'ray',                        clicksRequired: 2, enabled: true },
  { id: 'vector',                legacyMode: 7,  label: 'Vector',                  description: 'Select starting point, then end point',          category: 'lines', icon: 'vector',                     clicksRequired: 2, enabled: true },
  // Promoted Lines
  { id: 'segment-given-length',  legacyMode: 45, label: 'Segment with Given Length', description: 'Select point, then enter length',               category: 'lines', icon: 'segment-given-length',       clicksRequired: 1, enabled: true, isExpandedOnly: true },
  { id: 'vector-from-point',     legacyMode: 37, label: 'Vector from Point',       description: 'Select point and vector',                        category: 'lines', icon: 'vector-from-point',        clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'polar-diameter-line',   legacyMode: 44, label: 'Polar or Diameter Line',  description: 'Select point or line, then circle or conic',     category: 'lines', icon: 'polar-diameter-line',        clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'polyline',              legacyMode: 65, label: 'Polyline',                description: 'Select all vertices, then click first vertex again', category: 'lines', icon: 'polyline',              clicksRequired: 3, enabled: true, isExpandedOnly: true },

  // ==================== Circles ====================
  { id: 'circle-center-point',   legacyMode: 10, label: 'Circle with Center through Point', description: 'Select center point, then point on circle', category: 'circles', icon: 'circle-center-point', clicksRequired: 2, enabled: true },
  { id: 'compass',               legacyMode: 53, label: 'Compass',                          description: 'Select segment or two points for radius, then center point', category: 'circles', icon: 'compass', clicksRequired: 3, enabled: true },
  { id: 'semicircle',            legacyMode: 24, label: 'Semicircle',                       description: 'Select two end points', category: 'circles', icon: 'semicircle', clicksRequired: 2, enabled: true },
  // Expanded Circles
  { id: 'circle-center-radius',  legacyMode: 34, label: 'Circle: Center & Radius',          description: 'Select center point, then enter radius', category: 'circles', icon: 'circle-center-radius', clicksRequired: 1, enabled: true, isExpandedOnly: true },
  { id: 'circle-three-points',   legacyMode: 11, label: 'Circle through 3 Points',          description: 'Select three points', category: 'circles', icon: 'circle-three-points', clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'circular-arc',          legacyMode: 20, label: 'Circular Arc',                     description: 'Select center and two points', category: 'circles', icon: 'circular-arc', clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'circumcircular-arc',    legacyMode: 22, label: 'Circumcircular Arc',               description: 'Select three points on arc', category: 'circles', icon: 'circumcircular-arc', clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'circular-sector',       legacyMode: 21, label: 'Circular Sector',                  description: 'Select center and two points', category: 'circles', icon: 'circular-sector', clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'circumcircular-sector', legacyMode: 23, label: 'Circumcircular Sector',           description: 'Select three points on sector', category: 'circles', icon: 'circumcircular-sector', clicksRequired: 3, enabled: true, isExpandedOnly: true },

  // ==================== Points (New Category - Expanded Only) ====================
  { id: 'point-on-object',       legacyMode: 501, label: 'Point on Object',        description: 'Click inside object or on its perimeter',        category: 'points', icon: 'point-on-object',           clicksRequired: 1, enabled: true, isExpandedOnly: true },
  { id: 'attach-detach-point',   legacyMode: 67,  label: 'Attach / Detach Point',  description: 'Select point, then object to attach to',          category: 'points', icon: 'attach-detach-point',       clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'complex-number',        legacyMode: 72,  label: 'Complex Number',         description: 'Click on graphics view to create complex number',category: 'points', icon: 'complex-number',           clicksRequired: 1, enabled: true, isExpandedOnly: true },
  { id: 'list',                  legacyMode: 71,  label: 'List',                   description: 'Select objects to create a list',                category: 'points', icon: 'list',                     clicksRequired: 1, enabled: true, isExpandedOnly: true },

  // ==================== Polygons (New Category - Expanded Only) ====================
  { id: 'polygon',               legacyMode: 16,  label: 'Polygon',                description: 'Select all vertices, then click first vertex again', category: 'polygons', icon: 'polygon',             clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'regular-polygon',       legacyMode: 51,  label: 'Regular Polygon',        description: 'Select two points and enter number of vertices',   category: 'polygons', icon: 'regular-polygon',         clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'vector-polygon',        legacyMode: 70,  label: 'Vector Polygon',         description: 'Select all vertices, then click first vertex again', category: 'polygons', icon: 'vector-polygon',      clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'rigid-polygon',         legacyMode: 64,  label: 'Rigid Polygon',          description: 'Select all vertices, then click first vertex again', category: 'polygons', icon: 'rigid-polygon',       clicksRequired: 3, enabled: true, isExpandedOnly: true },

  // ==================== Conics (New Category - Expanded Only) ====================
  { id: 'ellipse',               legacyMode: 55,  label: 'Ellipse',                description: 'Select two foci and a point on ellipse',          category: 'conics', icon: 'ellipse',                  clicksRequired: 3, enabled: true, isExpandedOnly: true },
  { id: 'conic-five-points',     legacyMode: 12,  label: 'Conic through 5 Points', description: 'Select five points',                              category: 'conics', icon: 'conic-five-points',        clicksRequired: 5, enabled: true, isExpandedOnly: true },
  { id: 'parabola',              legacyMode: 57,  label: 'Parabola',               description: 'Select point and directrix',                      category: 'conics', icon: 'parabola',                 clicksRequired: 2, enabled: true, isExpandedOnly: true },
  { id: 'hyperbola',             legacyMode: 56,  label: 'Hyperbola',              description: 'Select two foci and a point on hyperbola',        category: 'conics', icon: 'hyperbola',                clicksRequired: 3, enabled: true, isExpandedOnly: true },

  // ==================== Others (New Category - Expanded Only) ====================
  { id: 'pen',                   legacyMode: 62,  label: 'Pen',                    description: 'Draw freehand on graphics view',                  category: 'others', icon: 'pen',                      clicksRequired: 0, enabled: true, isExpandedOnly: true, cursor: PEN_CURSOR },
  { id: 'freehand-shape',        legacyMode: 73,  label: 'Freehand Shape',         description: 'Sketch a function or geometric object',           category: 'others', icon: 'freehand-shape',           clicksRequired: 0, enabled: true, isExpandedOnly: true, cursor: PEN_CURSOR },
  { id: 'relation',              legacyMode: 14,  label: 'Relation',               description: 'Select two objects',                              category: 'others', icon: 'relation',                 clicksRequired: 2, enabled: true, isExpandedOnly: true, cursor: 'crosshair' },
  { id: 'button',                legacyMode: 60,  label: 'Button',                 description: 'Click on graphics view to insert button',         category: 'others', icon: 'button',                   clicksRequired: 1, enabled: true, isExpandedOnly: true, cursor: 'crosshair' },
  { id: 'check-box',             legacyMode: 52,  label: 'Check Box',              description: 'Click on graphics view to insert check box',      category: 'others', icon: 'check-box',                clicksRequired: 1, enabled: true, isExpandedOnly: true, cursor: 'crosshair' },
  { id: 'input-box',             legacyMode: 61,  label: 'Input Box',              description: 'Click on graphics view to insert input box',      category: 'others', icon: 'input-box',                clicksRequired: 1, enabled: true, isExpandedOnly: true, cursor: 'crosshair' },
];
