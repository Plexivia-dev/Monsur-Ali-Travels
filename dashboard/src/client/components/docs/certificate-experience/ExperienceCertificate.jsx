import React, { useState } from 'react';
import { ExperienceCertificateForm } from './ExperienceCertificateForm';
import { ExperienceCertificatePreview } from './ExperienceCertificatePreview';
import { SAMPLE_EXPERIENCE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns, Award } from 'lucide-react';

import { printDocument } from '@shared/lib/utils';

import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function ExperienceCertificate() {
  const [data, setData] = useState(SAMPLE_EXPERIENCE_CERTIFICATE);
  const [viewMode, setViewMode] = useState('split');

  const handleResetSample = () => {
    setData(SAMPLE_EXPERIENCE_CERTIFICATE);
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Experience_Certificate',
      clientName: data.employeeName,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <HeaderTitle
        variant="printables"
        icon={Award}
        title="Experience Certificate Generator"
        subtitle="Create professional employment experience certificates and service letters for embassy, work permit, and immigration dossiers."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Tabs */}
            <div className="flex items-center space-x-1 bg-muted p-1 rounded-xl border border-border">
              {[
                { id: 'split', label: 'Split View', icon: Columns },
                { id: 'edit', label: 'Edit Form', icon: Edit3 },
                { id: 'preview', label: 'Live Preview', icon: Eye },
              ].map((btn) => {
                const Icon = btn.icon;
                const isActive = viewMode === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setViewMode(btn.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetSample}
              className="flex items-center space-x-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="max-w-3xl mx-auto">
          <ExperienceCertificateForm data={data} onChange={setData} />
        </div>
      )}

      {viewMode === 'preview' && (
        <div>
          <ExperienceCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <ExperienceCertificateForm data={data} onChange={setData} />
          </div>
          <div className="lg:col-span-7 bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <ExperienceCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

    </div>
  );
}
