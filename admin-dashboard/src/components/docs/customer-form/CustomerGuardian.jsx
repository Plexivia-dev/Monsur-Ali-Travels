import React, { useState, useEffect } from 'react';
import { CustomerGuardianForm } from './CustomerGuardianForm';
import { CustomerGuardianPreview } from './CustomerGuardianPreview';
import { getDefaultCustomerGuardianData, generateApplicationNo } from './sampleData';
import { Printer, Edit3, CheckCircle2, FileText, Download, Share2, Sparkles, Save, Database } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api-client';

export function CustomerGuardian({ initialData = null, onSavedSuccess = null }) {
  const [data, setData] = useState(initialData || getDefaultCustomerGuardianData());
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultCustomerGuardianData());
    toast.info('ফর্মের তথ্য রিসেট করা হয়েছে।');
  };

  const handleSaveToDatabase = async () => {
    if (!data.customer?.fullName?.trim()) {
      toast.error('কাস্টমারের নাম (Customer Full Name) আবশ্যক!');
      return;
    }

    const payload = { ...data };
    if (!payload.applicationNo) {
      payload.applicationNo = generateApplicationNo();
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/docs/customer-guardians/${data._id}`, payload)
        : await apiClient.post('/api/v1/docs/customer-guardians', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setData(savedDoc);
        toast.success(
          isEdit
            ? `কাস্টমার ফাইল আপডেট করা হয়েছে! (App No: ${savedDoc.applicationNo})`
            : `কাস্টমার ফাইল ডাটাবেজে সেভ হয়েছে! (App No: ${savedDoc.applicationNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'ডাটাবেজে সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.warn('Backend API save warning (offline preview mode):', err);
      const fallbackAppNo = data.applicationNo || generateApplicationNo();
      setData(prev => ({ ...prev, applicationNo: fallbackAppNo }));
      toast.info(`ফর্ম প্রিভিউ প্রস্তুত! (অফলাইন মোড - App No: ${fallbackAppNo})`);
      setViewMode('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const customerName = data.customer?.fullName || 'সম্মানিত কাস্টমার';
    const total = Number(data.payment?.totalAmount || 0).toLocaleString('en-IN');
    const advance = Number(data.payment?.advancePaid || 0).toLocaleString('en-IN');
    const due = Number(data.payment?.dueAmount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*CUSTOMER & GUARDIAN APPLICATION FORM (${data.applicationNo || 'APP-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কাস্টমারের নাম:* ${customerName}\n` +
      `📌 *সার্ভিস:* ${data.serviceType || 'Indian Visa'}\n` +
      `🆔 *NID নম্বর:* ${data.customer?.nidNumber || 'N/A'}\n` +
      `🛂 *পাসপোর্ট:* ${data.customer?.passportNumber || 'N/A'}\n` +
      `👥 *অভিভাবক:* ${data.guardian?.fullName || 'N/A'} (${data.guardian?.relationship || 'Guardian'})\n` +
      `-----------------------------------------\n` +
      `💰 *মোট ফি:* ৳ ${total}\n` +
      `✅ *অগ্রিম জমা:* ৳ ${advance}\n` +
      `⏳ *বকেয়া:* ৳ ${due}\n` +
      `-----------------------------------------\n` +
      `📅 *তারিখ:* ${data.dateReceived || 'আজ'}\n\n` +
      `📌 *অফিসিয়াল আপডেট:* আপনার কাস্টমার ফাইল ও অগ্রিম জমার মানি রসিদ ডাটাবেজে সংরক্ষণ করা হয়েছে।\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 যোগাযোগ: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Customer &amp; Guardian Information Application Form
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            কাস্টমার ও অভিভাবকের তথ্য ও ডকুমেন্ট রিকোয়ারমেন্ট অ্যাপ্লিকেশন ফর্ম তৈরি ও প্রিন্ট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Form</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Print Preview</span>
            </button>
          </div>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="WhatsApp এ শেয়ার করুন"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          {/* Save to DB button */}
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : data._id ? 'Update DB' : 'Save DB'}</span>
          </button>

          {/* Print / Download Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'form' ? (
        <CustomerGuardianForm
          data={data}
          onChange={setData}
          onReset={handleReset}
          onSave={handleSaveToDatabase}
          onPreview={() => setViewMode('preview')}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-muted/20 border border-border p-4 sm:p-6 rounded-2xl flex flex-col items-center">
          <CustomerGuardianPreview data={data} />
        </div>
      )}
    </div>
  );
}
