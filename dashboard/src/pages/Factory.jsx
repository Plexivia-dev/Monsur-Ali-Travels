import React from 'react';
import { usePortal } from '../context/PortalContext';
import { FactoryDashboard } from '../components/factory/FactoryDashboard';
import { FactoryEmployees } from '../components/factory/FactoryEmployees';
import { FactoryBills } from '../components/factory/FactoryBills';
import { FactoryPayments } from '../components/factory/FactoryPayments';
import { FactoryReports } from '../components/factory/FactoryReports';

export default function Factory() {
  const { activeSubmodule } = usePortal();

  switch (activeSubmodule) {
    case 'employees':
      return <FactoryEmployees />;
    case 'bills':
      return <FactoryBills />;
    case 'payments':
      return <FactoryPayments />;
    case 'reports':
      return <FactoryReports />;
    case 'dashboard':
    default:
      return <FactoryDashboard />;
  }
}
