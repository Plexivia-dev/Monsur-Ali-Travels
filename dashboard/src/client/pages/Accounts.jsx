import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortalStore } from '../store/usePortalStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  PaymentsPage,
  BillsPage,
  SalarySlipsPage,
  ExpensesPage,
  CashBookPage,
  BankLedgerPage,
  ReportsPage,
} from '../../shared/features/accounts';

const ALLOWED_ROLES = ['owner', 'superadmin', 'accountant', 'accounts'];

export default function Accounts() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const user = useAuthStore((state) => state.user);

  const userRole = String(user?.role || '').toLowerCase();
  const userSubRole = String(user?.subRole || user?.sub_role || user?.designation || '').toLowerCase();

  const isAuthorized = ALLOWED_ROLES.includes(userRole) || ALLOWED_ROLES.includes(userSubRole);

  if (!isAuthorized) {
    return <Navigate to="/dashboard/overview" replace />;
  }

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

