'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GeoObject } from '../../types/geo';
import { MoreVertical } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { resolvePoint, PointValue } from '../../core/geometry/Point';
import { parseExpression } from '../../core/math-engine/parser';
import { clsx } from 'clsx';

function parsePointInput(input: string): { x: number; y: number } | null {
  const cleaned = input.trim().replace(/^\(/, '').replace(/\)$/, '');
  const parts = cleaned.split(',');
  if (parts.length === 2) {
    const x = parseFloat(parts[0].trim());
    const y = parseFloat(parts[1].trim());
    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    }
  }
  return null;
}

import { FormattedLabel } from '../ui/FormattedMath';

const ItemContent: React.FC<{ obj: GeoObject }> = ({ obj }) => {
  const { updateObject } = useConstructionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFreePoint =
    obj.type === 'point' &&
    obj.dependsOn.length === 0 &&
    (obj.value as any)?.kind !== 'dependent';

  const isFreeSlider = obj.type === 'slider' && obj.dependsOn.length === 0;

  const isFreeFunctionOrExpr =
    obj.dependsOn.length === 0 &&
    Boolean(obj.definition) &&
    obj.type !== 'point' &&
    obj.type !== 'slider';

  const isEditable = isFreePoint || isFreeSlider || isFreeFunctionOrExpr;

  const startEditing = () => {
    if (!isEditable) return;
    setHasError(false);

    if (isFreePoint && obj.value) {
      const pt = resolvePoint(obj.value as PointValue);
      setEditValue(`(${Number(pt.x.toFixed(2))}, ${Number(pt.y.toFixed(2))})`);
    } else if (isFreeSlider && obj.value) {
      const val = (obj.value as any).val ?? obj.value;
      setEditValue(String(val));
    } else if (obj.definition) {
      setEditValue(obj.definition);
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    if (!isEditing) return;

    if (isFreePoint) {
      const parsed = parsePointInput(editValue);
      if (parsed) {
        const oldPt = resolvePoint(obj.value as PointValue);
        const oldVal = { kind: 'free', x: oldPt.x, y: oldPt.y };
        const newVal = { kind: 'free', x: parsed.x, y: parsed.y };
        updateObject(obj.id, { value: newVal }, { value: oldVal });
        setIsEditing(false);
        setHasError(false);
        return;
      }
    } else if (isFreeSlider) {
      const num = parseFloat(editValue.trim());
      if (!isNaN(num)) {
        const sliderVal = obj.value as any;
        const oldVal = typeof sliderVal === 'object' ? { ...sliderVal } : { val: sliderVal };
        const newVal = typeof sliderVal === 'object' ? { ...sliderVal, val: num } : { val: num };
        updateObject(obj.id, { value: newVal }, { value: oldVal });
        setIsEditing(false);
        setHasError(false);
        return;
      }
    } else if (isFreeFunctionOrExpr) {
      const trimmed = editValue.trim();
      if (trimmed.length > 0) {
        try {
          parseExpression(trimmed);
          updateObject(obj.id, { definition: trimmed }, { definition: obj.definition });
          setIsEditing(false);
          setHasError(false);
          return;
        } catch (e) {
          // Invalid parse
        }
      }
    }

    // Invalid input: trigger error animation then revert
    setHasError(true);
    setTimeout(() => {
      setHasError(false);
      setIsEditing(false);
    }, 600);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setHasError(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <span className="text-sm font-semibold text-[var(--gk-text)] shrink-0">
          {obj.label} =
        </span>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitEdit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancelEdit();
            }
          }}
          onBlur={commitEdit}
          className={clsx(
            'flex-1 text-sm font-mono px-2 py-0.5 rounded border outline-none transition-all',
            hasError
              ? 'border-red-500 bg-red-50 text-red-700 animate-pulse'
              : 'border-[var(--gk-accent)] bg-white text-gray-900 shadow-sm ring-1 ring-[var(--gk-accent)]'
          )}
        />
      </div>
    );
  }

  // Render Display Mode
  if (obj.type === 'point') {
    const pt = resolvePoint(obj.value as PointValue);
    const isComplex = (obj.value as any)?.isComplex;
    const sign = pt.y >= 0 ? '+' : '-';
    const coordsText = isComplex
      ? `${Number(pt.x.toFixed(2))} ${sign} ${Number(Math.abs(pt.y).toFixed(2))}i`
      : `(${Number(pt.x.toFixed(2))}, ${Number(pt.y.toFixed(2))})`;

    return (
      <div
        className={clsx('flex flex-col', isEditable && 'cursor-pointer hover:text-[var(--gk-accent)]')}
        onClick={startEditing}
        title={isEditable ? 'Click to edit coordinates' : undefined}
      >
        <div className="text-sm text-[var(--gk-text)] font-semibold select-none flex items-baseline gap-1">
          <FormattedLabel label={obj.label} /> = {coordsText}
        </div>
        {obj.dependsOn.length > 0 && (
          <div className="text-xs text-[var(--gk-text-muted)] mt-0.5">
            Dependent point
          </div>
        )}
      </div>
    );
  }

  if (obj.type === 'slider') {
    const sliderVal = obj.value as any;
    if (sliderVal == null) return null;

    const currentVal = typeof sliderVal === 'number' ? sliderVal : sliderVal.val || 0;
    const min = sliderVal.min ?? -5;
    const max = sliderVal.max ?? 5;
    const step = sliderVal.step ?? 0.1;

    return (
      <div className="flex flex-col w-full pr-2">
        <div
          className="text-sm text-[var(--gk-text)] font-semibold cursor-pointer hover:text-[var(--gk-accent)] select-none flex items-baseline gap-1"
          onClick={startEditing}
          title="Click to edit value"
        >
          <FormattedLabel label={obj.label} /> = {Number(currentVal).toFixed(1)}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={(e) => {
            const baseObj = typeof sliderVal === 'object' ? sliderVal : { x: 0, y: 0, min, max, step };
            updateObject(
              obj.id,
              { value: { ...baseObj, val: parseFloat(e.target.value) } },
              { value: { ...baseObj, val: currentVal } }
            );
          }}
          className="w-full mt-2 accent-[var(--gk-accent)] cursor-pointer"
        />
      </div>
    );
  }

  // Geometric fallbacks & definitions
  let typeLabel = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
  let detail = '';

  if (
    obj.type === 'segment' ||
    obj.type === 'line' ||
    obj.type === 'circle' ||
    obj.type === 'conic' ||
    obj.type === 'ray' ||
    obj.type === 'vector' ||
    obj.type === 'polygon'
  ) {
    if (obj.type === 'polygon' && (obj.value as any)?.area !== undefined) {
      detail = `Area = ${(obj.value as any).area.toFixed(2)}`;
    } else if (obj.dependsOn.length > 0) {
      detail = `Depends on: ${obj.dependsOn
        .map((id) => id.split('_')[0].toUpperCase())
        .join(', ')}`;
    }
  }

  return (
    <div
      className={clsx('flex flex-col', isEditable && 'cursor-pointer hover:text-[var(--gk-accent)]')}
      onClick={startEditing}
      title={isEditable ? 'Click to edit definition' : undefined}
    >
      <div className="text-sm font-semibold text-[var(--gk-text)] truncate select-none flex items-baseline gap-1">
        <span>{typeLabel}</span> <FormattedLabel label={obj.label} />
      </div>
      {(obj.definition || detail) && (
        <div className="text-xs text-[var(--gk-text-muted)] mt-1 truncate select-none">
          {obj.definition || detail}
        </div>
      )}
    </div>
  );
};

export const AlgebraListItem: React.FC<{ obj: GeoObject }> = ({ obj }) => {
  const { toggleVisibility, removeObject } = useConstructionStore();

  return (
    <div className="flex items-center gap-3 p-3 border-b border-[var(--gk-border)] hover:bg-gray-50 group">
      <button
        onClick={() => toggleVisibility([obj.id])}
        title={obj.visible ? 'Hide object' : 'Show object'}
        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 shadow-sm bg-white shrink-0 hover:scale-105 transition-transform"
        style={{ borderColor: obj.style.color }}
      >
        <div
          className={clsx('w-3 h-3 rounded-full', !obj.visible && 'bg-transparent border')}
          style={{ backgroundColor: obj.visible ? obj.style.color : 'transparent', borderColor: obj.style.color }}
        />
      </button>

      <div className="flex-1 overflow-hidden">
        <ItemContent obj={obj} />
      </div>

      <button
        onClick={() => removeObject(obj.id)}
        title="Delete object"
        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
};
