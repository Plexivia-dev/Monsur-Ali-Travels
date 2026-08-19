import React from 'react';
import { usePortalStore } from '../../store/usePortalStore';
import { AgencyDashboard } from './AgencyDashboard';
import { AgencyEmployees } from './AgencyEmployees';
import { CandidateCaseFiles } from './CandidateCaseFiles';
import { ClientManagement } from './ClientManagement';

export const AgencyModule = () => {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  switch (activeSubmodule) {
    case 'employees':
      return <AgencyEmployees />;
    case 'candidates':
    case 'candidates-all':
    case 'candidates-add':
    case 'cases':
      return <CandidateCaseFiles initialTab={activeSubmodule} />;
    case 'clients':
    case 'clients-add':
    case 'add-client':
    case 'all-clients':
    case 'clients-all':
    case 'bills':
    case 'clients-payments':
    case 'payments':
      return <ClientManagement initialTab={activeSubmodule} />;
    case 'dashboard':
    case 'reports':
    default:
      return <AgencyDashboard />;
  }
};
