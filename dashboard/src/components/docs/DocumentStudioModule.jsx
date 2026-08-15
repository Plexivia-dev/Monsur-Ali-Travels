import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { ResumeBuilder } from './resume/ResumeBuilder';
import { CertificateBuilder } from './certificate/CertificateBuilder';
import { InvoiceBuilder } from './invoice/InvoiceBuilder';
import { TemplateStudio } from './templates/TemplateStudio';
import { FileText, Award, Receipt, FileCheck } from 'lucide-react';

export function DocumentStudioModule() {
  const { activeSubmodule, setActiveSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {/* Header & Submodule Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            📄 Document Studio
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              A4 Vector Print Ready
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, customize, and print crisp A4 Resumes, Templates, Character Certificates, and Invoices.
          </p>
        </div>

        {/* Submodule Tab Selector */}
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-xl">
          {[
            { id: 'templates', label: 'Templates', icon: FileCheck },
            { id: 'resume', label: 'Resume & CV', icon: FileText },
            { id: 'certificate', label: 'Character Certificate', icon: Award },
            { id: 'invoice', label: 'Invoice Generator', icon: Receipt }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubmodule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubmodule(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Document Builder Submodule */}
      <div>
        {activeSubmodule === 'templates' && <TemplateStudio />}
        {activeSubmodule === 'resume' && <ResumeBuilder />}
        {activeSubmodule === 'certificate' && <CertificateBuilder />}
        {activeSubmodule === 'invoice' && <InvoiceBuilder />}
      </div>
    </div>
  );
}
