import * as math from 'mathjs';
import { ParsedExpression } from './parser';

export class Evaluator {
  private scope: Map<string, any>;

  constructor() {
    this.scope = new Map();
  }

  public setVariable(name: string, value: any) {
    this.scope.set(name, value);
  }

  public getVariable(name: string): any {
    return this.scope.get(name);
  }

  public evaluate(parsed: ParsedExpression): any {
    // Compile and evaluate against the scope
    const code = parsed.node.compile();
    const result = code.evaluate(Object.fromEntries(this.scope));
    if (parsed.isAssignment && parsed.assignedName) {
      this.scope.set(parsed.assignedName, result);
    }
    return result;
  }
}
