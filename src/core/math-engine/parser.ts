import * as math from 'mathjs';

export interface ParsedExpression {
  node: math.MathNode;
  isAssignment: boolean;
  assignedName?: string;
}

export function parseExpression(expr: string): ParsedExpression {
  const node = math.parse(expr);
  const isAssignment = node.type === 'AssignmentNode';
  let assignedName: string | undefined;

  if (isAssignment) {
    assignedName = (node as math.AssignmentNode).name;
  } else if (node.type === 'FunctionAssignmentNode') {
    assignedName = (node as math.FunctionAssignmentNode).name;
  }

  return {
    node,
    isAssignment: isAssignment || node.type === 'FunctionAssignmentNode',
    assignedName,
  };
}
