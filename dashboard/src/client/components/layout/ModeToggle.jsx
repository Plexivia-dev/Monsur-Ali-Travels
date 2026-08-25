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
      className="relative cursor-pointer text-muted-foreground hover:text-foreground"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <MoonStar className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'scale-100' : 'scale-0'}`} />
      <Sun className={`w-4 h-4 absolute transition-transform duration-200 ${isDark ? 'scale-0' : 'scale-100'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ModeToggle;
