import React, { useState } from 'react';
import { CharacterCertificateForm } from './CharacterCertificateForm';
import { CharacterCertificatePreview } from './CharacterCertificatePreview';
import { SAMPLE_CHARACTER_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns } from 'lucide-react';

import { printDocument } from '@shared/lib/utils';

import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { ShieldCheck } from 'lucide-react';

export function CharacterCertificate() {
  const [data, setData] = useState(SAMPLE_CHARACTER_CERTIFICATE);
  const [viewMode, setViewMode] = useState('split');

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
      {/* Top Header Banner */}
      <HeaderTitle
        variant="printables"
        icon={ShieldCheck}
        title="Character Certificate & Testimonial Generator"
        subtitle="Generate official character certificates, good conduct letters, and institutional testimonials for visa & embassy dossiers."
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

      {/* Main Content */}
      {viewMode === 'edit' && (
        <div className="max-w-3xl mx-auto">
          <CharacterCertificateForm data={data} onChange={setData} />
        </div>
      )}

      {viewMode === 'preview' && (
        <div>
          <CharacterCertificatePreview data={data} onPrint={handlePrint} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CharacterCertificateForm data={data} onChange={setData} />
          </div>
          <div className="lg:col-span-7 bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <CharacterCertificatePreview data={data} onPrint={handlePrint} />
          </div>
        </div>
      )}

    </div>
  );
}
