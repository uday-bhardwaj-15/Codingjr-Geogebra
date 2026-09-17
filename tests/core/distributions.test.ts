import { describe, it, expect } from 'vitest';
import {
  normalDistribution,
  studentDistribution,
  chiSquaredDistribution,
  fDistribution,
  exponentialDistribution,
  cauchyDistribution,
  weibullDistribution,
  gammaDistribution,
  betaDistribution,
  logNormalDistribution,
  logisticDistribution,
  binomialDistribution,
  pascalDistribution,
  poissonDistribution,
  hypergeometricDistribution,
  erf,
  DISTRIBUTIONS,
  AVAILABLE_DISTRIBUTIONS,
} from '../../src/core/probability/distributions';

describe('Probability Distributions Engine (All 15 Distributions)', () => {
  describe('Distribution Registry Parity', () => {
    it('has 15 total distributions all enabled', () => {
      expect(AVAILABLE_DISTRIBUTIONS.length).toBe(15);
      AVAILABLE_DISTRIBUTIONS.forEach((d) => {
        expect(d.enabled).toBe(true);
        expect(DISTRIBUTIONS[d.id]).toBeDefined();
      });
    });
  });

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
  });

  describe('Student-t Distribution', () => {
    it('is symmetric with CDF(0) = 0.5', () => {
      const params = { df: 10 };
      expect(studentDistribution.cdf(0, params)).toBeCloseTo(0.5, 4);
      expect(studentDistribution.cdf(1.81, params)).toBeGreaterThan(0.9);
    });
  });

  describe('Chi-Squared Distribution', () => {
    it('evaluates correctly for df=5', () => {
      const params = { df: 5 };
      expect(chiSquaredDistribution.cdf(0, params)).toBe(0);
      expect(chiSquaredDistribution.cdf(5, params)).toBeGreaterThan(0.5);
      expect(chiSquaredDistribution.cdf(15, params)).toBeCloseTo(0.99, 1);
    });
  });

  describe('F-Distribution', () => {
    it('evaluates correctly for df1=5, df2=10', () => {
      const params = { df1: 5, df2: 10 };
      expect(fDistribution.cdf(0, params)).toBe(0);
      expect(fDistribution.cdf(1, params)).toBeGreaterThan(0.4);
      expect(fDistribution.cdf(10, params)).toBeCloseTo(1, 1);
    });
  });

  describe('Exponential Distribution', () => {
    it('evaluates CDF for lambda=1 as 1 - exp(-x)', () => {
      const params = { lambda: 1 };
      expect(exponentialDistribution.cdf(0, params)).toBe(0);
      expect(exponentialDistribution.cdf(1, params)).toBeCloseTo(1 - Math.exp(-1), 4);
      expect(exponentialDistribution.pdf(0, params)).toBe(1);
    });
  });

  describe('Cauchy Distribution', () => {
    it('evaluates CDF with median at x0', () => {
      const params = { x0: 0, gamma: 1 };
      expect(cauchyDistribution.cdf(0, params)).toBeCloseTo(0.5, 4);
      expect(cauchyDistribution.cdf(1, params)).toBeCloseTo(0.75, 4);
      expect(cauchyDistribution.cdf(-1, params)).toBeCloseTo(0.25, 4);
    });
  });

  describe('Weibull Distribution', () => {
    it('evaluates CDF as 1 - exp(-(x/lambda)^k)', () => {
      const params = { k: 2, lambda: 1 };
      expect(weibullDistribution.cdf(0, params)).toBe(0);
      expect(weibullDistribution.cdf(1, params)).toBeCloseTo(1 - Math.exp(-1), 4);
    });
  });

  describe('Gamma Distribution', () => {
    it('evaluates correctly for alpha=3, beta=2', () => {
      const params = { alpha: 3, beta: 2 };
      expect(gammaDistribution.cdf(0, params)).toBe(0);
      expect(gammaDistribution.cdf(6, params)).toBeGreaterThan(0.4);
    });
  });

  describe('Beta Distribution', () => {
    it('is bounded on [0, 1]', () => {
      const params = { alpha: 2, beta: 2 };
      expect(betaDistribution.cdf(0, params)).toBe(0);
      expect(betaDistribution.cdf(0.5, params)).toBeCloseTo(0.5, 4);
      expect(betaDistribution.cdf(1, params)).toBe(1);
    });
  });

  describe('Log-Normal Distribution', () => {
    it('evaluates with median at exp(mu)', () => {
      const params = { mean: 0, stdDev: 1 };
      expect(logNormalDistribution.cdf(1, params)).toBeCloseTo(0.5, 4);
      expect(logNormalDistribution.cdf(0, params)).toBe(0);
    });
  });

  describe('Logistic Distribution', () => {
    it('is symmetric with median at mu', () => {
      const params = { mean: 0, scale: 1 };
      expect(logisticDistribution.cdf(0, params)).toBeCloseTo(0.5, 4);
    });
  });

  describe('Binomial Distribution (Discrete)', () => {
    it('computes exact PMF and cumulative sum for n=10, p=0.5', () => {
      const params = { n: 10, p: 0.5 };
      expect(binomialDistribution.pdf(5, params)).toBeCloseTo(252 / 1024, 4);
      expect(binomialDistribution.cdf(10, params)).toBeCloseTo(1, 4);
      expect(binomialDistribution.cdf(-1, params)).toBe(0);
    });
  });

  describe('Pascal / Negative Binomial Distribution (Discrete)', () => {
    it('computes PMF and CDF for r=5, p=0.5', () => {
      const params = { r: 5, p: 0.5 };
      expect(pascalDistribution.pdf(0, params)).toBeCloseTo(Math.pow(0.5, 5), 4);
      expect(pascalDistribution.cdf(20, params)).toBeGreaterThan(0.9);
    });
  });

  describe('Poisson Distribution (Discrete)', () => {
    it('computes PMF for lambda=4', () => {
      const params = { lambda: 4 };
      expect(poissonDistribution.pdf(0, params)).toBeCloseTo(Math.exp(-4), 4);
      expect(poissonDistribution.pdf(4, params)).toBeCloseTo((Math.exp(-4) * 256) / 24, 4);
      expect(poissonDistribution.cdf(15, params)).toBeCloseTo(1, 3);
    });
  });

  describe('Hypergeometric Distribution (Discrete)', () => {
    it('computes PMF for N=50, M=10, n=10', () => {
      const params = { population: 50, successes: 10, sampleSize: 10 };
      expect(hypergeometricDistribution.pdf(2, params)).toBeGreaterThan(0.2);
      expect(hypergeometricDistribution.cdf(10, params)).toBeCloseTo(1, 4);
    });
  });
});
