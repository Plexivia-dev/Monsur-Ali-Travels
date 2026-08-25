import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { MoonStar, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ModeToggle = () => {
  const { toggleTheme, isDark } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative cursor-pointer text-white hover:text-white hover:bg-white/15 rounded-lg h-8 w-8 transition-colors"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <MoonStar className={`w-4 h-4 text-white transition-transform duration-200 ${isDark ? 'scale-100' : 'scale-0'}`} />
      <Sun className={`w-4 h-4 text-white absolute transition-transform duration-200 ${isDark ? 'scale-0' : 'scale-100'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ModeToggle;
