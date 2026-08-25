import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import {
  PaymentsPage,
  BillsPage,
  SalarySlipsPage,
  ExpensesPage,
  CashBookPage,
  BankLedgerPage,
  ReportsPage,
} from '../../shared/features/accounts';

export default function Accounts() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  switch (activeSubmodule) {
    case 'payments':
      return <PaymentsPage />;
    case 'bills':
      return <BillsPage />;
    case 'salaries':
      return <SalarySlipsPage />;
    case 'expenses':
      return <ExpensesPage />;
    case 'cash-book':
      return <CashBookPage />;
    case 'bank-ledger':
      return <BankLedgerPage />;
    case 'reports':
    default:
      return <ReportsPage />;
  }
}

