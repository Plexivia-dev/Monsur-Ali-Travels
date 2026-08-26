import * as React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuthStore';
import { useSocketNotification } from '@/hooks/useSocketNotification';
import { Toaster } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@shared/components/layout/DashboardLayout';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Activate real-time socket notification listener
  useSocketNotification();

  const [lang, setLang] = React.useState('EN');
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <DashboardLayout
        sidebar={
          <AdminSidebar
            lang={lang}
            onOpenLogoutConfirm={() => setShowLogoutConfirm(true)}
          />
        }
        header={<AdminHeader lang={lang} setLang={setLang} />}
        toasts={<Toaster />}
      >
        <Outlet context={{ lang }} />
      </DashboardLayout>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-foreground">
              {'Confirm Sign Out'}
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              {lang === 'BN'
                ? 'Are you sure you want to sign out of the Admin Panel?'
                : 'Are you sure you want to log out of the admin panel?'}
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="cursor-pointer"
              >
                {lang === 'BN' ? 'Rejected' : 'Cancel'}
              </Button>
              <Button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm cursor-pointer"
              >
                {lang === 'BN' ? 'Logout' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
