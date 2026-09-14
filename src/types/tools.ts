export type ToolCategory =
  | 'basic'
  | 'edit'
  | 'media'
  | 'measure'
  | 'transform'
  | 'construct'
  | 'lines'
  | 'circles';

export interface ToolDefinition {
  id: string;
  legacyMode: number;
  label: string;
  description: string;
  category: ToolCategory;
  icon: string; // We'll use lucide-react icon names or custom mapping
  clicksRequired: number;
}
