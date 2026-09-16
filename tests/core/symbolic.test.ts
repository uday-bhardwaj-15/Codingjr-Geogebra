import { describe, it, expect } from 'vitest';
import {
  evaluateCasInput,
  expandCas,
  substituteCas,
  solveEquation,
} from '../../src/core/math-engine/symbolic';

describe('CAS Symbolic Engine', () => {
  describe('Exact Fraction Arithmetic', () => {
    it('evaluates fractions exactly without floating point decimals', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('1/3 + 1/6', scope);
      expect(res.status).toBe('symbolic');
      expect(res.displayValue).toBe('1/2');
    });

    it('evaluates complex fraction arithmetic', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('3/4 * (2/5 + 1/10)', scope);
      expect(res.status).toBe('symbolic');
      expect(res.displayValue).toBe('3/8');
    });

    it('converts to numeric float when requested', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('1/3', scope, { numeric: true });
      expect(res.status).toBe('numeric');
      expect(parseFloat(res.displayValue)).toBeCloseTo(0.3333333333333333, 5);
    });
  });

  describe('Unassigned Symbol Passthrough', () => {
    it('passes unassigned bare variables through without throwing an error', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('z', scope);
      expect(res.status).toBe('unassigned');
      expect(res.displayValue).toBe('z');
    });

    it('evaluates assigned variable and passes unassigned variable', () => {
      const scope = new Map<string, any>();
      evaluateCasInput('a := 5', scope);
      const resA = evaluateCasInput('a', scope);
      const resZ = evaluateCasInput('z', scope);

      expect(resA.displayValue).toBe('5');
      expect(resZ.displayValue).toBe('z');
      expect(resZ.status).toBe('unassigned');
    });
  });

  describe('Simplification & Polynomial Expansion', () => {
    it('simplifies algebraic expressions', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('2*x + 3*x + 4', scope);
      expect(res.displayValue.replace(/\s+/g, '')).toBe('5*x+4');
    });

    it('expands polynomial products via expandCas', () => {
      const expanded = expandCas('(x + 1)^2');
      expect(expanded.replace(/\s+/g, '')).toBe('x^2+2*x+1');

      const expandedProd = expandCas('(x + 2)*(x - 3)');
      expect(expandedProd.replace(/\s+/g, '')).toBe('x^2-x-6');
    });
  });

  describe('Substitution', () => {
    it('substitutes a numeric value into an expression', () => {
      const res = substituteCas('x^2 + 2*x + 1', 'x', '3');
      expect(res).toBe('16');
    });

    it('substitutes an expression into another expression', () => {
      const res = substituteCas('2*x + 1', 'x', 'y + 2');
      expect(res.replace(/\s+/g, '')).toBe('2*y+5');
    });
  });

  describe('Symbolic Derivative', () => {
    it('computes derivative of polynomial functions', () => {
      const scope = new Map<string, any>();
      const res = evaluateCasInput('Derivative(x^3 + 2*x^2 - 5*x + 7, x)', scope);
      expect(res.status).toBe('symbolic');
      expect(res.displayValue.replace(/\s+/g, '')).toBe('3*x^2+4*x-5');
    });
  });

  describe('Equation Solving (Linear and Quadratic)', () => {
    it('solves linear equations', () => {
      const sol = solveEquation('2*x + 6 = 0');
      expect(sol).toBe('x = -3');
    });

    it('solves linear equations with fractions', () => {
      const sol = solveEquation('3*x - 2 = 0');
      expect(sol).toBe('x = 2/3');
    });

    it('solves quadratic equations with distinct real roots', () => {
      const sol = solveEquation('x^2 - 5*x + 6 = 0');
      expect(sol).toContain('x = 2');
      expect(sol).toContain('x = 3');
    });

    it('solves quadratic equations with repeated roots', () => {
      const sol = solveEquation('x^2 - 4*x + 4 = 0');
      expect(sol).toBe('x = 2');
    });
  });
});
