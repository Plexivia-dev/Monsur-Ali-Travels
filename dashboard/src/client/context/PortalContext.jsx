import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortalStore } from '../store/usePortalStore';

export const PortalProvider = ({ children }) => {
  const location = useLocation();
  const syncFromLocation = usePortalStore((state) => state.syncFromLocation);

  useEffect(() => {
    syncFromLocation(location.pathname);
  }, [location.pathname, syncFromLocation]);

  return <>{children}</>;
};

export const usePortal = () => {
  const store = usePortalStore();
  const navigate = useNavigate();
  const location = useLocation();

  return {
    ...store,
    switchPortal: (portal, submodule = 'dashboard') => {
      store.switchPortal(portal, submodule);
      if (location.pathname.startsWith('/admin')) {
        if (portal === 'docs') {
          navigate(`/admin/docs/${submodule}`);
        } else if (portal === 'data') {
          navigate(`/admin/data/${submodule}`);
        } else if (portal === 'accounts') {
          navigate(`/admin/accounts/${submodule}`);
        } else {
          navigate(`/admin/${submodule}`);
        }
      } else {
        navigate(`/dashboard/${portal}/${submodule}`);
      }
    },
    setActivePortal: (portal) => {
      store.setActivePortal(portal);
      if (location.pathname.startsWith('/admin')) {
        navigate(`/admin/${portal}`);
      } else {
        navigate(`/dashboard/${portal}/${store.activeSubmodule}`);
      }
    },
    setActiveSubmodule: (submodule) => {
      store.setActiveSubmodule(submodule);
      if (location.pathname.startsWith('/admin')) {
        navigate(`/admin/${store.activePortal}/${submodule}`);
      } else {
        navigate(`/dashboard/${store.activePortal}/${submodule}`);
      }
    },
  };
};
