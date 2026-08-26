import React, { useState, useRef } from 'react';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Download, Sparkles, RefreshCw, FileText, Contact } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import agencyInfo from '@shared/lib/information.json';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function IdCard() {
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
    <div className="space-y-4">
      {/* Universal Top Header Banner */}
      <HeaderTitle
        variant="printables"
        icon={Contact}
        title="Employee Identity Card Generator"
        subtitle="Generate and export official high-resolution dual-sided employee identity cards with photo and verifiable QR code."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetSample}
              className="flex items-center space-x-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportPNG('front')}
              disabled={!isFormValid || isExporting}
              className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isFormValid ? 'All fields and photo required' : 'Download Front PNG'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Front PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportPNG('back')}
              disabled={!isFormValid || isExporting}
              className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isFormValid ? 'All fields and photo required' : 'Download Back PNG'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Back PNG</span>
            </button>
          </div>
        }
      />

      {/* Main Grid: Left Form, Right Live Dual Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          <IdCardForm
            cardData={cardData}
            setCardData={setCardData}
            onResetSample={handleResetSample}
          />
        </div>

        {/* Right Side: Dual-Sided Visual Preview */}
        <div className="lg:col-span-7 bg-muted/20 border border-border p-6 rounded-2xl flex flex-col items-center justify-center min-h-[550px] overflow-x-auto shadow-xs">
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

export default IdCard;
