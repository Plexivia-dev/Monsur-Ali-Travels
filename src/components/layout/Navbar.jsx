import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  Search,
  Bell,
  Menu,
  Factory,
  Users2,
  Shield,
  CheckCheck,
  ChevronDown,
  Layers
} from 'lucide-react';

export const Navbar = ({ onOpenMobileSidebar }) => {
  const { activePortal, activeSubmodule, switchPortal, setSearchOpen, notifications, markAllNotificationsRead } = usePortal();
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const portalDetails = {
    factory: { title: 'Brick Factory Portal', subtitle: 'Kiln Production, Coal Stock & Raw Materials', icon: Factory, badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    agency: { title: 'Manpower Agency Portal', subtitle: 'Placements, Client Invoicing & Contractor Payroll', icon: Users2, badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
    admin: { title: 'System Administration', subtitle: 'Global Users, Financial Reconciliation & Audit Logs', icon: Shield, badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' }
  };

  const currentPortal = portalDetails[activePortal] || portalDetails.factory;
  const PortalIcon = currentPortal.icon;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Active Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Portal Selector Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setPortalMenuOpen(!portalMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div className={`p-1.5 rounded-lg ${currentPortal.badgeBg}`}>
              <PortalIcon className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                {currentPortal.title}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{activeSubmodule} Module</p>
            </div>
          </button>

          {/* Quick Portal Switcher Dropdown Menu */}
          {portalMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch Active Portal</p>

              <button
                onClick={() => {
                  switchPortal('factory', 'dashboard');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activePortal === 'factory' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Factory className="w-4 h-4 text-amber-500" />
                <span>Brick Factory Portal</span>
              </button>

              <button
                onClick={() => {
                  switchPortal('agency', 'dashboard');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activePortal === 'agency' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Users2 className="w-4 h-4 text-sky-500" />
                <span>Manpower Agency Portal</span>
              </button>

              <button
                onClick={() => {
                  switchPortal('admin', 'overview');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activePortal === 'admin' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-500" />
                <span>System Administration</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications, Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Global Search Quick Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-100">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs space-y-1 transition-colors ${
                      n.unread ? 'bg-blue-50/40 dark:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
