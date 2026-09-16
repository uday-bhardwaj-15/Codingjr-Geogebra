'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const mean = params.mean ?? 0;
  const stdDev = params.stdDev && params.stdDev > 0 ? params.stdDev : 1;

  // Domain configuration: 4 standard deviations on each side of the mean
  const xMin = mean - 4 * stdDev;
  const xMax = mean + 4 * stdDev;

  // Range configuration
  const yPeak = dist.pdf(mean, params);
  const yMax = yPeak * 1.3;

  const padding = { top: 40, right: 40, bottom: 60, left: 40 };
  const plotWidth = size.width - padding.left - padding.right;
  const plotHeight = size.height - padding.top - padding.bottom;
  const baseY = size.height - padding.bottom;

  const xToScreen = (x: number) =>
    padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;

  const yToScreen = (y: number) =>
    size.height - padding.bottom - (y / yMax) * plotHeight;

  // Generate curve points
  const numSamples = 300;
  const curvePoints: [number, number][] = [];
  const step = (xMax - xMin) / numSamples;
  for (let i = 0; i <= numSamples; i++) {
    const x = xMin + i * step;
    const y = dist.pdf(x, params);
    curvePoints.push([xToScreen(x), yToScreen(y)]);
  }

  const curvePath = curvePoints.reduce(
    (acc, [sx, sy], i) => (i === 0 ? `M ${sx},${sy}` : `${acc} L ${sx},${sy}`),
    ''
  );

  // Generate shaded region
  let shadeStart = lowerBound;
  let shadeEnd = upperBound;
  if (intervalMode === 'left') {
    shadeStart = xMin;
    shadeEnd = upperBound;
  } else if (intervalMode === 'right') {
    shadeStart = lowerBound;
    shadeEnd = xMax;
  }

  const shadePoints: [number, number][] = [];
  const shadeSamples = 150;
  const clampedStart = Math.max(xMin, Math.min(xMax, shadeStart));
  const clampedEnd = Math.max(xMin, Math.min(xMax, shadeEnd));
  const shadeStep = (clampedEnd - clampedStart) / shadeSamples;

  if (clampedEnd > clampedStart) {
    for (let i = 0; i <= shadeSamples; i++) {
      const x = clampedStart + i * shadeStep;
      const y = dist.pdf(x, params);
      shadePoints.push([xToScreen(x), yToScreen(y)]);
    }
  }

  const startScreenX = xToScreen(clampedStart);
  const endScreenX = xToScreen(clampedEnd);

  let shadePath = '';
  if (shadePoints.length > 0) {
    shadePath = `M ${startScreenX},${baseY} `;
    shadePoints.forEach(([sx, sy]) => {
      shadePath += `L ${sx},${sy} `;
    });
    shadePath += `L ${endScreenX},${baseY} Z`;
  }

  // Ticks along the X-Axis (multiples of stdDev or integers)
  const ticks: { x: number; label: string }[] = [];
  for (let i = -4; i <= 4; i++) {
    const tickX = mean + i * stdDev;
    ticks.push({
      x: tickX,
      label: Number(tickX.toFixed(2)).toString(),
    });
  }

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
          if (sx < padding.left || sx > size.width - padding.right) return null;
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

        {/* Shaded Interval Area */}
        {shadePath && (
          <path
            d={shadePath}
            fill="url(#probShade)"
            stroke="#6557d2"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}

        {/* Normal Distribution PDF Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="#6557d2"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bound Vertical Drops */}
        {intervalMode !== 'left' && (
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
        {intervalMode !== 'right' && (
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
