import React from 'react';
import { usePortal } from '../../context/PortalContext';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            📄 Document Studio
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              A4 Vector Print Ready
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, preview, and print high-resolution A4 Resumes, Character Certificates, and Invoices.
          </p>
        </div>
      </div>

      {/* Submodule View */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        {activeSubmodule === 'resume' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Resume & CV Builder</h2>
            <p className="text-sm text-muted-foreground">Resume Generator Module Loading...</p>
          </div>
        )}
        {activeSubmodule === 'certificate' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Character Certificate Generator</h2>
            <p className="text-sm text-muted-foreground">Character Certificate Module Loading...</p>
          </div>
        )}
        {activeSubmodule === 'invoice' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Invoice & Bill Generator</h2>
            <p className="text-sm text-muted-foreground">Invoice Generator Module Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
