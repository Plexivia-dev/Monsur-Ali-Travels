import React, { useState } from 'react';
import { ExperienceCertificateForm } from './ExperienceCertificateForm';
import { ExperienceCertificatePreview } from './ExperienceCertificatePreview';
import { SAMPLE_EXPERIENCE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns, Award, Printer } from 'lucide-react';
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
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Award}
        title="Experience Certificate Generator"
        subtitle="Create professional employment experience certificates and service letters for embassy, work permit, and immigration dossiers."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
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
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-md font-black'
                        : 'text-sky-100/80 hover:text-white hover:bg-white/10'
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
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
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

export default ExperienceCertificate;
