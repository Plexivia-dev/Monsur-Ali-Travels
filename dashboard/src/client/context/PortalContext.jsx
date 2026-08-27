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

  return {
    ...store,
    switchPortal: (portal, submodule = 'dashboard') => {
      store.switchPortal(portal, submodule);
      navigate(`/dashboard/${portal}/${submodule}`);
    },
    setActivePortal: (portal) => {
      store.setActivePortal(portal);
      navigate(`/dashboard/${portal}/${store.activeSubmodule}`);
    },
    setActiveSubmodule: (submodule) => {
      store.setActiveSubmodule(submodule);
      navigate(`/dashboard/${store.activePortal}/${submodule}`);
    },
  };
};
