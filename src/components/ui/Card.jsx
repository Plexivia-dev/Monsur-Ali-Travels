import React from 'react';

export const Card = ({ children, className = '', id, onClick }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-xs transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-5 pb-3 border-b border-border flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', icon: Icon }) => {
  return (
    <h3 className={`text-base font-semibold text-foreground flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-primary" />}
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-4 bg-muted/30 border-t border-border rounded-b-xl flex items-center justify-between text-sm ${className}`}>
      {children}
    </div>
  );
};
