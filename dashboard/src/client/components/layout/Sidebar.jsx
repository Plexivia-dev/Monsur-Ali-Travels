import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePortalStore } from '../../store/usePortalStore';
import { useAuthStore } from '../../store/useAuthStore';
import { UnifiedSidebar } from '@shared/components/layout/UnifiedSidebar';
import clientMenuConfig from '../../configs/clientSidebarMenu.json';
import logoImg from '../../assets/logo.png';
import { APP_VERSION } from '../../configs/appConfig';

export const Sidebar = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const activePortal = usePortalStore((state) => state.activePortal);
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const currentLang = (i18n.language || 'en').toUpperCase().startsWith('BN') ? 'BN' : 'EN';

  const activeChecker = React.useCallback((item) => {
    if (item.portal && item.submodule) {
      return activePortal === item.portal && activeSubmodule === item.submodule;
    }
    return false;
  }, [activePortal, activeSubmodule]);

  const handleItemSelect = (item) => {
    if (item.portal && item.submodule) {
      switchPortal(item.portal, item.submodule);
      navigate(`/dashboard/${item.portal}/${item.submodule}`);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <UnifiedSidebar
      menuGroups={clientMenuConfig}
      activeChecker={activeChecker}
      onItemSelect={handleItemSelect}
      brandTitle="Monsur Ali Travels"
      brandSubtitle={`Smart ERP v${APP_VERSION}`}
      logo={logoImg}
      user={user}
      onLogout={logout}
      onProfileClick={() => {
        switchPortal('admin', 'profile');
        navigate('/dashboard/admin/profile');
      }}
      lang={currentLang}
    />
  );
};

export default Sidebar;
