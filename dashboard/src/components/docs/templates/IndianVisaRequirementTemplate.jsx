import React from 'react';
import { Building2, Image as ImageIcon, Receipt, Landmark, FileSpreadsheet, MapPin, FileText, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

export function IndianVisaRequirementTemplate({ agencyInfo = {} }) {
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
            <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-md shrink-0 overflow-hidden">
              <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-[11px] font-semibold text-slate-700">
                Indian Visa Processing & Embassy Appointment Facilitation Desk
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                Authorized Visa Facilitator | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-[11px]">
            <div className="font-bold text-slate-900">Form Ref: MAT-INDVISA-02</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-sky-900 text-white py-2 px-4 rounded-lg text-center shadow-sm mb-3.5">
          <h2 className="text-lg font-extrabold tracking-wider uppercase">
            INDIAN VISA APPLICATION REQUIREMENT
          </h2>
          <p className="text-[11px] font-medium text-sky-200">
            ইন্ডিয়ান ভিসা আবেদনের জন্য প্রয়োজনীয় কাগজপত্র ও অফিশিয়াল নির্দেশাবলী
          </p>
        </div>

        {/* Overview Notice */}
        <div className="text-[11px] leading-relaxed text-slate-800 text-justify mb-3 bg-sky-50/60 border border-sky-200 p-2.5 rounded-lg">
          ইন্ডিয়ান মেডিকেল / ট্যুরিস্ট / বিজনেস ভিসা প্রসেসিং করার জন্য প্রয়োজনীয় ডকুমেন্টস ও ছবি সহ সরাসরি অফিশিয়াল এজেন্সির অফিসে আসার জন্য অনুরোধ করা হলো।
        </div>

        {/* Main Requirement Cards */}
        <div className="space-y-2.5 mb-3.5">
          
          {/* Item 1: Utility Bill */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <Receipt className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>১. বিদ্যুৎ বিলের কপি (Utility / Electricity Bill Copy)</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              বর্তমান ঠিকানার প্রমাণস্বরূপ হালনাগাদ কারেন্ট বিলের স্পষ্ট ফটোকপি সংযুক্ত করতে হবে।
            </p>
          </div>

          {/* Item 2: Photo Requirements */}
          <div className="p-2.5 border-2 border-sky-600 bg-sky-50/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs uppercase border-b border-sky-200 pb-1">
              <ImageIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>২. ছবি সংক্রান্ত নির্দেশাবলী (2x2 Inch Lab Scan Photo Guidelines)</span>
            </div>
            <div className="text-[11px] text-slate-800 space-y-1">
              <div>• <strong>সাইজ:</strong> ২" x ২" (2x2 Inch) মেট পেপারে ল্যাব প্রিন্ট করা ছবি (সাদা ব্যাকগ্রাউন্ড)।</div>
              <div>• <strong>হোয়াটসঅ্যাপ:</strong> ১ কপি ছবি আগেই এজেন্সির অফিশিয়াল হোয়াটসঅ্যাপ নম্বরে পাঠাতে হবে।</div>
              <div>• <strong>অফিস কপি:</strong> ৪ কপি ছবি সশরীরে অফিসে আসার সময় সাথে নিয়ে আসতে হবে।</div>
            </div>
          </div>

          {/* Item 3: Financial & Property Documents */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>৩. জায়গা/জমি বা ব্যবসার প্রমাণপত্র (Property / Business Documents)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">জমির খতিয়ান (Khatian)</span>
                <span className="text-slate-600 text-[10px]">
                  নিজের/অভিভাবকের নামে জমি থাকলে খতিয়ানের কপি।
                </span>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block text-xs">ট্রেড লাইসেন্স (Trade License)</span>
                <span className="text-slate-600 text-[10px]">
                  ব্যবসায়ীদের ক্ষেত্রে হালনাগাদ ট্রেড লাইসেন্স কপি।
                </span>
              </div>
            </div>
          </div>

          {/* Item 4: Bank Statement */}
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/60 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>৪. ব্যাংক স্টেটমেন্ট (Bank Statement - Last 6 Months)</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              বিগত **৬ মাসের সচল ব্যাংক স্টেটমেন্ট** (অফিশিয়াল ব্যাংক সিল ও স্বাক্ষর সহ)।
            </p>
          </div>

        </div>

        {/* Office Visit Reminder Box */}
        <div className="p-2.5 border-2 border-slate-900 bg-slate-900 text-white rounded-xl flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-[11px]">
            <span className="font-bold text-amber-400 block uppercase">অফিসে উপস্থিতির নির্দেশ:</span>
            <span>সকল মূল কাগজপত্র ও ৪ কপি ছবি নিয়ে অফিসে আসার অনুরোধ করা হলো।</span>
          </div>
        </div>

      </div>

      {/* Footer / Signature Block */}
      <div className="pt-4 mt-4 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-mono">
            [ ইন্ডিয়ান ভিসা সেল ]
          </div>
          <div className="text-[10px] text-slate-600 font-semibold">ভিসা সেকশন সিল / Processing Seal</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-36 mx-auto mb-1"></div>
          <div className="font-bold text-xs text-slate-900">ভিসা কনসালটেন্টের স্বাক্ষর</div>
          <div className="text-slate-600 text-[10px]">মুনসুর আলী ট্রাভেলস ইন্ডিয়ান ভিসা ডেক্স</div>
        </div>
      </div>

    </div>
  );
}
