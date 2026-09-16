import * as math from 'mathjs';

// Exact fraction math instance
const mathExact = math.create(math.all, { number: 'Fraction' });

export interface CasRowResult {
  status: 'symbolic' | 'numeric' | 'unassigned' | 'error';
  displayValue: string;
  raw: unknown;
  assignedName?: string;
  isFunction?: boolean;
  functionArg?: string;
  definition?: string;
}

export type CasScope = Map<string, any>;

/**
 * Normalizes input: handles ':=' as '=' and removes trailing semicolons.
 */
function normalizeInput(input: string): string {
  return input.trim().replace(/:=/g, '=').replace(/;+$/, '');
}

/**
 * Formats a Fraction or MathJS value into a clean exact string.
 */
export function formatExactResult(val: any): string {
  if (val == null) return '';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toString();
  }
  if (typeof val === 'object' && 's' in val && 'n' in val && 'd' in val) {
    // Fraction object
    const sign = val.s < 0 ? '-' : '';
    const n = val.n.toString();
    const d = val.d.toString();
    if (d === '1') return `${sign}${n}`;
    return `${sign}${n}/${d}`;
  }
  if (typeof val.toString === 'function') {
    return val.toString();
  }
  return String(val);
}

/**
 * Solve linear (ax + b = 0) or quadratic (ax^2 + bx + c = 0) equations symbolically.
 */
export function solveEquation(equationStr: string, variable: string = 'x'): string {
  try {
    let eq = equationStr.trim();
    // Strip "Solve(" and ")" if wrapped
    if (eq.toLowerCase().startsWith('solve(') && eq.endsWith(')')) {
      const inner = eq.slice(6, -1).trim();
      const commaIdx = inner.lastIndexOf(',');
      if (commaIdx > 0) {
        variable = inner.slice(commaIdx + 1).trim();
        eq = inner.slice(0, commaIdx).trim();
      } else {
        eq = inner;
      }
    }

    let exprStr = eq;
    if (eq.includes('=')) {
      const parts = eq.split('=');
      exprStr = `(${parts[0].trim()}) - (${parts[1].trim()})`;
    }

    // Rationalize/expand polynomial expression
    const simplified = math.rationalize(exprStr);
    const simplifiedStr = simplified.toString();

    // Check if it's a constant
    if (!simplifiedStr.includes(variable)) {
      const val = math.evaluate(simplifiedStr);
      if (val === 0) return 'All real numbers';
      return 'No solution';
    }

    // Try to extract coefficients for quadratic: a*x^2 + b*x + c
    // Evaluate at x = 0, x = 1, x = -1 to determine a, b, c
    const f0 = math.evaluate(simplifiedStr, { [variable]: 0 });
    const f1 = math.evaluate(simplifiedStr, { [variable]: 1 });
    const fm1 = math.evaluate(simplifiedStr, { [variable]: -1 });

    const c = f0;
    const a = (f1 + fm1 - 2 * c) / 2;
    const b = f1 - a - c;

    // Verify if expression is quadratic/linear: test at x = 2
    const f2 = math.evaluate(simplifiedStr, { [variable]: 2 });
    const expectedF2 = a * 4 + b * 2 + c;
    if (Math.abs(f2 - expectedF2) > 1e-6) {
      return 'Solve: Degree ≥ 3 polynomial solve (Coming soon)';
    }

    // 1. Linear case: ax + b = 0 (here b is the constant, a is the linear coef)
    if (Math.abs(a) < 1e-9) {
      if (Math.abs(b) < 1e-9) {
        return c === 0 ? 'All real numbers' : 'No solution';
      }
      const root = -c / b;
      const frac = math.fraction(root);
      return `${variable} = ${formatExactResult(frac)}`;
    }

    // 2. Quadratic case: ax^2 + bx + c = 0
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-disc) / (2 * a);
      const rFrac = formatExactResult(math.fraction(realPart));
      const iFrac = formatExactResult(math.fraction(Math.abs(imagPart)));
      const iStr = iFrac === '1' ? 'i' : `${iFrac}i`;
      return `${variable} = ${rFrac} + ${iStr}, ${variable} = ${rFrac} - ${iStr}`;
    }

    if (Math.abs(disc) < 1e-9) {
      const r = -b / (2 * a);
      const frac = formatExactResult(math.fraction(r));
      return `${variable} = ${frac}`;
    }

    const sqrtDisc = Math.sqrt(disc);
    const r1 = (-b + sqrtDisc) / (2 * a);
    const r2 = (-b - sqrtDisc) / (2 * a);

    // Format roots
    const root1Str = Number.isInteger(sqrtDisc)
      ? formatExactResult(math.fraction(r1))
      : `${r1.toFixed(4)}`;
    const root2Str = Number.isInteger(sqrtDisc)
      ? formatExactResult(math.fraction(r2))
      : `${r2.toFixed(4)}`;

    return `${variable} = ${root2Str}, ${variable} = ${root1Str}`;
  } catch (e: any) {
    return `Error: ${e.message || 'Could not solve equation'}`;
  }
}

/**
 * Main CAS input evaluation function.
 */
export function evaluateCasInput(
  input: string,
  scope: CasScope = new Map(),
  options: { numeric?: boolean } = {}
): CasRowResult {
  const rawInput = input.trim();
  if (!rawInput) {
    return { status: 'symbolic', displayValue: '', raw: null };
  }

  const normalized = normalizeInput(rawInput);
  const scopeObj = Object.fromEntries(scope);

  // 1. Check for Solve commands
  if (/^solve\s*\(/i.test(normalized) || (/=/.test(normalized) && !/^[a-zA-Z][a-zA-Z0-9_]*\s*(\([a-zA-Z0-9_,\s]+\))?\s*=/.test(normalized))) {
    const solved = solveEquation(normalized);
    return {
      status: 'symbolic',
      displayValue: solved,
      raw: solved,
    };
  }

  // 2. Check for Derivative commands: Derivative(f(x), x) or diff(...)
  const derivMatch = normalized.match(/^derivative\s*\(\s*([^,]+)\s*,\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\)$/i);
  if (derivMatch) {
    try {
      const expr = derivMatch[1].trim();
      const variable = derivMatch[2].trim();
      const d = math.derivative(expr, variable);
      const sim = math.simplify(d.toString());
      return {
        status: 'symbolic',
        displayValue: sim.toString(),
        raw: sim,
      };
    } catch (e: any) {
      return { status: 'error', displayValue: `Error: ${e.message}`, raw: null };
    }
  }

  // 3. Check for Assignment: variable or function definition
  // e.g. a = 5 or f(x) = x^2 + 2*x
  const funcAssignMatch = normalized.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\)\s*=\s*(.+)$/);
  if (funcAssignMatch) {
    const funcName = funcAssignMatch[1];
    const argName = funcAssignMatch[2];
    const funcBody = funcAssignMatch[3].trim();
    scope.set(funcName, funcBody);

    try {
      const simplified = math.simplify(funcBody, scopeObj);
      return {
        status: 'symbolic',
        displayValue: `${funcName}(${argName}) = ${simplified.toString()}`,
        raw: simplified,
        assignedName: funcName,
        isFunction: true,
        functionArg: argName,
        definition: funcBody,
      };
    } catch {
      return {
        status: 'symbolic',
        displayValue: `${funcName}(${argName}) = ${funcBody}`,
        raw: funcBody,
        assignedName: funcName,
        isFunction: true,
        functionArg: argName,
        definition: funcBody,
      };
    }
  }

  const varAssignMatch = normalized.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
  if (varAssignMatch) {
    const varName = varAssignMatch[1];
    const varExpr = varAssignMatch[2].trim();
    const evalRes = evaluateCasInput(varExpr, scope, options);
    scope.set(varName, evalRes.displayValue);
    return {
      status: evalRes.status,
      displayValue: `${varName} = ${evalRes.displayValue}`,
      raw: evalRes.raw,
      assignedName: varName,
      isFunction: false,
      definition: varExpr,
    };
  }

  // 4. Numeric Mode Override
  if (options.numeric) {
    try {
      const parsed = math.parse(normalized);
      const val = parsed.compile().evaluate(scopeObj);
      if (typeof val === 'number') {
        return {
          status: 'numeric',
          displayValue: val.toString(),
          raw: val,
        };
      }
    } catch {
      // Fall back to symbolic
    }
  }

  // 5. Bare Unassigned Identifier
  // Check if input is a single identifier that is not in scope
  if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(normalized)) {
    if (scope.has(normalized)) {
      return {
        status: 'symbolic',
        displayValue: String(scope.get(normalized)),
        raw: scope.get(normalized),
      };
    }
    // Return unassigned symbol without error!
    return {
      status: 'unassigned',
      displayValue: normalized,
      raw: normalized,
    };
  }

  // 6. Exact Fraction & Symbolic Evaluation
  try {
    // First attempt exact arithmetic using mathExact
    const parsedExact = mathExact.parse(normalized);
    const evaluatedExact = parsedExact.compile().evaluate(scopeObj);
    if (
      typeof evaluatedExact === 'object' &&
      evaluatedExact &&
      's' in evaluatedExact &&
      'n' in evaluatedExact
    ) {
      const formatted = formatExactResult(evaluatedExact);
      return {
        status: 'symbolic',
        displayValue: formatted,
        raw: evaluatedExact,
      };
    }
  } catch {
    // Continue to general symbolic simplify
  }

  // 7. General Symbolic Simplification
  try {
    const simplified = math.simplify(normalized, scopeObj);
    return {
      status: 'symbolic',
      displayValue: simplified.toString(),
      raw: simplified,
    };
  } catch {
    // If simplify throws because of unassigned symbols, try parsing directly
    try {
      const node = math.parse(normalized);
      return {
        status: 'symbolic',
        displayValue: node.toString(),
        raw: node,
      };
    } catch (e: any) {
      return {
        status: 'error',
        displayValue: `Error: ${e.message || 'Invalid syntax'}`,
        raw: null,
      };
    }
  }
}

/**
 * Expand algebraic expression using math.rationalize
 */
export function expandCas(expr: string, scope: CasScope = new Map()): string {
  try {
    const res = math.rationalize(expr, Object.fromEntries(scope));
    return res.toString();
  } catch (e: any) {
    return expr;
  }
}

/**
 * Substitute variable with a value/expression in the given expression.
 */
export function substituteCas(
  expr: string,
  varName: string,
  valueExpr: string,
  scope: CasScope = new Map()
): string {
  try {
    const scopeObj = Object.fromEntries(scope);
    const val = math.evaluate(valueExpr, scopeObj);
    const res = math.evaluate(expr, { ...scopeObj, [varName]: val });
    return formatExactResult(res);
  } catch {
    try {
      // Symbolic substitution via rationalize / simplify
      const replaced = expr.replace(new RegExp(`\\b${varName}\\b`, 'g'), `(${valueExpr})`);
      try {
        const rationalized = math.rationalize(replaced, Object.fromEntries(scope));
        return rationalized.toString();
      } catch {
        const simplified = math.simplify(replaced, Object.fromEntries(scope));
        return simplified.toString();
      }
    } catch (e: any) {
      return `Error: ${e.message || 'Substitution failed'}`;
    }
  }
}
