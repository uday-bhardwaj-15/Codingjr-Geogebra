import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';

export const midpointTool: ToolHandler = {
  id: 'midpoint',
  clicksRequired: 2, // Technically can be 1 segment, but MVP is 2 points
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];
    
    cm.addObject({
      id: `pt_${Date.now()}`,
      label: 'M',
      type: 'point',
      definition: '',
      dependsOn: [p1.id, p2.id],
      value: null, // Evaluator computes midpoint
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'midpoint',
      createdAt: Date.now()
    });
  }
};

export const perpendicularTool: ToolHandler = {
  id: 'perpendicular',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `line_${Date.now()}`,
      label: 'p',
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 3, opacity: 1 },
      createdByToolId: 'perpendicular',
      createdAt: Date.now()
    });
  }
};

export const parallelTool: ToolHandler = {
  id: 'parallel',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `line_${Date.now()}`,
      label: 'q',
      type: 'line',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 3, opacity: 1 },
      createdByToolId: 'parallel',
      createdAt: Date.now()
    });
  }
};
