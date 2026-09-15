export type ToolCategory =
  | 'basic'
  | 'edit'
  | 'media'
  | 'measure'
  | 'transform'
  | 'construct'
  | 'lines'
  | 'circles'
  | 'points'
  | 'polygons'
  | 'conics'
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
