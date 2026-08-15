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
  Receipt,
  History,
  ChevronRight,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  Award
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activePortal, activeSubmodule, switchPortal } = usePortal();
  const [factoryOpen, setFactoryOpen] = useState(true);
  const [agencyOpen, setAgencyOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(true);
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

  const navItemsDocs = [
    { id: 'resume', label: 'Resume & CV', icon: FileText },
    { id: 'certificate', label: 'Character Certificate', icon: Award },
    { id: 'invoice', label: 'Invoice Generator', icon: Receipt }
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-ring flex items-center justify-center text-sidebar-primary-foreground shadow-md shadow-primary/20 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-sidebar-foreground tracking-tight flex items-center gap-1.5">
                Smart ERP <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">v2.5</span>
              </h1>
              <p className="text-[11px] text-sidebar-foreground/60">Enterprise Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* GROUP 1: BRICK FACTORY PORTAL */}
          <div className="space-y-1">
            <button
              onClick={() => setFactoryOpen(!factoryOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-500 font-semibold border-l-2 border-amber-500'
                          : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-sidebar-foreground/60'}`} />
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
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left text-sky-500 hover:text-sky-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-sky-500" />
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-500 font-semibold border-l-2 border-sky-500'
                          : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-sidebar-foreground/60'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* GROUP 3: DOCUMENT STUDIO */}
          <div className="space-y-1">
            <button
              onClick={() => setDocsOpen(!docsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Document Studio</span>
              </div>
              {docsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {docsOpen && (
              <div className="space-y-0.5 pl-1">
                {navItemsDocs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePortal === 'docs' && activeSubmodule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick('docs', item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-500 font-semibold border-l-2 border-emerald-500'
                          : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-sidebar-foreground/60'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* GROUP 4: SYSTEM ADMIN & GLOBAL SETTINGS */}
          <div className="space-y-1">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left text-purple-500 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Admin Panel</span>
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-500/10 text-purple-500 font-semibold border-l-2 border-purple-500'
                          : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-500' : 'text-sidebar-foreground/60'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold text-xs shrink-0">
              IH
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Ikramul Hossen</p>
              <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Owner
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
