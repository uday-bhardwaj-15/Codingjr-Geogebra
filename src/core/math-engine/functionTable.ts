import { parseExpression } from './parser';
import { Evaluator } from './evaluator';

export interface TableRowData {
  x: string;
  fx: string;
  gx: string;
}

export function evaluateExpressionForX(expr: string, xVal: number): number | null {
  if (!expr || !expr.trim()) return null;
  try {
    const trimmed = expr.trim();
    // Support expressions like "x^2", "f(x) = x^2", "2*x + 1"
    const formula = trimmed.includes('=') ? trimmed.split('=')[1].trim() : trimmed;
    const parsed = parseExpression(formula);
    const evaluator = new Evaluator();
    evaluator.setVariable('x', xVal);
    const val = evaluator.evaluate(parsed);
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

export function computeTableRows(
  xValues: string[],
  fExpr: string,
  gExpr: string
): TableRowData[] {
  return xValues.map((xStr) => {
    const trimmedX = xStr.trim();
    if (trimmedX === '') {
      return { x: '', fx: '', gx: '' };
    }
    const xNum = parseFloat(trimmedX);
    if (isNaN(xNum)) {
      return { x: xStr, fx: '', gx: '' };
    }

    const fVal = evaluateExpressionForX(fExpr, xNum);
    const gVal = evaluateExpressionForX(gExpr, xNum);

    return {
      x: xStr,
      fx: fVal !== null ? (Math.round(fVal * 10000) / 10000).toString() : '',
      gx: gVal !== null ? (Math.round(gVal * 10000) / 10000).toString() : '',
    };
  });
}
