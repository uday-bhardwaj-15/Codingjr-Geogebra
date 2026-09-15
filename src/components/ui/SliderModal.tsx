import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useToolStore } from '../../store/useToolStore';
import { getNextSliderLabel } from '../../core/construction/labelGenerator';

export const SliderModal: React.FC = () => {
  const sliderModalPos = useUIStore((state) => state.sliderModalPos);
  const closeSliderModal = useUIStore((state) => state.closeSliderModal);
  const cm = useConstructionStore((state) => state.manager);

  const [name, setName] = useState('a');
  const [min, setMin] = useState('-5');
  const [max, setMax] = useState('5');
  const [step, setStep] = useState('0.1');

  // When modal opens, auto-suggest the next available slider variable name (a, b, c...)
  useEffect(() => {
    if (sliderModalPos && cm) {
      const nextLabel = getNextSliderLabel(cm.getObjects());
      setName(nextLabel);
      setMin('-5');
      setMax('5');
      setStep('0.1');
    }
  }, [sliderModalPos, cm]);

  if (!sliderModalPos) return null;

  const handleOk = () => {
    if (!cm) return;

    cm.addObject({
      id: `slider_${Date.now()}`,
      label: name.trim() || 'a',
      type: 'slider',
      definition: '',
      dependsOn: [],
      value: {
        x: sliderModalPos.x,
        y: sliderModalPos.y,
        val: 1,
        min: parseFloat(min) || -5,
        max: parseFloat(max) || 5,
        step: parseFloat(step) || 0.1,
      },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 3, opacity: 1 },
      createdByToolId: 'slider',
      createdAt: Date.now(),
    });

    closeSliderModal();
    // Revert tool back to Move after adding a slider
    useToolStore.getState().setActiveToolId('move');
  };

  const handleCancel = () => {
    closeSliderModal();
    useToolStore.getState().setActiveToolId('move');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px]">
        <h2 className="text-xl text-[var(--gk-text)] font-semibold mb-6">Slider</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <label className="w-16 text-sm text-[var(--gk-text-muted)]">Name</label>
            <input
              type="text"
              className="flex-1 border border-[var(--gk-border)] rounded-md px-3 py-1.5 outline-none focus:border-[var(--gk-accent)] text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 ml-3">
              <button className="text-[var(--gk-accent)] font-semibold text-sm" style={{ color: 'var(--gk-accent)' }}>
                123
              </button>
              <button className="text-[var(--gk-text-muted)] font-semibold text-sm">aA</button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-[var(--gk-border)]">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 ml-1">Min</label>
              <input
                type="text"
                className="w-full border border-[var(--gk-border)] rounded-md px-3 py-1.5 outline-none focus:border-[var(--gk-accent)] text-center text-black"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 ml-1">Max</label>
              <input
                type="text"
                className="w-full border border-[var(--gk-border)] rounded-md px-3 py-1.5 outline-none focus:border-[var(--gk-accent)] text-center text-black"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 ml-1">Step</label>
              <input
                type="text"
                className="w-full border border-[var(--gk-border)] rounded-md px-3 py-1.5 outline-none focus:border-[var(--gk-accent)] text-center text-black"
                value={step}
                onChange={(e) => setStep(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 rounded-full shadow-sm transition-all cursor-pointer"
            onClick={handleOk}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
