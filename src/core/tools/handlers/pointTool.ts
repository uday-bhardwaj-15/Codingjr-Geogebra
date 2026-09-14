import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';

export function createPointTool(cm: ConstructionManager): ToolHandler {
  return {
    id: 'point',
    onPointerDown(pos, target) {
      if (!target) {
        // create free point
        const id = 'P_' + Date.now();
        cm.addObject({
          id,
          label: 'A',
          type: 'point',
          definition: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`,
          dependsOn: [],
          value: { x: pos.x, y: pos.y },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: 'point',
          createdAt: Date.now(),
        });
      }
    },
  };
}
