import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';

export const circleCenterPointTool: ToolHandler = {
  id: 'circle-center-point',
  createsPoints: true,
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const center = selections[0];
    const point = selections[1];
    
    const newObj: GeoObject = {
      id: `circle_${Date.now()}`,
      label: 'c', 
      type: 'circle',
      definition: '',
      dependsOn: [center.id, point.id],
      value: null, // Evaluator will compute { center, radius }
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 3, opacity: 1 },
      createdByToolId: 'circle-center-point',
      createdAt: Date.now()
    };
    
    cm.addObject(newObj);
  }
};

export const compassTool: ToolHandler = {
  id: 'compass',
  createsPoints: true,
  // Clicks can be 3 points or 1 segment + 1 point. 
  // For MVP, require 3 clicks: point, point (for radius), center point
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];
    const center = selections[2];
    
    const newObj: GeoObject = {
      id: `circle_${Date.now()}`,
      label: 'c', 
      type: 'circle',
      definition: '',
      dependsOn: [p1.id, p2.id, center.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 3, opacity: 1 },
      createdByToolId: 'compass',
      createdAt: Date.now()
    };
    
    cm.addObject(newObj);
  }
};

export const semicircleTool: ToolHandler = {
  id: 'semicircle',
  createsPoints: true,
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];
    
    const newObj: GeoObject = {
      id: `semicircle_${Date.now()}`,
      label: 'd', 
      type: 'circle',
      definition: '', // arc info will be populated by evaluator
      dependsOn: [p1.id, p2.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 3, opacity: 1 },
      createdByToolId: 'semicircle',
      createdAt: Date.now()
    };
    
    cm.addObject(newObj);
  }
};
