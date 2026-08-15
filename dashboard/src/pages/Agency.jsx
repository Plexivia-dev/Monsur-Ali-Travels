import React from 'react';
import { usePortal } from '../context/PortalContext';
import { AgencyDashboard } from '../components/agency/AgencyDashboard';
import { AgencyEmployees } from '../components/agency/AgencyEmployees';
import { CandidateCaseFiles } from '../components/agency/CandidateCaseFiles';

export default function Agency() {
  const { activeSubmodule } = usePortal();

  switch (activeSubmodule) {
    case 'employees':
      return <AgencyEmployees />;
    case 'candidates':
      return <CandidateCaseFiles />;
    case 'dashboard':
    default:
      return <AgencyDashboard />;
  }
}
