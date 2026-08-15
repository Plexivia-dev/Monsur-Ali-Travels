import React from 'react';
import { Building2, Plane, CheckCircle2, FileText, UserCheck, ShieldAlert, Award } from 'lucide-react';

export function ManpowerChecklistTemplate({ agencyInfo = {} }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="border-2 border-slate-800 p-5 sm:p-6 flex flex-col justify-between bg-white text-slate-900 font-sans print:p-0 print:border-0">
      
      {/* Header Section */}
      <div>
        <div className="border-b-2 border-slate-900 pb-3 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-[11px] font-semibold text-slate-700">
                BMET Government Clearance & Flight Processing Operations Cell
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                License No: RL-1842 | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-[11px]">
            <div className="font-bold text-slate-900">Form Ref: MAT-MANPOWER-03</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-amber-900 text-white py-2 px-4 rounded-lg text-center shadow-sm mb-3.5">
          <h2 className="text-lg font-extrabold tracking-wider uppercase">
            MANPOWER & FLIGHT PROCESSING CHECKLIST
          </h2>
          <p className="text-[11px] font-medium text-amber-200">
            ম্যানপাওয়ার স্মার্ট কার্ড, বায়োমেট্রিক ও ফ্লাইট প্রসেসিং চেকলিস্ট
          </p>
        </div>

        {/* Overview Notice */}
        <div className="text-[11px] leading-relaxed text-slate-800 text-justify mb-3 bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg">
          বিএমইটি (BMET) ম্যানপাওয়ার ক্লিয়ারেন্স, স্মার্ট কার্ড কার্ড তৈরি ও ফ্লাইট প্রসেসিংয়ের জন্য নিম্নোক্ত সকল চেকলিস্ট সম্পন্ন করার নির্দেশ দেওয়া হলো।
        </div>

        {/* Main Requirement Cards */}
        <div className="space-y-2.5 mb-3.5">
          
          {/* Section 1: Biometric & Medical */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>১. মেডিকেল ও বায়োমেট্রিক ফিঙ্গারপ্রিন্ট (Medical & Biometric Fingerprint)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">মেডিকেল ফিট সার্টিফিকেট</span>
                <span className="text-slate-600 text-[10px]">গামকা (GAMCA) ফিট মেডিকেল রিপোর্ট।</span>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">বায়োমেট্রিক ফিঙ্গারপ্রিন্ট</span>
                <span className="text-slate-600 text-[10px]">বিএমইটি ফিঙ্গারপ্রিন্ট সম্পন্ন স্লিপ।</span>
              </div>
            </div>
          </div>

          {/* Section 2: Training & Smart Card */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>২. ওটিটিসি ট্রেনিং ও বিএমইটি স্মার্ট কার্ড (TTC Training & Smart Card)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">টিটিসি ট্রেনিং সনদ</span>
                <span className="text-slate-600 text-[10px]">৩ দিনের ব্রিফিং ট্রেনিং সার্টিফিকেট।</span>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">BMET স্মার্ট কার্ড</span>
                <span className="text-slate-600 text-[10px]">ম্যানপাওয়ার ইমিগ্রেশন স্মার্ট কার্ড।</span>
              </div>
            </div>
          </div>

          {/* Section 3: Visa Stamping & Contract */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>৩. ভিসা স্ট্যাম্পিং ও ফ্লাইট টিকিট (Visa Stamping & Flight Ticket)</span>
            </div>
            <div className="text-[11px] text-slate-800 space-y-1">
              <div>• <strong>ভিসা কপি:</strong> এম্বাসি কর্তৃক স্ট্যাম্পকৃত অরিজিনাল পাসপোর্ট ও ওয়ার্ক পারমিট ভিসা কপি।</div>
              <div>• <strong>ফ্লাইট টিকিট:</strong> কনফার্ম এয়ারলাইন টিকিট কপি ও এয়ারপোর্ট ইমিগ্রেশন পেপারস।</div>
            </div>
          </div>

        </div>

        {/* Flight Departure Reminder Box */}
        <div className="p-2.5 border-2 border-amber-900 bg-amber-900 text-white rounded-xl flex items-center gap-2.5">
          <Plane className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-[11px]">
            <span className="font-bold text-amber-400 block uppercase">এয়ারপোর্ট উপস্থিতি ও নির্দেশাবলী:</span>
            <span>ফ্লাইটের নির্ধারিত সময়ের অন্তত ৪ ঘণ্টা পূর্বে এয়ারপোর্টে মূল পাসপোর্ট ও ম্যানপাওয়ার কার্ড সহ উপস্থিত থাকুন।</span>
          </div>
        </div>

      </div>

      {/* Footer / Signature Block */}
      <div className="pt-4 mt-4 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-mono">
            [ ম্যানপাওয়ার সেল ]
          </div>
          <div className="text-[10px] text-slate-600 font-semibold">অফিসিয়াল ম্যানপাওয়ার সিল / Stamp</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-36 mx-auto mb-1"></div>
          <div className="font-bold text-xs text-slate-900">ম্যানপাওয়ার অফিসার স্বাক্ষর</div>
          <div className="text-slate-600 text-[10px]">মুনসুর আলী ট্রাভেলস ইমিগ্রেশন ডেক্স</div>
        </div>
      </div>

    </div>
  );
}
