import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { AgencyDashboard } from './AgencyDashboard';
import { AgencyEmployees } from './AgencyEmployees';

export const AgencyModule = () => {
  const { activeSubmodule } = usePortal();

  switch (activeSubmodule) {
    case 'employees':
      return <AgencyEmployees />;
    case 'dashboard':
    default:
      return <AgencyDashboard />;
  }
};
