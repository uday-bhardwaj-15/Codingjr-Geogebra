import { Command } from './Command';
import { ConstructionManager } from '../ConstructionManager';

export class ToggleVisibilityCommand implements Command {
  private previousStates: Record<string, boolean> = {};

  constructor(private objectIds: string[]) {}

  execute(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      const obj = manager.getObject(id);
      if (obj) {
        this.previousStates[id] = obj.visible;
        manager.updateObject(id, { visible: !obj.visible });
      }
    }
  }

  undo(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      if (this.previousStates[id] !== undefined) {
        manager.updateObject(id, { visible: this.previousStates[id] });
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
        manager.updateObject(id, { labelVisible: !obj.labelVisible });
      }
    }
  }

  undo(manager: ConstructionManager): void {
    for (const id of this.objectIds) {
      if (this.previousStates[id] !== undefined) {
        manager.updateObject(id, { labelVisible: this.previousStates[id] });
      }
    }
  }
}

export class DeleteObjectCommand implements Command {
  private deletedObjects: import('../../../types/geo').GeoObject[] = [];

  constructor(private objectId: string) {}

  execute(manager: ConstructionManager): void {
    // Collect object and all its dependents recursively
    const deps = manager.getDependents(this.objectId);
    const allIds = [this.objectId, ...deps];

    this.deletedObjects = [];
    for (const id of allIds) {
      const obj = manager.getObject(id);
      if (obj) {
        this.deletedObjects.push({ ...obj });
      }
    }

    manager.removeObject(this.objectId);
  }

  undo(manager: ConstructionManager): void {
    // Restore all deleted objects in original order
    for (const obj of this.deletedObjects) {
      manager.addObject(obj);
    }
  }
}
