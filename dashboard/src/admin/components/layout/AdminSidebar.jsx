import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuthStore';
import { UnifiedSidebar } from '@shared/components/layout/UnifiedSidebar';
import adminMenuConfig from '@/configs/adminSidebarMenu.json';
import logoImg from '@/assets/logo.png';

export function AdminSidebar({ lang = 'EN', onOpenLogoutConfirm }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeChecker = React.useCallback((item) => {
    if (!item.path) return false;
    if (item.path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path);
  }, [location.pathname]);

  const handleItemSelect = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <UnifiedSidebar
      menuGroups={adminMenuConfig}
      activeChecker={activeChecker}
      onItemSelect={handleItemSelect}
      brandTitle="Monsur Ali Travels"
      brandSubtitle="Admin Panel v3.3.0"
      logo={logoImg}
      user={user}
      onLogout={onOpenLogoutConfirm}
      onProfileClick={() => navigate('/admin/settings')}
      lang={lang}
    />
  );
}

export default AdminSidebar;
