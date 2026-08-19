import React from 'react';
import { usePortalStore } from '../../store/usePortalStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer = () => {
  const toasts = usePortalStore((state) => state.toasts);
  const removeToast = usePortalStore((state) => state.removeToast);

  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    danger: <XCircle className="w-4 h-4 text-destructive shrink-0" />,
    destructive: <XCircle className="w-4 h-4 text-destructive shrink-0" />,
    info: <Info className="w-4 h-4 text-primary shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between p-3.5 bg-card/95 backdrop-blur-xs border border-border rounded-xl shadow-lg animate-in slide-in-from-bottom-5 duration-200 text-xs"
        >
          <div className="flex items-center gap-2.5">
            {icons[toast.type] || icons.info}
            <span className="font-medium text-foreground">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
