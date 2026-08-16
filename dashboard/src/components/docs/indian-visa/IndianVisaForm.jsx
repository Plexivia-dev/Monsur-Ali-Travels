import React from 'react';
import { RotateCcw, Eye, Stamp, UserCheck, FileCheck, PhoneCall } from 'lucide-react';

export function IndianVisaForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
  const handleChecklistChange = (key, checked) => {
    onChange({
      ...data,
      documentsProvided: {
        ...data.documentsProvided,
        [key]: checked
      }
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full max-w-[850px] mx-auto space-y-5">
      <div className="bg-card border border-border rounded-[4px] p-6 sm:p-7 space-y-5 text-sm shadow-xs">
        
        {/* Header Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border pb-4 gap-3">
          <div>
            <h2 className="font-black text-foreground text-xl sm:text-2xl tracking-tight flex items-center gap-2">
              <Stamp className="w-6 h-6 text-emerald-600 shrink-0" />
              Indian Visa Application Form
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-foreground font-bold text-sm">স্ট্যাটাস (Status):</label>
            <select
              value={data.status || 'pending'}
              onChange={e => onChange({ ...data, status: e.target.value })}
              className="bg-background border border-border rounded-[4px] px-3 py-2 text-sm font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="pending">Pending (অপেক্ষমান)</option>
              <option value="processing">Processing (প্রসেসিং চলছে)</option>
              <option value="submitted">Submitted (জমা দেওয়া হয়েছে)</option>
              <option value="delivered">Delivered (সম্পন্ন / ডেলিভার্ড)</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-muted/20 p-4.5 rounded-[4px] border border-border">
          <div>
            <label className="block font-bold text-foreground text-sm mb-1.5">জমার তারিখ (Submission Date)</label>
            <input
              type="text"
              value={data.submissionDate}
              onChange={e => onChange({ ...data, submissionDate: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground text-sm mb-1.5">ভিসার ক্যাটাগরি (Visa Category)</label>
            <select
              value={data.visaType}
              onChange={e => onChange({ ...data, visaType: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-semibold text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ট্যুরিস্ট ভিসা (Tourist Visa)">ট্যুরিস্ট ভিসা (Tourist Visa)</option>
              <option value="মেডিকেল ভিসা (Medical Visa)">মেডিকেল ভিসা (Medical Visa)</option>

              <option value="বিজনেস ভিসা (Business Visa)">বিজনেস ভিসা (Business Visa)</option>
              <option value="এন্ট্রি ভিসা (Entry Visa)">এন্ট্রি ভিসা (Entry Visa)</option>
              <option value="স্টুডেন্ট ভিসা (Student Visa)">স্টুডেন্ট ভিসা (Student Visa)</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            ১. আবেদনকারীর ব্যক্তিগত তথ্য (Applicant Information)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">আবেদনকারীর পূর্ণ নাম (Full Name) *</label>
              <input
                type="text"
                required
                value={data.applicantName}
                onChange={e => onChange({ ...data, applicantName: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-bold text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">পাসপোর্ট নম্বর (Passport No.) *</label>
              <input
                type="text"
                required
                value={data.passportNo}
                onChange={e => onChange({ ...data, passportNo: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono font-bold text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">NID / জন্ম সনদ নম্বর (NID or Birth Cert No.)</label>
              <input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">ব্যক্তিগত মোবাইল নম্বর (Phone Number) *</label>
              <input
                type="text"
                required
                value={data.applicantPhone}
                onChange={e => onChange({ ...data, applicantPhone: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">ইমেইল অ্যাড্রেস (Email Address)</label>
              <input
                type="email"
                value={data.applicantEmail}
                onChange={e => onChange({ ...data, applicantEmail: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">ঠিকানা (Village, Upazila, District)</label>
              <input
                type="text"
                value={data.address}
                onChange={e => onChange({ ...data, address: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: VISA SPECIFICATIONS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            ২. ইন্ডিয়ান ভিসা স্পেসিফিকেশন (Visa Details & Travel Specs)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">পোর্ট / এন্ট্রি রুট (Entry Port)</label>
              <select
                value={data.entryPort}
                onChange={e => onChange({ ...data, entryPort: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="হরিদাসপুর / গেদে (Haridaspur / Gede)">হরিদাসপুর / গেদে (Haridaspur / Gede)</option>
                <option value="বাই এয়ার / বিমানবন্দর (By Air)">বাই এয়ার / বিমানবন্দর (By Air)</option>
                <option value="আগরতলা (Agartala)">আগরতলা (Agartala)</option>
                <option value="ঘোজাদাঙ্গা (Ghojadanga)">ঘোজাদাঙ্গা (Ghojadanga)</option>
                <option value="ডাউকি / তামাবিল (Dawki / Tamabil)">ডাউকি / তামাবিল (Dawki / Tamabil)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">ভিসার মেয়াদ (Duration)</label>
              <select
                value={data.durationMonths}
                onChange={e => onChange({ ...data, durationMonths: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="১ বছর (1 Year Multiple)">১ বছর (1 Year Multiple)</option>
                <option value="৬ মাস (6 Months Multiple)">৬ মাস (6 Months Multiple)</option>
                <option value="৩ মাস (3 Months Single)">৩ মাস (3 Months Single)</option>
                <option value="৫ বছর (5 Years Multiple)">৫ বছর (5 Years Multiple)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">এন্ট্রি টাইপ (Entry Type)</label>
              <select
                value={data.entryType}
                onChange={e => onChange({ ...data, entryType: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="মাল্টিপল এন্ট্রি (Multiple Entry)">মাল্টিপল এন্ট্রি (Multiple Entry)</option>

                <option value="সিঙ্গেল এন্ট্রি (Single Entry)">সিঙ্গেল এন্ট্রি (Single Entry)</option>
                <option value="ডাবল এন্ট্রি (Double Entry)">ডাবল এন্ট্রি (Double Entry)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: DOCUMENTS CHECKLIST */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600">
            ৩. প্রাপ্ত কাগজপত্রের চেকলিস্ট (Checklist of Provided Required Files)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-500/5 p-4.5 rounded-[4px] border border-emerald-500/20">
            {[
              { id: 'passportOriginal', label: 'মূল পাসপোর্ট (Original Passport)', desc: 'কমপক্ষে ৬ মাসের মেয়াদী অরিজিনাল পাসপোর্ট' },
              { id: 'nidCopy', label: 'জাতীয় পরিচয়পত্র (NID) / জন্ম সনদ কপি', desc: 'এনআইডি বা ১৭ ডিজিটের অনলাইন জন্ম সনদ কপি' },
              { id: 'photoLabPrint', label: '২x২ ইঞ্চি ল্যাব প্রিন্ট ছবি (2x2 Photo)', desc: 'সাদা ব্যাকগ্রাউন্ডের ছবি' },
              { id: 'bankSolvency', label: 'ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট', desc: 'কমপক্ষে ২০,০০০ টাকার ব্যাংক স্টেটমেন্ট বা $200 ডলার' },
              { id: 'utilityBillCopy', label: 'ইউটিলিটি বিলের কপি (Utility Bill)', desc: 'বিদ্যুৎ/পানি/গ্যাস বিলের কপি' },
              { id: 'previousVisaCopy', label: 'পূর্ববর্তী ইন্ডিয়ান ভিসা কপি (Old Visa)', desc: 'পূর্বে ইন্ডিয়ান ভিসা থাকলে তার কপি' },
              { id: 'nocTradeLicense', label: 'NOC / ট্রেড লাইসেন্স / স্টুডেন্ট কার্ড', desc: 'পেশাগত ডকুমেন্টস' },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.documentsProvided?.[item.id])}
                  onChange={e => handleChecklistChange(item.id, e.target.checked)}
                  className="w-4 h-4 rounded-[4px] text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-foreground block text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="border-t border-border pt-4">
          <label className="block font-bold text-foreground text-sm mb-1.5">অফিসিয়াল মন্তব্য / স্পেশাল নোট (Office Remarks)</label>
          <textarea
            rows={2}
            value={data.remarks}
            onChange={e => onChange({ ...data, remarks: e.target.value })}
            placeholder=""
            className="w-full bg-background border border-border rounded-[4px] p-3 text-foreground text-sm outline-none resize-none focus:ring-1 focus:ring-primary"
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4.5 rounded-[4px] flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] text-sm font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>ফর্ম রিসেট (Reset)</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>সংরক্ষণ করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>ইন্ডিয়ান ভিসা রসিদ তৈরি ও প্রিভিউ দেখুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
