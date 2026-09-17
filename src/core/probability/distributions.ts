export interface DistributionParams {
  [key: string]: number;
}

export interface Distribution {
  id: string;
  name: string;
  isDiscrete: boolean;
  enabled: boolean;
  defaultParams: Record<string, number>;
  paramLabels: Record<string, string>;
  defaultBounds: { lower: number; upper: number };
  pdf(x: number, params: Record<string, number>): number;
  cdf(x: number, params: Record<string, number>): number;
}

export interface DistributionMeta {
  id: string;
  name: string;
  isDiscrete: boolean;
  enabled: boolean;
}

/**
 * Abramowitz and Stegun formula 7.1.26 approximation for the Error Function erf(x).
 * Maximum error is 1.5 * 10^-7.
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Log-Gamma function ln(Γ(x)) using Lanczos approximation (g=7, n=9).
 */
export function logGamma(x: number): number {
  if (x <= 0) return 0;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.138571095836524,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  const g = 7;
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  let a = p[0];
  const t = x + g + 0.5;
  for (let i = 1; i < p.length; i++) {
    a += p[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function gamma(x: number): number {
  return Math.exp(logGamma(x));
}

/**
 * Log-Beta function ln(B(a, b))
 */
export function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

export function beta(a: number, b: number): number {
  return Math.exp(logBeta(a, b));
}

/**
 * Regularized lower incomplete gamma function P(a, x) = γ(a, x) / Γ(a)
 */
export function regularizedIncompleteGamma(a: number, x: number): number {
  if (x <= 0 || a <= 0) return 0;
  if (x > 200 && x > a * 2) return 1;

  if (x < a + 1) {
    // Series expansion
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return Math.min(1, Math.max(0, Math.exp(-x + a * Math.log(x) - logGamma(a)) * sum));
  } else {
    // Continued fraction (Lentz's method) for Q(a, x) = 1 - P(a, x)
    const TINY = 1e-30;
    let b = x + 1 - a;
    let c = 1 / TINY;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= 200; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < TINY) d = TINY;
      c = b + an / c;
      if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
    return Math.min(1, Math.max(0, 1 - q));
  }
}

/**
 * Regularized incomplete beta function I_x(a, b)
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (a <= 0 || b <= 0) return 0;

  // Symmetry transformation
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedIncompleteBeta(1 - x, b, a);
  }

  const factor = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBeta(a, b)) / a;

  // Continued fraction using Lentz's method
  const TINY = 1e-30;
  let c = 1;
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 200; m++) {
    // Even step
    const num1 = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + num1 * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + num1 / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;

    // Odd step
    const num2 = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num2 * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + num2 / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < 1e-15) break;
  }

  return Math.min(1, Math.max(0, factor * h));
}

/**
 * Combinations C(n, k)
 */
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

// ==========================================
// 15 DISTRIBUTIONS DEFINITION
// ==========================================

export const normalDistribution: Distribution = {
  id: 'normal',
  name: 'Normal',
  isDiscrete: false,
  enabled: true,
  defaultParams: { mean: 0, stdDev: 1 },
  paramLabels: { mean: 'μ', stdDev: 'σ' },
  defaultBounds: { lower: -1, upper: 1 },
  pdf(x: number, params: Record<string, number>): number {
    const mean = params.mean ?? 0;
    const stdDev = params.stdDev && params.stdDev > 0 ? params.stdDev : 1;
    const z = (x - mean) / stdDev;
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  },
  cdf(x: number, params: Record<string, number>): number {
    const mean = params.mean ?? 0;
    const stdDev = params.stdDev && params.stdDev > 0 ? params.stdDev : 1;
    const z = (x - mean) / (stdDev * Math.SQRT2);
    return 0.5 * (1 + erf(z));
  },
};

export const studentDistribution: Distribution = {
  id: 'student',
  name: 'Student',
  isDiscrete: false,
  enabled: true,
  defaultParams: { df: 10 },
  paramLabels: { df: 'ν (df)' },
  defaultBounds: { lower: -1.81, upper: 1.81 },
  pdf(x: number, params: Record<string, number>): number {
    const df = Math.max(0.1, params.df ?? 10);
    const coef = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI);
    return coef * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
  },
  cdf(x: number, params: Record<string, number>): number {
    const df = Math.max(0.1, params.df ?? 10);
    const z = df / (df + x * x);
    const ib = 0.5 * regularizedIncompleteBeta(z, df / 2, 0.5);
    return x >= 0 ? 1 - ib : ib;
  },
};

export const chiSquaredDistribution: Distribution = {
  id: 'chisquare',
  name: 'Chi-Squared',
  isDiscrete: false,
  enabled: true,
  defaultParams: { df: 5 },
  paramLabels: { df: 'ν (df)' },
  defaultBounds: { lower: 1, upper: 9 },
  pdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const df = Math.max(0.1, params.df ?? 5);
    return (
      Math.exp(-logGamma(df / 2) - (df / 2) * Math.LN2 + (df / 2 - 1) * Math.log(x) - x / 2)
    );
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const df = Math.max(0.1, params.df ?? 5);
    return regularizedIncompleteGamma(df / 2, x / 2);
  },
};

export const fDistribution: Distribution = {
  id: 'f',
  name: 'F-Distribution',
  isDiscrete: false,
  enabled: true,
  defaultParams: { df1: 5, df2: 10 },
  paramLabels: { df1: 'd₁ (df₁)', df2: 'd₂ (df₂)' },
  defaultBounds: { lower: 0.5, upper: 3.3 },
  pdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const d1 = Math.max(0.1, params.df1 ?? 5);
    const d2 = Math.max(0.1, params.df2 ?? 10);
    const logNum = (d1 / 2) * Math.log(d1 / d2) + (d1 / 2 - 1) * Math.log(x);
    const logDen = logBeta(d1 / 2, d2 / 2) + ((d1 + d2) / 2) * Math.log(1 + (d1 / d2) * x);
    return Math.exp(logNum - logDen);
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const d1 = Math.max(0.1, params.df1 ?? 5);
    const d2 = Math.max(0.1, params.df2 ?? 10);
    const z = (d1 * x) / (d1 * x + d2);
    return regularizedIncompleteBeta(z, d1 / 2, d2 / 2);
  },
};

export const exponentialDistribution: Distribution = {
  id: 'exponential',
  name: 'Exponential',
  isDiscrete: false,
  enabled: true,
  defaultParams: { lambda: 1 },
  paramLabels: { lambda: 'λ' },
  defaultBounds: { lower: 0, upper: 2 },
  pdf(x: number, params: Record<string, number>): number {
    if (x < 0) return 0;
    const l = Math.max(1e-5, params.lambda ?? 1);
    return l * Math.exp(-l * x);
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x < 0) return 0;
    const l = Math.max(1e-5, params.lambda ?? 1);
    return 1 - Math.exp(-l * x);
  },
};

export const cauchyDistribution: Distribution = {
  id: 'cauchy',
  name: 'Cauchy',
  isDiscrete: false,
  enabled: true,
  defaultParams: { x0: 0, gamma: 1 },
  paramLabels: { x0: 'x₀', gamma: 'γ' },
  defaultBounds: { lower: -1, upper: 1 },
  pdf(x: number, params: Record<string, number>): number {
    const x0 = params.x0 ?? 0;
    const g = Math.max(1e-4, params.gamma ?? 1);
    const z = (x - x0) / g;
    return 1 / (Math.PI * g * (1 + z * z));
  },
  cdf(x: number, params: Record<string, number>): number {
    const x0 = params.x0 ?? 0;
    const g = Math.max(1e-4, params.gamma ?? 1);
    return (1 / Math.PI) * Math.atan((x - x0) / g) + 0.5;
  },
};

export const weibullDistribution: Distribution = {
  id: 'weibull',
  name: 'Weibull',
  isDiscrete: false,
  enabled: true,
  defaultParams: { k: 1.5, lambda: 1 },
  paramLabels: { k: 'k (Shape)', lambda: 'λ (Scale)' },
  defaultBounds: { lower: 0.2, upper: 1.8 },
  pdf(x: number, params: Record<string, number>): number {
    if (x < 0) return 0;
    const k = Math.max(1e-4, params.k ?? 1.5);
    const l = Math.max(1e-4, params.lambda ?? 1);
    return (k / l) * Math.pow(x / l, k - 1) * Math.exp(-Math.pow(x / l, k));
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x < 0) return 0;
    const k = Math.max(1e-4, params.k ?? 1.5);
    const l = Math.max(1e-4, params.lambda ?? 1);
    return 1 - Math.exp(-Math.pow(x / l, k));
  },
};

export const gammaDistribution: Distribution = {
  id: 'gamma',
  name: 'Gamma',
  isDiscrete: false,
  enabled: true,
  defaultParams: { alpha: 3, beta: 2 },
  paramLabels: { alpha: 'α (Shape)', beta: 'β (Scale)' },
  defaultBounds: { lower: 2, upper: 10 },
  pdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const a = Math.max(1e-4, params.alpha ?? 3);
    const b = Math.max(1e-4, params.beta ?? 2);
    return Math.exp((a - 1) * Math.log(x) - x / b - a * Math.log(b) - logGamma(a));
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const a = Math.max(1e-4, params.alpha ?? 3);
    const b = Math.max(1e-4, params.beta ?? 2);
    return regularizedIncompleteGamma(a, x / b);
  },
};

export const betaDistribution: Distribution = {
  id: 'beta',
  name: 'Beta',
  isDiscrete: false,
  enabled: true,
  defaultParams: { alpha: 2, beta: 5 },
  paramLabels: { alpha: 'α', beta: 'β' },
  defaultBounds: { lower: 0.1, upper: 0.5 },
  pdf(x: number, params: Record<string, number>): number {
    if (x <= 0 || x >= 1) return 0;
    const a = Math.max(1e-4, params.alpha ?? 2);
    const b = Math.max(1e-4, params.beta ?? 5);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logBeta(a, b));
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const a = Math.max(1e-4, params.alpha ?? 2);
    const b = Math.max(1e-4, params.beta ?? 5);
    return regularizedIncompleteBeta(x, a, b);
  },
};

export const logNormalDistribution: Distribution = {
  id: 'lognormal',
  name: 'Log-Normal',
  isDiscrete: false,
  enabled: true,
  defaultParams: { mean: 0, stdDev: 1 },
  paramLabels: { mean: 'μ', stdDev: 'σ' },
  defaultBounds: { lower: 0.5, upper: 3 },
  pdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const m = params.mean ?? 0;
    const s = Math.max(1e-4, params.stdDev ?? 1);
    const z = (Math.log(x) - m) / s;
    return (1 / (x * s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  },
  cdf(x: number, params: Record<string, number>): number {
    if (x <= 0) return 0;
    const m = params.mean ?? 0;
    const s = Math.max(1e-4, params.stdDev ?? 1);
    const z = (Math.log(x) - m) / (s * Math.SQRT2);
    return 0.5 * (1 + erf(z));
  },
};

export const logisticDistribution: Distribution = {
  id: 'logistic',
  name: 'Logistic',
  isDiscrete: false,
  enabled: true,
  defaultParams: { mean: 0, scale: 1 },
  paramLabels: { mean: 'μ', scale: 's' },
  defaultBounds: { lower: -2, upper: 2 },
  pdf(x: number, params: Record<string, number>): number {
    const m = params.mean ?? 0;
    const s = Math.max(1e-4, params.scale ?? 1);
    const z = (x - m) / s;
    const expZ = Math.exp(-z);
    return expZ / (s * Math.pow(1 + expZ, 2));
  },
  cdf(x: number, params: Record<string, number>): number {
    const m = params.mean ?? 0;
    const s = Math.max(1e-4, params.scale ?? 1);
    return 1 / (1 + Math.exp(-(x - m) / s));
  },
};

export const binomialDistribution: Distribution = {
  id: 'binomial',
  name: 'Binomial',
  isDiscrete: true,
  enabled: true,
  defaultParams: { n: 20, p: 0.5 },
  paramLabels: { n: 'n (Trials)', p: 'p (Probability)' },
  defaultBounds: { lower: 7, upper: 13 },
  pdf(x: number, params: Record<string, number>): number {
    const k = Math.round(x);
    const n = Math.max(1, Math.round(params.n ?? 20));
    const p = Math.max(0, Math.min(1, params.p ?? 0.5));
    if (k < 0 || k > n || Math.abs(x - k) > 1e-4) return 0;
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  },
  cdf(x: number, params: Record<string, number>): number {
    const kMax = Math.floor(x);
    const n = Math.max(1, Math.round(params.n ?? 20));
    if (kMax < 0) return 0;
    if (kMax >= n) return 1;
    let sum = 0;
    for (let k = 0; k <= kMax; k++) {
      sum += binomialDistribution.pdf(k, params);
    }
    return Math.min(1, Math.max(0, sum));
  },
};

export const pascalDistribution: Distribution = {
  id: 'pascal',
  name: 'Pascal',
  isDiscrete: true,
  enabled: true,
  defaultParams: { r: 5, p: 0.5 },
  paramLabels: { r: 'n (Successes)', p: 'p (Probability)' },
  defaultBounds: { lower: 2, upper: 8 },
  pdf(x: number, params: Record<string, number>): number {
    const k = Math.round(x);
    const r = Math.max(1, Math.round(params.r ?? 5));
    const p = Math.max(0.001, Math.min(0.999, params.p ?? 0.5));
    if (k < 0 || Math.abs(x - k) > 1e-4) return 0;
    return combinations(k + r - 1, k) * Math.pow(p, r) * Math.pow(1 - p, k);
  },
  cdf(x: number, params: Record<string, number>): number {
    const kMax = Math.floor(x);
    if (kMax < 0) return 0;
    let sum = 0;
    for (let k = 0; k <= kMax; k++) {
      sum += pascalDistribution.pdf(k, params);
    }
    return Math.min(1, Math.max(0, sum));
  },
};

export const poissonDistribution: Distribution = {
  id: 'poisson',
  name: 'Poisson',
  isDiscrete: true,
  enabled: true,
  defaultParams: { lambda: 4 },
  paramLabels: { lambda: 'λ (Mean)' },
  defaultBounds: { lower: 2, upper: 6 },
  pdf(x: number, params: Record<string, number>): number {
    const k = Math.round(x);
    const l = Math.max(0.01, params.lambda ?? 4);
    if (k < 0 || Math.abs(x - k) > 1e-4) return 0;
    return Math.exp(-l + k * Math.log(l) - logGamma(k + 1));
  },
  cdf(x: number, params: Record<string, number>): number {
    const kMax = Math.floor(x);
    if (kMax < 0) return 0;
    let sum = 0;
    for (let k = 0; k <= kMax; k++) {
      sum += poissonDistribution.pdf(k, params);
    }
    return Math.min(1, Math.max(0, sum));
  },
};

export const hypergeometricDistribution: Distribution = {
  id: 'hypergeometric',
  name: 'Hypergeometric',
  isDiscrete: true,
  enabled: true,
  defaultParams: { population: 50, successes: 10, sampleSize: 10 },
  paramLabels: {
    population: 'N (Population)',
    successes: 'M (Successes)',
    sampleSize: 'n (Sample Size)',
  },
  defaultBounds: { lower: 1, upper: 4 },
  pdf(x: number, params: Record<string, number>): number {
    const k = Math.round(x);
    const N = Math.max(1, Math.round(params.population ?? 50));
    const M = Math.max(0, Math.min(N, Math.round(params.successes ?? 10)));
    const n = Math.max(0, Math.min(N, Math.round(params.sampleSize ?? 10)));
    if (k < Math.max(0, n - (N - M)) || k > Math.min(n, M) || Math.abs(x - k) > 1e-4) return 0;
    const num = combinations(M, k) * combinations(N - M, n - k);
    const den = combinations(N, n);
    return den === 0 ? 0 : num / den;
  },
  cdf(x: number, params: Record<string, number>): number {
    const kMax = Math.floor(x);
    if (kMax < 0) return 0;
    let sum = 0;
    for (let k = 0; k <= kMax; k++) {
      sum += hypergeometricDistribution.pdf(k, params);
    }
    return Math.min(1, Math.max(0, sum));
  },
};

export const AVAILABLE_DISTRIBUTIONS: DistributionMeta[] = [
  // Continuous
  { id: 'normal', name: 'Normal', isDiscrete: false, enabled: true },
  { id: 'student', name: 'Student', isDiscrete: false, enabled: true },
  { id: 'chisquare', name: 'Chi-Squared', isDiscrete: false, enabled: true },
  { id: 'f', name: 'F-Distribution', isDiscrete: false, enabled: true },
  { id: 'exponential', name: 'Exponential', isDiscrete: false, enabled: true },
  { id: 'cauchy', name: 'Cauchy', isDiscrete: false, enabled: true },
  { id: 'weibull', name: 'Weibull', isDiscrete: false, enabled: true },
  { id: 'gamma', name: 'Gamma', isDiscrete: false, enabled: true },
  { id: 'beta', name: 'Beta', isDiscrete: false, enabled: true },
  { id: 'lognormal', name: 'Log-Normal', isDiscrete: false, enabled: true },
  { id: 'logistic', name: 'Logistic', isDiscrete: false, enabled: true },

  // Discrete
  { id: 'binomial', name: 'Binomial', isDiscrete: true, enabled: true },
  { id: 'pascal', name: 'Pascal', isDiscrete: true, enabled: true },
  { id: 'poisson', name: 'Poisson', isDiscrete: true, enabled: true },
  { id: 'hypergeometric', name: 'Hypergeometric', isDiscrete: true, enabled: true },
];

export const DISTRIBUTIONS: Record<string, Distribution> = {
  normal: normalDistribution,
  student: studentDistribution,
  chisquare: chiSquaredDistribution,
  f: fDistribution,
  exponential: exponentialDistribution,
  cauchy: cauchyDistribution,
  weibull: weibullDistribution,
  gamma: gammaDistribution,
  beta: betaDistribution,
  lognormal: logNormalDistribution,
  logistic: logisticDistribution,
  binomial: binomialDistribution,
  pascal: pascalDistribution,
  poisson: poissonDistribution,
  hypergeometric: hypergeometricDistribution,
};
