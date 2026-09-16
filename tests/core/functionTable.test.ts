import { describe, it, expect } from 'vitest';
import {
  evaluateExpressionForX,
  computeTableRows,
} from '../../src/core/math-engine/functionTable';

describe('Function Table Evaluator', () => {
  describe('evaluateExpressionForX', () => {
    it('evaluates polynomials correctly', () => {
      expect(evaluateExpressionForX('x^2', 3)).toBe(9);
      expect(evaluateExpressionForX('x^2 - 4', 2)).toBe(0);
      expect(evaluateExpressionForX('3*x + 7', 4)).toBe(19);
    });

    it('evaluates functions with explicit f(x) = notation', () => {
      expect(evaluateExpressionForX('f(x) = x^3 - x', 2)).toBe(6);
      expect(evaluateExpressionForX('g(x) = 2*x + 1', 5)).toBe(11);
    });

    it('evaluates trigonometric and mathematical functions', () => {
      expect(evaluateExpressionForX('sin(0)', 0)).toBe(0);
      expect(evaluateExpressionForX('abs(x)', -5)).toBe(5);
    });

    it('returns null for empty or invalid expressions', () => {
      expect(evaluateExpressionForX('', 5)).toBeNull();
      expect(evaluateExpressionForX('invalid_syntax +++*', 5)).toBeNull();
    });
  });

  describe('computeTableRows', () => {
    it('computes f(x)=x^2 and g(x)=2*x+1 for a series of x values', () => {
      const xValues = ['-2', '-1', '0', '1', '2', '3'];
      const rows = computeTableRows(xValues, 'x^2', '2*x + 1');

      expect(rows).toEqual([
        { x: '-2', fx: '4', gx: '-3' },
        { x: '-1', fx: '1', gx: '-1' },
        { x: '0', fx: '0', gx: '1' },
        { x: '1', fx: '1', gx: '3' },
        { x: '2', fx: '4', gx: '5' },
        { x: '3', fx: '9', gx: '7' },
      ]);
    });

    it('handles blank rows gracefully', () => {
      const xValues = ['1', '', '2'];
      const rows = computeTableRows(xValues, 'x^2', '');

      expect(rows).toEqual([
        { x: '1', fx: '1', gx: '' },
        { x: '', fx: '', gx: '' },
        { x: '2', fx: '4', gx: '' },
      ]);
    });
  });
});
