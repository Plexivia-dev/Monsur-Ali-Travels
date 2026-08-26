import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { AgencyEmployees } from '../components/agency/AgencyEmployees';
import { ClientDataTable } from '../components/data/ClientDataTable';
import { InvoiceDataTable } from '../components/data/InvoiceDataTable';
import { CaseFileTracker } from '../components/agency/CaseFileTracker';

export default function Agency() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  switch (activeSubmodule) {
    // ── Case Files / Client Files (Master Workflow Tracker) ────
    case 'cases':
    case 'client-files':
    case 'case-files':
      return <CaseFileTracker />;

    // ── Employees ─────────────────────────────────────────────
    case 'employees':
      return <AgencyEmployees />;

    // ── Client Invoices & Bills ────────────────────────────────
    case 'bills':
    case 'invoices':
      return <InvoiceDataTable />;

    // ── Clients & Accounts (Live Database Records) ───────────
    case 'clients':
    case 'clients-all':
    case 'all-clients':
    case 'clients-add':
    case 'add-client':
    case 'payments':
    case 'clients-payments':
    default:
      return <ClientDataTable activeSubmodule={activeSubmodule} />;
  }
}
