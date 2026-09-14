import { Command } from './Command';
import { ConstructionManager } from '../ConstructionManager';

export class CommandStack {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  constructor(private manager: ConstructionManager) {}

  public execute(command: Command): void {
    command.execute(this.manager);
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action
  }

  public undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo(this.manager);
      this.redoStack.push(command);
    }
  }

  public redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute(this.manager);
      this.undoStack.push(command);
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
