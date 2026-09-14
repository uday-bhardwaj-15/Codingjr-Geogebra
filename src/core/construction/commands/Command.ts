import { ConstructionManager } from '../ConstructionManager';

export interface Command {
  execute(manager: ConstructionManager): void;
  undo(manager: ConstructionManager): void;
}
