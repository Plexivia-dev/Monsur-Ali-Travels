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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => setSearchOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search modules, workers, bills, or portals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-hidden"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
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
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.portal}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">No matching portals or views found.</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground font-mono text-[10px]">ESC</kbd> to close</span>
          <span>Smart ERP Quick Navigator</span>
        </div>
      </div>
    </div>
  );
};
