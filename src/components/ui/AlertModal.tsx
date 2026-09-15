'use client';

import React from 'react';
import { useUIStore } from '../../store/useUIStore';

export const AlertModal: React.FC = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);

  if (!activeModal || activeModal.type !== 'alert') return null;

  const { title, message, onOk } = activeModal.props;

  const handleOk = () => {
    if (onOk) onOk();
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in duration-150"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      onClick={handleOk}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] max-w-[90vw] transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[var(--gk-text)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--gk-text-muted)] mb-6 whitespace-pre-wrap">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={handleOk}
            autoFocus
            className="px-6 py-2 bg-black text-white text-sm font-semibold rounded-full shadow-sm hover:bg-gray-800 transition-all cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
