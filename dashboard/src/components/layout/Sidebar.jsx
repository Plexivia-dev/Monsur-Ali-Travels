import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../context/ThemeContext';
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
  Award,
  UserCheck,
  FileCheck,
  FolderDown,
  IdCard,
  X,
  LogOut,
  Settings,
  Sun,
  Moon,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { activePortal, activeSubmodule, switchPortal, isSidebarOpen, setIsSidebarOpen, toggleSidebar } = usePortal();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [agencyOpen, setAgencyOpen] = useState(true);
  const [clientsSubOpen, setClientsSubOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const navItemsAgency = [
    { id: 'candidates-all', label: 'All Candidates', icon: Users },
    { id: 'candidates-add', label: 'Add New Candidate', icon: Users },
    { id: 'cases', label: 'Candidate Case Files', icon: FileText },
    { id: 'passport-tracking', label: 'Passport & Visa Tracking', icon: CreditCard },
    { id: 'reports', label: 'Placement Reports', icon: BarChart3 }
  ];

  const navItemsDocs = [
    { id: 'agreement', label: 'Employment Agreement', icon: FileText },
    { id: 'templates', label: 'Templates', icon: FileCheck },
    { id: 'idcard', label: 'ID Card Studio', icon: IdCard },
    { id: 'downloads', label: 'Downloads', icon: FolderDown },
    { id: 'payroll', label: 'Salary Slip Studio', icon: Receipt }
  ];

  const navItemsAdmin = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const handleNavClick = (portal, submodule) => {
    switchPortal(portal, submodule);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Backdrop Overlay with smooth transition */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <img
                src={logoImg}
                alt="Monsur Ali Travels Logo"
                className="w-9 h-9 object-contain rounded-lg shrink-0"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight flex items-center gap-1.5 truncate">
                Admin Portal
              </h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">Monsur Ali Travels</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs ml-1"
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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

        {/* Minimalist 4-Icon Action Footer Row */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50 flex items-center justify-around gap-1 relative">
          {/* 1. User Profile Icon Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileCard(!showProfileCard)}
              className={`w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer border border-sky-400/40 shadow-xs hover:ring-2 hover:ring-sky-400/50 transition-all ${
                showProfileCard ? 'ring-2 ring-sky-400' : ''
              }`}
              title="View User Profile"
            >
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'মড'}
            </button>

            {/* Profile Details Popover Modal */}
            {showProfileCard && (
              <div className="absolute bottom-12 left-0 w-48 bg-card border border-border p-3 rounded-xl shadow-xl z-50 animate-in fade-in-50 duration-150 text-foreground">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.name || 'মিস্টার ডেভেলপার'}
                </p>
                <p className="text-[10px] text-emerald-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {user?.role || 'Owner'}
                </p>
              </div>
            )}
          </div>

          {/* 2. Settings Icon Button */}
          <button
            onClick={() => switchPortal('admin', 'overview')}
            className="p-2 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* 3. Dark/Light Mode Switcher Icon (Left of Logout) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-sidebar-foreground/70 hover:text-amber-400 hover:bg-sidebar-accent transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-400" />}
          </button>

          {/* 4. Logout Icon Button (Active highlight default, smooth hover transition) */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 cursor-pointer shadow-xs"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </aside>
    </>
  );
};
