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
  pdf(x: number, params: Record<string, number>): number;
  cdf(x: number, params: Record<string, number>): number;
}

/**
 * Abramowitz and Stegun formula 7.1.26 approximation for the Error Function erf(x).
 * Maximum error is 1.5 * 10^-7.
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  // Constants
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

export const normalDistribution: Distribution = {
  id: 'normal',
  name: 'Normal',
  isDiscrete: false,
  enabled: true,
  defaultParams: {
    mean: 0,
    stdDev: 1,
  },
  paramLabels: {
    mean: 'μ',
    stdDev: 'σ',
  },
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

export interface DistributionMeta {
  id: string;
  name: string;
  enabled: boolean;
}

export const AVAILABLE_DISTRIBUTIONS: DistributionMeta[] = [
  { id: 'normal', name: 'Normal', enabled: true },
  { id: 'student', name: "Student's t (Coming soon)", enabled: false },
  { id: 'chisquare', name: 'Chi-Squared (Coming soon)', enabled: false },
  { id: 'f', name: 'F-Distribution (Coming soon)', enabled: false },
  { id: 'binomial', name: 'Binomial (Coming soon)', enabled: false },
  { id: 'poisson', name: 'Poisson (Coming soon)', enabled: false },
];

export const DISTRIBUTIONS: Record<string, Distribution> = {
  normal: normalDistribution,
};
