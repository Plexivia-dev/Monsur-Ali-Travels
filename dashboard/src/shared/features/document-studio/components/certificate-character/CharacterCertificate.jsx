import React, { useState } from 'react';
import { CharacterCertificateForm } from './CharacterCertificateForm';
import { CharacterCertificatePreview } from './CharacterCertificatePreview';
import { SAMPLE_CHARACTER_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, ShieldCheck, Printer } from 'lucide-react';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function CharacterCertificate() {
  const [data, setData] = useState(SAMPLE_CHARACTER_CERTIFICATE);
  const [viewMode, setViewMode] = useState('edit');

  const handleResetSample = () => {
    setData(SAMPLE_CHARACTER_CERTIFICATE);
  };

  const handlePrint = () => {
    printDocument({
      docId: data.certificateNo,
      docType: 'Character_Certificate',
      clientName: data.candidateName,
    });
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={ShieldCheck}
        title="Character Certificate & Testimonial Generator"
        subtitle="Generate official character certificates, good conduct letters, and institutional testimonials for visa & embassy dossiers."
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
          <CharacterCertificateForm data={data} onChange={setData} />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="pb-16">
          <CharacterCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CharacterCertificateForm data={data} onChange={setData} />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <CharacterCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CharacterCertificate;
