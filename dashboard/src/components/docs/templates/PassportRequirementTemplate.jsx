import React from 'react';
import { ShieldCheck, FileCheck, PhoneCall, Mail, MessageSquare, CheckSquare, Building2 } from 'lucide-react';

export function PassportRequirementTemplate({ agencyInfo = {} }) {
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
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {agencyInfo.name || 'MONSUR ALI TRAVELS'}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                Government Approved Overseas Manpower & Passport Processing Agency
              </p>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                License No: RL-1842 | Head Office: Dhaka, Bangladesh | Cell: +880 1700-000000
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block font-mono text-xs">
            <div className="font-bold text-slate-900">Form Ref: MAT-PASSPORT-01</div>
            <div className="text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-slate-900 text-white py-3 px-6 rounded-lg text-center shadow-sm mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase">
            REQUIRED FILES FOR PASSPORT SUBMISSION
          </h2>
          <p className="text-xs font-medium text-amber-300 mt-0.5">
            পাসপোর্ট জমা ও নতুন আবেদনের জন্য প্রয়োজনীয় কাগজপত্র ও তথ্যাবলী
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs leading-relaxed text-slate-800 text-justify mb-6 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          মুনসুর আলী ট্রাভেলস এর মাধ্যমে ই-পাসপোর্ট (E-Passport) বা এমআরপি পাসপোর্ট নবায়ন/নতুন আবেদনের সুবিধার্থে নিম্নবর্ণিত প্রয়োজনীয় ডকুমেন্টস ও তথ্যাবলী সঠিকভাবে প্রস্তুত করে অফিসে জমা দিন অথবা আমাদের অফিশিয়াল হোয়াটসঅ্যাপ নম্বরে ডিজিটাল কপি প্রেরণ করুন।
        </div>

        {/* Section 1: Applicant Information & NID */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-1.5">
            <ShieldCheck className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              ১. আবেদনকারীর প্রয়োজনীয় ডকুমেন্ট ও তথ্য (Applicant Documents & Info)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">জাতীয় পরিচয়পত্র (NID / Birth Certificate)</span>
                <span className="text-slate-600 text-[11px]">
                  জাতীয় পরিচয়পত্র (NID Card) এর স্পষ্ট কপি বা অনলাইন কপি। NID না থাকলে ১৬ ডিজিটের ডিজিটাল জন্ম নিবন্ধন সনদের স্পষ্ট কপি।
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">পাসপোর্ট নম্বর (Passport Number)</span>
                <span className="text-slate-600 text-[11px]">
                  যদি পূর্ববর্তী পাসপোর্ট থাকে তবে পূর্বের মূল পাসপোর্ট কপি ও পাসপোর্ট নম্বর তথ্য হিসেবে প্রদান করতে হবে।
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">আবেদনকারীর ফোন নম্বর (Phone Number)</span>
                <span className="text-slate-600 text-[11px]">
                  আবেদনকারীর সচল ব্যক্তিগত মোবাইল নম্বর যা পাসপোর্ট ভেরিফিকেশন ও ওটিপি (OTP) কাজে ব্যবহৃত হবে।
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">ইমেইল অ্যাড্রেস (Applicant Email Address)</span>
                <span className="text-slate-600 text-[11px]">
                  আবেদনকারীর ব্যক্তিগত সচল ইমেইল অ্যাড্রেস। অফিশিয়াল ই-পাসপোর্ট সামারি ও বায়োমেট্রিক স্লিপ এতে পাঠানো হবে।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Guardian Information */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-1.5">
            <FileCheck className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              ২. অভিভাবক / গার্জিয়ানের প্রয়োজনীয় তথ্য (Guardian Details)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">গার্জিয়ানের নাম</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Full Name</span>
              <p className="text-[10px] text-slate-500 mt-1">পিতা / মাতা / আইনগত অভিভাবকের নাম</p>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">গার্জিয়ানের ফোন নম্বর</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Contact Phone</span>
              <p className="text-[10px] text-slate-500 mt-1">জরুরি প্রয়োজনে যোগাযোগের ফোন নম্বর</p>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">গার্জিয়ানের ইমেইল</span>
              <span className="font-semibold text-slate-900 text-xs">Guardian Email Address</span>
              <p className="text-[10px] text-slate-500 mt-1">অভিভাবকের ইমেইল ঠিকানা (যদি থাকে)</p>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Submission Instruction */}
        <div className="p-4 border-2 border-emerald-600 bg-emerald-50/50 rounded-xl space-y-2 mb-6">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>হোয়াটসঅ্যাপে প্রেরণের নির্দেশাবলী (WhatsApp Submission Guidelines)</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">
            উপরে উল্লেখিত সকল কাগজপত্র (এনআইডি, এনআইডি নম্বর, আবেদনকারীর ফোন, নাম, ইমেইল, গার্ডিয়ানের নাম, ইমেইল, মোবাইল ও পাসপোর্ট নম্বর) সুস্পষ্ট ছবি বা স্ক্যান কপি আকারে মুনসুর আলী ট্রাভেলস এর অফিশিয়াল **হোয়াটসঅ্যাপ (WhatsApp) নম্বরে** মেসেজ পাঠাতে হবে।
          </p>
        </div>

        {/* Important Notes */}
        <div className="p-3 border border-amber-300 bg-amber-50/60 rounded-lg text-[11px] text-slate-800 space-y-1">
          <span className="font-bold text-amber-900 block">📌 বিশেষ সতর্কবার্তা:</span>
          <p>
            ১. জন্ম তারিখ, পিতা-মাতার নাম এনআইডি বা জন্ম সনদের সাথে ১০০% হুবহু মিল থাকতে হবে।
            <br />
            ২. জরুরী প্রয়োজনে বা ভুল সংশোধনের ক্ষেত্রে এজেন্সির হেল্পডেস্কে অবিলম্বে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* Footer / Signature Block */}
      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end text-xs">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono">
            [ এজেন্সির সিল ]
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">অফিসিয়াল সিল / Agency Stamp</div>
        </div>

        <div className="text-center space-y-1">
          <div className="border-b-2 border-slate-900 w-48 mx-auto mb-2"></div>
          <div className="font-bold text-sm text-slate-900">অনুমোদিত কর্মকর্তার স্বাক্ষর</div>
          <div className="text-slate-600 text-[11px]">মুনসুর আলী ট্রাভেলস প্রসেসিং সেল</div>
        </div>
      </div>

    </div>
  );
}
