import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, size = 'default', ...props }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card bg-card text-card-foreground border border-black/10 flex flex-col gap-4 overflow-hidden rounded-xl p-5 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-colors',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex items-center justify-between gap-2 pb-1',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, icon: Icon, children, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-base font-semibold text-foreground flex items-center gap-2', className)}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-primary shrink-0 inline-flex" />}
      {children}
    </div>
  );
}

function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-xs', className)} {...props} />;
}

function CardAction({ className, ...props }) {
  return <div data-slot="card-action" className={cn('flex items-center gap-2', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center pt-3 border-t border-border', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
export default Card;
