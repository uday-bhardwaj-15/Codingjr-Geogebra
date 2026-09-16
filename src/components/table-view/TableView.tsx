'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MoreVertical, Settings, Plus, Keyboard, Trash2 } from 'lucide-react';
import { computeTableRows } from '../../core/math-engine/functionTable';
import { DefineFunctionsModal } from './DefineFunctionsModal';
import { useActiveMathInputStore, useRegisterMathInput } from '../../hooks/useActiveMathInput';
import { clsx } from 'clsx';

interface TableViewProps {
  variant?: 'sidebar' | 'fullpage';
}

const DEFAULT_X_VALUES = ['-2', '-1', '0', '1', '2', '3', '4', '', '', '', '', '', '', '', ''];

export const TableView: React.FC<TableViewProps> = ({ variant = 'sidebar' }) => {
  const [xValues, setXValues] = useState<string[]>(DEFAULT_X_VALUES);
  const [fExpr, setFExpr] = useState<string>('x^2');
  const [gExpr, setGExpr] = useState<string>('2*x + 1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleKeyboard = useActiveMathInputStore((s) => s.toggleKeyboard);
  const isKeyboardOpen = useActiveMathInputStore((s) => s.isKeyboardOpen);

  const rows = useMemo(() => {
    return computeTableRows(xValues, fExpr, gExpr);
  }, [xValues, fExpr, gExpr]);

  const handleXChange = (index: number, val: string) => {
    const next = [...xValues];
    next[index] = val;
    // Auto-grow rows if typing into the last row
    if (index === next.length - 1 && val.trim() !== '') {
      next.push('');
    }
    setXValues(next);
  };

  const clearAllX = () => {
    setXValues(Array(15).fill(''));
    setShowMenu(false);
  };

  const populateDefaultRange = () => {
    setXValues(['-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '', '', '', '']);
    setShowMenu(false);
  };

  const isFullPage = variant === 'fullpage';

  return (
    <div
      className={clsx(
        'h-full bg-white flex flex-col select-none relative',
        isFullPage ? 'w-full max-w-4xl mx-auto px-4 py-4' : 'w-80 border-r border-[#e0e0e0]'
      )}
    >
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-[#e0e0e0] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">
            Table of Values
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsModalOpen(true)}
            title="Edit Functions"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6557d2] hover:bg-[#f3f1fd] rounded-md border border-[#dadce0] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit f(x), g(x)</span>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 bg-gray-100/80 border-b border-[#dadce0] text-xs font-semibold text-[#3c4043] shrink-0">
        {/* X Column Header with menu */}
        <div className="relative flex items-center justify-center py-2 px-2 border-r border-[#dadce0]">
          <span className="font-mono italic font-bold">x</span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Column Options"
            className="ml-1.5 p-0.5 hover:bg-gray-200 rounded text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div className="absolute top-full left-2 mt-1 w-44 bg-white border border-[#dadce0] rounded-xl shadow-lg p-1.5 text-xs text-[#3c4043] z-40">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] rounded-md transition-colors cursor-pointer"
              >
                Define Functions...
              </button>
              <button
                onClick={populateDefaultRange}
                className="w-full text-left px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                Fill Range [-5, 5]
              </button>
              <button
                onClick={clearAllX}
                className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors cursor-pointer"
              >
                Clear Values
              </button>
            </div>
          )}
        </div>

        {/* f(x) Column Header */}
        <div
          onClick={() => setIsModalOpen(true)}
          title={`Click to edit f(x) = ${fExpr}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 border-r border-[#dadce0] cursor-pointer hover:bg-gray-200/60 transition-colors"
        >
          <span className="text-[#6557d2] font-mono font-bold">f(x)</span>
          <span className="text-[10px] text-[#5f6368] truncate max-w-full font-mono">
            {fExpr ? `= ${fExpr}` : '(not set)'}
          </span>
        </div>

        {/* g(x) Column Header */}
        <div
          onClick={() => setIsModalOpen(true)}
          title={`Click to edit g(x) = ${gExpr}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 cursor-pointer hover:bg-gray-200/60 transition-colors"
        >
          <span className="text-[#1e88e5] font-mono font-bold">g(x)</span>
          <span className="text-[10px] text-[#5f6368] truncate max-w-full font-mono">
            {gExpr ? `= ${gExpr}` : '(not set)'}
          </span>
        </div>
      </div>

      {/* Table Data Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f4]">
        {rows.map((row, i) => (
          <TableRowItem
            key={i}
            index={i}
            row={row}
            onXChange={(val) => handleXChange(i, val)}
          />
        ))}
      </div>

      {/* Bottom Bar with Keyboard Toggle */}
      <div className="p-2 border-t border-[#e0e0e0] bg-gray-50 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={toggleKeyboard}
          title="Toggle Virtual Math Keyboard"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isKeyboardOpen
              ? 'bg-[#f3f1fd] border-[#6557d2] text-[#6557d2]'
              : 'border-[#dadce0] bg-white text-[#5f6368] hover:text-[#202124] hover:bg-gray-100'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Keyboard</span>
        </button>

        <span className="text-[10px] text-[#80868b]">
          {rows.filter((r) => r.x.trim() !== '').length} points
        </span>
      </div>

      {/* Define Functions Modal */}
      <DefineFunctionsModal
        isOpen={isModalOpen}
        initialF={fExpr}
        initialG={gExpr}
        onSave={(f, g) => {
          setFExpr(f);
          setGExpr(g);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

interface TableRowItemProps {
  index: number;
  row: { x: string; fx: string; gx: string };
  onXChange: (val: string) => void;
}

const TableRowItem: React.FC<TableRowItemProps> = ({ index, row, onXChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const mathInput = useRegisterMathInput(`table-x-${index}`, row.x, onXChange, inputRef);

  return (
    <div className="grid grid-cols-3 hover:bg-gray-50/80 transition-colors">
      <div className="border-r border-[#f1f3f4] p-0">
        <input
          ref={inputRef}
          type="text"
          value={row.x}
          onFocus={mathInput.onFocus}
          onChange={(e) => onXChange(e.target.value)}
          placeholder="..."
          className="w-full text-center py-2 text-sm text-[#202124] font-mono outline-none focus:bg-white focus:ring-1 focus:ring-[#6557d2] transition-all"
        />
      </div>

      <div className="border-r border-[#f1f3f4] flex items-center justify-center py-2 px-1 text-sm text-[#202124] font-mono bg-[#faf9fe]">
        {row.fx}
      </div>

      <div className="flex items-center justify-center py-2 px-1 text-sm text-[#202124] font-mono bg-[#f8fbfe]">
        {row.gx}
      </div>
    </div>
  );
};
