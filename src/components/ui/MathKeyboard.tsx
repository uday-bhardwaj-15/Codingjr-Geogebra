'use client';

import React, { useState } from 'react';
import { useActiveMathInputStore } from '../../hooks/useActiveMathInput';
import { Delete, X, CornerDownLeft } from 'lucide-react';
import { clsx } from 'clsx';

type TabKey = '123' | 'fx' | 'abc' | 'symbols';

export const MathKeyboard: React.FC = () => {
  const { isKeyboardOpen, setKeyboardOpen, insertToken, handleBackspace } = useActiveMathInputStore();
  const [activeTab, setActiveTab] = useState<TabKey>('123');

  if (!isKeyboardOpen) return null;

  const renderKey = (label: string | React.ReactNode, value: string, className?: string) => (
    <button
      key={typeof label === 'string' ? label : value}
      onMouseDown={(e) => {
        e.preventDefault(); // Don't steal input focus
        insertToken(value);
      }}
      className={clsx(
        'h-10 sm:h-11 rounded-md bg-white border border-[#dadce0] shadow-2xs hover:bg-gray-100 active:bg-gray-200 transition-colors font-medium text-sm text-[#202124] flex items-center justify-center cursor-pointer select-none',
        className
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f1f3f4] border-t border-[#dadce0] shadow-2xl z-50 flex flex-col items-center pb-2 select-none animate-in slide-in-from-bottom duration-200">
      {/* Keyboard Header Tabs */}
      <div className="w-full max-w-4xl flex items-center justify-between px-3 py-1.5 border-b border-[#dadce0]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('123')}
            className={clsx(
              'px-4 py-1 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer',
              activeTab === '123'
                ? 'bg-white text-[#6557d2] shadow-2xs'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
          >
            123
          </button>
          <button
            onClick={() => setActiveTab('fx')}
            className={clsx(
              'px-4 py-1 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer',
              activeTab === 'fx'
                ? 'bg-white text-[#6557d2] shadow-2xs'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
          >
            f(x)
          </button>
          <button
            onClick={() => setActiveTab('abc')}
            className={clsx(
              'px-4 py-1 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer',
              activeTab === 'abc'
                ? 'bg-white text-[#6557d2] shadow-2xs'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
          >
            ABC
          </button>
          <button
            onClick={() => setActiveTab('symbols')}
            className={clsx(
              'px-4 py-1 rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer',
              activeTab === 'symbols'
                ? 'bg-white text-[#6557d2] shadow-2xs'
                : 'text-[#5f6368] hover:text-[#202124]'
            )}
          >
            #&¬
          </button>
        </div>

        <button
          onClick={() => setKeyboardOpen(false)}
          className="p-1 hover:bg-gray-200 rounded text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
          title="Close Keyboard"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Body */}
      <div className="w-full max-w-4xl p-2">
        {activeTab === '123' && (
          <div className="grid grid-cols-10 gap-1.5">
            {renderKey('x', 'x', 'font-serif italic')}
            {renderKey('y', 'y', 'font-serif italic')}
            {renderKey('z', 'z', 'font-serif italic')}
            {renderKey('π', 'pi')}
            {renderKey('e', 'e')}
            {renderKey('7', '7')}
            {renderKey('8', '8')}
            {renderKey('9', '9')}
            {renderKey('+', '+')}
            {renderKey('−', '-')}

            {renderKey('x²', '^2')}
            {renderKey('xʸ', '^')}
            {renderKey('√', 'sqrt(')}
            {renderKey('(', '(')}
            {renderKey(')', ')')}
            {renderKey('4', '4')}
            {renderKey('5', '5')}
            {renderKey('6', '6')}
            {renderKey('×', '*')}
            {renderKey('÷', '/')}

            {renderKey('<', '<')}
            {renderKey('>', '>')}
            {renderKey('≤', '<=')}
            {renderKey('≥', '>=')}
            {renderKey('=', '=')}
            {renderKey('1', '1')}
            {renderKey('2', '2')}
            {renderKey('3', '3')}
            {renderKey(',', ',')}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleBackspace();
              }}
              className="h-10 sm:h-11 rounded-md bg-[#e8eaed] border border-[#dadce0] shadow-2xs hover:bg-[#dadce0] active:bg-[#bdc1c6] transition-colors font-medium text-sm text-[#202124] flex items-center justify-center cursor-pointer select-none"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>

            {renderKey('|x|', 'abs(')}
            {renderKey('!', '!')}
            {renderKey('%', '%')}
            {renderKey(';', ';')}
            {renderKey(':', ':')}
            {renderKey('0', '0', 'col-span-2')}
            {renderKey('.', '.')}
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                insertToken('\n');
              }}
              className="col-span-2 h-10 sm:h-11 rounded-md bg-[#6557d2] text-white hover:bg-[#5345c2] active:bg-[#473aa8] border border-[#5345c2] shadow-2xs transition-colors font-medium text-sm flex items-center justify-center cursor-pointer select-none"
              title="Enter"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'fx' && (
          <div className="grid grid-cols-6 gap-1.5">
            {renderKey('sin', 'sin(')}
            {renderKey('cos', 'cos(')}
            {renderKey('tan', 'tan(')}
            {renderKey('ln', 'log(')}
            {renderKey('log₁₀', 'log10(')}
            {renderKey('exp', 'exp(')}

            {renderKey('arcsin', 'asin(')}
            {renderKey('arccos', 'acos(')}
            {renderKey('arctan', 'atan(')}
            {renderKey('sqrt', 'sqrt(')}
            {renderKey('cbrt', 'cbrt(')}
            {renderKey('abs', 'abs(')}

            {renderKey('sinh', 'sinh(')}
            {renderKey('cosh', 'cosh(')}
            {renderKey('tanh', 'tanh(')}
            {renderKey('floor', 'floor(')}
            {renderKey('ceil', 'ceil(')}
            {renderKey('round', 'round(')}

            {renderKey('nCr', 'combinations(')}
            {renderKey('nPr', 'permutations(')}
            {renderKey('mean', 'mean(')}
            {renderKey('stdDev', 'std(')}
            {renderKey('min', 'min(')}
            {renderKey('max', 'max(')}
          </div>
        )}

        {activeTab === 'abc' && (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-10 gap-1.5">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((k) =>
                renderKey(k, k)
              )}
            </div>
            <div className="grid grid-cols-9 gap-1.5 px-4">
              {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((k) =>
                renderKey(k, k)
              )}
            </div>
            <div className="grid grid-cols-9 gap-1.5 px-6">
              {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((k) => renderKey(k, k))}
              {renderKey(',', ',')}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleBackspace();
                }}
                className="h-10 sm:h-11 rounded-md bg-[#e8eaed] border border-[#dadce0] shadow-2xs hover:bg-[#dadce0] active:bg-[#bdc1c6] transition-colors font-medium text-sm text-[#202124] flex items-center justify-center cursor-pointer select-none"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'symbols' && (
          /* Intentional MVP cut: reduced set of comparison and symbol keys (#&¬) */
          <div className="grid grid-cols-6 gap-1.5">
            {renderKey('<', '<')}
            {renderKey('>', '>')}
            {renderKey('≤', '<=')}
            {renderKey('≥', '>=')}
            {renderKey('=', '=')}
            {renderKey('≠', '!=')}

            {renderKey('(', '(')}
            {renderKey(')', ')')}
            {renderKey('[', '[')}
            {renderKey(']', ']')}
            {renderKey('{', '{')}
            {renderKey('}', '}')}

            {renderKey('|', '|')}
            {renderKey('&', '&')}
            {renderKey('~', '~')}
            {renderKey('#', '#')}
            {renderKey('$', '$')}
            {renderKey('@', '@')}

            {renderKey(':', ':')}
            {renderKey(';', ';')}
            {renderKey(',', ',')}
            {renderKey('?', '?')}
            {renderKey('_', '_')}
            {renderKey('"', '"')}
          </div>
        )}
      </div>
    </div>
  );
};
