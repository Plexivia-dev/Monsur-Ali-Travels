import React, { useState, useRef } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Printer, Download, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

export function IdCardStudio() {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const sampleData = {
    fullName: 'MD HAKIMUL ISLAM',
    role: 'EMPLOYEE',
    idNumber: '123',
    joiningDate: '01-10-2025',
    bloodGroup: 'B+',
    contactPhone: '0134557934',
    email: 'monsuralitravels@gmail.com',
    address: 'Mominpur Jagannathpur Road, Sunamganj',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  };

  const [cardData, setCardData] = useState(sampleData);

  const handleResetSample = () => {
    setCardData(sampleData);
  };

  const downloadCardJpg = async (ref, filename) => {
    if (!ref.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toJpeg(ref.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export ID Card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFront = () => {
    const name = cardData.fullName.replace(/\s+/g, '_') || 'ID_Card';
    downloadCardJpg(frontRef, `${name}_Front_ID_Card.jpg`);
  };

  const handleExportBack = () => {
    const name = cardData.fullName.replace(/\s+/g, '_') || 'ID_Card';
    downloadCardJpg(backRef, `${name}_Back_ID_Card.jpg`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Toolbar */}
      <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            🆔 Dynamic ID Card Studio
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              HD JPG & Print Ready
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in candidate / employee details, upload photo, and export double-sided ID cards as HD JPG images.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportFront}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Export Front (JPG)</span>
          </button>

          <button
            onClick={handleExportBack}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Export Back (JPG)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Form & Preview Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Editor */}
        <div className="no-print lg:col-span-4">
          <IdCardForm
            cardData={cardData}
            setCardData={setCardData}
            onResetSample={handleResetSample}
          />
        </div>

        {/* Right Column: Live ID Card Preview Canvas */}
        <div className="lg:col-span-8 flex justify-center">
          <IdCardPreview
            cardData={cardData}
            frontRef={frontRef}
            backRef={backRef}
          />
        </div>

      </div>

    </div>
  );
}
