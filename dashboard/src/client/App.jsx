import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { usePortalStore } from './store/usePortalStore';
import { DashboardLayout } from '@shared/components/layout/DashboardLayout';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import DocumentStudio from './pages/DocumentStudio';
import DocumentData from './pages/DocumentData';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Overview from './pages/Overview';
import NotFoundPage from './pages/NotFoundPage';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AuthGuard({ children }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold font-sans">Booting secure session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const location = useLocation();
  const activePortal = usePortalStore((state) => state.activePortal);
  const setSearchOpen = usePortalStore((state) => state.setSearchOpen);
  const syncFromLocation = usePortalStore((state) => state.syncFromLocation);

  useEffect(() => {
    syncFromLocation(location.pathname);
  }, [location.pathname]);

  // Global Keyboard Shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const isKnownPortal = ['overview', 'docs', 'data', 'accounts', 'settings'].includes(activePortal);

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      header={<Header />}
      toasts={
        <>
          <ToastContainer />
          <Toaster />
        </>
      }
      modals={<GlobalSearchModal />}
    >
      {activePortal === 'overview' && <Overview />}
      {activePortal === 'docs' && <DocumentStudio />}
      {activePortal === 'data' && <DocumentData />}
      {activePortal === 'accounts' && <Accounts />}
      {activePortal === 'settings' && <Settings />}
      {!isKnownPortal && <NotFoundPage />}
    </DashboardLayout>
  );
}


export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client.html" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/client" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <MainLayout />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
