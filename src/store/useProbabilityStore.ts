import { create } from 'zustand';
import { DISTRIBUTIONS, normalDistribution } from '../core/probability/distributions';

export type IntervalMode = 'interval' | 'left' | 'right';

interface ProbabilityState {
  distributionType: string;
  params: Record<string, number>;
  lowerBound: number;
  upperBound: number;
  intervalMode: IntervalMode;
  setDistributionType: (type: string) => void;
  setParam: (key: string, value: number) => void;
  setLowerBound: (val: number) => void;
  setUpperBound: (val: number) => void;
  setIntervalMode: (mode: IntervalMode) => void;
  getProbability: () => number;
}

export const useProbabilityStore = create<ProbabilityState>((set, get) => ({
  distributionType: 'normal',
  params: { mean: 0, stdDev: 1 },
  lowerBound: -1,
  upperBound: 1,
  intervalMode: 'interval',
  setDistributionType: (type) => {
    const dist = DISTRIBUTIONS[type] || normalDistribution;
    set({
      distributionType: type,
      params: { ...dist.defaultParams },
    });
  },
  setParam: (key, value) =>
    set((state) => ({
      params: { ...state.params, [key]: value },
    })),
  setLowerBound: (val) => set({ lowerBound: val }),
  setUpperBound: (val) => set({ upperBound: val }),
  setIntervalMode: (mode) => set({ intervalMode: mode }),
  getProbability: () => {
    const { distributionType, params, lowerBound, upperBound, intervalMode } = get();
    const dist = DISTRIBUTIONS[distributionType] || normalDistribution;
    if (intervalMode === 'left') {
      return dist.cdf(upperBound, params);
    } else if (intervalMode === 'right') {
      return 1 - dist.cdf(lowerBound, params);
    }
    // interval
    const p = dist.cdf(upperBound, params) - dist.cdf(lowerBound, params);
    return Math.max(0, Math.min(1, p));
  },
}));
