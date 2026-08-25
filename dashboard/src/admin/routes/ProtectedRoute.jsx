import * as React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, ADMIN_ROLES } from '@/store/useAuthStore'
import { Spinner } from '@/components/ui/spinner'

export function ProtectedRoute({ allowedRoles = ADMIN_ROLES }) {
  const user = useAuth((state) => state.user)
  const isLoading = useAuth((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <span className="text-xs text-muted-foreground font-semibold font-sans">Booting secure session...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasAccess = allowedRoles.includes(user.role)
  if (!hasAccess) {
    // Redirect standard employees / unauthorized users to login
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
