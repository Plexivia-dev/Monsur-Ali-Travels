import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { toggleTheme, isDark } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border border-neutral-700/80 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDark ? 'bg-primary' : 'bg-neutral-900'
      }`}
      aria-label="Toggle dark/light theme"
    >
      <span
        className={`flex px-1 pl-1 h-4 w-4 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
          isDark
            ? 'translate-x-5 bg-neutral-950 text-white'
            : 'translate-x-0.5 bg-neutral-100 text-neutral-900'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 stroke-[2]" />
        ) : (
          <Sun className="h-3.5 w-3.5 stroke-[2]" />
        )}
      </span>
    </button>
  );
};
