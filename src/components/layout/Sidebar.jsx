import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  Factory,
  Users2,
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Settings,
  Receipt,
  History,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  LogOut,
  Building2
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activePortal, activeSubmodule, switchPortal } = usePortal();
  const [factoryOpen, setFactoryOpen] = useState(true);
  const [agencyOpen, setAgencyOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const navItemsFactory = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Workers & Attendance', icon: Users },
    { id: 'bills', label: 'Raw Material Bills', icon: FileText },
    { id: 'payments', label: 'Payouts & Ledger', icon: CreditCard },
    { id: 'reports', label: 'Production Reports', icon: BarChart3 }
  ];

  const navItemsAgency = [
    { id: 'dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Placed Workers', icon: Users },
    { id: 'bills', label: 'Client Invoicing', icon: Receipt },
    { id: 'payments', label: 'Contractor Payouts', icon: CreditCard },
    { id: 'reports', label: 'Placement Reports', icon: BarChart3 }
  ];

  const navItemsAdmin = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const handleNavClick = (portal, submodule) => {
    switchPortal(portal, submodule);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-900/30 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Smart ERP <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold uppercase">v2.5</span>
              </h1>
              <p className="text-[11px] text-slate-400">Enterprise Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* GROUP 1: BRICK FACTORY PORTAL */}
          <div className="space-y-1">
            <button
              onClick={() => setFactoryOpen(!factoryOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-500" />
                <span>Brick Factory Portal</span>
              </div>
              {factoryOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {factoryOpen && (
              <div className="space-y-0.5 pl-1">
                {navItemsFactory.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePortal === 'factory' && activeSubmodule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick('factory', item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* GROUP 2: MANPOWER AGENCY PORTAL */}
          <div className="space-y-1">
            <button
              onClick={() => setAgencyOpen(!agencyOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-sky-400" />
                <span>Manpower Agency</span>
              </div>
              {agencyOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {agencyOpen && (
              <div className="space-y-0.5 pl-1">
                {navItemsAgency.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePortal === 'agency' && activeSubmodule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick('agency', item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-300 font-semibold border-l-2 border-sky-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* GROUP 3: SYSTEM ADMIN & GLOBAL SETTINGS */}
          <div className="space-y-1">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>System Administration</span>
              </div>
              {adminOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {adminOpen && (
              <div className="space-y-0.5 pl-1">
                {navItemsAdmin.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePortal === 'admin' && activeSubmodule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick('admin', item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300 font-semibold border-l-2 border-purple-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              AW
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Alexander Wright</p>
              <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Super Admin
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
