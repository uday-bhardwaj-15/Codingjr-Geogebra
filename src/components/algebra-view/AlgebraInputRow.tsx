import React, { useState, useRef, KeyboardEvent } from 'react';
import { Plus, Keyboard } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useRegisterMathInput, useActiveMathInputStore } from '../../hooks/useActiveMathInput';

interface AlgebraInputRowProps {
  rowNumber?: number;
}

export const AlgebraInputRow: React.FC<AlgebraInputRowProps> = ({ rowNumber }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addObject } = useConstructionStore();
  const toggleKeyboard = useActiveMathInputStore((s) => s.toggleKeyboard);
  const isKeyboardOpen = useActiveMathInputStore((s) => s.isKeyboardOpen);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const trimmed = input.trim();
    
    // Distinguish assignment or free expression
    let label = 'ans';
    if (trimmed.includes('=')) {
      label = trimmed.split('=')[0]?.trim() || 'ans';
    }

    addObject({
      id: 'obj_' + Date.now(),
      label,
      type: 'function',
      definition: trimmed,
      dependsOn: [],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#6557d2', thickness: 3, opacity: 1 },
      createdByToolId: 'input',
      createdAt: Date.now(),
    });
    setInput('');
  };

  const mathInput = useRegisterMathInput(
    'algebra-input-row',
    input,
    setInput,
    inputRef,
    handleSubmit
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2.5 p-3 border-b border-[#e0e0e0] bg-gray-50/70 hover:bg-gray-50 transition-colors">
      {rowNumber !== undefined ? (
        <span className="text-xs font-mono font-semibold text-[#5f6368] w-6 text-right">
          {rowNumber})
        </span>
      ) : (
        <div onClick={handleSubmit} className="text-[#5f6368] hover:text-[#6557d2] cursor-pointer">
          <Plus className="w-5 h-5" />
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={input}
        onFocus={mathInput.onFocus}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Input..."
        className="flex-1 bg-transparent border-none outline-none text-[#202124] text-sm font-mono placeholder:font-sans placeholder:text-[#80868b]"
      />

      <button
        type="button"
        onClick={toggleKeyboard}
        title="Toggle Virtual Math Keyboard"
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
          isKeyboardOpen
            ? 'bg-[#f3f1fd] border-[#6557d2] text-[#6557d2]'
            : 'border-transparent text-[#5f6368] hover:bg-gray-200/70 hover:text-[#202124]'
        }`}
      >
        <Keyboard className="w-4 h-4" />
      </button>
    </div>
  );
};
