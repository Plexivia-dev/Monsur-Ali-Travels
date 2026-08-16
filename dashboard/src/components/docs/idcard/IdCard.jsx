import React, { useState, useRef } from 'react';
import { IdCardForm } from './IdCardForm';
import { IdCardPreview } from './IdCardPreview';
import { Printer, Download, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

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
    email: 'monsuralitravels@gmail.com',
    address: 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
    website: 'www.monsuralitravels.com',
    signatureName: 'M. Ali',
    signatureTitle: 'Managing Director',
    photo: null,
    qrData: 'https://www.monsuralitravels.com/verify?id=123'
  };

  const [cardData, setCardData] = useState(defaultSampleData);

  const handleResetSample = () => {
    setCardData(defaultSampleData);
    toast.info('আইডি কার্ডের তথ্য রিসেট করা হয়েছে।');
  };

  const handleExportPNG = async (side) => {
    const targetRef = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!targetRef) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(targetRef, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `ID-Card-${cardData.fullName || 'Employee'}-${side}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`${side === 'front' ? 'সামনের' : 'পেছনের'} কার্ড PNG ইমেজ হিসেবে ডাউনলোড হয়েছে!`);
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
            কর্মচারীর তথ্য ও ছবি দিয়ে স্ট্যান্ডার্ড সাইজের আইডি কার্ড তৈরি ও প্রিন্ট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => handleExportPNG('front')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Front PNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPNG('back')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Back PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
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
