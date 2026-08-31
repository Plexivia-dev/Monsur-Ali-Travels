import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default:
          'bg-black/[0.04] text-black border-black/15',
        primary:
          'bg-sky-50 text-sky-800 border-sky-300',
        secondary:
          'bg-black/[0.04] text-black border-black/15',
        destructive:
          'bg-rose-50 text-rose-800 border-rose-300',
        danger:
          'bg-rose-50 text-rose-800 border-rose-300',
        error:
          'bg-rose-50 text-rose-800 border-rose-300',
        warning:
          'bg-amber-50 text-amber-900 border-amber-300',
        cancel:
          'bg-rose-50 text-rose-800 border-rose-300',
        delete:
          'bg-rose-50 text-rose-800 border-rose-300',
        outline:
          'border-black/15 text-black bg-white',
        ghost:
          'hover:bg-black/[0.04] text-black/70 hover:text-black border-transparent',
        success:
          'bg-emerald-50 text-emerald-800 border-emerald-300',
        info:
          'bg-sky-50 text-sky-800 border-sky-300',
        indigo:
          'bg-indigo-50 text-indigo-800 border-indigo-300',
        purple:
          'bg-purple-50 text-purple-800 border-purple-300',
        pending:
          'bg-amber-50 text-amber-900 border-amber-300',
        in_progress:
          'bg-sky-50 text-sky-800 border-sky-300',
        done:
          'bg-emerald-50 text-emerald-800 border-emerald-300',
        approved:
          'bg-teal-50 text-teal-800 border-teal-300',
        rejected:
          'bg-rose-50 text-rose-800 border-rose-300',
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
