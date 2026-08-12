import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  id
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-primary hover:opacity-90 active:opacity-100 text-primary-foreground shadow-xs focus:ring-ring',
    secondary: 'bg-secondary hover:opacity-90 text-secondary-foreground focus:ring-ring',
    outline: 'border border-border hover:bg-muted text-foreground focus:ring-ring',
    ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground focus:ring-ring',
    danger: 'bg-destructive hover:opacity-90 text-destructive-foreground focus:ring-ring',
    success: 'bg-emerald-600 hover:opacity-90 text-white focus:ring-ring'
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
};
