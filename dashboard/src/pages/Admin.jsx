import React from 'react';
import { usePortal } from '../context/PortalContext';
import { useAdminData } from '../api/hooks';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminActivityLog } from '../components/admin/AdminActivityLog';
import { AdminReports } from '../components/admin/AdminReports';

export default function Admin() {
  const { activeSubmodule, addToast } = usePortal();
  const { data: adminData, isLoading, error } = useAdminData();

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse space-y-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center mx-auto">
          <span className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-semibold">Loading Admin Telemetry...</p>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20 my-4">
        Failed to load Admin telemetry. Please retry or contact technical support.
      </div>
    );
  }

  switch (activeSubmodule) {
    case 'activity':
    case 'audit':
      return <AdminActivityLog adminData={adminData} addToast={addToast} />;
    case 'reports':
    case 'finance':
      return <AdminReports adminData={adminData} addToast={addToast} />;
    case 'overview':
    case 'dashboard':
    default:
      return <AdminOverview adminData={adminData} addToast={addToast} />;
  }
}
