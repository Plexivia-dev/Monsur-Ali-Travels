import React from 'react';
import { usePortalStore } from '../../store/usePortalStore';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LanguageToggle = () => {
  const language = usePortalStore((state) => state.language || 'bn');
  const toggleLanguage = usePortalStore((state) => state.toggleLanguage);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2.5 flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground rounded-lg border border-border/40 hover:bg-muted/60 transition-all duration-200"
      onClick={toggleLanguage}
      title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
      aria-label="Toggle Language"
    >
      <Languages className="w-3.5 h-3.5 text-sky-400" />
      <span className="text-[11px] font-bold tracking-wider uppercase">
        {language === 'bn' ? 'বাং' : 'EN'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
