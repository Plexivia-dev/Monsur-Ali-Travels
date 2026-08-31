import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortalStore } from '../../store/usePortalStore';
import { usePortal } from '../../context/PortalContext';
import {
  Search,
  Building2,
  Users,
  FileText,
  CreditCard,
  Shield,
  ArrowRight,
  X,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

export const GlobalSearchModal = () => {
  const { t } = useTranslation();
  const searchOpen = usePortalStore((state) => state.searchOpen);
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const searchQuery = usePortalStore((state) => state.searchQuery);
  const setSearchQuery = usePortalStore((state) => state.setSearchQuery);
  const { switchPortal } = usePortal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const quickLinks = [
    { portal: 'agency', submodule: 'dashboard', title: t('nav.agencyDashboard', 'Agency Overview'), desc: 'Active placements, billing & client contracts', icon: Building2 },
    { portal: 'agency', submodule: 'clients-all', title: t('nav.allClients', 'Client Directory'), desc: 'Client enterprise contracts & accounts', icon: Building2 },
    { portal: 'agency', submodule: 'bills', title: t('nav.clientBills', 'Client Invoices & Billing'), desc: 'Unbilled hours, margins & client billing', icon: FileText },
    { portal: 'agency', submodule: 'payments', title: t('nav.clientPayments', 'Client Payments'), desc: 'Contractor salary settlements', icon: CreditCard },
    { portal: 'docs', submodule: 'agreement', title: t('nav.employmentAgreement', 'Employment Agreement'), desc: 'Generate official client contract A4', icon: FileSpreadsheet },
    { portal: 'docs', submodule: 'client-form', title: t('nav.clientGuardianForm', 'Client & Guardian Form'), desc: 'Generate printable client profile form', icon: FileSpreadsheet },
    { portal: 'docs', submodule: 'payroll', title: t('nav.salarySlip', 'Salary Slip Generator'), desc: 'Printable worker salary slip', icon: FileSpreadsheet },
    { portal: 'docs', submodule: 'invoice', title: t('nav.invoice', 'Invoice Generator'), desc: 'Generate official client invoice', icon: FileSpreadsheet },
    { portal: 'data', submodule: 'agreements', title: t('nav.agreementRecords', 'Agreement Records'), desc: 'Historical client employment agreements', icon: Database },
    { portal: 'admin', submodule: 'users', title: t('nav.systemUsers', 'User Management & Permissions'), desc: 'Role assignments & portal access', icon: Shield },
    { portal: 'admin', submodule: 'system-logs', title: t('nav.auditLogs', 'System Audit Logs'), desc: 'Database operations and activity trail', icon: Shield },
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
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSearchOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white text-black border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-black/10 bg-black/[0.02]">
          <Search className="w-5 h-5 text-black/40 shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder={t('header.searchPlaceholder', 'Search modules, portals, records...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-sm text-black placeholder:text-black/40 focus:outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.portal, item.submodule)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
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

export default GlobalSearchModal;
