import React, { useState } from 'react';
import { IndianVisaForm } from './IndianVisaForm';
import { IndianVisaPreview } from './IndianVisaPreview';
import { getDefaultIndianVisaData, generateUniqueIndianVisaTrackingNo } from './sampleData';
import { FileText, Eye, Edit3, Share2, Printer, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../../lib/apiClient';

export function IndianVisaStudio() {
  const [data, setData] = useState(getDefaultIndianVisaData());
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setData(getDefaultIndianVisaData());
    toast.info('ইন্ডিয়ান ভিসা আবেদনের তথ্য রিসেট করা হয়েছে।');
  };

  const handleFormSubmit = async () => {
    const payload = { ...data };
    if (!payload.trackingNo) {
      delete payload.trackingNo;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/docs/indian-visas/${data._id}`, payload)
        : await apiClient.post('/api/v1/docs/indian-visas', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedTrackingNo = savedDoc.trackingNo || generateUniqueIndianVisaTrackingNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          trackingNo: returnedTrackingNo,
        }));
        toast.success(
          isEdit
            ? `ইন্ডিয়ান ভিসা আবেদন আপডেট করা হয়েছে! (ট্র্যাকিং নং: ${returnedTrackingNo})`
            : `ইন্ডিয়ান ভিসা আবেদন ডাটাবেজে সংরক্ষণ করা হয়েছে! (ট্র্যাকিং নং: ${returnedTrackingNo})`
        );
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'ডাটাবেজে সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackTrackingNo = data.trackingNo || generateUniqueIndianVisaTrackingNo();
      setData((prev) => ({
        ...prev,
        trackingNo: fallbackTrackingNo,
      }));
      toast.info(`ইন্ডিয়ান ভিসা রসিদ প্রস্তুত! (ট্র্যাকিং নং: ${fallbackTrackingNo})`);
      setViewMode('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const applicantName = data.applicantName || 'সম্মানিত আবেদনকারী';

    const msg =
      `*📄 মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*ইন্ডিয়ান ভিসা আবেদন ও জমা ট্র্যাকিং স্লিপ (${data.trackingNo || 'IVISA-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *আবেদনকারীর নাম:* ${applicantName}\n` +
      `🛂 *পাসপোর্ট নম্বর:* ${data.passportNo || 'N/A'}\n` +
      `🇮🇳 *ভিসা ক্যাটাগরি:* ${data.visaType || 'ট্যুরিস্ট ভিসা'}\n` +
      `🛣️ *এন্ট্রি পোর্ট:* ${data.entryPort || 'হরিদাসপুর/গেদে'}\n` +
      `📅 *জমার তারিখ:* ${data.submissionDate || 'আজ'}\n` +
      `📞 *ফোন নম্বর:* ${data.applicantPhone || 'N/A'}\n\n` +
      `📌 *অফিসিয়াল আপডেট:* আপনার ইন্ডিয়ান ভিসা ফাইল জমা ও আবেদনের তথ্য রসিদ প্রস্তুত করা হয়েছে।\n\n` +
      `ধন্যবাদান্তে,\n*মনসুর আলী ট্রাভেলস*`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header Toolbar */}
      <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-[4px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Stamp className="w-6 h-6 text-emerald-600 shrink-0" />
            Indian Visa Application
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-muted p-1 rounded-[4px] flex items-center space-x-1 border border-border">
            <button
              onClick={() => setViewMode('form')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ফর্ম এডিটর (Form)</span>
            </button>

            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 রসিদ প্রিভিউ (Preview)</span>
            </button>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-[4px] transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপ শেয়ার</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold px-3.5 py-2 rounded-[4px] transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট রসিদ (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Render */}
      <div>
        {viewMode === 'form' ? (
          <IndianVisaForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
        ) : (
          <IndianVisaPreview data={data} onPrint={handlePrint} />
        )}
      </div>

    </div>
  );
}
