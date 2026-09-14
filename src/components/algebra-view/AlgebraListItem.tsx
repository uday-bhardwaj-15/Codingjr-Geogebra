import React from 'react';
import { GeoObject } from '../../types/geo';
import { Eye, EyeOff, MoreVertical } from 'lucide-react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { resolvePoint, PointValue } from '../../core/geometry/Point';
import { clsx } from 'clsx';

const ItemContent: React.FC<{ obj: GeoObject }> = ({ obj }) => {
  const { updateObject } = useConstructionStore();

  if (obj.type === 'point') {
    const pt = resolvePoint(obj.value as PointValue);
    return (
      <div className="flex flex-col">
        <div className="text-sm text-[var(--gk-text)] font-semibold">
          {obj.label} = ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
        </div>
      </div>
    );
  }

  if (obj.type === 'slider') {
    const sliderVal = obj.value as any;
    if (sliderVal == null) return null;
    
    // In case evaluator overwrote it with a number temporarily
    const currentVal = typeof sliderVal === 'number' ? sliderVal : (sliderVal.val || 0);
    const min = sliderVal.min ?? -5;
    const max = sliderVal.max ?? 5;
    const step = sliderVal.step ?? 0.1;

    return (
      <div className="flex flex-col w-full pr-2">
        <div className="text-sm text-[var(--gk-text)] font-semibold">
          {obj.label} = {currentVal.toFixed(1)}
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={currentVal}
          onChange={(e) => {
            // Keep object structure
            const baseObj = typeof sliderVal === 'object' ? sliderVal : { x: 0, y: 0, min, max, step };
            updateObject(obj.id, {
              value: { ...baseObj, val: parseFloat(e.target.value) }
            });
          }}
          className="w-full mt-2 accent-[var(--gk-accent)] cursor-pointer"
        />
      </div>
    );
  }

  // Geometric fallbacks
  let typeLabel = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
  let detail = '';
  
  if (obj.type === 'segment' || obj.type === 'line' || obj.type === 'circle' || obj.type === 'ray' || obj.type === 'vector') {
    if (obj.dependsOn.length > 0) {
      detail = `Depends on: ${obj.dependsOn.map(id => {
        // We'd ideally look up labels, but this is an MVP
        return id.split('_')[0].toUpperCase();
      }).join(', ')}`;
    }
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm font-semibold text-[var(--gk-text)] truncate">
        {typeLabel} {obj.label}
      </div>
      {(obj.definition || detail) && (
        <div className="text-xs text-[var(--gk-text-muted)] mt-1 truncate">
          {obj.definition || detail}
        </div>
      )}
    </div>
  );
};

export const AlgebraListItem: React.FC<{ obj: GeoObject }> = ({ obj }) => {
  const { updateObject } = useConstructionStore();

  return (
    <div className="flex items-center gap-3 p-3 border-b border-[var(--gk-border)] hover:bg-gray-50 group">
      <button 
        onClick={() => updateObject(obj.id, { visible: !obj.visible })}
        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 shadow-sm bg-white shrink-0"
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

      <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
};
