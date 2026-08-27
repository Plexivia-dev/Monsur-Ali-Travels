import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  Search,
  Bell,
  Factory,
  Users2,
  Shield,
  FileSpreadsheet,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const { activePortal, activeSubmodule, switchPortal, setSearchOpen, notifications, markAllNotificationsRead, isSidebarOpen, toggleSidebar } = usePortal();
  const { isDark, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const portalDetails = {
    factory: { title: 'Brick Factory Portal', subtitle: 'Kiln Production, Coal Stock & Raw Materials', icon: Factory, badgeBg: 'bg-amber-500/15 text-amber-500' },
    agency: { title: 'Manpower Agency Portal', subtitle: 'Placements, Client Invoicing & Contractor Payroll', icon: Users2, badgeBg: 'bg-sky-500/15 text-sky-500' },
    docs: { title: 'Document Center', subtitle: 'Employment Agreement, Invoice & ID Card', icon: FileSpreadsheet, badgeBg: 'bg-emerald-500/15 text-emerald-500' },
    admin: { title: 'System Administration', subtitle: 'Global Users, Financial Reconciliation & Audit Logs', icon: Shield, badgeBg: 'bg-purple-500/15 text-purple-500' }
  };

  const currentPortal = portalDetails[activePortal] || portalDetails.docs;
  const PortalIcon = currentPortal.icon;

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/85 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Active Context */}
      <div className="flex items-center gap-3">

        {/* Portal Selector Dropdown Button */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setPortalMenuOpen(!portalMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer group"
          >
            <div className={`p-1.5 rounded-lg ${currentPortal.badgeBg}`}>
              <PortalIcon className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                {currentPortal.title}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground capitalize">{activeSubmodule} Module</p>
            </div>
            </Button>

          {/* Quick Portal Switcher Dropdown Menu */}
          {portalMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Switch Active Portal</p>

              <Button
                variant="ghost"
                onClick={() => {
                  switchPortal('docs', 'agreement');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  activePortal === 'docs' ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'text-foreground'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Document Center</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  switchPortal('agency', 'dashboard');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  activePortal === 'agency' ? 'bg-sky-500/10 text-sky-500 font-semibold' : 'text-foreground'
                }`}
              >
                <Users2 className="w-4 h-4 text-sky-500" />
                <span>Manpower Agency Portal</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  switchPortal('factory', 'dashboard');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  activePortal === 'factory' ? 'bg-amber-500/10 text-amber-500 font-semibold' : 'text-foreground'
                }`}
              >
                <Factory className="w-4 h-4 text-amber-500" />
                <span>Brick Factory Portal</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  switchPortal('admin', 'overview');
                  setPortalMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  activePortal === 'admin' ? 'bg-purple-500/10 text-purple-500 font-semibold' : 'text-foreground'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-500" />
                <span>System Administration</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications, Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Global Search Quick Trigger */}
        <Button
          variant="ghost"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground text-xs cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        {/* Notifications Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </Button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-100">
              <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="link"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-primary flex items-center gap-1 cursor-pointer p-0 h-auto"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </Button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs space-y-1 transition-colors ${
                      n.unread ? 'bg-primary/5 font-medium' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </Button>
      </div>
    </header>
  );
};
