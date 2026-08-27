import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Standardized responsive container layout matching the 1440px - 1600px viewport specifications.
 * 
 * Viewport Scaling:
 * - Mobile (<640px): 100% width, padding 16px (px-4)
 * - Tablet (641px - 768px): padding 24px (px-6)
 * - Desktop (769px - 1280px): padding 32px (px-8)
 * - FHD / 1440p (1281px - 1536px): max-width 1440px (max-w-[1440px])
 * - Ultrawide / 2K / 4K (1600px+): max-width 1600px (3xl:max-w-[1600px])
 */
export function AppContainer({
  children,
  className = '',
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={cn(
        'w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default AppContainer;
