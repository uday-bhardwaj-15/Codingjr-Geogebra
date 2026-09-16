'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MoreVertical, Check, CornerDownLeft, Sparkles } from 'lucide-react';
import { CasRowItem, useCasStore } from '../../store/useCasStore';
import { useRegisterMathInput } from '../../hooks/useActiveMathInput';
import { FormattedMath } from '../ui/FormattedMath';
import { clsx } from 'clsx';

interface CasRowProps {
  row: CasRowItem;
  index: number;
}

export const CasRow: React.FC<CasRowProps> = ({ row, index }) => {
  const [inputText, setInputText] = useState(row.input);
  const [showMenu, setShowMenu] = useState(false);
  const [isSubbing, setIsSubbing] = useState(false);
  const [subVar, setSubVar] = useState('x');
  const [subVal, setSubVal] = useState('0');

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { updateRow, deleteRow, applyRowCommand, substituteRow, toggleRowNumeric } =
    useCasStore();

  useEffect(() => {
    setInputText(row.input);
  }, [row.input]);

  const mathInput = useRegisterMathInput(
    `cas-row-${row.id}`,
    inputText,
    setInputText,
    inputRef
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCommit = () => {
    updateRow(row.id, inputText);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    }
  };

  return (
    <div className="border-b border-[#e8eaed] bg-white hover:bg-gray-50/60 transition-colors p-3 select-none">
      <div className="flex items-start gap-2.5">
        {/* Row Number */}
        <span className="text-xs font-mono font-semibold text-[#5f6368] w-6 pt-1 text-right shrink-0">
          {index + 1})
        </span>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Input Box */}
          <div className="flex items-center gap-2 bg-gray-50/80 border border-[#dadce0] rounded-lg px-2.5 py-1.5 focus-within:bg-white focus-within:border-[#6557d2] focus-within:ring-1 focus-within:ring-[#6557d2] transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onFocus={mathInput.onFocus}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCommit}
              placeholder="e.g. 1/3 + 1/6, z, f(x) := x^2"
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-[#202124] placeholder:font-sans placeholder:text-gray-400"
            />
            {inputText !== row.input && (
              <button
                onClick={handleCommit}
                className="p-1 text-[#6557d2] hover:bg-[#f3f1fd] rounded transition-colors cursor-pointer"
                title="Evaluate (Enter)"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Evaluated Result Output */}
          {row.result && row.result.displayValue && (
            <div className="mt-2 pl-2 flex items-baseline justify-between border-l-2 border-[#6557d2]/40">
              <div className="text-sm font-semibold text-[#202124] font-mono select-text flex items-baseline gap-1">
                <span>→</span>
                <FormattedMath expression={row.result.displayValue} />
              </div>

              {row.isNumeric && (
                <span className="text-[10px] font-medium text-[#6557d2] bg-[#f3f1fd] px-1.5 py-0.5 rounded border border-[#d3ccf7]">
                  Numeric ≈
                </span>
              )}
            </div>
          )}

          {/* Substitute Inline Prompt */}
          {isSubbing && (
            <div className="mt-2 p-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#5f6368]">Substitute:</span>
              <input
                type="text"
                value={subVar}
                onChange={(e) => setSubVar(e.target.value)}
                placeholder="var"
                className="w-12 px-1.5 py-1 bg-white border border-[#dadce0] rounded font-mono text-center outline-none focus:border-[#6557d2]"
              />
              <span>=</span>
              <input
                type="text"
                value={subVal}
                onChange={(e) => setSubVal(e.target.value)}
                placeholder="value"
                className="w-20 px-1.5 py-1 bg-white border border-[#dadce0] rounded font-mono text-center outline-none focus:border-[#6557d2]"
              />
              <button
                onClick={() => {
                  substituteRow(row.id, subVar, subVal);
                  setIsSubbing(false);
                }}
                className="px-2 py-1 bg-[#6557d2] text-white rounded font-medium hover:bg-[#5345c2] cursor-pointer"
              >
                Apply
              </button>
              <button
                onClick={() => setIsSubbing(false)}
                className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Row Action Menu Button (⋮) */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Row Options"
            className="p-1 hover:bg-gray-200/70 rounded text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#dadce0] rounded-xl shadow-xl py-1.5 z-40 text-xs text-[#3c4043] animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-[#80868b] uppercase tracking-wider">
                Symbolic Operations
              </div>

              <button
                onClick={() => {
                  applyRowCommand(row.id, 'simplify');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer"
              >
                <span>Simplify</span>
                <span className="text-[10px] text-gray-400 font-mono">simplify()</span>
              </button>

              <button
                onClick={() => {
                  applyRowCommand(row.id, 'expand');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer"
              >
                <span>Expand</span>
                <span className="text-[10px] text-gray-400 font-mono">expand()</span>
              </button>

              <button
                onClick={() => {
                  setIsSubbing(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer"
              >
                <span>Substitute...</span>
                <span className="text-[10px] text-gray-400 font-mono">sub()</span>
              </button>

              <button
                onClick={() => {
                  applyRowCommand(row.id, 'derivative');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer"
              >
                <span>Derivative</span>
                <span className="text-[10px] text-gray-400 font-mono">d/dx</span>
              </button>

              <button
                onClick={() => {
                  applyRowCommand(row.id, 'solve');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer"
              >
                <span>Solve Equation</span>
                <span className="text-[10px] text-gray-400 font-mono">solve()</span>
              </button>

              <button
                onClick={() => {
                  toggleRowNumeric(row.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f3f1fd] hover:text-[#6557d2] flex items-center justify-between cursor-pointer border-t border-gray-100"
              >
                <span>{row.isNumeric ? 'Exact Mode' : 'Numeric Value ≈'}</span>
                <span className="text-[10px] text-gray-400 font-mono">float</span>
              </button>

              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 py-1 text-[10px] font-bold text-[#80868b] uppercase tracking-wider">
                Advanced (Coming Soon)
              </div>

              <div className="px-3 py-1 text-gray-400 cursor-not-allowed flex items-center justify-between">
                <span>Factor</span>
                <span className="text-[9px] bg-gray-100 px-1 rounded">Soon</span>
              </div>
              <div className="px-3 py-1 text-gray-400 cursor-not-allowed flex items-center justify-between">
                <span>Integrate</span>
                <span className="text-[9px] bg-gray-100 px-1 rounded">Soon</span>
              </div>
              <div className="px-3 py-1 text-gray-400 cursor-not-allowed flex items-center justify-between">
                <span>Limit</span>
                <span className="text-[9px] bg-gray-100 px-1 rounded">Soon</span>
              </div>

              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  deleteRow(row.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
              >
                Delete Row
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
