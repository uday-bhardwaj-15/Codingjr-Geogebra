'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../../store/useUIStore';

export const ValueInputModal: React.FC = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal && activeModal.type === 'valueInput') {
      setValue(activeModal.props.defaultValue || '');
      setError(null);
    }
  }, [activeModal]);

  useEffect(() => {
    if (activeModal && activeModal.type === 'valueInput' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeModal]);

  if (!activeModal || activeModal.type !== 'valueInput') return null;

  const { title, label, inputType, placeholder, onConfirm, onCancel } = activeModal.props;

  const handleConfirm = () => {
    const trimmed = value.trim();

    if (inputType === 'number' || inputType === 'angle') {
      const parsed = parseFloat(trimmed.replace('°', ''));
      if (isNaN(parsed)) {
        setError('Please enter a valid number');
        return;
      }
    } else if (trimmed.length === 0) {
      setError('Value cannot be empty');
      return;
    }

    onConfirm(trimmed);
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in duration-150"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[var(--gk-text)] mb-4">{title}</h2>

        <div className="mb-6">
          {label && (
            <label className="block text-xs font-semibold text-[var(--gk-text-muted)] uppercase tracking-wider mb-2">
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder || (inputType === 'angle' ? '45°' : '')}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all text-gray-900 ${
              error
                ? 'border-red-500 ring-1 ring-red-500 bg-red-50'
                : 'border-[var(--gk-border)] focus:border-[var(--gk-accent)] focus:ring-1 focus:ring-[var(--gk-accent)]'
            }`}
          />
          {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm font-medium hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            style={{ color: 'var(--gk-accent)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-sm font-medium text-white rounded-full shadow hover:brightness-95 transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--gk-accent)' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
