import React, { useEffect } from 'react';
import { useAuth } from '@/lib/core/auth-context';

export function AuthGuard({ children }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold font-sans">Booting secure session...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
