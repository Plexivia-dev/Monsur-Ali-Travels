import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  return useAuthStore();
};
