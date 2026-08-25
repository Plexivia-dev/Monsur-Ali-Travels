import * as React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import DashboardHome from '@/pages/DashboardHome'
import WidgetCardPreview from '@/pages/WidgetCardPreview'
import DropdownPage from '@/pages/DropdownPage'
import DropdownProfilePage from '@/pages/DropdownProfilePage'
import DialogPage from '@/pages/DialogPage'
import { LoginPage } from '@/pages/LoginPage'
import VisaWorkflowsPage from '@/pages/VisaWorkflowsPage'
import CaseWorkflow from '@/pages/CaseWorkflow'
import CaseDetailPage from '@/pages/CaseDetailPage'
import ActivityLogsPage from '@/pages/ActivityLogsPage'
import TrashPage from '@/pages/system/TrashPage'
import StorageSyncPage from '@/pages/system/StorageSyncPage'
import ClientsPage from '@/pages/ClientsPage'
import UsersPage from '@/pages/UsersPage'
import SettingsPage from '@/pages/SettingsPage'
import DocumentStudioPage from '@/pages/DocumentStudioPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CashBook from '@/pages/accounting/CashBook'
import BankLedger from '@/pages/accounting/BankLedger'
import Expenses from '@/pages/accounting/Expenses'
import { PaymentsPage, BillsPage, ReportsPage } from '@shared/features/accounts'
import UnifiedTableShowcasePage from '@/pages/UnifiedTableShowcasePage'
import { GlobalErrorBoundary } from '@/components/layout/GlobalErrorBoundary'
import { useAuth } from '@/store/useAuthStore'
import { Toaster } from '@/components/ui/toast'

export default function App() {
  const fetchProfile = useAuth((state) => state.fetchProfile)

  React.useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      fetchProfile()
    }
  }, [fetchProfile])

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="docs" element={<DocumentStudioPage />} />
              <Route path="docs/:generator" element={<DocumentStudioPage />} />
              <Route path="document-studio" element={<Navigate to="/admin/docs" replace />} />
              <Route path="document-studio/:generator" element={<DocumentStudioPage />} />
              <Route path="metrics" element={<WidgetCardPreview />} />
              <Route path="dropdown" element={<DropdownPage />} />
              <Route path="profile-dropdown" element={<DropdownProfilePage />} />
              <Route path="dialog" element={<DialogPage />} />
              <Route path="datatable" element={<UnifiedTableShowcasePage />} />
              <Route path="tables" element={<UnifiedTableShowcasePage />} />
              <Route path="visa-workflows" element={<VisaWorkflowsPage />} />
              <Route path="visa-workflows/:id" element={<CaseDetailPage />} />
              <Route path="cases" element={<CaseWorkflow />} />
              <Route path="cases/:id" element={<CaseDetailPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="agency/clients" element={<ClientsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="agency/users" element={<UsersPage />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="system/activity-logs" element={<ActivityLogsPage />} />
              <Route path="system/logs" element={<ActivityLogsPage />} />
              <Route path="system-logs" element={<ActivityLogsPage />} />
              <Route path="system/trash" element={<TrashPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="system/storage" element={<StorageSyncPage />} />
              <Route path="storage" element={<StorageSyncPage />} />
              <Route path="system" element={<Navigate to="/admin/system/activity-logs" replace />} />
              
              <Route path="accounts/payments" element={<PaymentsPage />} />
              <Route path="accounts/bills" element={<BillsPage />} />
              <Route path="accounts/reports" element={<ReportsPage />} />
              <Route path="accounts/cash-book" element={<CashBook />} />
              <Route path="accounts/bank-ledger" element={<BankLedger />} />
              <Route path="accounts/expenses" element={<Expenses />} />

              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin.html" element={<Navigate to="/admin" replace />} />

          {/* Global Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications container */}
      <Toaster />
    </GlobalErrorBoundary>
  )
}

