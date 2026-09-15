import React from "react";
import { Menu, Share2, TrendingUp, ChevronDown } from "lucide-react";
import Image from "next/image";

export const TopNavBar: React.FC = () => {
  return (
    <header className="h-13 bg-white border-b border-[#e0e0e0] flex items-center justify-between px-4 shrink-0 z-30 select-none">
      {/* Left Section: Menu + GeoGebra Logo + Calculator Suite + Mode Pill */}
      <div className="flex items-center gap-4">
        <button
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#5f6368] transition-colors cursor-pointer"
          aria-label="Main Menu"
          title="Main Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* GeoGebra Brand & Logo */}
          <div className="flex items-baseline gap-2">
            <span className="text-[21px] font-medium tracking-tight text-[#202124] flex items-center gap-1.5">
              <Image
                src="/codingjr.webp"
                alt="Coding jr logo"
                height={100}
                width={100}
              />
            </span>
          </div>

          {/* Mode Selector Dropdown */}
          <div className="ml-3 flex items-center gap-1.5 px-3 py-1 bg-white border border-[#dadce0] hover:border-[#bdc1c6] rounded-full text-sm font-medium text-[#3c4043] shadow-2xs transition-colors cursor-pointer">
            <svg
              className="w-4 h-4 text-[#6557d2] stroke-[2.2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M3 17c3-8 6-8 9 0s6 8 9 0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span>Graphing</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5f6368] ml-0.5" />
          </div>
        </div>
      </div>

      {/* Right Section: Share + Assign + Sign In */}
      {/* <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-full text-[#5f6368] transition-colors cursor-pointer"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        <button className="px-5 py-1.5 bg-[#6557d2] hover:bg-[#5345c2] active:bg-[#473aa8] text-white rounded-full font-medium text-sm transition-colors shadow-2xs cursor-pointer">
          Assign
        </button>

        <button className="text-[#6557d2] hover:text-[#5345c2] font-medium text-sm transition-colors cursor-pointer px-1 py-1">
          Sign in
        </button>
      </div> */}
    </header>
  );
};
