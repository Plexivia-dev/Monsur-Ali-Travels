import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle, Compass } from 'lucide-react';
import { usePortalStore } from '../store/usePortalStore';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const switchPortal = usePortalStore((state) => state.switchPortal);

  const handleGoHome = () => {
    switchPortal('agency', 'tasks');
    navigate('/dashboard/agency/tasks');
  };

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 select-none">
      <div className="relative max-w-lg w-full text-center space-y-6 bg-card border border-border/80 p-8 sm:p-10 rounded-2xl shadow-xl shadow-black/5">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-1">
          <AlertCircle className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
            <Compass className="w-3.5 h-3.5" />
            Error 404 • Page Not Found
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lost Your Way?
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            The page or workspace module you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
