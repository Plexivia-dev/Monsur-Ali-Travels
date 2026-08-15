import React from 'react';

/**
 * PrintablePaper wrapper component enforcing standard A4 paper dimensions
 * (210mm x 297mm in print mode, ~850px x 1120px in display mode).
 */
export function PrintablePaper({ children, className = '', id = 'printable-document-canvas' }) {
  return (
    <div className="w-full flex justify-center py-2 sm:py-4 no-print-padding">
      <div
        id={id}
        className={`printable-a4-paper bg-white text-slate-900 shadow-2xl rounded-sm w-full max-w-[850px] min-h-[1120px] p-8 sm:p-10 transition-all print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none ${className}`}
        style={{ color: '#111827' }}
      >
        {children}
      </div>
    </div>
  );
}
