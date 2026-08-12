import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { Search, Building2, Users, FileText, CreditCard, Shield, ArrowRight, X } from 'lucide-react';

export const GlobalSearchModal = () => {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, switchPortal } = usePortal();

  if (!searchOpen) return null;

  const quickLinks = [
    { portal: 'factory', submodule: 'dashboard', title: 'Factory Dashboard', desc: 'Brick production, Coal stock & Kiln metrics', icon: Building2 },
    { portal: 'factory', submodule: 'employees', title: 'Factory Workers & Kiln Crew', desc: 'Attendance, daily wages & kiln shifts', icon: Users },
    { portal: 'factory', submodule: 'bills', title: 'Factory Raw Material Bills', desc: 'Coal supplies, soil haulage & invoices', icon: FileText },
    { portal: 'factory', submodule: 'payments', title: 'Factory Worker & Vendor Payouts', desc: 'Wage settlements & vendor payments', icon: CreditCard },
    { portal: 'agency', submodule: 'dashboard', title: 'Manpower Agency Portal', desc: 'Active placements, billing & client contracts', icon: Building2 },
    { portal: 'agency', submodule: 'employees', title: 'Agency Contractor Database', desc: 'Placed workers, hourly rates & clients', icon: Users },
    { portal: 'agency', submodule: 'bills', title: 'Client Invoices & Billing', desc: 'Unbilled hours, margins & client billing', icon: FileText },
    { portal: 'admin', submodule: 'users', title: 'User Management & Permissions', desc: 'Role assignments & portal access', icon: Shield },
  ];

  const filteredLinks = quickLinks.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.portal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (portal, submodule) => {
    switchPortal(portal, submodule);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
        onClick={() => setSearchOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search modules, workers, bills, or portals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.portal, item.submodule)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.portal}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No matching portals or views found.</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">ESC</kbd> to close</span>
          <span>Smart ERP Quick Navigator</span>
        </div>
      </div>
    </div>
  );
};
