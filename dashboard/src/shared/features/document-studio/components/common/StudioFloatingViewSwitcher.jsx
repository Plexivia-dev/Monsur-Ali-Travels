import React from 'react';
import { Columns, Edit3, Eye } from 'lucide-react';

export function StudioFloatingViewSwitcher({
  viewMode = 'split',
  setViewMode,
  modes = [
    { id: 'split', label: 'Split View', icon: Columns },
    { id: 'edit', label: 'Edit Form', icon: Edit3 },
    { id: 'preview', label: 'Live Preview', icon: Eye },
  ],
  className = '',
}) {
  if (!setViewMode) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto print:hidden ${className}`}>
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-950/90 dark:bg-black/90 text-zinc-100 border border-zinc-700/80 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {modes.map((btn) => {
          const Icon = btn.icon;
          const isActive = viewMode === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setViewMode(btn.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 font-black scale-105'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StudioFloatingViewSwitcher;
