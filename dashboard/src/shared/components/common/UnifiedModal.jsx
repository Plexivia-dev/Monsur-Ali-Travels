import React, { useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * UnifiedModalHeader
 * Renders the signature Dark Blue / Sky Indigo gradient modal header matching HeaderTitle.
 */
export function UnifiedModalHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  onClose,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  const resolvedSubtitle = subtitle || description;

  const renderIcon = (iconClass) => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'string') {
      const IconComponent = LucideIcons[Icon] || LucideIcons.Layers;
      return <IconComponent className={cn(iconClass, 'shrink-0')} />;
    }
    const IconComponent = Icon;
    return <IconComponent className={cn(iconClass, 'shrink-0')} />;
  };

  return (
    <div
      className={cn(
        'p-5 sm:p-6 border-b border-sky-800/40 relative z-10 select-none bg-transparent',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon & Title/Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="size-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 shadow-xs">
              {renderIcon('size-5 text-sky-400')}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className={cn(
                  'text-base sm:text-lg font-bold text-white tracking-tight',
                  titleClassName
                )}
              >
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {badge}
                </span>
              )}
            </div>
            {resolvedSubtitle && (
              <p
                className={cn(
                  'text-xs text-sky-200/70 mt-0.5 leading-relaxed truncate max-w-xl',
                  subtitleClassName
                )}
              >
                {resolvedSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/40 shadow-xs transition-all cursor-pointer shrink-0 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="size-4 text-rose-400 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * UnifiedModalFooter
 * Renders the modal action bar with cohesive dark glass aesthetics.
 */
export function UnifiedModalFooter({
  onCancel,
  cancelText = 'Cancel',
  cancelButton = null,
  showCancel = true,
  onSubmit,
  submitText = 'Confirm',
  loadingText,
  submitIcon: SubmitIcon = CheckCircle2,
  loading = false,
  disabled = false,
  submitButton = null,
  children,
  className = '',
}) {
  return (
    <div
      className={cn(
        'p-4 sm:px-6 sm:py-4 border-t border-sky-800/40 flex items-center justify-end gap-2.5 bg-slate-950/60 backdrop-blur-md relative z-10',
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          {showCancel &&
            (cancelButton || (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
            ))}

          {submitButton || (
            <button
              type={onSubmit ? 'button' : 'submit'}
              onClick={onSubmit}
              disabled={loading || disabled}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 hover:text-black transition-all cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50 select-none"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : SubmitIcon ? (
                React.isValidElement(SubmitIcon) ? (
                  SubmitIcon
                ) : (
                  <SubmitIcon className="size-4 shrink-0" />
                )
              ) : null}
              <span>{loading ? loadingText || submitText : submitText}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * UnifiedModal
 * Standardized, signature gradient modal for Monsur Ali Travels ERP.
 */
export function UnifiedModal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  icon,
  badge,
  children,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[92vh]',
  // Footer Props
  footer = null,
  onCancel,
  cancelText = 'Cancel',
  showCancel = true,
  onSubmit,
  submitText = 'Confirm',
  loadingText,
  submitIcon = CheckCircle2,
  loading = false,
  disabled = false,
  showFooter = true,
  // Custom class overrides
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={cn(
          'bg-linear-to-r from-sky-950 via-indigo-950 to-slate-950 rounded-2xl sm:rounded-3xl border border-sky-800/40 text-white shadow-2xl w-full flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200',
          maxWidth,
          maxHeight,
          className
        )}
      >
        {/* Decorative ambient background glows matching HeaderTitle */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <UnifiedModalHeader
          title={title}
          subtitle={subtitle || description}
          icon={icon}
          badge={badge}
          onClose={onClose}
          className={headerClassName}
        />

        {/* Content Body */}
        <div className={cn('p-6 overflow-y-auto flex-grow space-y-5 relative z-10', bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          footer || (
            <UnifiedModalFooter
              onCancel={onCancel || onClose}
              cancelText={cancelText}
              showCancel={showCancel}
              onSubmit={onSubmit}
              submitText={submitText}
              loadingText={loadingText}
              submitIcon={submitIcon}
              loading={loading}
              disabled={disabled}
            />
          )
        )}
      </div>
    </div>
  );
}

export default UnifiedModal;
