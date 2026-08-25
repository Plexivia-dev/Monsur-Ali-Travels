import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePortalStore } from '../../store/usePortalStore';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const setStoreLanguage = usePortalStore((state) => state.setLanguage);

  const currentLang = i18n.language?.startsWith('bn') ? 'bn' : 'en';

  const handleToggle = () => {
    const nextLang = currentLang === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(nextLang);
    setStoreLanguage(nextLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2.5 flex items-center gap-1.5 cursor-pointer text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-lg border border-white/20 transition-all duration-200"
      onClick={handleToggle}
      title={currentLang === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
      aria-label="Toggle Language"
    >
      <Languages className="w-3.5 h-3.5 text-white" />
      <span className="text-[11px] font-bold tracking-wider uppercase text-white">
        {currentLang === 'en' ? 'EN' : 'বাং'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
