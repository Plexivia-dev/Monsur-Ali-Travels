import React from 'react';
import { Building2, Image as ImageIcon, Receipt, Landmark, FileSpreadsheet, MapPin, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';

export function IndianVisaRequirementTemplate({ agencyInfo = {} }) {
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
            <div className="w-14 h-14 rounded-2xl bg-sky-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                Indian Visa Processing & Embassy Appointment Facilitation Desk
              </p>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                Authorized Visa Facilitator | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-xs">
            <div className="font-bold text-slate-900">Form Ref: MAT-INDVISA-02</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-sky-900 text-white py-3 px-6 rounded-lg text-center shadow-sm mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase">
            INDIAN VISA APPLICATION REQUIREMENT
          </h2>
          <p className="text-xs font-medium text-sky-200 mt-0.5">
            ইন্ডিয়ান ভিসা আবেদনের জন্য প্রয়োজনীয় কাগজপত্র ও অফিশিয়াল নির্দেশাবলী
          </p>
        </div>

        {/* Overview Notice */}
        <div className="text-xs leading-relaxed text-slate-800 text-justify mb-6 bg-sky-50/60 border border-sky-200 p-4 rounded-lg">
          ইন্ডিয়ান মেডিকেল / ট্যুরিস্ট / বিজনেস ভিসা দ্রুত ও নির্ভুলভাবে প্রসেসিং করার জন্য আবেদনকারীকে নিম্নোক্ত ডকুমেন্টস ও ছবি সহ সরাসরি মুনসুর আলী ট্রাভেলস এর অফিসে আসার জন্য অনুরোধ করা হলো।
        </div>

        {/* Main Requirement Cards */}
        <div className="space-y-4 mb-6">
          
          {/* Item 1: Utility Bill */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <Receipt className="w-4 h-4 text-sky-600 shrink-0" />
              <span>১. বিদ্যুৎ বিলের কপি (Utility / Electricity Bill Copy)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              আবেদনকারীর বর্তমান ঠিকানার প্রমাণস্বরূপ হালনাগাদ কারেন্ট বিলের (Electricity Bill) স্পষ্ট কপি সংযুক্ত করতে হবে। বিলের ঠিকানার সাথে আবেদনের ঠিকানা মিল থাকতে হবে।
            </p>
          </div>

          {/* Item 2: Photo Requirements */}
          <div className="p-4 border-2 border-sky-600 bg-sky-50/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase border-b border-sky-200 pb-1.5">
              <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
              <span>২. ছবি সংক্রান্ত নির্দেশাবলী (2x2 Inch Lab Scan Photo Guidelines)</span>
            </div>
            <div className="text-xs text-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span><strong>ছবি সাইজ:</strong> ২" x ২" (2x2 Inch) মেট পেপারে ল্যাব প্রিন্ট করা ছবি (সাদা ব্যাকগ্রাউন্ড)।</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span><strong>হোয়াটসঅ্যাপ কপি:</strong> ১ কপি ছবি আগেই এজেন্সির অফিশিয়াল হোয়াটসঅ্যাপ নম্বরে পাঠাতে হবে।</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span><strong>অফিস কপি:</strong> ৪ কপি ছবি সশরীরে অফিসে আসার সময় সাথে নিয়ে আসতে হবে।</span>
              </div>
            </div>
          </div>

          {/* Item 3: Financial & Property Documents */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <Landmark className="w-4 h-4 text-amber-600 shrink-0" />
              <span>৩. জায়গা/জমি বা ব্যবসার প্রমাণপত্র (Property / Business Documents)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">জমির খতিয়ান (Khatian Document)</span>
                <span className="text-slate-600 text-[11px]">
                  নিজের নামে বা অভিভাবকের নামে জমি/জায়গা থাকলে হালনাগাদ জমির খতিয়ানের ফটোকপি।
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">ট্রেড লাইসেন্স (Trade License)</span>
                <span className="text-slate-600 text-[11px]">
                  ব্যবসায়ীদের ক্ষেত্রে হালনাগাদ ট্রেড লাইসেন্সের স্পষ্ট কপি সহ অফিসিয়াল প্যাড।
                </span>
              </div>
            </div>
          </div>

          {/* Item 4: Bank Statement */}
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-200 pb-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>৪. ব্যাংক স্টেটমেন্ট (Bank Statement - Last 6 Months)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              বিগত **৬ (ছয়) মাসের সচল ব্যাংক স্টেটমেন্ট** (যেখানে সর্বনিম্ন ব্যালেন্স নিশ্চিত করা আছে)। ব্যাংক স্টেটমেন্ট অবশ্যই সংশ্লিষ্ট ব্যাংক অফিসার কর্তৃক **অফিশিয়াল সিল ও স্বাক্ষর** সম্বলিত হতে হবে।
            </p>
          </div>

        </div>

        {/* Office Visit Reminder Box */}
        <div className="p-4 border-2 border-slate-900 bg-slate-900 text-white rounded-xl flex items-center gap-3">
          <MapPin className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-400 block uppercase">অফিসে সশরীরে উপস্থিতির নির্দেশ:</span>
            <span>উক্ত সকল মূল কাগজপত্র ও ৪ কপি ছবি সাথে নিয়ে ইন্ডিয়ান ভিসা ফাইনাল ফাইল প্রস্তুতের জন্য মুনসুর আলী ট্রাভেলস অফিসে নির্ধারিত সময়ে সশরীরে উপস্থিত থাকুন।</span>
          </div>
        </div>

      </div>

      {/* Footer / Signature Block */}
      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end text-xs">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono">
            [ ইন্ডিয়ান ভিসা সেল সিল ]
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">ভিসা সেকশন সিল / Processing Seal</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-48 mx-auto mb-2"></div>
          <div className="font-bold text-sm text-slate-900">ভিসা কনসালটেন্টের স্বাক্ষর</div>
          <div className="text-slate-600 text-[11px]">মুনসুর আলী ট্রাভেলস ইন্ডিয়ান ভিসা ডেক্স</div>
        </div>
      </div>

    </div>
  );
}
