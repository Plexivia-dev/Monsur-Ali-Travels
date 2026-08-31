import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card with White Background */}
      <div className={`relative w-full ${maxWidth} bg-white text-black border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-10 transition-all transform animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.02]">
          <h3 className="text-base font-bold text-black">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto text-black">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/[0.02] border-t border-black/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
