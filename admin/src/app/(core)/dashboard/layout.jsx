import { AppSidebar } from '@/components/core/dashboard/app-sidebar';
import { Header } from '@/components/core/dashboard/header';
import { ClientSidebarProvider } from '@/components/core/dashboard/client-sidebar-provider';
import { AuthGuard } from '@/components/core/auth-guard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <ClientSidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
      </ClientSidebarProvider>
    </AuthGuard>
  );
}
