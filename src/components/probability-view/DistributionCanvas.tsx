'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useProbabilityStore } from '../../store/useProbabilityStore';
import { DISTRIBUTIONS, normalDistribution } from '../../core/probability/distributions';
import { IntervalHandles } from './IntervalHandles';

export const DistributionCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const { distributionType, params, lowerBound, upperBound, intervalMode } = useProbabilityStore();

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setSize({ width: clientWidth, height: clientHeight });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const dist = DISTRIBUTIONS[distributionType] || normalDistribution;

  // Calculate dynamic domain [xMin, xMax] for each distribution
  const { xMin, xMax } = useMemo(() => {
    switch (dist.id) {
      case 'normal': {
        const m = params.mean ?? 0;
        const s = params.stdDev && params.stdDev > 0 ? params.stdDev : 1;
        return { xMin: m - 4 * s, xMax: m + 4 * s };
      }
      case 'student': {
        return { xMin: -4.5, xMax: 4.5 };
      }
      case 'chisquare': {
        const df = params.df ?? 5;
        const maxVal = Math.max(10, df + 4 * Math.sqrt(2 * df));
        return { xMin: 0, xMax: maxVal };
      }
      case 'f': {
        return { xMin: 0, xMax: 5 };
      }
      case 'exponential': {
        const l = params.lambda && params.lambda > 0 ? params.lambda : 1;
        return { xMin: 0, xMax: Math.max(2, 5 / l) };
      }
      case 'cauchy': {
        const x0 = params.x0 ?? 0;
        const g = params.gamma && params.gamma > 0 ? params.gamma : 1;
        return { xMin: x0 - 5 * g, xMax: x0 + 5 * g };
      }
      case 'weibull': {
        const l = params.lambda && params.lambda > 0 ? params.lambda : 1;
        return { xMin: 0, xMax: Math.max(2, 3.5 * l) };
      }
      case 'gamma': {
        const a = params.alpha ?? 3;
        const b = params.beta ?? 2;
        const maxVal = Math.max(5, a * b + 4 * Math.sqrt(a) * b);
        return { xMin: 0, xMax: maxVal };
      }
      case 'beta': {
        return { xMin: 0, xMax: 1 };
      }
      case 'lognormal': {
        const m = params.mean ?? 0;
        const s = params.stdDev && params.stdDev > 0 ? params.stdDev : 1;
        return { xMin: 0, xMax: Math.min(50, Math.exp(m + 3 * s)) };
      }
      case 'logistic': {
        const m = params.mean ?? 0;
        const s = params.scale && params.scale > 0 ? params.scale : 1;
        return { xMin: m - 6 * s, xMax: m + 6 * s };
      }
      case 'binomial': {
        const n = Math.max(1, params.n ?? 20);
        return { xMin: -0.5, xMax: n + 0.5 };
      }
      case 'pascal': {
        const r = params.r ?? 5;
        const p = params.p && params.p > 0 ? params.p : 0.5;
        const mean = (r * (1 - p)) / p;
        const maxVal = Math.max(12, Math.ceil(mean + 4 * Math.sqrt(mean / p)));
        return { xMin: -0.5, xMax: maxVal + 0.5 };
      }
      case 'poisson': {
        const l = params.lambda ?? 4;
        const maxVal = Math.max(10, Math.ceil(l + 4 * Math.sqrt(l)));
        return { xMin: -0.5, xMax: maxVal + 0.5 };
      }
      case 'hypergeometric': {
        const n = params.sampleSize ?? 10;
        return { xMin: -0.5, xMax: n + 0.5 };
      }
      default:
        return { xMin: -4, xMax: 4 };
    }
  }, [dist.id, params]);

  const padding = { top: 40, right: 40, bottom: 60, left: 40 };
  const plotWidth = size.width - padding.left - padding.right;
  const plotHeight = size.height - padding.top - padding.bottom;
  const baseY = size.height - padding.bottom;

  const xToScreen = (x: number) =>
    padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;

  // Calculate discrete bars or continuous curve points
  const isDiscrete = dist.isDiscrete;

  const { discreteBars, curvePoints, yMax } = useMemo(() => {
    let peakY = 0.01;

    if (isDiscrete) {
      const bars: { k: number; p: number; isSelected: boolean }[] = [];
      const kStart = Math.max(0, Math.ceil(xMin));
      const kEnd = Math.floor(xMax);

      for (let k = kStart; k <= kEnd; k++) {
        const p = dist.pdf(k, params);
        if (p > peakY) peakY = p;
        let isSelected = false;
        if (intervalMode === 'left') {
          isSelected = k <= upperBound;
        } else if (intervalMode === 'right') {
          isSelected = k >= lowerBound;
        } else {
          isSelected = k >= lowerBound && k <= upperBound;
        }
        bars.push({ k, p, isSelected });
      }
      return { discreteBars: bars, curvePoints: [], yMax: Math.max(0.1, peakY * 1.3) };
    } else {
      const numSamples = 300;
      const pts: [number, number][] = [];
      const step = (xMax - xMin) / numSamples;
      for (let i = 0; i <= numSamples; i++) {
        const x = xMin + i * step;
        const y = dist.pdf(x, params);
        if (!isNaN(y) && isFinite(y) && y > peakY) peakY = y;
        pts.push([x, isNaN(y) || !isFinite(y) ? 0 : y]);
      }
      return { discreteBars: [], curvePoints: pts, yMax: Math.max(0.1, peakY * 1.3) };
    }
  }, [isDiscrete, dist, params, xMin, xMax, intervalMode, lowerBound, upperBound]);

  const yToScreen = (y: number) =>
    size.height - padding.bottom - (y / yMax) * plotHeight;

  // Continuous curve SVG path & shaded area
  const curvePath = useMemo(() => {
    if (isDiscrete || curvePoints.length === 0) return '';
    return curvePoints.reduce(
      (acc, [x, y], i) => {
        const sx = xToScreen(x);
        const sy = yToScreen(y);
        return i === 0 ? `M ${sx},${sy}` : `${acc} L ${sx},${sy}`;
      },
      ''
    );
  }, [isDiscrete, curvePoints, xMin, xMax, yMax, size]);

  const shadePath = useMemo(() => {
    if (isDiscrete || curvePoints.length === 0) return '';

    let shadeStart = lowerBound;
    let shadeEnd = upperBound;
    if (intervalMode === 'left') {
      shadeStart = xMin;
      shadeEnd = upperBound;
    } else if (intervalMode === 'right') {
      shadeStart = lowerBound;
      shadeEnd = xMax;
    }

    const clampedStart = Math.max(xMin, Math.min(xMax, shadeStart));
    const clampedEnd = Math.max(xMin, Math.min(xMax, shadeEnd));
    if (clampedEnd <= clampedStart) return '';

    const shadeSamples = 150;
    const shadeStep = (clampedEnd - clampedStart) / shadeSamples;
    let path = `M ${xToScreen(clampedStart)},${baseY} `;

    for (let i = 0; i <= shadeSamples; i++) {
      const x = clampedStart + i * shadeStep;
      const y = dist.pdf(x, params);
      const sy = yToScreen(isNaN(y) || !isFinite(y) ? 0 : y);
      path += `L ${xToScreen(x)},${sy} `;
    }

    path += `L ${xToScreen(clampedEnd)},${baseY} Z`;
    return path;
  }, [isDiscrete, curvePoints, intervalMode, lowerBound, upperBound, xMin, xMax, yMax, dist, params, baseY]);

  // X-Axis Ticks
  const ticks = useMemo(() => {
    const res: { x: number; label: string }[] = [];
    const span = xMax - xMin;
    const tickCount = isDiscrete && span <= 25 ? Math.floor(span) : 8;
    const step = span / tickCount;

    for (let i = 0; i <= tickCount; i++) {
      const x = xMin + i * step;
      const rounded = isDiscrete ? Math.round(x) : Number(x.toFixed(2));
      res.push({
        x: rounded,
        label: rounded.toString(),
      });
    }
    return res;
  }, [xMin, xMax, isDiscrete]);

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full w-full relative bg-white overflow-hidden select-none"
    >
      <svg
        width={size.width}
        height={size.height}
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id="probShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8174ea" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6557d2" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* X-Axis Baseline */}
        <line
          x1={padding.left}
          y1={baseY}
          x2={size.width - padding.right}
          y2={baseY}
          stroke="#5f6368"
          strokeWidth="1.5"
        />

        {/* X-Axis Ticks & Labels */}
        {ticks.map((t, idx) => {
          const sx = xToScreen(t.x);
          if (sx < padding.left - 5 || sx > size.width - padding.right + 5) return null;
          return (
            <g key={idx}>
              <line
                x1={sx}
                y1={baseY - 4}
                x2={sx}
                y2={baseY + 4}
                stroke="#5f6368"
                strokeWidth="1"
              />
              <text
                x={sx}
                y={baseY + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#5f6368"
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Continuous Distribution: Shaded Area & Curve */}
        {!isDiscrete && shadePath && (
          <path
            d={shadePath}
            fill="url(#probShade)"
            stroke="#6557d2"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}

        {!isDiscrete && curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke="#6557d2"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Bound Vertical Drops for Continuous Distribution */}
        {!isDiscrete && intervalMode !== 'left' && (
          <line
            x1={xToScreen(lowerBound)}
            y1={yToScreen(dist.pdf(lowerBound, params))}
            x2={xToScreen(lowerBound)}
            y2={baseY}
            stroke="#6557d2"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
        )}
        {!isDiscrete && intervalMode !== 'right' && (
          <line
            x1={xToScreen(upperBound)}
            y1={yToScreen(dist.pdf(upperBound, params))}
            x2={xToScreen(upperBound)}
            y2={baseY}
            stroke="#6557d2"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
        )}

        {/* Discrete Distribution: Bar Chart with Selected Interval Highlighting */}
        {isDiscrete &&
          discreteBars.map((bar) => {
            const sx = xToScreen(bar.k);
            const sy = yToScreen(bar.p);
            const barHeight = Math.max(0, baseY - sy);
            const barWidth = Math.max(3, Math.min(24, (plotWidth / (xMax - xMin)) * 0.65));

            return (
              <g key={bar.k}>
                <rect
                  x={sx - barWidth / 2}
                  y={sy}
                  width={barWidth}
                  height={barHeight}
                  fill={bar.isSelected ? 'url(#probShade)' : '#f1f3f4'}
                  stroke={bar.isSelected ? '#6557d2' : '#dadce0'}
                  strokeWidth={bar.isSelected ? 1.5 : 1}
                  rx={2}
                />
                <circle
                  cx={sx}
                  cy={sy}
                  r={bar.isSelected ? 3.5 : 2.5}
                  fill={bar.isSelected ? '#6557d2' : '#9aa0a6'}
                />
              </g>
            );
          })}
      </svg>

      {/* Interactive 1D Draggable Handles Layer */}
      <IntervalHandles
        xMin={xMin}
        xMax={xMax}
        width={size.width}
        height={size.height}
        padding={padding}
      />
    </div>
  );
};
