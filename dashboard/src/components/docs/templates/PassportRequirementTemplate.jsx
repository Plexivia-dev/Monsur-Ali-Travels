import React from 'react';
import { ShieldCheck, FileCheck, PhoneCall, Mail, MessageSquare, CheckSquare, Building2 } from 'lucide-react';

export function PassportRequirementTemplate({ agencyInfo = {} }) {
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
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-[11px] font-semibold text-slate-700">
                Government Approved Overseas Manpower & Passport Processing Agency
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                License No: RL-1842 | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-[11px]">
            <div className="font-bold text-slate-900">Form Ref: MAT-PASSPORT-01</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-slate-900 text-white py-2 px-4 rounded-lg text-center shadow-sm mb-3.5">
          <h2 className="text-lg font-extrabold tracking-wider uppercase">
            REQUIRED FILES FOR PASSPORT SUBMISSION
          </h2>
          <p className="text-[11px] font-medium text-amber-300">
            পাসপোর্ট জমা ও নতুন আবেদনের জন্য প্রয়োজনীয় কাগজপত্র ও তথ্যাবলী
          </p>
        </div>

        {/* Introduction */}
        <div className="text-[11px] leading-relaxed text-slate-800 text-justify mb-3.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
          মুনসুর আলী ট্রাভেলস এর মাধ্যমে ই-পাসপোর্ট (E-Passport) বা এমআরপি পাসপোর্ট নবায়ন/নতুন আবেদনের সুবিধার্থে নিম্নবর্ণিত প্রয়োজনীয় ডকুমেন্টস ও তথ্যাবলী সঠিকভাবে প্রস্তুত করে অফিসে জমা দিন অথবা অফিশিয়াল হোয়াটসঅ্যাপ নম্বরে মেসেজ দিন।
        </div>

        {/* Section 1: Applicant Information & NID */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center gap-1.5 border-b-2 border-slate-800 pb-1">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
              ১. আবেদনকারীর প্রয়োজনীয় ডকুমেন্ট ও তথ্য (Applicant Documents & Info)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">জাতীয় পরিচয়পত্র (NID / Birth Certificate)</span>
                <span className="text-slate-600 text-[10px]">
                  NID Card এর স্পষ্ট কপি বা অনলাইন কপি। NID না থাকলে ১৬ ডিজিটের জন্ম সনদ কপি।
                </span>
              </div>
            </div>

            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">পাসপোর্ট নম্বর (Passport Number)</span>
                <span className="text-slate-600 text-[10px]">
                  পূর্ববর্তী পাসপোর্ট থাকলে মূল পাসপোর্ট কপি ও পাসপোর্ট নম্বর প্রদান করতে হবে।
                </span>
              </div>
            </div>

            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">আবেদনকারীর ফোন নম্বর (Phone Number)</span>
                <span className="text-slate-600 text-[10px]">
                  আবেদনকারীর সচল ব্যক্তিগত মোবাইল নম্বর যা পাসপোর্ট ওটিপি (OTP) কাজে লাগবে।
                </span>
              </div>
            </div>

            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">ইমেইল অ্যাড্রেস (Email Address)</span>
                <span className="text-slate-600 text-[10px]">
                  ব্যক্তিগত সচল ইমেইল। ই-পাসপোর্ট সামারি ও বায়োমেট্রিক স্লিপ এতে পাঠানো হবে।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Guardian Information */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center gap-1.5 border-b-2 border-slate-800 pb-1">
            <FileCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
              ২. অভিভাবক / গার্জিয়ানের প্রয়োজনীয় তথ্য (Guardian Details)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">গার্জিয়ানের নাম</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Full Name</span>
            </div>

            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">গার্জিয়ানের ফোন নম্বর</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Contact Phone</span>
            </div>

            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">গার্জিয়ানের ইমেইল</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Email Address</span>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Submission Instruction */}
        <div className="p-3 border-2 border-emerald-600 bg-emerald-50/50 rounded-xl space-y-1 mb-3.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>হোয়াটসঅ্যাপে প্রেরণের নির্দেশাবলী (WhatsApp Submission Guidelines)</span>
          </div>
          <p className="text-[11px] text-slate-800 leading-relaxed text-justify">
            সকল কাগজপত্র সুস্পষ্ট স্ক্যান বা স্পষ্ট ছবি তুলে মুনসুর আলী ট্রাভেলস এর অফিশিয়াল **হোয়াটসঅ্যাপ (WhatsApp) নম্বরে** সরাসরি মেসেজ পাঠাতে হবে।
          </p>
        </div>

        {/* Important Notes */}
        <div className="p-2.5 border border-amber-300 bg-amber-50/60 rounded-lg text-[10px] text-slate-800 space-y-0.5">
          <span className="font-bold text-amber-900 block">📌 বিশেষ সতর্কবার্তা:</span>
          <p>
            ১. নাম, পিতা-মাতার নাম ও জন্ম তারিখ এনআইডি/জন্ম সনদের সাথে ১০০% মিল থাকতে হবে।
            <br />
            ২. তথ্যে ভুল থাকলে বাজরুরী প্রয়োজনে এজেন্সির হেল্পডেস্কে অবিলম্বে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* Footer / Signature Block */}
      <div className="pt-4 mt-4 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-mono">
            [ এজেন্সির সিল ]
          </div>
          <div className="text-[10px] text-slate-600 font-semibold">অফিসিয়াল সিল / Agency Stamp</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-36 mx-auto mb-1"></div>
          <div className="font-bold text-xs text-slate-900">অনুমোদিত কর্মকর্তার স্বাক্ষর</div>
          <div className="text-slate-600 text-[10px]">মুনসুর আলী ট্রাভেলস প্রসেসিং সেল</div>
        </div>
      </div>

    </div>
  );
}
