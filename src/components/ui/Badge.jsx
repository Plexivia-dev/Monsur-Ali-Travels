import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
    neutral: 'bg-muted text-foreground border-border'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
