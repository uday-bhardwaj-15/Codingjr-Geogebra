import { describe, it, expect } from 'vitest';
import { normalDistribution, erf } from '../../src/core/probability/distributions';

describe('Probability Distributions Engine', () => {
  describe('erf approximation', () => {
    it('evaluates special values accurately', () => {
      expect(erf(0)).toBe(0);
      expect(erf(1)).toBeCloseTo(0.84270079, 4);
      expect(erf(-1)).toBeCloseTo(-0.84270079, 4);
      expect(erf(2)).toBeCloseTo(0.99532226, 4);
    });
  });

  describe('Normal Distribution (mean=0, stdDev=1)', () => {
    const params = { mean: 0, stdDev: 1 };

    it('computes exact peak for standard normal PDF at x=0', () => {
      const pdf0 = normalDistribution.pdf(0, params);
      const expectedPeak = 1 / Math.sqrt(2 * Math.PI); // ~0.39894228
      expect(pdf0).toBeCloseTo(expectedPeak, 5);
    });

    it('computes CDF at mean as 0.5', () => {
      expect(normalDistribution.cdf(0, params)).toBeCloseTo(0.5, 5);
    });

    it('computes 1-sigma standard normal interval (~68.27%)', () => {
      const p1 = normalDistribution.cdf(1, params);
      const pm1 = normalDistribution.cdf(-1, params);
      expect(p1 - pm1).toBeCloseTo(0.682689, 4);
    });

    it('computes 2-sigma standard normal interval (~95.45%)', () => {
      const p2 = normalDistribution.cdf(2, params);
      const pm2 = normalDistribution.cdf(-2, params);
      expect(p2 - pm2).toBeCloseTo(0.954499, 4);
    });

    it('computes 3-sigma standard normal interval (~99.73%)', () => {
      const p3 = normalDistribution.cdf(3, params);
      const pm3 = normalDistribution.cdf(-3, params);
      expect(p3 - pm3).toBeCloseTo(0.9973, 3);
    });
  });

  describe('Normal Distribution with custom mean and stdDev', () => {
    const params = { mean: 50, stdDev: 10 };

    it('computes CDF at mean=50 as 0.5', () => {
      expect(normalDistribution.cdf(50, params)).toBeCloseTo(0.5, 5);
    });

    it('computes 1-sigma interval around mean 50 (from 40 to 60)', () => {
      const upper = normalDistribution.cdf(60, params);
      const lower = normalDistribution.cdf(40, params);
      expect(upper - lower).toBeCloseTo(0.682689, 4);
    });
  });
});
