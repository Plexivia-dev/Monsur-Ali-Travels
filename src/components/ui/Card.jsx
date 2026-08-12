import React from 'react';

export const Card = ({ children, className = '', id, onClick }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', icon: Icon }) => {
  return (
    <h3 className={`text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 rounded-b-xl flex items-center justify-between text-sm ${className}`}>
      {children}
    </div>
  );
};
