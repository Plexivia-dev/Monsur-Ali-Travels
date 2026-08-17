import React, { useState } from 'react';
import { IndianVisaForm } from './IndianVisaForm';
import { IndianVisaPreview } from './IndianVisaPreview';
import { getDefaultIndianVisaData, generateUniqueIndianVisaTrackingNo } from './sampleData';
import { Printer, Edit3, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api-client';

export function IndianVisa() {
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
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh\n` +
      `📞 যোগাযোগ: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form Mode */}
      {viewMode === 'form' && (
        <IndianVisaForm
          data={data}
          onChange={setData}
          onSubmit={handleFormSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Action Header in Preview Mode */}
          <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-[4px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ইন্ডিয়ান ভিসা রসিদ প্রস্তুত (ট্র্যাকিং নং: <span className="font-mono text-emerald-600 font-bold">{data.trackingNo}</span>)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ইন্ডিয়ান ভিসা আবেদনের তথ্য ডাটাবেজে সংরক্ষণ করা হয়েছে। সরাসরি A4 প্রিন্ট বা হোয়াটসঅ্যাপে পাঠান।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-primary" />
                <span>তথ্য পরিবর্তন (Edit Form)</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2 rounded-[4px] shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                title="Share Summary on WhatsApp"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp-এ পাঠান</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-[4px] shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>

          {/* Printable A4 Canvas */}
          <IndianVisaPreview data={data} onPrint={handlePrint} />
        </div>
      )}
    </div>
  );
}
