import React, { useState, useRef } from 'react';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Download, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import agencyInfo from '@shared/lib/information.json';

export function IdCard() {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [isExporting, setIsExporting] = useState(false);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  const defaultSampleData = {
    fullName: '',
    role: '',
    idNumber: '',
    joiningDate: new Date().toISOString().split('T')[0],
    bloodGroup: '',
    contactPhone: '',
    email: agencyInfo.email || 'contact@monsuralitravels.com',
    address: agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    website: agencyInfo.website || 'www.monsuralitravels.com',
    signatureName: 'M. Ali',
    signatureTitle: 'Managing Director',
    photo: null,
    qrData: 'https://www.monsuralitravels.com/verify?id=123'
  };

  const [cardData, setCardData] = useState(defaultSampleData);

  const isFormValid = Boolean(
    cardData.photo &&
    cardData.fullName?.trim() &&
    cardData.role?.trim() &&
    cardData.idNumber?.trim() &&
    cardData.joiningDate?.trim() &&
    cardData.bloodGroup?.trim() &&
    cardData.contactPhone?.trim() &&
    cardData.email?.trim() &&
    cardData.address?.trim() &&
    cardData.website?.trim() &&
    cardData.signatureName?.trim()
  );

  const handleResetSample = () => {
    setCardData(defaultSampleData);
    toast.info('ID card form has been reset.');
  };

  const handleExportPNG = async (side) => {
    if (!isFormValid) {
      toast.error('All fields and photo are required to download ID card!');
      return;
    }
    const targetRef = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!targetRef) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(targetRef, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `ID-Card-${cardData.fullName || 'Employee'}-${side}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`${side === 'front' ? 'Front' : 'Back'} side ID card downloaded successfully as PNG image!`);
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('Failed to download image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print bg-card border border-border p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Official Employee ID Card
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate and export official employee identity cards with photo and verifiable credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!isFormValid ? (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              ⚠️ All fields and photo required
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              ✓ Ready to Download & Print
            </span>
          )}

          <button
            type="button"
            onClick={() => handleExportPNG('front')}
            disabled={!isFormValid || isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={!isFormValid ? 'All fields and photo required' : 'Download Front PNG'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Front PNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPNG('back')}
            disabled={!isFormValid || isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={!isFormValid ? 'All fields and photo required' : 'Download Back PNG'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Back PNG</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form, Right Live Dual Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-5">
          <IdCardForm
            cardData={cardData}
            setCardData={setCardData}
            onResetSample={handleResetSample}
          />
        </div>

        {/* Right Side: Dual-Sided Visual Preview */}
        <div className="lg:col-span-7 bg-muted/20 border border-border p-6 rounded-2xl flex flex-col items-center justify-center min-h-[600px] overflow-x-auto shadow-xs">
          <IdCardPreview
            cardData={cardData}
            frontRef={frontCardRef}
            backRef={backCardRef}
          />
        </div>
      </div>
    </div>
  );
}
