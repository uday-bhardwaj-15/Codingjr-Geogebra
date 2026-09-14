import { ConstructionManager } from '../construction/ConstructionManager';
import { PointCoords } from '../geometry/Point';
import { GeoObject } from '../../types/geo';
import { getNextPointLabel } from '../construction/labelGenerator';

export interface ToolHandler {
  id: string;
  name?: string;
  instruction?: string;
  clicksRequired?: number;
  createsPoints?: boolean;
  commit?: (selections: GeoObject[], cm: ConstructionManager) => void;
  onPointerDown?: (pos: PointCoords, target?: GeoObject, cm?: ConstructionManager) => void;
  onPointerMove?: (pos: PointCoords, target?: GeoObject, cm?: ConstructionManager) => void;
  onPointerUp?: (pos: PointCoords, target?: GeoObject, cm?: ConstructionManager) => void;
  reset?: () => void;
}

export class ToolManager {
  private activeToolId: string = 'move';
  private handlers: Map<string, ToolHandler> = new Map();
  public pendingSelections: GeoObject[] = [];

  constructor(private constructionManager: ConstructionManager) {}

  public registerHandler(handler: ToolHandler) {
    this.handlers.set(handler.id, handler);
  }

  public setActiveTool(toolId: string) {
    const oldHandler = this.handlers.get(this.activeToolId);
    if (oldHandler?.reset) oldHandler.reset();

    this.pendingSelections = [];
    this.activeToolId = toolId;
  }

  public getActiveToolId() {
    return this.activeToolId;
  }

  public getActiveHandler() {
    return this.handlers.get(this.activeToolId);
  }

  public handlePointerDown(pos: PointCoords, target?: GeoObject) {
    const handler = this.getActiveHandler();
    if (!handler) return;

    if (handler.onPointerDown && (!handler.clicksRequired || handler.id === 'point')) {
      handler.onPointerDown(pos, target, this.constructionManager);
      if (handler.clicksRequired) {
        return;
      }
    }

    if (handler.clicksRequired) {
      let selection = target;

      if (!selection) {
        if (handler.createsPoints) {
          const label = getNextPointLabel(this.constructionManager.getObjects());
          const id = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          selection = {
            id,
            label,
            type: 'point',
            definition: '',
            dependsOn: [],
            value: { kind: 'free', x: pos.x, y: pos.y },
            visible: true,
            labelVisible: true,
            style: { color: '#1565ef', thickness: 5, opacity: 1 },
            createdByToolId: this.activeToolId,
            createdAt: Date.now(),
          };
          this.constructionManager.addObject(selection);
        } else {
          this.pendingSelections = [];
          return;
        }
      }

      this.pendingSelections.push(selection);

      if (this.pendingSelections.length >= handler.clicksRequired) {
        if (handler.commit) {
          handler.commit(this.pendingSelections, this.constructionManager);
        }
        this.pendingSelections = [];
      }
    } else {
      handler.onPointerDown?.(pos, target, this.constructionManager);
    }
  }

  public handlePointerMove(pos: PointCoords, target?: GeoObject) {
    this.getActiveHandler()?.onPointerMove?.(pos, target, this.constructionManager);
  }

  public handlePointerUp(pos: PointCoords, target?: GeoObject) {
    this.getActiveHandler()?.onPointerUp?.(pos, target, this.constructionManager);
  }
}
