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
import ActivityLogsPage from '@/pages/ActivityLogsPage'
import TrashPage from '@/pages/system/TrashPage'
import Reports from '@/pages/accounting/Reports'
import Payments from '@/pages/reports/Payments'
import Bills from '@/pages/reports/Bills'
import Logs from '@/pages/accounting/Logs'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'
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
              <Route path="metrics" element={<WidgetCardPreview />} />
              <Route path="dropdown" element={<DropdownPage />} />
              <Route path="profile-dropdown" element={<DropdownProfilePage />} />
              <Route path="dialog" element={<DialogPage />} />
              <Route path="visa-workflows" element={<VisaWorkflowsPage />} />
              <Route path="cases" element={<CaseWorkflow />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="system/activity-logs" element={<ActivityLogsPage />} />
              <Route path="system/logs" element={<ActivityLogsPage />} />
              <Route path="system-logs" element={<ActivityLogsPage />} />
              <Route path="system/trash" element={<TrashPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="system" element={<Navigate to="/admin/system/activity-logs" replace />} />
              <Route path="reports" element={<Navigate to="/admin/reports/payments" replace />} />
              <Route path="reports/payments" element={<Payments />} />
              <Route path="reports/bills" element={<Bills />} />
              <Route path="accounting" element={<Navigate to="/admin/reports/payments" replace />} />
              <Route path="accounting/reports" element={<Reports />} />
              <Route path="accounting/payments" element={<Payments />} />
              <Route path="accounting/bills" element={<Bills />} />
              <Route path="accounting/logs" element={<Logs />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Global Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications container */}
      <Toaster />
    </GlobalErrorBoundary>
  )
}

