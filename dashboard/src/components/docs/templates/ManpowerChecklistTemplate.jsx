import React from 'react';
import { Building2, Plane, ShieldCheck, Stethoscope, FileText, CheckCircle2, UserCheck } from 'lucide-react';

export function ManpowerChecklistTemplate({ agencyInfo = {} }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="border-2 border-slate-800 p-6 sm:p-8 min-h-[1020px] flex flex-col justify-between bg-white text-slate-900 font-sans">
      
      {/* Header Section */}
      <div>
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                Government Approved Overseas Employment & Manpower Processing Agency
              </p>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                License No: RL-1842 | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-xs">
            <div className="font-bold text-slate-900">Form Ref: MAT-MANPOWER-03</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-emerald-900 text-white py-3 px-6 rounded-lg text-center shadow-sm mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase">
            MANPOWER & FLIGHT PROCESSING CHECKLIST
          </h2>
          <p className="text-xs font-medium text-emerald-200 mt-0.5">
            ম্যানপাওয়ার ক্লিয়ারেন্স ও ফ্লাইট প্রসেসিংয়ের জন্য প্রয়োজনীয় কাগজপত্রের চেকলিস্ট
          </p>
        </div>

        {/* Overview Notice */}
        <div className="text-xs leading-relaxed text-slate-800 text-justify mb-6 bg-emerald-50/60 border border-emerald-200 p-4 rounded-lg">
          বিদেশগামী কর্মীদের ম্যানপাওয়ার (BMET Smart Card) ক্লিয়ারেন্স ও ফ্লাইট টিকিটিং নিশ্চিতকরণের জন্য নিম্নোক্ত ডকুমেন্টস ও সনদপত্রাদি মুনসুর আলী ট্রাভেলস এর ম্যানপাওয়ার সেকশনে জমা দেওয়ার নির্দেশ দেওয়া হলো।
        </div>

        {/* Requirements Grid */}
        <div className="space-y-4 mb-6">
          
          {/* Section 1: Original Documents */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>১. মূল কাগজপত্র ও ছবি (Original Documents & Photo)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">মূল পাসপোর্ট (Original Passport)</span>
                  <span className="text-[11px] text-slate-600">মেয়াদ সর্বনিম্ন ৮ মাস থাকতে হবে।</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">পুলিশ ক্লিয়ারেন্স সনদ (Police Clearance)</span>
                  <span className="text-[11px] text-slate-600">পররাষ্ট্র মন্ত্রণালয় কর্তৃক সত্যায়িত কপি।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Medical & BMET */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
              <span>২. মেডিকেল সনদ ও বিএমইটি ক্লিয়ারেন্স (Medical & BMET Clearance)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">মেডিকেল ফিট সনদ (GAMCA Medical Fit)</span>
                  <span className="text-[11px] text-slate-600">অনুমোদিত মেডিকেল সেন্টার হতে ফিট রিপোর্ট।</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">বিএমইটি রেজিষ্ট্রেশন (BMET Smart Card)</span>
                  <span className="text-[11px] text-slate-600">ফিঙ্গারপ্রিন্ট ও ওরিয়েন্টেশন ট্রেনিং সনদ।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visa & Contract */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <Plane className="w-4 h-4 text-amber-600 shrink-0" />
              <span>৩. ভিসা ও ফ্লাইট চুক্তিপত্র (Visa & Flight Instructions)</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              সংশ্লিষ্ট দেশের অনুমোদিত ওয়ার্ক পারমিট ভিসা কপি, নিয়োগকারী কোম্পানির এগ্রিমেন্ট চুক্তিপত্র এবং এয়ারলাইন্স ই-টিকিট কপি প্রসেসিং শেষে সাথে নিয়ে ফ্লাইট নিশ্চিত করুন।
            </div>
          </div>

        </div>

        {/* Agency Helpline */}
        <div className="p-4 border-2 border-emerald-800 bg-emerald-900 text-white rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block uppercase">ম্যানপাওয়ার অ্যান্ড ফ্লাইট হেল্পডেস্ক</span>
              <span>ফ্লাইট সংক্রান্ত কোনো অনুসন্ধানের জন্য সরাসরি এজেন্সির ম্যানপাওয়ার অফিসারকে জানান।</span>
            </div>
          </div>
          <div className="text-right font-mono text-xs hidden sm:block text-emerald-300 font-bold">
            +880 1700-000000
          </div>
        </div>

      </div>

      {/* Footer / Signature Block */}
      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end text-xs">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono">
            [ ম্যানপাওয়ার সিল ]
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">বিএমইটি প্রসেসিং সিল / Seal</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-48 mx-auto mb-2"></div>
          <div className="font-bold text-sm text-slate-900">ম্যানপাওয়ার ইনচার্জের স্বাক্ষর</div>
          <div className="text-slate-600 text-[11px]">মুনসুর আলী ট্রাভেলস হেড অফিস</div>
        </div>
      </div>

    </div>
  );
}
