import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { AgencyDashboard } from './AgencyDashboard';
import { AgencyEmployees } from './AgencyEmployees';
import { CandidateCaseFiles } from './CandidateCaseFiles';
import { ClientManagement } from './ClientManagement';

export const AgencyModule = () => {
  const { activeSubmodule } = usePortal();

  switch (activeSubmodule) {
    case 'employees':
      return <AgencyEmployees />;
    case 'candidates':
      return <CandidateCaseFiles />;
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
    default:
      return <AgencyDashboard />;
  }
};

