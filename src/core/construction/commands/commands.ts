import { Command } from './Command';
import { ConstructionManager } from '../ConstructionManager';
import { GeoObject } from '../../../types/geo';

export class AddObjectCommand implements Command {
  constructor(private obj: GeoObject) {}

  execute(manager: ConstructionManager): void {
    manager.rawAddObject(this.obj);
  }

  undo(manager: ConstructionManager): void {
    manager.rawRemoveObject(this.obj.id);
  }
}

export class DeleteObjectCommand implements Command {
  private deletedObjects: GeoObject[] = [];

  constructor(private objectId: string) {}

  execute(manager: ConstructionManager): void {
    const deps = manager.getDependents(this.objectId);
    const allIds = [this.objectId, ...deps];

    this.deletedObjects = [];
    for (const id of allIds) {
      const obj = manager.getObject(id);
      if (obj) {
        this.deletedObjects.push(JSON.parse(JSON.stringify(obj)));
      }
    }

    manager.rawRemoveObject(this.objectId);
  }

  undo(manager: ConstructionManager): void {
    for (const obj of this.deletedObjects) {
      manager.rawAddObject(obj);
    }
  }
}

export class UpdateObjectCommand implements Command {
  private capturedPrevProps?: Partial<GeoObject>;

  constructor(
    private objectId: string,
    private newProps: Partial<GeoObject>,
    private prevProps?: Partial<GeoObject>
  ) {
    if (prevProps) {
      this.capturedPrevProps = JSON.parse(JSON.stringify(prevProps));
    }
  }

  execute(manager: ConstructionManager): void {
    const obj = manager.getObject(this.objectId);
    if (!obj) return;

    if (!this.capturedPrevProps) {
      const prev: Partial<GeoObject> = {};
      for (const key of Object.keys(this.newProps) as (keyof GeoObject)[]) {
        (prev as any)[key] = JSON.parse(JSON.stringify(obj[key]));
      }
      this.capturedPrevProps = prev;
    }

    manager.rawUpdateObject(this.objectId, this.newProps);
  }

  undo(manager: ConstructionManager): void {
    if (this.capturedPrevProps) {
      manager.rawUpdateObject(this.objectId, this.capturedPrevProps);
    }
  }
}

export class ToggleVisibilityCommand implements Command {
  private previousStates: Record<string, boolean> = {};

  constructor(private objectIds: string[]) {}

  execute(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      const obj = manager.getObject(id);
      if (obj) {
        this.previousStates[id] = obj.visible;
        manager.rawUpdateObject(id, { visible: !obj.visible });
      }
    }
  }

  undo(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      if (this.previousStates[id] !== undefined) {
        manager.rawUpdateObject(id, { visible: this.previousStates[id] });
      }
    }
  }
}

export class ToggleLabelCommand implements Command {
  private previousStates: Record<string, boolean> = {};

  constructor(private objectIds: string[]) {}

  execute(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      const obj = manager.getObject(id);
      if (obj) {
        this.previousStates[id] = obj.labelVisible;
        manager.rawUpdateObject(id, { labelVisible: !obj.labelVisible });
      }
    }
  }

  undo(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      if (this.previousStates[id] !== undefined) {
        manager.rawUpdateObject(id, { labelVisible: this.previousStates[id] });
      }
    }
  }
}
