'use client';

import React from 'react';
import { Plus, Keyboard, RotateCcw } from 'lucide-react';
import { useCasStore } from '../../store/useCasStore';
import { CasRow } from './CasRow';
import { useActiveMathInputStore } from '../../hooks/useActiveMathInput';

export const CasRowList: React.FC = () => {
  const { rows, addRow, recomputeAll } = useCasStore();
  const toggleKeyboard = useActiveMathInputStore((s) => s.toggleKeyboard);
  const isKeyboardOpen = useActiveMathInputStore((s) => s.isKeyboardOpen);

  return (
    <div className="w-80 sm:w-96 h-full bg-white border-r border-[#e0e0e0] flex flex-col select-none">
      {/* CAS Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border-b border-[#e0e0e0] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">
            CAS (Symbolic)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => recomputeAll()}
            title="Recompute all rows"
            className="p-1 hover:bg-gray-200/70 rounded text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f4]">
        {rows.map((row, index) => (
          <CasRow key={row.id} row={row} index={index} />
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-2.5 border-t border-[#e0e0e0] bg-gray-50 flex items-center justify-between shrink-0">
        <button
          onClick={() => addRow()}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#6557d2] hover:bg-[#5345c2] active:bg-[#473aa8] text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Row</span>
        </button>

        <button
          type="button"
          onClick={toggleKeyboard}
          title="Toggle Virtual Math Keyboard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isKeyboardOpen
              ? 'bg-[#f3f1fd] border-[#6557d2] text-[#6557d2]'
              : 'border-[#dadce0] bg-white text-[#5f6368] hover:text-[#202124] hover:bg-gray-100'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Keyboard</span>
        </button>
      </div>
    </div>
  );
};
