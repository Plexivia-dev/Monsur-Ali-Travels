import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { useAuthStore } from '../store/useAuthStore';
import { AgencyEmployees } from '../components/agency/AgencyEmployees';
import { ClientCaseFiles } from '../components/agency/ClientCaseFiles';
import { ClientManagement } from '../components/agency/ClientManagement';
import { ClientDataTable } from '../components/data/ClientDataTable';
import { InvoiceDataTable } from '../components/data/InvoiceDataTable';
import { ClientKanbanBoard } from '../components/agency/ClientKanbanBoard';
import { isRouteAllowedForUser } from '../configs/roleNavConfig';
import MyTasks from './MyTasks';

export default function Agency() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const user = useAuthStore((state) => state.user);

  // Dynamic Route Guard: check if current route is allowed for the user's role
  const isAllowed = isRouteAllowedForUser(user, 'agency', activeSubmodule);
  if (!isAllowed && activeSubmodule !== 'tasks' && activeSubmodule !== 'my-tasks') {
    return <MyTasks />;
  }

  switch (activeSubmodule) {
    // ── Operational Tasks ─────────────────────────────────────
    case 'tasks':
    case 'my-tasks':
      return <MyTasks />;

    // ── Employees ─────────────────────────────────────────────
    case 'employees':
      return <AgencyEmployees />;

    // ── Case Files (Clients) ────────────────────────────────
    case 'cases':
    case 'clients':
    case 'clients-all':
    case 'clients-add':
      return <ClientCaseFiles initialTab={activeSubmodule} />;

    // ── Client Kanban Board ──────────────────────────────────
    case 'pipeline':
    case 'board':
    case 'kanban':
      return <ClientKanbanBoard />;

    // ── Clients & Accounts (Live Database Records) ───────────
    case 'clients':
    case 'clients-all':
    case 'all-clients':
    case 'clients-add':
    case 'add-client':
    case 'payments':
    case 'clients-payments':
      return <ClientDataTable />;

    // ── Client Invoices & Bills ────────────────────────────────
    case 'bills':
    case 'invoices':
      return <InvoiceDataTable />;

    // ── Default / Fallback → My Tasks ─────────────────────────
    case 'dashboard':
    case 'reports':
    case 'overview':
    default:
      return <MyTasks />;
  }
}
