import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../lib/auth-context';
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
  Building2,
  UserPlus,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { activePortal, activeSubmodule, switchPortal, isSidebarOpen, setIsSidebarOpen, toggleSidebar } = usePortal();
  const { user, logout } = useAuth();
  const [factoryOpen, setFactoryOpen] = useState(true);
  const [agencyOpen, setAgencyOpen] = useState(true);
  const [clientsSubOpen, setClientsSubOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const navItemsFactory = [
    { id: 'dashboard', label: 'Factory Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Molded Bricks & Labor', icon: Users },
    { id: 'bills', label: 'Coal & Raw Material Bills', icon: Receipt },
    { id: 'payments', label: 'Contractor Wages', icon: CreditCard },
    { id: 'reports', label: 'Production & Sales Reports', icon: BarChart3 }
  ];

  const navItemsAgency = [
    { id: 'dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidate & Agent Pipeline', icon: UserCheck },
    { id: 'employees', label: 'Placed Workers', icon: Users },
    {
      id: 'clients',
      label: 'Client Invoicing',
      icon: Receipt,
      children: [
        { id: 'clients-add', label: 'Add new clients', icon: UserPlus },
        { id: 'all-clients', label: 'All Clients', icon: Building2 },
        { id: 'clients-payments', label: 'Payments', icon: CreditCard }
      ]
    },
    { id: 'payments', label: 'Contractor Payouts', icon: CreditCard },
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
          {/* GROUP 1: BRICK FACTORY PORTAL (HIDDEN FOR NOW) */}

          {/* GROUP 2: MANPOWER AGENCY PORTAL (HIDDEN FOR NOW) */}
          {/*
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
                  const isParentActive =
                    activePortal === 'agency' &&
                    (activeSubmodule === item.id ||
                      (item.children &&
                        item.children.some(
                          (child) =>
                            child.id === activeSubmodule ||
                            (child.id === 'all-clients' && activeSubmodule === 'bills')
                        )));

                  if (item.children) {
                    return (
                      <div key={item.id} className="space-y-0.5">
                        <button
                          onClick={() => setClientsSubOpen(!clientsSubOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                            isParentActive
                              ? 'bg-sky-500/10 text-sky-500 font-semibold'
                              : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isParentActive ? 'text-sky-500' : 'text-sidebar-foreground/60'}`} />
                            <span>{item.label}</span>
                          </div>
                          {clientsSubOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                          )}
                        </button>

                        {clientsSubOpen && (
                          <div className="pl-4 ml-2 border-l border-sidebar-border/60 space-y-0.5 my-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive =
                                activePortal === 'agency' &&
                                (activeSubmodule === child.id ||
                                  (child.id === 'all-clients' && (activeSubmodule === 'bills' || activeSubmodule === 'clients-all')) ||
                                  (child.id === 'clients-add' && activeSubmodule === 'add-client') ||
                                  (child.id === 'clients-payments' && activeSubmodule === 'payments'));

                              return (
                                <button
                                  key={child.id}
                                  onClick={() => handleNavClick('agency', child.id)}
                                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-left transition-all cursor-pointer ${
                                    isChildActive
                                      ? 'bg-sky-500/15 text-sky-500 font-bold border-l-2 border-sky-500 pl-2'
                                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/70'
                                  }`}
                                >
                                  <ChildIcon className={`w-3.5 h-3.5 ${isChildActive ? 'text-sky-500' : 'text-sidebar-foreground/50'}`} />
                                  <span>{child.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Normal single item
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
          */}

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

        {/* Footer User Info & Logout Button */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold text-xs shrink-0">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'IH'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.name || 'Ikramul Hossen'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {user?.role || 'Owner'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-rose-500/20"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
