import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ArrowLeft, Check, CheckCheck, FileText, Sparkles, FolderOpen, AlertCircle } from 'lucide-react';
import { usePortalStore } from '../../store/usePortalStore';
import { useSocketNotification } from '../../hooks/useSocketNotification';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ModeToggle from './ModeToggle';
import LanguageToggle from './LanguageToggle';

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Activate real-time socket notification listener for client session
  useSocketNotification();

  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const notifications = usePortalStore((state) => state.notifications);
  const markNotificationRead = usePortalStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = usePortalStore((state) => state.markAllNotificationsRead);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread || !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleBack = () => {
    if (activePortal === 'docs' && activeSubmodule && activeSubmodule !== 'overview') {
      switchPortal('docs', 'overview');
      navigate('/dashboard/docs/overview');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      switchPortal('overview', 'tasks');
      navigate('/dashboard/overview');
    }
  };

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id || item.did);
    if (item.module === 'visa' || item.module === 'task' || item.portal === 'agency') {
      switchPortal('overview', 'tasks');
      navigate('/dashboard/overview');
    } else if (item.portal && item.submodule) {
      switchPortal(item.portal, item.submodule);
      navigate(`/dashboard/${item.portal}/${item.submodule}`);
    }
    setNotifOpen(false);
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
            className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-white/95 border border-white/40 px-3 h-8 rounded-lg transition-all cursor-pointer shadow-sm group"
            title={t('common.back', 'Back')}
          >
            <ArrowLeft className="w-4 h-4 text-slate-900 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-slate-900">{t('common.back', 'Back')}</span>
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

          {/* Real-time Notifications Popover Trigger */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-white hover:text-white hover:bg-white/15 cursor-pointer rounded-lg h-8 w-8 transition-colors"
              title={t('header.notifications', 'Notifications')}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-1 ring-white" />
                </span>
              )}
            </Button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2 text-slate-500">
                      <Bell className="w-6 h-6 mx-auto text-slate-400 opacity-40" />
                      <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                      <p className="text-[11px] text-slate-500">Real-time system updates will appear here.</p>
                    </div>
                  ) : (
                    notifications.map((item, idx) => {
                      const isUnread = item.unread || !item.isRead;
                      return (
                        <div
                          key={item.id || item.did || idx}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3.5 text-left transition-colors cursor-pointer flex items-start gap-3 relative ${
                            isUnread
                              ? 'bg-sky-50/60 hover:bg-sky-50 border-l-4 border-l-sky-500'
                              : 'bg-white hover:bg-slate-50/80 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 mt-0.5 border shadow-2xs ${
                              isUnread
                                ? 'bg-white text-sky-600 border-sky-200/80'
                                : 'bg-slate-100 text-slate-500 border-slate-200/60'
                            }`}
                          >
                            {item.module === 'visa' || item.module === 'task' ? (
                              <Sparkles className="w-4 h-4 text-sky-600" />
                            ) : item.module === 'invoice' ? (
                              <FileText className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-amber-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5 pr-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5
                                className={`text-xs truncate ${
                                  isUnread ? 'font-bold text-sky-950' : 'font-semibold text-slate-800'
                                }`}
                              >
                                {item.title}
                              </h5>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now')}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] line-clamp-2 leading-relaxed ${
                                isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
                              }`}
                            >
                              {item.message}
                            </p>
                          </div>

                          {isUnread && (
                            <span className="size-2 rounded-full bg-sky-500 shrink-0 mt-1.5 shadow-xs" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 border-t border-slate-100 bg-slate-50/80 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      switchPortal('overview', 'tasks');
                      navigate('/dashboard/overview');
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-sky-600 transition-all cursor-pointer py-1 block w-full"
                  >
                    View Task Overview →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
