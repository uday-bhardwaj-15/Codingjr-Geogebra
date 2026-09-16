'use client';

import React from 'react';
import { useConstructionStore } from '../../store/useConstructionStore';
import { AlgebraInputRow } from './AlgebraInputRow';
import { AlgebraListItem } from './AlgebraListItem';
import { clsx } from 'clsx';

interface AlgebraViewProps {
  variant?: 'sidebar' | 'fullpage';
}

export const AlgebraView: React.FC<AlgebraViewProps> = ({ variant = 'sidebar' }) => {
  const objects = useConstructionStore((state) => state.objects);
  const isFullPage = variant === 'fullpage';

  return (
    <div
      className={clsx(
        'h-full bg-white flex flex-col',
        isFullPage ? 'w-full max-w-4xl mx-auto px-4 py-4' : 'w-80 border-r border-[#e0e0e0]'
      )}
    >
      <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f4]">
        {objects.map((obj, index) => (
          <div key={obj.id} className="flex items-center">
            {isFullPage && (
              <span className="text-xs font-mono font-semibold text-[#5f6368] w-8 pl-2 shrink-0">
                {index + 1})
              </span>
            )}
            <div className="flex-1 min-w-0">
              <AlgebraListItem obj={obj} />
            </div>
          </div>
        ))}
      </div>

      <div className={clsx(isFullPage ? 'mt-2 border rounded-xl shadow-xs overflow-hidden' : '')}>
        <AlgebraInputRow rowNumber={isFullPage ? objects.length + 1 : undefined} />
      </div>
    </div>
  );
};
