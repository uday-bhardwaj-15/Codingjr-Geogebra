'use client';

import React from 'react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { AlgebraInputRow } from './AlgebraInputRow';
import { AlgebraListItem } from './AlgebraListItem';

export const AlgebraView: React.FC = () => {
  const objects = useConstructionStore((state) => state.objects);

  return (
    <div className="w-80 h-full bg-[var(--gk-bg)] border-r border-[var(--gk-border)] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {objects.map((obj) => (
          <AlgebraListItem key={obj.id} obj={obj} />
        ))}
      </div>
      <AlgebraInputRow />
    </div>
  );
};
