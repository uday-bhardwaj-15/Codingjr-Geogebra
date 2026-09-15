'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  const modalProps = activeModal?.type === 'valueInput' ? activeModal.props : null;

  const isValid = useMemo(() => {
    if (!modalProps) return false;
    const trimmed = value.trim();
    if (modalProps.inputType === 'number' || modalProps.inputType === 'angle') {
      if (!trimmed) return false;
      const parsed = parseFloat(trimmed.replace('°', ''));
      return !isNaN(parsed);
    }
    return trimmed.length > 0;
  }, [value, modalProps]);

  if (!activeModal || activeModal.type !== 'valueInput' || !modalProps) return null;

  const { title, label, inputType, placeholder, onConfirm, onCancel } = modalProps;

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
                if (isValid) handleConfirm();
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

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
              isValid
                ? 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
