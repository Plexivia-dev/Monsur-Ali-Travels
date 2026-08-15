import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { AgencyDashboard } from './AgencyDashboard';
import { AgencyEmployees } from './AgencyEmployees';
import { CandidateCaseFiles } from './CandidateCaseFiles';

export const AgencyModule = () => {
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
};
