import React from 'react';
import { SharedLoginPage } from '@shared/components/auth/SharedLoginPage';
import { useAuth } from '@/lib/auth-context';
import logo from '../assets/logo.png';

export function LoginPage() {
  return (
    <SharedLoginPage
      portalType="client"
      portalTitle="Operations & Staff Workspace Portal"
      logoSrc={logo}
      useAuthHook={useAuth}
    />
  );
}

export default LoginPage;
