/**
 * Dynamic Role-Based Access Control (RBAC) & Navigation Configuration
 * 
 * Each role (and Staff subRole) has its own dedicated navigation schema,
 * permitted submodules, and default landing page.
 */

// Master Navigation Items Catalogue
export const MASTER_ITEMS = {
  // Operational Tasks
  myTasks: {
    icon: 'CheckSquare',
    label: 'My Tasks',
    key: 'nav.myTasks',
    portal: 'agency',
    submodule: 'tasks',
    href: '/dashboard/agency/tasks',
  },

  // Case Files (Candidates)
  caseFiles: {
    icon: 'FolderOpen',
    label: 'Case Files',
    key: 'nav.caseFiles',
    portal: 'agency',
    submodule: 'cases',
    href: '/dashboard/agency/cases',
  },

  // Clients & Accounts
  clientsAll: {
    icon: 'Users',
    label: 'All Clients',
    key: 'nav.allClients',
    portal: 'agency',
    submodule: 'clients-all',
    href: '/dashboard/agency/clients-all',
  },
  clientsAdd: {
    icon: 'UserPlus',
    label: 'Add Client',
    key: 'nav.addClient',
    portal: 'agency',
    submodule: 'clients-add',
    href: '/dashboard/agency/clients-add',
  },
  clientBills: {
    icon: 'Receipt',
    label: 'Client Invoices & Bills',
    key: 'nav.clientBills',
    portal: 'agency',
    submodule: 'bills',
    href: '/dashboard/agency/bills',
  },
  clientPayments: {
    icon: 'CreditCard',
    label: 'Client Payments',
    key: 'nav.clientPayments',
    portal: 'agency',
    submodule: 'payments',
    href: '/dashboard/agency/payments',
  },

  // Document Studio Items
  docHub: {
    icon: 'LayoutGrid',
    label: 'All Generators (Studio Hub)',
    key: 'nav.documentStudioHub',
    portal: 'docs',
    submodule: 'overview',
    href: '/dashboard/docs/overview',
  },
  docAgreement: {
    icon: 'FileSignature',
    label: 'Employment Agreement',
    key: 'nav.employmentAgreement',
    portal: 'docs',
    submodule: 'agreement',
    href: '/dashboard/docs/agreement',
  },
  docCustomerForm: {
    icon: 'UserCheck',
    label: 'Client & Guardian Form',
    key: 'nav.clientGuardianForm',
    portal: 'docs',
    submodule: 'customer-form',
    href: '/dashboard/docs/customer-form',
  },
  docIndianVisa: {
    icon: 'Stamp',
    label: 'Indian Visa Submission',
    key: 'nav.indianVisaRecords',
    portal: 'docs',
    submodule: 'indian-visa',
    href: '/dashboard/docs/indian-visa',
  },
  docPassportSub: {
    icon: 'BookOpen',
    label: 'Passport Submission',
    key: 'nav.passportRecords',
    portal: 'docs',
    submodule: 'passport-sub',
    href: '/dashboard/docs/passport-sub',
  },
  docIdCard: {
    icon: 'Contact',
    label: 'Employee ID Card',
    key: 'nav.idCard',
    portal: 'docs',
    submodule: 'idcard',
    href: '/dashboard/docs/idcard',
  },
  docPayroll: {
    icon: 'Banknote',
    label: 'Monthly Salary Slip',
    key: 'nav.salarySlip',
    portal: 'docs',
    submodule: 'payroll',
    href: '/dashboard/docs/payroll',
  },
  docInvoice: {
    icon: 'ReceiptText',
    label: 'Invoice Billing',
    key: 'nav.invoice',
    portal: 'docs',
    submodule: 'invoice',
    href: '/dashboard/docs/invoice',
  },
  docMoneyReceipt: {
    icon: 'Receipt',
    label: 'Money Receipt Voucher',
    key: 'nav.moneyReceipt',
    portal: 'docs',
    submodule: 'money-receipt',
    href: '/dashboard/docs/money-receipt',
  },
  docCashVoucher: {
    icon: 'Wallet',
    label: 'Cash Money Voucher',
    key: 'nav.cashVoucher',
    portal: 'docs',
    submodule: 'cash-voucher',
    href: '/dashboard/docs/cash-voucher',
  },
  docExpCert: {
    icon: 'Award',
    label: 'Experience Certificate',
    key: 'nav.experienceCertificate',
    portal: 'docs',
    submodule: 'experience-certificate',
    href: '/dashboard/docs/experience-certificate',
  },
  docCharCert: {
    icon: 'ShieldCheck',
    label: 'Character Certificate',
    key: 'nav.characterCertificate',
    portal: 'docs',
    submodule: 'character-certificate',
    href: '/dashboard/docs/character-certificate',
  },
  docMarrCert: {
    icon: 'Heart',
    label: 'Marriage Certificate',
    key: 'nav.marriageCertificate',
    portal: 'docs',
    submodule: 'marriage-certificate',
    href: '/dashboard/docs/marriage-certificate',
  },

  // Data Records Center Items
  dataCustomerProfiles: {
    icon: 'Users',
    label: 'Client Profiles',
    key: 'nav.clientProfiles',
    portal: 'data',
    submodule: 'client-profiles',
    href: '/dashboard/data/client-profiles',
  },
  dataAgreements: {
    icon: 'FileSignature',
    label: 'Agreement Records',
    key: 'nav.agreementRecords',
    portal: 'data',
    submodule: 'agreements',
    href: '/dashboard/data/agreements',
  },
  dataCustomerApplications: {
    icon: 'UserCheck',
    label: 'Client Applications',
    key: 'nav.clientApplications',
    portal: 'data',
    submodule: 'client-applications',
    href: '/dashboard/data/client-applications',
  },
  dataIndianVisas: {
    icon: 'Stamp',
    label: 'Indian Visa Records',
    key: 'nav.indianVisaRecords',
    portal: 'data',
    submodule: 'indian-visas',
    href: '/dashboard/data/indian-visas',
  },
  dataPassports: {
    icon: 'BookOpen',
    label: 'Passport Submissions',
    key: 'nav.passportRecords',
    portal: 'data',
    submodule: 'passports',
    href: '/dashboard/data/passports',
  },
  dataSalarySlips: {
    icon: 'Banknote',
    label: 'Salary Slips',
    key: 'nav.salarySlipRecords',
    portal: 'data',
    submodule: 'salary-slips',
    href: '/dashboard/data/salary-slips',
  },
  dataInvoices: {
    icon: 'ReceiptText',
    label: 'Invoices & Billing',
    key: 'nav.invoiceRecords',
    portal: 'data',
    submodule: 'invoices',
    href: '/dashboard/data/invoices',
  },
};

/**
 * Role-specific navigation presets
 */
export const ROLE_NAVIGATION_PRESETS = {
  // ─── FRONTDESK ─────────────────────────────────────────────────────────────
  frontdesk: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'Building2',
            label: 'Clients',
            key: 'nav.clientsAndAccounts',
            portal: 'agency',
            childItems: [MASTER_ITEMS.clientsAll, MASTER_ITEMS.clientsAdd],
          },
          {
            icon: 'FileText',
            label: 'Document Studio',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docMoneyReceipt,
              MASTER_ITEMS.docCustomerForm,
              MASTER_ITEMS.docPassportSub,
              MASTER_ITEMS.docIndianVisa,
              MASTER_ITEMS.docAgreement,
            ],
          },
        ],
      },
      {
        groupLabel: 'Data Records Center',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataCustomerProfiles,
          MASTER_ITEMS.dataAgreements,
          MASTER_ITEMS.dataCustomerApplications,
          MASTER_ITEMS.dataIndianVisas,
          MASTER_ITEMS.dataPassports,
        ],
      },
    ],
  },

  // ─── ACCOUNTANT ────────────────────────────────────────────────────────────
  accountant: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'Building2',
            label: 'Clients & Billing',
            key: 'nav.clientsAndAccounts',
            portal: 'agency',
            childItems: [
              MASTER_ITEMS.clientsAll,
              MASTER_ITEMS.clientBills,
              MASTER_ITEMS.clientPayments,
            ],
          },
          {
            icon: 'FileText',
            label: 'Financial Documents',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docMoneyReceipt,
              MASTER_ITEMS.docCashVoucher,
              MASTER_ITEMS.docInvoice,
              MASTER_ITEMS.docPayroll,
            ],
          },
        ],
      },
      {
        groupLabel: 'Financial Records',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataInvoices,
          MASTER_ITEMS.dataSalarySlips,
          MASTER_ITEMS.dataCustomerProfiles,
        ],
      },
    ],
  },

  // ─── VISA PROCESSOR ────────────────────────────────────────────────────────
  visa_processor: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'FileText',
            label: 'Visa & Passport Studio',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docIndianVisa,
              MASTER_ITEMS.docPassportSub,
              MASTER_ITEMS.docCustomerForm,
              MASTER_ITEMS.docAgreement,
            ],
          },
        ],
      },
      {
        groupLabel: 'Processing Records',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataIndianVisas,
          MASTER_ITEMS.dataPassports,
          MASTER_ITEMS.dataCustomerApplications,
          MASTER_ITEMS.dataCustomerProfiles,
        ],
      },
    ],
  },

  // ─── LAWYER ────────────────────────────────────────────────────────────────
  lawyer: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'FileText',
            label: 'Legal Document Studio',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docAgreement,
              MASTER_ITEMS.docCustomerForm,
              MASTER_ITEMS.docExpCert,
              MASTER_ITEMS.docCharCert,
              MASTER_ITEMS.docMarrCert,
            ],
          },
        ],
      },
      {
        groupLabel: 'Legal Records',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataAgreements,
          MASTER_ITEMS.dataCustomerApplications,
          MASTER_ITEMS.dataCustomerProfiles,
        ],
      },
    ],
  },

  // ─── REPRESENTATIVE / CLIENT MANAGER ──────────────────────────────────────
  representative: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'Building2',
            label: 'Clients',
            key: 'nav.clientsAndAccounts',
            portal: 'agency',
            childItems: [MASTER_ITEMS.clientsAll, MASTER_ITEMS.clientsAdd],
          },
          {
            icon: 'FileText',
            label: 'Document Studio',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docCustomerForm,
              MASTER_ITEMS.docMoneyReceipt,
            ],
          },
        ],
      },
      {
        groupLabel: 'Records',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataCustomerProfiles,
          MASTER_ITEMS.dataCustomerApplications,
        ],
      },
    ],
  },

  // ─── DEFAULT / SUPER ADMIN / OWNER / MANAGER ──────────────────────────────
  admin: {
    defaultPortal: 'agency',
    defaultSubmodule: 'tasks',
    navGroups: [
      {
        groupLabel: '',
        groupKey: '',
        portal: 'agency',
        items: [
          MASTER_ITEMS.myTasks,
          MASTER_ITEMS.caseFiles,
          {
            icon: 'Building2',
            label: 'Clients & Accounts',
            key: 'nav.clientsAndAccounts',
            portal: 'agency',
            childItems: [
              MASTER_ITEMS.clientsAll,
              MASTER_ITEMS.clientsAdd,
              MASTER_ITEMS.clientBills,
              MASTER_ITEMS.clientPayments,
            ],
          },
          {
            icon: 'FileText',
            label: 'Document Studio',
            key: 'nav.docs',
            portal: 'docs',
            childItems: [
              MASTER_ITEMS.docHub,
              MASTER_ITEMS.docAgreement,
              MASTER_ITEMS.docCustomerForm,
              MASTER_ITEMS.docIndianVisa,
              MASTER_ITEMS.docPassportSub,
              MASTER_ITEMS.docIdCard,
              MASTER_ITEMS.docPayroll,
              MASTER_ITEMS.docInvoice,
              MASTER_ITEMS.docMoneyReceipt,
              MASTER_ITEMS.docCashVoucher,
              MASTER_ITEMS.docExpCert,
              MASTER_ITEMS.docCharCert,
              MASTER_ITEMS.docMarrCert,
            ],
          },
        ],
      },
      {
        groupLabel: 'Data Records Center',
        groupKey: 'nav.data',
        portal: 'data',
        items: [
          MASTER_ITEMS.dataCustomerProfiles,
          MASTER_ITEMS.dataAgreements,
          MASTER_ITEMS.dataCustomerApplications,
          MASTER_ITEMS.dataIndianVisas,
          MASTER_ITEMS.dataPassports,
          MASTER_ITEMS.dataSalarySlips,
          MASTER_ITEMS.dataInvoices,
        ],
      },
    ],
  },
};

/**
 * Normalizes user role key from auth object
 */
export function getRoleKey(user) {
  if (!user) return 'admin';
  const role = String(user.role || '').toLowerCase().trim();
  const subRole = String(user.subRole || user.sub_role || user.designation || '')
    .toLowerCase()
    .trim()
    .replace(/[-\s]/g, '_');

  if (role === 'staff') {
    if (subRole.includes('frontdesk')) return 'frontdesk';
    if (subRole.includes('account')) return 'accountant';
    if (subRole.includes('visa') || subRole.includes('processor')) return 'visa_processor';
    if (subRole.includes('lawyer') || subRole.includes('legal')) return 'lawyer';
    if (subRole.includes('rep') || subRole.includes('client') || subRole.includes('agent')) return 'representative';
    return 'frontdesk'; // Default staff fallback
  }

  return 'admin';
}

/**
 * Returns the exact navigation structure for any user dynamically
 */
export function getNavGroupsForUser(user) {
  const roleKey = getRoleKey(user);
  const preset = ROLE_NAVIGATION_PRESETS[roleKey] || ROLE_NAVIGATION_PRESETS.admin;
  return preset.navGroups;
}

/**
 * Returns default landing submodule for any user
 */
export function getDefaultSubmoduleForUser(user) {
  const roleKey = getRoleKey(user);
  const preset = ROLE_NAVIGATION_PRESETS[roleKey] || ROLE_NAVIGATION_PRESETS.admin;
  return preset.defaultSubmodule || 'tasks';
}

/**
 * Checks if a specific route is permitted for a user
 */
export function isRouteAllowedForUser(user, portal, submodule) {
  if (!user) return false;
  const roleKey = getRoleKey(user);
  if (roleKey === 'admin') return true;

  const preset = ROLE_NAVIGATION_PRESETS[roleKey];
  if (!preset) return true;

  // Check against permitted items in navGroups
  for (const group of preset.navGroups) {
    for (const item of group.items) {
      if (item.portal === portal && item.submodule === submodule) return true;
      if (item.childItems) {
        for (const child of item.childItems) {
          if (child.portal === portal && child.submodule === submodule) return true;
        }
      }
    }
  }

  // Common always-accessible utility routes (like user profile)
  if (portal === 'admin' && (submodule === 'profile' || submodule === 'account')) return true;

  return false;
}
