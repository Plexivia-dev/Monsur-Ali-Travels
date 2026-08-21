import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { useAuthStore } from '../store/useAuthStore';
import { AgencyEmployees } from '../components/agency/AgencyEmployees';
import { CandidateCaseFiles } from '../components/agency/CandidateCaseFiles';
import { ClientManagement } from '../components/agency/ClientManagement';
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

    // ── Case Files (Candidates) ────────────────────────────────
    case 'cases':
    case 'candidates':
    case 'candidates-all':
    case 'candidates-add':
      return <CandidateCaseFiles initialTab={activeSubmodule} />;

    // ── Clients & Accounts ────────────────────────────────────
    case 'clients':
    case 'clients-all':
    case 'all-clients':
    case 'clients-add':
    case 'add-client':
    case 'bills':
    case 'payments':
    case 'clients-payments':
      return <ClientManagement initialTab={activeSubmodule} />;

    // ── Default / Fallback → My Tasks ─────────────────────────
    case 'dashboard':
    case 'reports':
    case 'overview':
    default:
      return <MyTasks />;
  }
}
