import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalStore } from '../../store/usePortalStore';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  FileSpreadsheet,
  Users2,
  Factory,
  Shield,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PORTAL_LABELS = {
  docs: { label: 'Document Studio', icon: FileSpreadsheet, homeSub: 'agreement', hasParentPage: false },
  data: { label: 'Data Records Center', icon: Database, homeSub: 'customer-profiles', hasParentPage: false },
  agency: { label: 'Manpower Agency', icon: Users2, homeSub: 'dashboard', hasParentPage: true },
  factory: { label: 'Brick Factory', icon: Factory, homeSub: 'dashboard', hasParentPage: true },
  admin: { label: 'System Admin', icon: Shield, homeSub: 'users', hasParentPage: false },
};

const SUBMODULE_LABELS = {
  'customer-form': 'Customer & Guardian Form',
  'customer-forms': 'Customer & Guardian Form',
  'customer-guardians': 'Customer Application Files',
  agreement: 'Employment Agreement',
  agreements: 'Employment Agreements',
  idcard: 'Employee ID Card',
  payroll: 'Salary Slip',
  payrolls: 'Salary Slips',
  invoice: 'Invoice Generator',
  invoices: 'Invoices Data',
  'passport-sub': 'Passport Submission',
  passports: 'Passport Submissions Data',
  'indian-visa': 'Indian Visa Application',
  'indian-visas': 'Indian Visa Applications Data',
  'certificate-exp': 'Experience Certificate',
  'certificate-char': 'Character Certificate',
  'certificate-marr': 'Marriage Certificate',
  'customer-profiles': 'Customer Profiles',

  dashboard: 'Dashboard Overview',
  'candidates-all': 'All Candidates',
  'candidates-add': 'Add New Candidate',
  candidates: 'Candidate Case Files',
  cases: 'Candidate Case Files',
  'clients-all': 'All Client Accounts',
  'clients-add': 'Add New Client',
  bills: 'Billing & Invoices',
  payments: 'Wages & Payments',
  reports: 'Reports & Analytics',
  employees: 'Staff & Worker Roster',

  users: 'System Users',
  'system-logs': 'Audit & Database Logs',
  settings: 'Global Settings',
};

export function TopBreadcrumbBar() {
  const navigate = useNavigate();
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);

  const currentPortalInfo = PORTAL_LABELS[activePortal] || PORTAL_LABELS.agency;
  const PortalIcon = currentPortalInfo.icon;
  const submoduleTitle =
    SUBMODULE_LABELS[activeSubmodule] ||
    (activeSubmodule ? activeSubmodule.replace(/-/g, ' ').toUpperCase() : 'Dashboard');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      switchPortal(activePortal, currentPortalInfo.homeSub);
    }
  };

  return (
    <div className="no-print mb-4 flex items-center justify-between gap-3 bg-card/60 backdrop-blur-xs border border-border/80 px-3.5 py-2 rounded-xl text-xs shadow-xs transition-colors">
      {/* Left: Back Button & Trail */}
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleBack}
          className="gap-1.5 font-medium cursor-pointer shadow-2xs group"
          title="Go to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </Button>

        <span className="h-4 w-px bg-border shrink-0" />

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
          <button
            type="button"
            onClick={() => switchPortal('agency', 'dashboard')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />

          {PORTAL_LABELS[activePortal]?.hasParentPage ? (
            <button
              type="button"
              onClick={() => switchPortal(activePortal, currentPortalInfo.homeSub)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer shrink-0"
            >
              <PortalIcon className="w-3.5 h-3.5 text-primary" />
              <span>{currentPortalInfo.label}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0 select-none">
              <PortalIcon className="w-3.5 h-3.5 text-primary/70" />
              <span>{currentPortalInfo.label}</span>
            </span>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />

          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {submoduleTitle}
          </span>
        </nav>
      </div>

      {/* Right: Live Status Indicator */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Smart ERP Live</span>
        </span>
      </div>
    </div>
  );
}

export default TopBreadcrumbBar;
