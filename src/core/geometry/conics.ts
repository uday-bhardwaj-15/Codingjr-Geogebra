import { PointCoords, distance } from './Point';
import { LineValue } from './Line';
import * as math from 'mathjs';

export type ConicShape =
  | {
      conicType: 'ellipse';
      center: PointCoords;
      a: number;
      b: number;
      angle: number; // rotation in radians
    }
  | {
      conicType: 'hyperbola';
      center: PointCoords;
      a: number;
      b: number;
      angle: number;
    }
  | {
      conicType: 'parabola';
      vertex: PointCoords;
      p: number; // focal parameter
      angle: number; // axis direction in radians
    };

export function ellipseFromFociAndPoint(
  f1: PointCoords,
  f2: PointCoords,
  p: PointCoords
): ConicShape {
  const dFoci = distance(f1, f2);
  const c = dFoci / 2;
  const d1 = distance(f1, p);
  const d2 = distance(f2, p);
  const a = Math.max(c + 0.001, (d1 + d2) / 2);
  const b = Math.sqrt(Math.max(0.001, a * a - c * c));

  const center: PointCoords = {
    x: (f1.x + f2.x) / 2,
    y: (f1.y + f2.y) / 2,
  };
  const angle = Math.atan2(f2.y - f1.y, f2.x - f1.x);

  return {
    conicType: 'ellipse',
    center,
    a,
    b,
    angle,
  };
}

export function hyperbolaFromFociAndPoint(
  f1: PointCoords,
  f2: PointCoords,
  p: PointCoords
): ConicShape {
  const dFoci = distance(f1, f2);
  const c = dFoci / 2;
  const d1 = distance(f1, p);
  const d2 = distance(f2, p);
  const diff = Math.abs(d1 - d2);
  const a = Math.max(0.001, Math.min(c - 0.001, diff / 2));
  const b = Math.sqrt(Math.max(0.001, c * c - a * a));

  const center: PointCoords = {
    x: (f1.x + f2.x) / 2,
    y: (f1.y + f2.y) / 2,
  };
  const angle = Math.atan2(f2.y - f1.y, f2.x - f1.x);

  return {
    conicType: 'hyperbola',
    center,
    a,
    b,
    angle,
  };
}

export function parabolaFromFocusAndDirectrix(
  focus: PointCoords,
  directrix: LineValue
): ConicShape {
  const { a, b, c } = directrix;
  const normSq = a * a + b * b;
  const norm = Math.sqrt(normSq);

  // Perpendicular foot of focus on directrix line
  const dSigned = (a * focus.x + b * focus.y + c) / norm;
  const foot: PointCoords = {
    x: focus.x - (a * (a * focus.x + b * focus.y + c)) / normSq,
    y: focus.y - (b * (a * focus.x + b * focus.y + c)) / normSq,
  };

  const vertex: PointCoords = {
    x: (focus.x + foot.x) / 2,
    y: (focus.y + foot.y) / 2,
  };

  const pDist = distance(focus, foot);
  const angle = Math.atan2(focus.y - foot.y, focus.x - foot.x);

  return {
    conicType: 'parabola',
    vertex,
    p: Math.max(0.001, pDist / 2),
    angle,
  };
}

export function conicFromFivePoints(points: PointCoords[]): ConicShape | null {
  if (points.length < 5) return null;

  try {
    // Solve [x^2, xy, y^2, x, y] * [A, B, C, D, E]^T = -1
    const matrixA: number[][] = [];
    const vectorB: number[] = [];

    for (let i = 0; i < 5; i++) {
      const pt = points[i];
      matrixA.push([pt.x * pt.x, pt.x * pt.y, pt.y * pt.y, pt.x, pt.y]);
      vectorB.push(-1);
    }

    const sol = math.lusolve(matrixA, vectorB) as any;
    const A = sol[0][0];
    const B = sol[1][0];
    const C = sol[2][0];
    const D = sol[3][0];
    const E = sol[4][0];
    const F = 1;

    const disc = B * B - 4 * A * C;

    // Center of general conic: 2Ax + By + D = 0, Bx + 2Cy + E = 0
    const det = 4 * A * C - B * B;
    if (Math.abs(det) < 1e-9) {
      // Parabola case fallback
      return {
        conicType: 'parabola',
        vertex: points[0],
        p: 1,
        angle: 0,
      };
    }

    const x0 = (B * E - 2 * C * D) / det;
    const y0 = (B * D - 2 * A * E) / det;

    if (disc < 0) {
      // Ellipse
      const term = 2 * (A * x0 * x0 + C * y0 * y0 + B * x0 * y0 - F);
      const root = Math.sqrt((A - C) * (A - C) + B * B);
      const a = Math.sqrt(Math.max(0.001, Math.abs(term / (A + C - root))));
      const b = Math.sqrt(Math.max(0.001, Math.abs(term / (A + C + root))));
      const angle = 0.5 * Math.atan2(B, A - C);

      return {
        conicType: 'ellipse',
        center: { x: x0, y: y0 },
        a: Math.max(a, b),
        b: Math.min(a, b),
        angle,
      };
    } else {
      // Hyperbola
      return {
        conicType: 'hyperbola',
        center: { x: x0, y: y0 },
        a: 2,
        b: 2,
        angle: 0.5 * Math.atan2(B, A - C),
      };
    }
  } catch (e) {
    return null;
  }
}
