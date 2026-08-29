import React, { useState } from 'react';
import { MarriageCertificateForm } from './MarriageCertificateForm';
import { MarriageCertificatePreview } from './MarriageCertificatePreview';
import { SAMPLE_MARRIAGE_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Heart, Printer } from 'lucide-react';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function MarriageCertificate() {
  const [data, setData] = useState(SAMPLE_MARRIAGE_CERTIFICATE);
  const [viewMode, setViewMode] = useState('edit');

  const handleResetSample = () => {
    setData(SAMPLE_MARRIAGE_CERTIFICATE);
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Marriage_Certificate',
      clientName: data.groomName ? `${data.groomName}_and_${data.brideName || ''}` : 'Marriage',
      elementId: 'marriage-certificate-canvas',
    });
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Heart}
        title="Marriage Certificate Generator"
        subtitle="Generate official Muslim / Civil marriage certificate and Nikahnama translation dossiers for spouse visa and immigration."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="w-full pb-16">
          <MarriageCertificateForm data={data} onChange={setData} />
          <div className="hidden print:block w-full">
            <MarriageCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <MarriageCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <MarriageCertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <MarriageCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default MarriageCertificate;
