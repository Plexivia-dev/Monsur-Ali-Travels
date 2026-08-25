import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ArrowLeft } from 'lucide-react';
import { usePortalStore } from '../../store/usePortalStore';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ModeToggle from './ModeToggle';
import ProfileDropdown from './ProfileDropdown';
import LanguageToggle from './LanguageToggle';

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const notifications = usePortalStore((state) => state.notifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleBack = () => {
    if (activePortal === 'docs' && activeSubmodule && activeSubmodule !== 'overview') {
      switchPortal('docs', 'overview');
      navigate('/dashboard/docs/overview');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      switchPortal('agency', 'tasks');
      navigate('/dashboard/agency/tasks');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border shadow-xs transition-colors">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left Side: Sidebar Trigger (Mobile) & Back Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          <SidebarTrigger className="md:hidden text-white hover:text-white hover:bg-white/15 cursor-pointer rounded-lg" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-2.5 h-8 rounded-lg transition-all cursor-pointer shadow-xs group"
            title={t('common.back', 'Back')}
          >
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-semibold text-white">{t('common.back', 'Back')}</span>
          </Button>
        </div>

        {/* Right Side: Quick Search, Notifications, Theme Mode, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 text-xs text-white/90 bg-white/10 border border-white/20 hover:bg-white/20 hover:text-white cursor-pointer h-8 px-2.5 rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-white" />
            <span className="text-white/90">{t('header.searchPlaceholder', 'Search ERP...')}</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded bg-white/15 px-1.5 font-mono text-[10px] font-medium text-white border border-white/20">
              ⌘K
            </kbd>
          </Button>

          {/* Search Icon on Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="md:hidden text-white hover:text-white hover:bg-white/15 cursor-pointer rounded-lg h-8 w-8"
            title={t('common.search', 'Search')}
          >
            <Search className="w-4 h-4 text-white" />
          </Button>

          {/* Language Switcher Toggle */}
          <LanguageToggle />

          {/* Notifications Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchPortal(activePortal, 'reports')}
            className="relative text-white hover:text-white hover:bg-white/15 cursor-pointer rounded-lg h-8 w-8"
            title={t('header.notifications', 'Notifications')}
          >
            <Bell className="w-4 h-4 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-1 ring-white" />
              </span>
            )}
          </Button>

          {/* Dark / Light Mode Toggle */}
          <ModeToggle />

          {/* User Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
