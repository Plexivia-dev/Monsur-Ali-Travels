import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../context/PortalContext';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  FileSpreadsheet,
  Users2,
  Factory,
  Shield,
  FileText,
  IdCard,
  Receipt,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Layers,
  Database
} from 'lucide-react';

const PORTAL_LABELS = {
  docs: { label: 'Document Center', icon: FileSpreadsheet, homeSub: 'customer-form' },
  data: { label: 'Document Data Records', icon: Database, homeSub: 'customer-guardians' },
  agency: { label: 'Manpower Agency', icon: Users2, homeSub: 'dashboard' },
  factory: { label: 'Brick Factory', icon: Factory, homeSub: 'dashboard' },
  admin: { label: 'System Admin', icon: Shield, homeSub: 'overview' }
};

const SUBMODULE_LABELS = {
  // Document Center Submodules
  'customer-form': 'Customer & Guardian Form',
  'customer-forms': 'Customer & Guardian Form',
  'customer-guardians': 'Customer Application Files',
  'agreement': 'Employment Agreement',
  'agreements': 'Employment Agreements',
  'idcard': 'Employee ID Card',
  'payroll': 'Salary Slip',
  'payrolls': 'Salary Slips',
  'invoice': 'Invoice Generator',
  'invoices': 'Invoices Data',
  'passport-sub': 'Passport Submission',
  'passports': 'Passport Submissions Data',
  'indian-visa': 'Indian Visa Application',
  'indian-visas': 'Indian Visa Applications Data',

  // Agency Submodules
  'dashboard': 'Dashboard Overview',
  'candidates-list': 'Candidate Directory',
  'candidates-add': 'Add New Candidate',
  'cases': 'Candidate Case Files',
  'passport-tracking': 'Passport & Visa Tracking',
  'reports': 'Placement Reports',

  // Admin Submodules
  'overview': 'System Overview',
  'activity': 'Activity Audit Log'
};

export function TopBreadcrumbBar() {
  const navigate = useNavigate();
  const { activePortal, activeSubmodule, switchPortal } = usePortal();

  const currentPortalInfo = PORTAL_LABELS[activePortal] || PORTAL_LABELS.docs;
  const PortalIcon = currentPortalInfo.icon;
  const submoduleTitle = SUBMODULE_LABELS[activeSubmodule] || (activeSubmodule ? activeSubmodule.replace(/-/g, ' ').toUpperCase() : 'Dashboard');

  const handleBack = () => {
    // If browser has history, go back, otherwise go to portal root
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      switchPortal(activePortal, currentPortalInfo.homeSub);
    }
  };

  return (
    <div className="no-print mb-4 flex items-center justify-between gap-3 bg-card/60 backdrop-blur-xs border border-border px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-colors">
      {/* Left / Middle: Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs group shrink-0"
          title="Go to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Vertical separator */}
        <span className="h-4 w-[1px] bg-border shrink-0" />

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11.5px] min-w-0">
          {/* Home Link */}
          <button
            type="button"
            onClick={() => switchPortal('docs', 'customer-form')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />

          {/* Portal Node */}
          <button
            type="button"
            onClick={() => switchPortal(activePortal, currentPortalInfo.homeSub)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer shrink-0"
          >
            <PortalIcon className="w-3.5 h-3.5 text-primary" />
            <span>{currentPortalInfo.label}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />

          {/* Current Active Page Node */}
          <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {submoduleTitle}
          </span>
        </nav>
      </div>

      {/* Right side contextual status badge */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Smart ERP Live</span>
        </span>
      </div>
    </div>
  );
}
