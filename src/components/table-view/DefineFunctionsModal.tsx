'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRegisterMathInput } from '../../hooks/useActiveMathInput';

interface DefineFunctionsModalProps {
  isOpen: boolean;
  initialF: string;
  initialG: string;
  onSave: (f: string, g: string) => void;
  onClose: () => void;
}

export const DefineFunctionsModal: React.FC<DefineFunctionsModalProps> = ({
  isOpen,
  initialF,
  initialG,
  onSave,
  onClose,
}) => {
  const [fExpr, setFExpr] = useState(initialF);
  const [gExpr, setGExpr] = useState(initialG);

  const fRef = useRef<HTMLInputElement>(null);
  const gRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFExpr(initialF);
    setGExpr(initialG);
  }, [initialF, initialG, isOpen]);

  const fInput = useRegisterMathInput('table-modal-f', fExpr, setFExpr, fRef);
  const gInput = useRegisterMathInput('table-modal-g', gExpr, setGExpr, gRef);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-[#dadce0] animate-in zoom-in-95 duration-150 select-none">
        <h3 className="text-lg font-semibold text-[#202124] mb-4">
          Define Functions
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#6557d2] w-14 font-mono">
              f(x) =
            </span>
            <input
              ref={fRef}
              type="text"
              value={fExpr}
              onFocus={fInput.onFocus}
              onChange={(e) => setFExpr(e.target.value)}
              placeholder="e.g. x^2 - 4"
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-[#dadce0] rounded-lg font-mono focus:bg-white focus:border-[#6557d2] focus:ring-1 focus:ring-[#6557d2] outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1e88e5] w-14 font-mono">
              g(x) =
            </span>
            <input
              ref={gRef}
              type="text"
              value={gExpr}
              onFocus={gInput.onFocus}
              onChange={(e) => setGExpr(e.target.value)}
              placeholder="e.g. 2*x + 1"
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-[#dadce0] rounded-lg font-mono focus:bg-white focus:border-[#6557d2] focus:ring-1 focus:ring-[#6557d2] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(fExpr, gExpr);
              onClose();
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-[#6557d2] hover:bg-[#5345c2] active:bg-[#473aa8] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
