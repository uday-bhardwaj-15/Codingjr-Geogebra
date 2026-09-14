import React, { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';

export const AlgebraInputRow: React.FC = () => {
  const [input, setInput] = useState('');
  const { addObject } = useConstructionStore();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      addObject({
        id: 'obj_' + Date.now(),
        label: input.split('=')[0]?.trim() || 'ans', // Very basic parse
        type: 'function',
        definition: input.trim(),
        dependsOn: [],
        value: null,
        visible: true,
        labelVisible: true,
        style: { color: '#1565ef', thickness: 3, opacity: 1 },
        createdByToolId: 'input',
        createdAt: Date.now(),
      });
      setInput('');
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-[var(--gk-border)] bg-gray-50">
      <div className="text-[var(--gk-text-muted)] cursor-pointer">
        <Plus className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Input..."
        className="flex-1 bg-transparent border-none outline-none text-[var(--gk-text)] text-sm font-mono placeholder:font-sans"
      />
    </div>
  );
};
