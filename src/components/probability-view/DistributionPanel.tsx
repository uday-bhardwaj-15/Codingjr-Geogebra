'use client';

import React, { useRef } from 'react';
import { useProbabilityStore } from '../../store/useProbabilityStore';
import { AVAILABLE_DISTRIBUTIONS, DISTRIBUTIONS, normalDistribution } from '../../core/probability/distributions';
import { useRegisterMathInput } from '../../hooks/useActiveMathInput';
import { clsx } from 'clsx';

export const DistributionPanel: React.FC = () => {
  const {
    distributionType,
    params,
    lowerBound,
    upperBound,
    intervalMode,
    setDistributionType,
    setParam,
    setLowerBound,
    setUpperBound,
    setIntervalMode,
    getProbability,
  } = useProbabilityStore();

  const lowerRef = useRef<HTMLInputElement>(null);
  const upperRef = useRef<HTMLInputElement>(null);

  const currentDist = DISTRIBUTIONS[distributionType] || normalDistribution;

  const lowerInput = useRegisterMathInput(
    'prob-lower',
    String(lowerBound),
    (val) => {
      const num = parseFloat(val);
      if (!isNaN(num)) setLowerBound(num);
    },
    lowerRef
  );

  const upperInput = useRegisterMathInput(
    'prob-upper',
    String(upperBound),
    (val) => {
      const num = parseFloat(val);
      if (!isNaN(num)) setUpperBound(num);
    },
    upperRef
  );

  const probValue = getProbability();

  return (
    <div className="w-80 h-full bg-white border-r border-[#e0e0e0] flex flex-col p-4 overflow-y-auto select-none">
      <h2 className="text-base font-semibold text-[#202124] mb-3">Distribution</h2>

      {/* Distribution Type Dropdown */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#5f6368] mb-1">Type</label>
        <select
          value={distributionType}
          onChange={(e) => setDistributionType(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-[#dadce0] rounded-lg text-[#202124] focus:border-[#6557d2] focus:ring-1 focus:ring-[#6557d2] outline-none cursor-pointer font-medium"
        >
          {AVAILABLE_DISTRIBUTIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Distribution Parameters (Dynamic based on distributionType) */}
      <div className="mb-5 bg-gray-50 border border-[#e8eaed] rounded-xl p-3">
        <span className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider block mb-2">
          Parameters
        </span>
        <div className="space-y-2.5">
          {Object.entries(currentDist.paramLabels).map(([key, label]) => {
            const currentVal = params[key] ?? currentDist.defaultParams[key] ?? 0;
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#202124] min-w-16 font-sans">
                  {label}
                </span>
                <input
                  type="number"
                  step="any"
                  value={currentVal}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setParam(key, val);
                  }}
                  className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-[#dadce0] rounded-md text-right font-mono focus:border-[#6557d2] outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interval Type Selection */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#5f6368] mb-1.5">Interval Mode</label>
        <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-lg border border-[#dadce0]">
          <button
            onClick={() => setIntervalMode('left')}
            className={clsx(
              'py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center',
              intervalMode === 'left'
                ? 'bg-white text-[#6557d2] shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
            title="Left tail: P(X ≤ b)"
          >
            P(X ≤ b)
          </button>
          <button
            onClick={() => setIntervalMode('interval')}
            className={clsx(
              'py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center',
              intervalMode === 'interval'
                ? 'bg-white text-[#6557d2] shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
            title="Interval: P(a ≤ X ≤ b)"
          >
            P(a ≤ X ≤ b)
          </button>
          <button
            onClick={() => setIntervalMode('right')}
            className={clsx(
              'py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center',
              intervalMode === 'right'
                ? 'bg-white text-[#6557d2] shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
            title="Right tail: P(X ≥ a)"
          >
            P(X ≥ a)
          </button>
        </div>
      </div>

      {/* Bounds Input Fields */}
      <div className="space-y-3 mb-6 bg-gray-50 border border-[#e8eaed] rounded-xl p-3">
        {(intervalMode === 'interval' || intervalMode === 'right') && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#5f6368] w-24">Lower (a)</span>
            <input
              ref={lowerRef}
              type="number"
              step={currentDist.isDiscrete ? '1' : 'any'}
              value={lowerBound}
              onFocus={lowerInput.onFocus}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setLowerBound(val);
              }}
              className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-[#dadce0] rounded-md text-right font-mono focus:border-[#6557d2] outline-none"
            />
          </div>
        )}

        {(intervalMode === 'interval' || intervalMode === 'left') && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#5f6368] w-24">Upper (b)</span>
            <input
              ref={upperRef}
              type="number"
              step={currentDist.isDiscrete ? '1' : 'any'}
              value={upperBound}
              onFocus={upperInput.onFocus}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setUpperBound(val);
              }}
              className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-[#dadce0] rounded-md text-right font-mono focus:border-[#6557d2] outline-none"
            />
          </div>
        )}
      </div>

      {/* Probability Result Readout Box */}
      <div className="mt-auto bg-[#f3f1fd] border border-[#d3ccf7] rounded-xl p-4 text-center">
        <div className="text-xs font-medium text-[#6557d2] uppercase tracking-wide mb-1">
          Probability
        </div>
        <div className="text-2xl font-bold font-mono text-[#202124]">
          {probValue.toFixed(4)}
        </div>
        <div className="text-xs text-[#5f6368] mt-1 font-mono">
          {intervalMode === 'interval' && `P(${lowerBound} ≤ X ≤ ${upperBound})`}
          {intervalMode === 'left' && `P(X ≤ ${upperBound})`}
          {intervalMode === 'right' && `P(X ≥ ${lowerBound})`}
          {` = ${(probValue * 100).toFixed(2)}%`}
        </div>
      </div>
    </div>
  );
};
