import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/15 text-destructive border-destructive/20',
        danger: 'bg-destructive/15 text-destructive border-destructive/20',
        outline: 'border-border text-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground',
        success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
        info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant = 'default', ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export default Badge;
