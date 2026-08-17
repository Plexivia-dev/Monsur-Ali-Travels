import React from 'react';
import { usePortal } from '../context/PortalContext';
import { AgencyDashboard } from '../components/agency/AgencyDashboard';
import { AgencyEmployees } from '../components/agency/AgencyEmployees';
import { CandidateCaseFiles } from '../components/agency/CandidateCaseFiles';
import { ClientManagement } from '../components/agency/ClientManagement';

export default function Agency() {
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
}

