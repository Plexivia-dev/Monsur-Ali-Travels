import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { usePortalStore } from './store/usePortalStore';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import Factory from './pages/Factory';
import Agency from './pages/Agency';
import Admin from './pages/Admin';
import DocumentStudio from './pages/DocumentStudio';
import DocumentData from './pages/DocumentData';
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

  // Sync URL changes with Zustand portal store
  useEffect(() => {
    syncFromLocation(location.pathname);
  }, [location.pathname, syncFromLocation]);

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

  const isKnownPortal = ['factory', 'agency', 'admin', 'docs', 'data'].includes(activePortal);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Application Inset */}
        <SidebarInset className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden bg-background">
          {/* Modern Sticky Header (Fixed 56px / h-14 height) */}
          <Header />

          {/* Dynamic Portal View Container (Height strictly 100vh - 56px navbar, scrollable internally) */}
          <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {activePortal === 'factory' && <Factory />}
            {activePortal === 'agency' && <Agency />}
            {activePortal === 'admin' && <Admin />}
            {activePortal === 'docs' && <DocumentStudio />}
            {activePortal === 'data' && <DocumentData />}
            {!isKnownPortal && <NotFoundPage />}
          </main>

          {/* Global Utilities */}
          <ToastContainer />
          <Toaster />
          <GlobalSearchModal />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
