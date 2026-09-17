'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { APPS, AppId } from '../../config/appConfig';
import { useConstructionStore } from '../../store/useConstructionStore';
import { clsx } from 'clsx';

interface AppSwitcherDropdownProps {
  currentAppId?: AppId;
}

export const AppSwitcherDropdown: React.FC<AppSwitcherDropdownProps> = ({ currentAppId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const switchApp = useConstructionStore((s) => s.switchApp);

  // Derive active app from prop or current pathname
  const activeAppId: AppId =
    currentAppId ||
    (pathname?.includes('geometry')
      ? 'geometry'
      : pathname?.includes('probability')
      ? 'probability'
      : pathname?.includes('scientific')
      ? 'scientific'
      : pathname?.includes('cas')
      ? 'cas'
      : pathname?.includes('3d')
      ? '3d'
      : 'graphing');

  const currentApp = APPS[activeAppId] || APPS.graphing;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectApp = (appId: AppId) => {
    setIsOpen(false);
    switchApp(appId);
    router.push(APPS[appId].route);
  };

  const renderAppIcon = (id: AppId, className = 'w-4 h-4') => {
    switch (id) {
      case 'graphing':
        return (
          <svg className={clsx(className, 'text-[#6557d2] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 17c3-8 6-8 9 0s6 8 9 0" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );
      case 'geometry':
        return (
          <svg className={clsx(className, 'text-[#1e88e5] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12 2 22 20 2 20" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3" strokeWidth="2" />
          </svg>
        );
      case 'probability':
        return (
          <svg className={clsx(className, 'text-[#00897b] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M2 20h20M4 20c4-1 6-16 8-16s4 15 8 16" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );
      case 'scientific':
        return (
          <svg className={clsx(className, 'text-[#e65100] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2.2" />
            <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="14" x2="16" y2="18" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'cas':
        return (
          <svg className={clsx(className, 'text-[#d81b60] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h10M4 18h16M18 10l3 3-3 3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case '3d':
        return (
          <svg className={clsx(className, 'text-[#7b1fa2] stroke-[2.2]')} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m12 3-8 4.5v9L12 21l8-4.5v-9L12 3z" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M12 12 4 7.5M12 12v9M12 12l8-4.5" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div ref={dropdownRef} className="relative ml-3 select-none">
      {/* Active App Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#dadce0] hover:border-[#bdc1c6] rounded-full text-sm font-medium text-[#3c4043] shadow-2xs transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {renderAppIcon(currentApp.id)}
        <span>{currentApp.label}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-[#5f6368] transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-[#dadce0] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-[#80868b] uppercase tracking-wider">
            Apps
          </div>
          {(Object.keys(APPS) as AppId[]).map((appId) => {
            const app = APPS[appId];
            const isSelected = app.id === activeAppId;
            return (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[#f3f1fd] text-[#6557d2] font-semibold'
                    : 'text-[#202124] hover:bg-gray-100 font-normal'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {renderAppIcon(app.id, 'w-4.5 h-4.5')}
                  <span>{app.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#6557d2]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
