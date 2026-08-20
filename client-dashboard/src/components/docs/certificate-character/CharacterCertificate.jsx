import React, { useState } from 'react';
import { CharacterCertificateForm } from './CharacterCertificateForm';
import { CharacterCertificatePreview } from './CharacterCertificatePreview';
import { SAMPLE_CHARACTER_CERTIFICATE } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns } from 'lucide-react';

export function CharacterCertificate() {
  const [data, setData] = useState(SAMPLE_CHARACTER_CERTIFICATE);
  const [viewMode, setViewMode] = useState('split');

  const handleResetSample = () => {
    setData(SAMPLE_CHARACTER_CERTIFICATE);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl shadow-xs">
        
        {/* Left: View Mode */}
        <div className="flex items-center space-x-1.5 bg-muted p-1 rounded-lg">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetSample}
            className="flex items-center space-x-1.5 bg-muted/60 hover:bg-muted text-foreground text-xs font-medium px-3 py-1.5 rounded-lg border border-border transition-colors cursor-pointer"
            title="Reset Sample Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset Sample</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Print</span>
          </button>
        </div>

      </div>

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
