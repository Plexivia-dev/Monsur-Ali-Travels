import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { PaymentsPage, BillsPage, ReportsPage } from '../../shared/features/accounts';

export default function Accounts() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  switch (activeSubmodule) {
    case 'payments':
      return <PaymentsPage />;
    case 'bills':
      return <BillsPage />;
    case 'reports':
    default:
      return <ReportsPage />;
  }
}
