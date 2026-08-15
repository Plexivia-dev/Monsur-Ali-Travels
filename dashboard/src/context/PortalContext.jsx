import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PortalContext = createContext();

export const PortalProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to parse portal and submodule from URL pathname
  const getPortalFromPath = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    let portal = 'agency';
    let submodule = 'dashboard';

    if (parts[0] === 'dashboard') {
      if (parts[1]) portal = parts[1];
      if (parts[2]) submodule = parts[2];
    } else if (parts[0] && parts[0] !== 'login') {
      portal = parts[0];
      if (parts[1]) submodule = parts[1];
    }

    return { portal, submodule };
  };

  const parsed = getPortalFromPath(location.pathname);
  const [activePortal, setActivePortalState] = useState(parsed.portal);
  const [activeSubmodule, setActiveSubmoduleState] = useState(parsed.submodule);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  
  // Real notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, portal: 'factory', title: 'Coal Stock Alert', message: 'Coal level dropped below 20 Tons threshold (Currently 18.4 Tons).', time: '10 mins ago', unread: true, type: 'warning' },
    { id: 2, portal: 'factory', title: 'Batch #892 Complete', message: 'Daily molded brick batch #892 completed with 42,500 units.', time: '1 hour ago', unread: true, type: 'success' },
    { id: 3, portal: 'agency', title: 'Timesheet Approved', message: 'Client Apex Tech approved 12 contractor timesheets for Week 32.', time: '2 hours ago', unread: false, type: 'info' },
    { id: 4, portal: 'agency', title: 'Pending Placement', message: '3 candidates awaiting client confirmation for Logistics Hub.', time: '4 hours ago', unread: true, type: 'warning' },
    { id: 5, portal: 'admin', title: 'System Backup Complete', message: 'Automated database snapshot created successfully.', time: '12 hours ago', unread: false, type: 'info' }
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync state when browser URL location changes (e.g. back/forward buttons, direct entry)
  useEffect(() => {
    const { portal, submodule } = getPortalFromPath(location.pathname);
    if (location.pathname !== '/login') {
      setActivePortalState(portal);
      setActiveSubmoduleState(submodule);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const switchPortal = (portal, submodule = 'dashboard') => {
    setActivePortalState(portal);
    setActiveSubmoduleState(submodule);
    navigate(`/dashboard/${portal}/${submodule}`);
  };

  const setActiveSubmodule = (submodule) => {
    setActiveSubmoduleState(submodule);
    navigate(`/dashboard/${activePortal}/${submodule}`);
  };

  return (
    <PortalContext.Provider
      value={{
        activePortal,
        setActivePortal,
        activeSubmodule,
        setActiveSubmodule,
        switchPortal,
        searchOpen,
        setSearchOpen,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        notifications,
        markAllNotificationsRead,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
