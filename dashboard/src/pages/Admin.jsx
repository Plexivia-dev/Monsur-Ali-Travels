import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { useAdminData } from '../api/hooks';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminActivityLog } from '../components/admin/AdminActivityLog';
import { AdminReports } from '../components/admin/AdminReports';
import { UserProfilePage } from '../components/profile/UserProfilePage';

export default function Admin() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const addToast = usePortalStore((state) => state.addToast);
  const { data: adminData, isLoading, error } = useAdminData();

  if (activeSubmodule === 'profile' || activeSubmodule === 'account') {
    return <UserProfilePage />;
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse space-y-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
          <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-semibold">Loading Admin Telemetry...</p>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl border border-destructive/20 my-4">
        Failed to load Admin telemetry. Please retry or contact technical support.
      </div>
    );
  }

  switch (activeSubmodule) {
    case 'activity':
    case 'audit':
    case 'system-logs':
      return <AdminActivityLog adminData={adminData} addToast={addToast} />;
    case 'reports':
    case 'finance':
      return <AdminReports adminData={adminData} addToast={addToast} />;
    case 'users':
    case 'overview':
    case 'dashboard':
    default:
      return <AdminOverview adminData={adminData} addToast={addToast} />;
  }
}
