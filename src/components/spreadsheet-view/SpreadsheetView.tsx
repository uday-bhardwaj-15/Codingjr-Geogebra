'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';

export const SpreadsheetView: React.FC = () => {
  const rows = 20;
  const cols = 5;
  const colNames = ['A', 'B', 'C', 'D', 'E'];

  const [data, setData] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const handleChange = (row: number, col: string, value: string) => {
    setData((prev) => ({ ...prev, [`${col}${row}`]: value }));
  };

  return (
    <div className="w-80 h-full bg-[var(--gk-bg)] border-r border-[var(--gk-border)] flex flex-col overflow-auto">
      <div className="flex sticky top-0 bg-gray-50 z-10 border-b border-[var(--gk-border)]">
        <div className="w-10 flex-shrink-0 border-r border-[var(--gk-border)] bg-gray-50" />
        {colNames.map((col) => (
          <div key={col} className="w-24 flex-shrink-0 text-center py-1 text-sm text-[var(--gk-text-muted)] font-medium border-r border-[var(--gk-border)]">
            {col}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, r) => {
          const rowNum = r + 1;
          return (
            <div key={rowNum} className="flex">
              <div className="w-10 flex-shrink-0 text-center py-1 text-xs text-[var(--gk-text-muted)] border-r border-b border-[var(--gk-border)] bg-gray-50">
                {rowNum}
              </div>
              {colNames.map((col) => {
                const cellId = `${col}${rowNum}`;
                const isSelected = selectedCell === cellId;
                return (
                  <div key={col} className="w-24 flex-shrink-0 border-r border-b border-[var(--gk-border)] relative">
                    <input
                      type="text"
                      value={data[cellId] || ''}
                      onChange={(e) => handleChange(rowNum, col, e.target.value)}
                      onFocus={() => setSelectedCell(cellId)}
                      onBlur={() => setSelectedCell(null)}
                      className={clsx(
                        'w-full h-full px-1 text-sm text-right outline-none',
                        isSelected ? 'ring-2 ring-[var(--gk-accent)] ring-inset bg-transparent' : 'bg-transparent'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
