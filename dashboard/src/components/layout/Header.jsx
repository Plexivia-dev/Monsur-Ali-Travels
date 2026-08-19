import React from 'react';
import { Search, Bell } from 'lucide-react';
import { usePortalStore } from '../../store/usePortalStore';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ModeToggle from './ModeToggle';
import ProfileDropdown from './ProfileDropdown';

const PORTAL_LABELS = {
  agency: 'Manpower Agency',
  factory: 'Brick Factory',
  docs: 'Document Studio',
  data: 'Data Records Center',
  admin: 'System Admin',
};

const SUBMODULE_LABELS = {
  dashboard: 'Overview & Dashboard',
  employees: 'Staff & Worker Roster',
  'candidates-all': 'All Candidates',
  'candidates-add': 'Add New Candidate',
  candidates: 'Candidate Case Files',
  cases: 'Candidate Case Files',
  'clients-all': 'All Client Accounts',
  'clients-add': 'Add New Client',
  bills: 'Billing & Invoices',
  payments: 'Wages & Payments',
  reports: 'Reports & Analytics',
  agreement: 'Employment Agreement',
  'customer-form': 'Customer & Guardian Form',
  'indian-visa': 'Indian Visa Submission',
  'passport-sub': 'Passport Submission',
  idcard: 'Office ID Card',
  payroll: 'Monthly Salary Slip',
  invoice: 'Invoice & Billing',
  'certificate-exp': 'Experience Certificate',
  'certificate-char': 'Character Certificate',
  'certificate-marr': 'Marriage Certificate',
  'customer-profiles': 'Customer Profiles',
  agreements: 'Agreement Records',
  'customer-applications': 'Customer Applications',
  'indian-visas': 'Indian Visa Records',
  passports: 'Passport Submissions',
  'salary-slips': 'Salary Slips',
  invoices: 'Invoice Records',
  users: 'System Users',
  'system-logs': 'Audit & Database Logs',
  settings: 'Global Settings',
};

export const Header = () => {
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const notifications = usePortalStore((state) => state.notifications);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const portalLabel = PORTAL_LABELS[activePortal] || activePortal;
  const submoduleLabel = SUBMODULE_LABELS[activeSubmodule] || activeSubmodule.replace(/-/g, ' ');

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left Side: Sidebar Trigger & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="[&_svg]:size-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Separator orientation="vertical" className="hidden h-4 data-vertical:self-center sm:block" />

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => switchPortal(activePortal, 'dashboard')}>
                  {portalLabel}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{submoduleLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right Side: Quick Search, Notifications, Theme Mode, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border-border hover:bg-muted cursor-pointer h-8 px-2.5 rounded-lg"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search ERP...</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border">
              ⌘K
            </kbd>
          </Button>

          {/* Search Icon on Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchPortal(activePortal, 'reports')}
            className="relative text-muted-foreground hover:text-foreground cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </Button>

          {/* Dark / Light Mode Toggle */}
          <ModeToggle />

          {/* User Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
