import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';

function createLineTool(id: string, type: 'segment' | 'line' | 'ray' | 'vector'): ToolHandler {
  return {
    id,
    createsPoints: true,
    clicksRequired: 2,
    commit: (selections: GeoObject[], cm: ConstructionManager) => {
      const p1 = selections[0];
      const p2 = selections[1];
      
      const newObj: GeoObject = {
        id: `${type}_${Date.now()}`,
        label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`, // auto-label
        type: type,
        definition: '', // Could be segment(A, B)
        dependsOn: [p1.id, p2.id],
        value: { p1: p1.value, p2: p2.value }, // Basic representation
        visible: true,
        labelVisible: true,
        style: { color: '#4b5563', thickness: 3, opacity: 1 },
        createdByToolId: id,
        createdAt: Date.now()
      };
      
      cm.addObject(newObj);
    }
  };
}

export const segmentTool = createLineTool('segment', 'segment');
export const lineTool = createLineTool('line', 'line');
export const rayTool = createLineTool('ray', 'ray');
export const vectorTool = createLineTool('vector', 'vector');
