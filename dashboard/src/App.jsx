import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { PortalProvider, usePortal } from './context/PortalContext';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import Factory from './pages/Factory';
import Agency from './pages/Agency';
import Admin from './pages/Admin';
import DocumentStudio from './pages/DocumentStudio';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { Toaster } from 'sonner';
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
  const { user, isLoading } = useAuth();

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
  const { activePortal, setSearchOpen, isSidebarOpen } = usePortal();

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

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Dynamic Portal View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/dashboard/agency/*" element={<Agency />} />
            <Route path="/dashboard/docs/*" element={<DocumentStudio />} />
            <Route path="/dashboard/factory/*" element={<Factory />} />
            <Route path="/dashboard/admin/*" element={<Admin />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/agency/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/dashboard/agency/dashboard" replace />} />
            <Route
              path="*"
              element={
                activePortal === 'factory' ? <Factory /> :
                activePortal === 'docs' ? <DocumentStudio /> :
                activePortal === 'admin' ? <Admin /> : <Agency />
              }
            />
          </Routes>
        </main>
      </div>

      {/* Global Utilities */}
      <ToastContainer />
      <Toaster richColors position="top-right" />
      <GlobalSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <PortalProvider>
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
            </PortalProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
