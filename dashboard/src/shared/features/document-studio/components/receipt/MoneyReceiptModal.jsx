import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, Printer, ArrowLeft, Loader2, Sparkles, User, Phone, ShieldCheck, DollarSign, FileText } from 'lucide-react';
import { apiClient } from '@shared/lib/api-client';
import { toast } from 'sonner';
import { MoneyReceiptPrintSlip } from './MoneyReceiptPrintSlip';
import { useAuth } from '@shared/lib/auth-context';
import { Button } from '@/components/ui/button';

const SERVICE_OPTIONS = [
  'ইন্ডিয়ান ভিসা প্রসেসিং',
  'পাসপোর্ট সাবমিশন ও নবায়ন',
  'গ্রিস ওয়ার্ক পারমিট কেস',
  'উত্তর মেসিডোনিয়া কেস',
  'ম্যানপাওয়ার কেস ফাইল',
  'এয়ার টিকিট বুকিং',
  'চাকরির চুক্তিপত্র সার্ভিস',
  'সার্ভিস ফি ও কনসালটেন্সি',
  'অন্যান্য সার্ভিস',
];

export function MoneyReceiptModal({
  isOpen,
  onClose,
  initialData = {},
  onSuccess,
}) {
  const user = useAuth((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    clientPhone: initialData.clientPhone || '',
    passportNumber: initialData.passportNumber || '',
    serviceType: initialData.serviceType || 'ইন্ডিয়ান ভিসা প্রসেসিং',
    amount: initialData.amount || '',
    amountInWords: initialData.amountInWords || '',
    paymentMethod: initialData.paymentMethod || 'Cash',
    purpose: initialData.purpose || '',
    createdByName: user?.name || 'ম্যানেজার',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCreatedReceipt(null);
      setFormData({
        clientName: initialData.clientName || initialData.applicantName || initialData.fullName || initialData.name || '',
        clientPhone: initialData.clientPhone || initialData.phone || initialData.mobileNumber || '',
        passportNumber: initialData.passportNumber || '',
        serviceType: initialData.serviceType || 'ইন্ডিয়ান ভিসা প্রসেসিং',
        purpose: initialData.purpose || initialData.remarks || '',
        amount: initialData.amount || initialData.totalAmount || initialData.fee || '',
        amountInWords: initialData.amountInWords || '',
        paymentMethod: initialData.paymentMethod || 'Cash',
        createdByName: user?.name || 'ম্যানেজার',
        notes: initialData.notes || '',
        clientId: initialData.clientId || null,
        serviceRef: initialData.serviceRef || null,
      });
    }
  }, [isOpen, initialData, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error('অনুগ্রহ করে গ্রাহকের নাম প্রদান করুন।');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('অনুগ্রহ করে সঠিক টাকার পরিমাণ প্রদান করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      const res = await apiClient.post('/api/v1/client/receipts', payload);
      if (res.data?.success || res.data?.status === 'success') {
        const receipt = res.data.data;
        setCreatedReceipt(receipt);
        toast.success(`পেমেন্ট টোকেন #${receipt.receiptNo} সফলভাবে তৈরি হয়েছে!`);
        if (onCreated) {
          onCreated(receipt);
        }
      } else {
        toast.error(res.data?.message || 'টোকেন তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Failed to create money receipt:', err);
      toast.error(err.response?.data?.message || 'টোকেন তৈরিতে সার্ভার ত্রুটি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                {createdReceipt ? 'টোকেন প্রিন্ট ও প্রিভিউ' : 'নতুন পেমেন্ট টোকেন ও মানি রিসিট তৈরি'}
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  অভ্যন্তরীণ অফিস ব্যবহার
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {createdReceipt 
                  ? 'গ্রাহককে এই টোকেনটি দিন — একাউন্টেন্টে সিল মাইরা ক্যাশ জমা নিবে।' 
                  : 'ম্যানেজার এই স্লিপটি তৈরি করে গ্রাহককে একাউন্টেন্টের কাছে পাঠাবেন।'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {createdReceipt ? (
            /* Print Preview Screen */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-3.5 rounded-xl text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>টোকেন তৈরি সম্পন্ন! টোকেন নং: <strong className="font-mono text-base">{createdReceipt.receiptNo}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreatedReceipt(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>নতুন টোকেন</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>

              {/* Printable Component Container */}
              <div className="border border-border rounded-xl p-2 bg-muted/20 overflow-x-auto">
                <MoneyReceiptPrintSlip data={createdReceipt} onPrint={handlePrint} />
              </div>
            </div>
          ) : (
            /* Token Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Client Details Section */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <User className="w-4 h-4" />
                  ১. গ্রাহকের বিবরণ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      গ্রাহকের নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="e.g. মোঃ করিম হোসেন"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      মোবাইল নম্বর
                    </label>
                    <input
                      type="text"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      placeholder="e.g. 01711223344"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      পাসপোর্ট নম্বর
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="e.g. A01234567"
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Payment Amount Section */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <DollarSign className="w-4 h-4" />
                  ২. সেবার ধরন ও টাকার পরিমাণ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      সেবার ধরন <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">৳</span>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="e.g. 5000"
                        min="0"
                        required
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-foreground rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      টাকার পরিমাণ কথায়
                    </label>
                    <input
                      type="text"
                      name="amountInWords"
                      value={formData.amountInWords}
                      onChange={handleChange}
                      placeholder="e.g. পাঁচ হাজার টাকা মাত্র"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      পেমেন্ট মাধ্যম
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    >
                      <option value="Cash">নগদ ক্যাশ</option>
                      <option value="Bank Transfer">ব্যাংক ট্রান্সফার</option>
                      <option value="bKash/Nagad">বিকাশ / নগদ</option>
                      <option value="Cheque">চেক</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      বিবরণ ও মন্তব্য
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="e.g. গ্রিস ওয়ার্ক পারমিটের ১ম কিস্তি / ভিসা সাবমিশন ফি"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Creator & Internal Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>টোকেন প্রস্তুতকারী: <strong>{formData.createdByName}</strong></span>
                <span className="text-[11px] italic">* টোকেন সেভ হলে অটোমেটিক প্রিন্ট রেডি হবে।</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>টোকেন জেনারেট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>টোকেন তৈরি ও প্রিন্ট করুন</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
