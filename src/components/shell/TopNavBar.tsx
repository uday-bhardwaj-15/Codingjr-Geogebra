import React from "react";
import { Menu, Share2 } from "lucide-react";

export const TopNavBar: React.FC = () => {
  return (
    <header className="h-14 bg-[var(--gk-bg)] border-b border-[var(--gk-border)] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <div className="flex items-center gap-2">
          {/* Swappable Logo Slot */}
          <div className="w-8 h-8 bg-[var(--gk-accent)] rounded flex items-center justify-center text-white font-bold">
            GK
          </div>
          <span className="font-semibold text-lg text-[var(--gk-text)]">
            GraphKit
          </span>
          <select className="ml-2 text-sm border-none bg-transparent outline-none cursor-pointer text-[var(--gk-text-muted)] font-medium">
            <option value="graphing">Graphing ▾</option>
            <option value="geometry" disabled>
              Geometry
            </option>
            <option value="3d" disabled>
              3D Calculator
            </option>
          </select>
        </div>
      </div>
      {/* <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Share">
          <Share2 className="w-5 h-5 text-[var(--gk-text)]" />
        </button>
        <button className="px-4 py-1.5 text-sm font-medium border border-[var(--gk-border)] rounded hover:bg-gray-50 text-[var(--gk-text-muted)] cursor-not-allowed">
          Assign
        </button>
        <button className="px-4 py-1.5 text-sm font-medium text-[var(--gk-accent)] hover:bg-gray-50 rounded cursor-not-allowed">
          Sign In
        </button>
      </div> */}
    </header>
  );
};
