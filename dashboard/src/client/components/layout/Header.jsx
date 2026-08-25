import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell } from 'lucide-react';
import { usePortalStore } from '../../store/usePortalStore';
import { Button } from '@/components/ui/button';
import ModeToggle from './ModeToggle';
import ProfileDropdown from './ProfileDropdown';
import LanguageToggle from './LanguageToggle';

const SUBMODULE_KEYS = {
  dashboard: 'nav.agencyDashboard',
  cases: 'nav.caseFiles',
  tasks: 'nav.myTasks',
  overview: 'nav.documentStudioHub',
  'clients-all': 'nav.allClients',
  'clients-add': 'nav.addClient',
  bills: 'nav.clientBills',
  payments: 'nav.clientPayments',
  agreement: 'nav.employmentAgreement',
  'customer-form': 'nav.customerGuardianForm',
  'indian-visa': 'nav.indianVisaRecords',
  'passport-sub': 'nav.passportRecords',
  idcard: 'nav.idCard',
  payroll: 'nav.salarySlip',
  invoice: 'nav.invoice',
  'money-receipt': 'nav.moneyReceipt',
  receipt: 'nav.moneyReceipt',
  'cash-voucher': 'nav.cashVoucher',
  'experience-certificate': 'nav.experienceCertificate',
  'character-certificate': 'nav.characterCertificate',
  'marriage-certificate': 'nav.marriageCertificate',
  'certificate-exp': 'nav.experienceCertificate',
  'certificate-char': 'nav.characterCertificate',
  'certificate-marr': 'nav.marriageCertificate',
  'customer-profiles': 'nav.customerProfiles',
  agreements: 'nav.agreementRecords',
  'customer-applications': 'nav.customerApplications',
  'indian-visas': 'nav.indianVisaRecords',
  passports: 'nav.passportRecords',
  'salary-slips': 'nav.salarySlipRecords',
  invoices: 'nav.invoiceRecords',
  users: 'nav.systemUsers',
  profile: 'header.myProfile',
  account: 'header.myProfile',
  'system-logs': 'nav.auditLogs',
  settings: 'nav.globalSettings',
};

const PORTALS_WITH_PARENT_PAGE = ['agency', 'factory'];

export const Header = () => {
  const { t } = useTranslation();
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const notifications = usePortalStore((state) => state.notifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left Side spacer */}
        <div className="flex items-center gap-3 min-w-0" />

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
            <span>{t('header.searchPlaceholder', 'Search ERP...')}</span>
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
            title={t('common.search', 'Search')}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Language Switcher Toggle */}
          <LanguageToggle />

          {/* Notifications Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => switchPortal(activePortal, 'reports')}
            className="relative text-muted-foreground hover:text-foreground cursor-pointer"
            title={t('header.notifications', 'Notifications')}
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
