import React, { createContext, useContext, useState } from 'react';

const PortalContext = createContext();

export const PortalProvider = ({ children }) => {
  const [activePortal, setActivePortal] = useState('factory'); // 'factory' | 'agency' | 'docs' | 'admin'
  const [activeSubmodule, setActiveSubmodule] = useState('dashboard'); // 'dashboard', 'employees', 'bills', 'payments', 'reports', 'resume', 'certificate', 'invoice'
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
    setActivePortal(portal);
    setActiveSubmodule(submodule);
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
        markAllNotificationsRead
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
