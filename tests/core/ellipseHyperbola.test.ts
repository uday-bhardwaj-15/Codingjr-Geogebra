import { describe, it, expect } from 'vitest';
import { ellipseFromFociAndPoint, hyperbolaFromFociAndPoint } from '../../src/core/geometry/conics';

describe('Ellipse and Hyperbola', () => {
  it('should construct ellipse with known foci and point', () => {
    // Foci at (-3, 0) and (3, 0), c = 3. Point at (0, 4) -> dist = 5 each -> 2a = 10 -> a = 5, b = 4
    const f1 = { x: -3, y: 0 };
    const f2 = { x: 3, y: 0 };
    const p = { x: 0, y: 4 };

    const shape = ellipseFromFociAndPoint(f1, f2, p);
    expect(shape.conicType).toBe('ellipse');
    if (shape.conicType === 'ellipse') {
      expect(shape.center.x).toBeCloseTo(0);
      expect(shape.center.y).toBeCloseTo(0);
      expect(shape.a).toBeCloseTo(5);
      expect(shape.b).toBeCloseTo(4);
    }
  });

  it('should construct hyperbola with known foci and point', () => {
    // Foci at (-5, 0) and (5, 0), c = 5. Point at (4, 0) -> dist1 = 9, dist2 = 1 -> diff = 8 -> a = 4, b = 3
    const f1 = { x: -5, y: 0 };
    const f2 = { x: 5, y: 0 };
    const p = { x: 4, y: 0 };

    const shape = hyperbolaFromFociAndPoint(f1, f2, p);
    expect(shape.conicType).toBe('hyperbola');
    if (shape.conicType === 'hyperbola') {
      expect(shape.center.x).toBeCloseTo(0);
      expect(shape.center.y).toBeCloseTo(0);
      expect(shape.a).toBeCloseTo(4);
      expect(shape.b).toBeCloseTo(3);
    }
  });
});
