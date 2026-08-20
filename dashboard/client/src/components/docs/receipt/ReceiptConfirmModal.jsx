import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Loader2, Printer, AlertTriangle, User, DollarSign } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '../../../lib/auth-context';
import { formatToDdMmYyyy } from '../../../lib/utils';
import { MoneyReceiptPrintSlip } from './MoneyReceiptPrintSlip';

export function ReceiptConfirmModal({
  isOpen,
  onClose,
  receipt,
  onConfirmed,
}) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(receipt?.paymentMethod || 'Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  if (!isOpen || !receipt) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        paymentMethod,
        notes: notes.trim(),
        confirmedByName: user?.name || 'একাউন্টেন্ট (Accountant)',
      };

      const res = await apiClient.patch(`/api/v1/client/receipts/${receipt._id || receipt.id}/confirm`, payload);
      if (res.data?.success || res.data?.status === 'success') {
        const updated = res.data.data;
        setConfirmedData(updated);
        toast.success(`টোকেন #${receipt.receiptNo} সফলভাবে ক্যাশ গ্রহণ ও সিল নিশ্চিত করা হয়েছে!`);
        if (onConfirmed) {
          onConfirmed(updated);
        }
      } else {
        toast.error(res.data?.message || 'সিল নিশ্চিত করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Failed to confirm receipt:', err);
      toast.error(err.response?.data?.message || 'সার্ভার ত্রুটি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                ক্যাশ রিসিভ ও সিল মোহর নিশ্চিতকরণ
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">
                  একাউন্টস ডেস্ক
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                টোকেন নং: <strong className="text-primary">{receipt.receiptNo}</strong>
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
        <div className="p-6 space-y-5">
          {confirmedData ? (
            /* After confirmation: Print & Success view */
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 space-y-1">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold">ক্যাশ জমা ও সিল সম্পন্ন হয়েছে!</h3>
                <p className="text-xs">
                  টোকেন #{confirmedData.receiptNo} — সিল গ্রহীতা: {confirmedData.confirmedByName}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>সিলযুক্ত রিসিট প্রিন্ট করুন</span>
                </button>
              </div>

              {/* Hidden or small preview */}
              <div className="mt-4 border border-border rounded-xl p-2 bg-muted/10 max-h-[300px] overflow-y-auto">
                <MoneyReceiptPrintSlip data={confirmedData} onPrint={handlePrint} />
              </div>
            </div>
          ) : (
            /* Confirmation Form */
            <div className="space-y-4">
              
              {/* Receipt Summary Card */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">টোকেন প্রস্তুতকারক (ম্যানেজার):</span>
                  <span className="text-xs font-bold text-foreground">{receipt.createdByName || 'ম্যানেজার'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">গ্রাহকের নাম:</span>
                    <strong className="text-foreground text-sm">{receipt.clientName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">মোবাইল:</span>
                    <strong className="text-foreground font-mono">{receipt.clientPhone || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">পাসপোর্ট নম্বর:</span>
                    <strong className="text-foreground font-mono uppercase">{receipt.passportNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">সেবার ধরন:</span>
                    <strong className="text-foreground">{receipt.serviceType}</strong>
                  </div>
                </div>

                {receipt.purpose && (
                  <div className="border-t border-border pt-2 text-xs">
                    <span className="text-muted-foreground block text-[11px]">বিবরণ / পারপাস:</span>
                    <span className="text-foreground">{receipt.purpose}</span>
                  </div>
                )}

                {/* Amount Callout */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 text-white mt-2">
                  <span className="text-xs uppercase font-semibold text-slate-300">গ্রহণযোগ্য টাকার পরিমাণ:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    ৳ {Number(receipt.amount || 0).toLocaleString('en-IN')} BDT
                  </span>
                </div>
              </div>

              {/* Accountant Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ক্যাশ পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  >
                    <option value="Cash">নগদ ক্যাশ (Cash)</option>
                    <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank)</option>
                    <option value="bKash/Nagad">বিকাশ / নগদ (Mobile)</option>
                    <option value="Cheque">চেক (Cheque)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    সিল প্রদানকারী একাউন্টেন্ট
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'একাউন্টেন্ট (Accountant)'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-muted text-foreground outline-hidden opacity-80"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    একাউন্টস নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. ৫০০ টাকার নোট গ্রহণ / ব্যাংক ক্যাশ ভাউচার #৮৮৯"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সিল নিশ্চিত করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>✅ ক্যাশ গ্রহণ ও সিল নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
