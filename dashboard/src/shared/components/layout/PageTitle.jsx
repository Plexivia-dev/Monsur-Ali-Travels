import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Universal PageTitle banner component.
 * 
 * Design Specs:
 * - Gradient background: from-sky-900 via-indigo-900 to-slate-900
 * - Rounded-2xl with border-sky-800/40 and shadow-xl
 * - No eyebrow / short text before heading (as per design requirement)
 * - Main Title: Icon (text-sky-400) + Bold Heading (text-xl sm:text-2xl font-black text-white)
 * - Description: Clean text below heading (text-xs sm:text-sm text-sky-100/80 leading-relaxed)
 * - Right Actions: Flexible actions slot (e.g., Refresh button, Create buttons, filters)
 */
export function PageTitle({
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  children,
  badge,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}) {
  const resolvedDescription = description || subtitle;

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'string') {
      const IconComponent = LucideIcons[Icon] || LucideIcons.FileText;
      return <IconComponent className="w-6 h-6 text-sky-400 shrink-0" />;
    }
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon;
    return <IconComponent className="w-6 h-6 text-sky-400 shrink-0" />;
  };

  const actionElements = actions || children;

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden transition-all select-none',
        className
      )}
    >
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Heading & Description (No eyebrow short text) */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className={cn(
                'text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5',
                titleClassName
              )}
            >
              {renderIcon()}
              <span className="truncate">{title}</span>
            </h1>
            {badge && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {badge}
              </span>
            )}
          </div>

          {resolvedDescription && (
            <p
              className={cn(
                'text-xs sm:text-[13px] text-sky-100/80 max-w-3xl leading-relaxed',
                descriptionClassName
              )}
            >
              {resolvedDescription}
            </p>
          )}
        </div>

        {/* Right: Actions Container */}
        {actionElements && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actionElements}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageTitle;
