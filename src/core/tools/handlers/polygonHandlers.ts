import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { resolvePoint } from '../../geometry/Point';
import { regularPolygonVertices, polygonArea } from '../../geometry/polygons';
import { getNextPointLabel } from '../../construction/labelGenerator';

let activePolygonVertices: GeoObject[] = [];

function createPolygonToolHandler(id: string, name: string, edgeStyle?: 'segment' | 'vector', isRigid?: boolean): ToolHandler {
  return {
    id,
    name,
    instruction: 'Select all vertices, then click first vertex again',
    clicksRequired: 0,
    onPointerDown: (pos, target, cm) => {
      if (!cm) return;

      let vertex = target;
      if (!vertex) {
        const label = getNextPointLabel(cm.getObjects());
        vertex = {
          id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          label,
          type: 'point',
          definition: '',
          dependsOn: [],
          value: { kind: 'free', x: pos.x, y: pos.y },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: id,
          createdAt: Date.now(),
        };
        cm.addObject(vertex);
      }

      if (activePolygonVertices.length >= 2 && activePolygonVertices[0].id === vertex.id) {
        // Closed loop -> create polygon
        const vertices = activePolygonVertices.map((v) => resolvePoint(v.value as any));
        const area = polygonArea(vertices);

        cm.addObject({
          id: `poly_${Date.now()}`,
          label: 'poly',
          type: 'polygon',
          definition: `Polygon(${activePolygonVertices.map((v) => v.label).join(', ')})`,
          dependsOn: activePolygonVertices.map((v) => v.id),
          value: {
            vertices,
            isRigid: !!isRigid,
            edgeStyle: edgeStyle || 'segment',
            area,
          },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 2, opacity: 0.2 },
          createdByToolId: id,
          createdAt: Date.now(),
        });

        activePolygonVertices = [];
      } else {
        activePolygonVertices.push(vertex);
      }
    },
    reset: () => {
      activePolygonVertices = [];
    },
  };
}

export const polygonTool = createPolygonToolHandler('polygon', 'Polygon', 'segment');
export const vectorPolygonTool = createPolygonToolHandler('vector-polygon', 'Vector Polygon', 'vector');
export const rigidPolygonTool = createPolygonToolHandler('rigid-polygon', 'Rigid Polygon', 'segment', true);

export const regularPolygonTool: ToolHandler = {
  id: 'regular-polygon',
  name: 'Regular Polygon',
  instruction: 'Select two points and enter number of vertices',
  clicksRequired: 2,
  createsPoints: true,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1Obj = selections[0];
    const p2Obj = selections[1];

    useUIStore.getState().openValueInputModal({
      title: 'Regular Polygon',
      label: 'Vertices',
      defaultValue: '4',
      inputType: 'number',
      onConfirm: (val) => {
        const n = Math.max(3, parseInt(val, 10) || 4);
        const p1 = resolvePoint(p1Obj.value as any);
        const p2 = resolvePoint(p2Obj.value as any);

        const generatedVertices = regularPolygonVertices(p1, p2, n);
        const vertexIds: string[] = [p1Obj.id, p2Obj.id];

        // Create remaining n-2 vertices as dependent points
        for (let i = 2; i < n; i++) {
          const vPt = generatedVertices[i];
          const vLabel = getNextPointLabel(cm.getObjects());
          const vId = `pt_${Date.now()}_${i}`;
          cm.addObject({
            id: vId,
            label: vLabel,
            type: 'point',
            definition: '',
            dependsOn: [p1Obj.id, p2Obj.id],
            value: { kind: 'dependent', x: vPt.x, y: vPt.y },
            visible: true,
            labelVisible: true,
            style: { color: '#1565ef', thickness: 5, opacity: 1 },
            createdByToolId: 'regular-polygon',
            createdAt: Date.now() + i,
          });
          vertexIds.push(vId);
        }

        const area = polygonArea(generatedVertices);
        cm.addObject({
          id: `poly_${Date.now()}`,
          label: 'poly',
          type: 'polygon',
          definition: `RegularPolygon(${p1Obj.label}, ${p2Obj.label}, ${n})`,
          dependsOn: vertexIds,
          value: {
            vertices: generatedVertices,
            edgeStyle: 'segment',
            area,
            n,
          },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 2, opacity: 0.2 },
          createdByToolId: 'regular-polygon',
          createdAt: Date.now() + n + 1,
        });
      },
    });
  },
};
