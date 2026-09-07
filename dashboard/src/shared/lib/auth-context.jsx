import React, { useState, useEffect } from 'react';

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = (selector) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const state = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return typeof selector === 'function' ? selector(state) : state;
};

export default useAuth;
