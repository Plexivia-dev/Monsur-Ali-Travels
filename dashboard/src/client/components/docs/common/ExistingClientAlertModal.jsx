import React from 'react';
import {
  UserCheck,
  Phone,
  CreditCard,
  FileCheck,
  CopyCheck,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

/**
 * Modal dialog that freezes the screen when an existing client matches by phone/passport/NID.
 * User MUST make a conscious choice before proceeding:
 * 1. Auto-fill from existing client
 * 2. Update existing client data with current form entries
 * 3. Ignore & create new document unlinked
 */
export function ExistingClientAlertModal({
  client,
  onAutoFill,
  onUpdateExisting,
  onProceedAsNew
}) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-card border-2 border-amber-500/50 shadow-2xl rounded-2xl max-w-xl w-full p-6 text-foreground space-y-5 relative">
        
        {/* Header with warning icon & Lock badge */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/15 text-amber-600 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                ক্লায়েন্ট ম্যাচ পাওয়া গেছে! (Client Found)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                এই মোবাইল নম্বর বা পাসপোর্টে ডাটাবেজে ইতিমধ্যে একজন ক্লায়েন্ট রেজিস্টার করা আছে।
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/15 text-amber-600 px-2.5 py-1 rounded-full shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>সতর্কতা</span>
          </span>
        </div>

        {/* Existing Client Profile Card */}
        <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-primary font-bold text-[11px]">
              {client.clientCode || 'CUST-RECORD'}
            </span>
            <span className="font-semibold text-foreground">
              {client.applications?.length || 0} টি সার্ভিস রেকর্ড লিংকড
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-foreground font-medium pt-1">
            <div>
              <span className="text-muted-foreground block text-[10.5px]">পূর্ণ নাম:</span>
              <span className="font-bold text-sm">{client.fullName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">মোবাইল নম্বর:</span>
              <span className="font-mono font-bold">{client.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">পাসপোর্ট নম্বর:</span>
              <span className="font-mono font-bold">{client.passportNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10.5px]">জাতীয় পরিচয়পত্র (NID):</span>
              <span className="font-mono font-bold">{client.nidNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action Choices Required */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-bold text-foreground">
            আপনি কীভাবে অগ্রসর হতে চান? নিচের যেকোনো একটি অপশন নির্বাচন করুন:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Auto Fill */}
            <button
              type="button"
              onClick={onAutoFill}
              className="flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-left">
                <CopyCheck className="w-4 h-4 shrink-0" />
                <div>
                  <p>অটো ফিল করুন</p>
                  <p className="text-[10px] font-normal opacity-80">ক্লায়েন্টের সেভ করা ডাটা ফর্মে বসান</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 2: Update Existing Profile */}
            <button
              type="button"
              onClick={onUpdateExisting}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-left">
                <RefreshCw className="w-4 h-4 shrink-0" />
                <div>
                  <p>তথ্য আপডেট করুন</p>
                  <p className="text-[10px] font-normal opacity-80">বর্তমান তথ্য দিয়ে প্রোফাইল আপডেট হবে</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Option 3: Create as New / Skip Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onProceedAsNew}
              className="text-[11.5px] text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
            >
              লিংক না করে সাধারণ নতুন ডকুমেন্ট হিসেবে সংরক্ষণ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
