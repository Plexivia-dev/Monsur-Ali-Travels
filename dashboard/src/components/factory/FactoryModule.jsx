import { usePortalStore } from '../../store/usePortalStore';
import { FactoryDashboard } from './FactoryDashboard';
import { FactoryEmployees } from './FactoryEmployees';
import { FactoryBills } from './FactoryBills';
import { FactoryPayments } from './FactoryPayments';
import { FactoryReports } from './FactoryReports';

export const FactoryModule = () => {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

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
};
