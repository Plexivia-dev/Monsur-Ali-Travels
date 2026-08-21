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
import ActivityLogsPage from '@/pages/ActivityLogsPage'
import Accounting from '@/pages/Accounting'
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
    <>
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
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="accounting" element={<Accounting />} />
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications container */}
      <Toaster />
    </>
  )
}
