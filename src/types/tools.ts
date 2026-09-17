export type ToolCategory =
  | 'basic'
  | 'edit'
  | 'media'
  | 'measure'
  | 'transform'
  | 'construct'
  | 'lines'
  | 'lines-and-polygons'
  | 'circles'
  | 'points'
  | 'polygons'
  | 'conics'
  | 'curves'
  | 'planes'
  | 'solids'
  | 'special-lines'
  | 'others';

export interface ToolDefinition {
  id: string;
  legacyMode: number;
  label: string;
  description: string;
  category: ToolCategory;
  icon: string;
  clicksRequired: number;
  enabled?: boolean;
  isExpandedOnly?: boolean;
  cursor?: string;
}
