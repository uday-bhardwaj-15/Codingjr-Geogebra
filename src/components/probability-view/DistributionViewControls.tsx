'use client';

import React from 'react';
import { Maximize } from 'lucide-react';

export const DistributionViewControls: React.FC = () => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute top-3 right-3 z-10 select-none">
      <button
        onClick={handleFullscreen}
        title="Full Screen"
        className="p-2 bg-white hover:bg-gray-100 rounded-full border border-[#dadce0] text-[#5f6368] hover:text-[#202124] shadow-xs transition-colors cursor-pointer"
      >
        <Maximize className="w-4.5 h-4.5 stroke-[2]" />
      </button>
    </div>
  );
};
