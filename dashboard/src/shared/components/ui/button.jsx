import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        outline:
          'border-black/10 bg-white text-black hover:bg-black/[0.03] hover:text-black aria-expanded:bg-black/[0.03] aria-expanded:text-black shadow-xs',
        secondary:
          'bg-black/[0.04] text-black aria-expanded:bg-black/[0.04] aria-expanded:text-black hover:bg-black/[0.08]',
        ghost:
          'hover:bg-black/[0.04] text-black hover:text-black aria-expanded:bg-black/[0.04] aria-expanded:text-black',
        destructive:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        danger:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        error:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        delete:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        cancel:
          'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-xs cursor-pointer',
        close:
          'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-xs cursor-pointer',
        previous:
          'bg-black/[0.04] text-black hover:bg-black/[0.08] border border-black/15 shadow-xs cursor-pointer font-semibold',
        back:
          'bg-black/[0.04] text-black hover:bg-black/[0.08] border border-black/15 shadow-xs cursor-pointer font-semibold',
        warning:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        reset:
          'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        success:
          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
        info:
          'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
        link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
      },
      size: {
        default: 'h-9 gap-1.5 px-4 text-xs font-semibold rounded-xl',
        xs: 'h-6 gap-1 rounded-md px-2 text-[11px]',
        sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs font-medium',
        lg: 'h-10 gap-2 rounded-xl px-5 text-sm font-bold',
        icon: 'size-9 rounded-xl',
        'icon-xs': 'size-6 rounded-md',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Unified Button — use across all dashboards.
 *
 * Props:
 *   variant      — primary | secondary | reset | success | info | destructive |
 *                  cancel | outline | ghost | link | delete | danger | warning
 *   size         — default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
 *   icon         — Lucide icon component (optional)
 *   iconPosition — 'left' (default) | 'right'
 *
 * Examples:
 *   <Button variant="primary" icon={Save}>Save</Button>
 *   <Button variant="reset" icon={RefreshCw}>Reset</Button>
 *   <Button variant="success" icon={CheckCircle2}>Confirm</Button>
 *   <Button variant="info" size="sm">Learn More</Button>
 *   <Button variant="cancel">Cancel</Button>
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  children,
  ...props
}) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon />}
      {children}
      {Icon && iconPosition === 'right' && <Icon />}
    </button>
  );
}

export { Button, buttonVariants };
export default Button;
