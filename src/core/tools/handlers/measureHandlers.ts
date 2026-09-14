import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';

export const angleTool: ToolHandler = {
  id: 'angle',
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `angle_${Date.now()}`,
      label: 'α',
      type: 'angle',
      definition: '',
      dependsOn: selections.map(s => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 3, opacity: 0.2 },
      createdByToolId: 'angle',
      createdAt: Date.now()
    });
  }
};

export const distanceTool: ToolHandler = {
  id: 'distance',
  clicksRequired: 2, // Can also be 1 segment
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `measure_${Date.now()}`,
      label: 'd',
      type: 'measurement',
      definition: '',
      dependsOn: selections.map(s => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 1, opacity: 1 },
      createdByToolId: 'distance',
      createdAt: Date.now()
    });
  }
};

export const areaTool: ToolHandler = {
  id: 'area',
  clicksRequired: 1, // 1 polygon or circle
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `measure_${Date.now()}`,
      label: 'A',
      type: 'measurement',
      definition: '',
      dependsOn: [selections[0].id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 1, opacity: 1 },
      createdByToolId: 'area',
      createdAt: Date.now()
    });
  }
};
