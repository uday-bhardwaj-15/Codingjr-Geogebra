'use client';

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export const TableView: React.FC = () => {
  const [rows, setRows] = useState<string[]>(Array(15).fill(''));

  const handleChange = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index] = value;
    setRows(newRows);
  };

  return (
    <div className="w-80 h-full bg-[var(--gk-bg)] border-r border-[var(--gk-border)] flex flex-col">
      <div className="flex bg-gray-50 border-b border-[var(--gk-border)]">
        <div className="flex-1 flex justify-center items-center py-2 font-medium text-[var(--gk-text)] text-sm">
          x <MoreVertical className="w-3 h-3 ml-1 text-[var(--gk-text-muted)] cursor-pointer" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.map((row, i) => (
          <div key={i} className="flex border-b border-[var(--gk-border)]">
            <input
              type="text"
              value={row}
              onChange={(e) => handleChange(i, e.target.value)}
              className="flex-1 w-full text-center py-2 text-sm text-[var(--gk-text)] outline-none focus:bg-gray-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
