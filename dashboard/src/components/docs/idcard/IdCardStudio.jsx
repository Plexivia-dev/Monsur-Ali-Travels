import React, { useState, useRef } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Printer, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

export function IdCardStudio() {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sample data initialized to match exact reference card image
  const sampleData = {
    fullName: 'MD HAKIMUL ISLAM',
    role: 'EMPLOYEE',
    idNumber: '123',
    joiningDate: '01-10-2025',
    bloodGroup: 'B+',
    contactPhone: '01345579534',
    email: 'monsuralitravels@gmail.com',
    address: 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
    website: 'www.monsuralitravels.com',
    signatureName: 'M. Ali',
    signatureTitle: 'Managing Director',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  };

  const [cardData, setCardData] = useState(sampleData);

  const handleResetSample = () => {
    setCardData(sampleData);
  };

  const downloadCardJpg = async (ref, filename) => {
    if (!ref.current) return;
    try {
      setIsExporting(true);
      // Generate HD JPG with pixelRatio 3 for crisp printing
      const dataUrl = await toJpeg(ref.current, { quality: 0.98, pixelRatio: 3 });
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
    const name = (cardData.fullName || 'ID_Card').replace(/\s+/g, '_');
    downloadCardJpg(frontRef, `${name}_Front_ID_Card.jpg`);
  };

  const handleExportBack = () => {
    const name = (cardData.fullName || 'ID_Card').replace(/\s+/g, '_');
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
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            🆔 Dynamic ID Card
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportFront}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Export Front (JPG)</span>
          </button>

          <button
            onClick={handleExportBack}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Export Back (JPG)</span>
          </button>
        </div>
      </div>

      {/* Main Form & Live ID Card Canvas */}
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

        {/* Print Stylesheet override for exact physical card sizing when printed */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            #id-card-front-canvas, #id-card-back-canvas, #id-card-front-canvas *, #id-card-back-canvas * {
              visibility: visible;
            }
            #id-card-front-canvas {
              position: absolute;
              left: 20px;
              top: 20px;
              page-break-after: always;
            }
            #id-card-back-canvas {
              position: absolute;
              left: 20px;
              top: 600px;
            }
          }
        ` }} />

      </div>

    </div>
  );
}
