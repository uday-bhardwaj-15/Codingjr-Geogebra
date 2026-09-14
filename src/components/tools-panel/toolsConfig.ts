import { ToolCategory, ToolDefinition } from '../../types/tools';

export const TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'basic',     label: 'Basic Tools' },
  { id: 'edit',      label: 'Edit' },
  { id: 'media',     label: 'Media' },
  { id: 'measure',   label: 'Measure' },
  { id: 'transform', label: 'Transform' },
  { id: 'construct', label: 'Construct' },
  { id: 'lines',     label: 'Lines' },
  { id: 'circles',   label: 'Circles' },
];

export const TOOLS: ToolDefinition[] = [
  // Basic Tools
  { id: 'move',              legacyMode: 0,  label: 'Move',              description: 'Drag or select object',                                     category: 'basic', icon: 'move',              clicksRequired: 0 },
  { id: 'point',             legacyMode: 1,  label: 'Point',             description: 'Select position or line, function, or curve',               category: 'basic', icon: 'point',             clicksRequired: 1 },
  { id: 'slider',            legacyMode: 25, label: 'Slider',            description: 'Select position',                                            category: 'basic', icon: 'slider',            clicksRequired: 1 },
  { id: 'intersect',         legacyMode: 5,  label: 'Intersect',         description: 'Select intersection or two objects successively',            category: 'basic', icon: 'intersect',         clicksRequired: 2 },
  { id: 'extremum',          legacyMode: 75, label: 'Extremum',          description: 'Select a function',                                          category: 'basic', icon: 'extremum',          clicksRequired: 1 },
  { id: 'roots',             legacyMode: 76, label: 'Roots',             description: 'Select a function',                                          category: 'basic', icon: 'roots',             clicksRequired: 1 },
  { id: 'best-fit-line',     legacyMode: 58, label: 'Best Fit Line',     description: 'Select several points or list of points',                    category: 'basic', icon: 'best-fit-line',     clicksRequired: 2 },

  // Edit
  { id: 'select-objects',    legacyMode: 77, label: 'Select Objects',    description: 'Click on object to select it or drag a rectangle to select multiple objects', category: 'edit', icon: 'select-objects', clicksRequired: 0 },
  { id: 'move-graphics-view',legacyMode: 40, label: 'Move Graphics View',description: 'Drag white background or axis',                              category: 'edit',  icon: 'move-graphics-view', clicksRequired: 0 },
  { id: 'delete',            legacyMode: 6,  label: 'Delete',            description: 'Select object which should be deleted',                      category: 'edit',  icon: 'delete',            clicksRequired: 1 },
  { id: 'show-hide-label',   legacyMode: 28, label: 'Show / Hide Label', description: 'Select object',                                              category: 'edit',  icon: 'show-hide-label',   clicksRequired: 1 },
  { id: 'show-hide-object',  legacyMode: 27, label: 'Show / Hide Object',description: 'Select objects to hide, then switch to another tool',        category: 'edit',  icon: 'show-hide-object',  clicksRequired: 1 },

  // Media
  { id: 'image',             legacyMode: 26, label: 'Image',             description: 'Select image from files or webcam',                         category: 'media', icon: 'image',             clicksRequired: 1 },
  { id: 'text',              legacyMode: 17, label: 'Text',              description: 'Select position or existing point',                          category: 'media', icon: 'text',              clicksRequired: 1 },

  // Measure
  { id: 'angle',              legacyMode: 36, label: 'Angle',             description: 'Select three points or two lines',                           category: 'measure', icon: 'angle',            clicksRequired: 3 },
  { id: 'distance-length',    legacyMode: 38, label: 'Distance or Length',description: 'Select two points, a segment, polygon or circle',            category: 'measure', icon: 'distance-length',  clicksRequired: 2 },
  { id: 'area',               legacyMode: 49, label: 'Area',              description: 'Select polygon, circle or conic',                            category: 'measure', icon: 'area',             clicksRequired: 1 },

  // Transform
  { id: 'reflect-line',        legacyMode: 30, label: 'Reflect about Line',  description: 'Select object to reflect, then line of reflection',       category: 'transform', icon: 'reflect-line',   clicksRequired: 2 },
  { id: 'reflect-point',       legacyMode: 29, label: 'Reflect about Point', description: 'Select object to reflect, then center point',              category: 'transform', icon: 'reflect-point',  clicksRequired: 2 },
  { id: 'translate-vector',    legacyMode: 31, label: 'Translate by Vector', description: 'Select object to translate, then vector',                 category: 'transform', icon: 'translate-vector', clicksRequired: 2 },

  // Construct
  { id: 'midpoint-center',           legacyMode: 19, label: 'Midpoint or Center',      description: 'Select two points, a segment, circle or conic', category: 'construct', icon: 'midpoint-center',        clicksRequired: 1 },
  { id: 'perpendicular-line',        legacyMode: 4,  label: 'Perpendicular Line',      description: 'Select perpendicular line and point',            category: 'construct', icon: 'perpendicular-line',     clicksRequired: 2 },
  { id: 'perpendicular-bisector',    legacyMode: 8,  label: 'Perpendicular Bisector',  description: 'Select two points or one segment',               category: 'construct', icon: 'perpendicular-bisector', clicksRequired: 2 },
  { id: 'parallel-line',             legacyMode: 3,  label: 'Parallel Line',           description: 'Select parallel line and point',                 category: 'construct', icon: 'parallel-line',          clicksRequired: 2 },
  { id: 'angle-bisector',            legacyMode: 9,  label: 'Angle Bisector',          description: 'Select three points or two lines',               category: 'construct', icon: 'angle-bisector',         clicksRequired: 3 },
  { id: 'tangents',                  legacyMode: 13, label: 'Tangents',                description: 'Select point or line, then circle, conic or function', category: 'construct', icon: 'tangents',          clicksRequired: 2 },

  // Lines
  { id: 'segment',  legacyMode: 15, label: 'Segment', description: 'Select two points or positions', category: 'lines', icon: 'segment', clicksRequired: 2 },
  { id: 'line',     legacyMode: 2,  label: 'Line',    description: 'Select two points or positions', category: 'lines', icon: 'line',    clicksRequired: 2 },
  { id: 'ray',      legacyMode: 18, label: 'Ray',     description: 'Select starting point, then point on ray', category: 'lines', icon: 'ray',     clicksRequired: 2 },
  { id: 'vector',   legacyMode: 7,  label: 'Vector',  description: 'Select starting point, then end point',    category: 'lines', icon: 'vector',  clicksRequired: 2 },

  // Circles
  { id: 'circle-center-point', legacyMode: 10, label: 'Circle with Center through Point', description: 'Select center point, then point on circle', category: 'circles', icon: 'circle-center-point', clicksRequired: 2 },
  { id: 'compass',             legacyMode: 53, label: 'Compass',                          description: 'Select segment or two points for radius, then center point', category: 'circles', icon: 'compass', clicksRequired: 3 },
  { id: 'semicircle',          legacyMode: 24, label: 'Semicircle',                       description: 'Select two end points', category: 'circles', icon: 'semicircle', clicksRequired: 2 },
];
