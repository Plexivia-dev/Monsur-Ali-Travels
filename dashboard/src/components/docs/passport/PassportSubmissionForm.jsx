import React from 'react';
import { RotateCcw, Eye, ShieldCheck, UserCheck, FileCheck, PhoneCall, Sparkles } from 'lucide-react';
import { generateUniquePassportTrackingNo } from './sampleData';

export function PassportSubmissionForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
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
        
        {/* Form Title & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border pb-4 gap-3">
          <div>
            <h2 className="font-black text-foreground text-xl sm:text-2xl tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              Passport Submission Form
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
            <label className="block font-bold text-foreground text-sm mb-1.5">আবেদনের ধরন (Passport Type)</label>
            <select
              value={data.passportType}
              onChange={e => onChange({ ...data, passportType: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-semibold text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ই-পাসপোর্ট (E-Passport)">ই-পাসপোর্ট (E-Passport)</option>
              <option value="এমআরপি (MRP Passport)">এমআরপি (MRP Passport)</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            ১. আবেদনকারীর প্রয়োজনীয় তথ্য (Applicant Information)
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
              <label className="block font-bold text-foreground text-sm mb-1.5">NID / জন্ম সনদ নম্বর (NID or Birth Certificate No.)</label>
              <input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">পূর্ববর্তী পাসপোর্ট নম্বর (Old Passport No. if any)</label>
              <input
                type="text"
                value={data.previousPassportNo}
                onChange={e => onChange({ ...data, previousPassportNo: e.target.value })}
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

        {/* SECTION 2: GUARDIAN DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            ২. অভিভাবকের তথ্য (Guardian Details)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">অভিভাবকের নাম (Guardian Name)</label>
              <input
                type="text"
                value={data.guardianName}
                onChange={e => onChange({ ...data, guardianName: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">সম্পর্ক (Relationship)</label>
              <select
                value={data.relationship}
                onChange={e => onChange({ ...data, relationship: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-semibold text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="পিতা">পিতা (Father)</option>
                <option value="মাতা">মাতা (Mother)</option>
                <option value="স্বামী">স্বামী (Husband)</option>
                <option value="স্ত্রী">স্ত্রী (Wife)</option>
                <option value="আইনগত অভিভাবক">আইনগত অভিভাবক (Legal Guardian)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">অভিভাবকের ফোন নম্বর</label>
              <input
                type="text"
                value={data.guardianPhone}
                onChange={e => onChange({ ...data, guardianPhone: e.target.value })}
                placeholder=""
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            ৩. পাসপোর্ট স্পেসিফিকেশন ও অপশন (Passport Specifications)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">আবেদনের বিভাগ (Category)</label>
              <select
                value={data.applicationCategory}
                onChange={e => onChange({ ...data, applicationCategory: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="নতুন আবেদন (New Passport)">নতুন আবেদন (New Passport)</option>
                <option value="রি-ইস্যু / নবায়ন (Re-issue / Renewal)">রি-ইস্যু / নবায়ন (Re-issue)</option>
                <option value="তথ্য সংশোধন (Data Correction)">তথ্য সংশোধন (Correction)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">পৃষ্ঠা সংখ্যা (Page Count)</label>
              <select
                value={data.pageCount}
                onChange={e => onChange({ ...data, pageCount: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="৪৮ পৃষ্ঠা (48 Pages)">৪৮ পৃষ্ঠা (48 Pages)</option>
                <option value="৬৪ পৃষ্ঠা (64 Pages)">৬৪ পৃষ্ঠা (64 Pages)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">মেয়াদের মেয়াদ (Validity)</label>
              <select
                value={data.validityYears}
                onChange={e => onChange({ ...data, validityYears: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="১০ বছর (10 Years)">১০ বছর (10 Years)</option>
                <option value="৫ বছর (5 Years)">৫ বছর (5 Years)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">ডেলিভারির সময়সীমা (Speed)</label>
              <select
                value={data.deliverySpeed}
                onChange={e => onChange({ ...data, deliverySpeed: e.target.value })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-medium text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="সাধারণ (Regular)">সাধারণ (Regular)</option>
                <option value="জরুরি (Express)">জরুরি (Express)</option>
                <option value="অতি জরুরি (Super Express)">অতি জরুরি (Super Express)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCUMENTS CHECKLIST */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600">
            ৪. প্রাপ্ত কাগজপত্রের চেকলিস্ট (Checklist of Provided Required Files)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-500/5 p-4.5 rounded-[4px] border border-emerald-500/20">
            {[
              { id: 'nidCopy', label: 'জাতীয় পরিচয়পত্র (NID) কপি / অনলাইন কপি', desc: 'আবেদনকারীর এনআইডি কার্ডের দুই পাশের স্পষ্ট কপি' },
              { id: 'birthCertOnline', label: 'অনলাইন জন্ম সনদ (১৭ ডিজিট)', desc: '১৭ ডিজিটের অনলাইন রেজিস্টার্ড জন্ম সনদ' },
              { id: 'oldPassportOriginal', label: 'মূল পুরাতন পাসপোর্ট (Old Passport)', desc: 'রি-ইস্যু / নবায়নের ক্ষেত্রে অরিজিনাল পাসপোর্ট' },
              { id: 'photoLabPrint', label: 'পাসপোর্ট সাইজ ল্যাব ছবি (Photo)', desc: 'সাদা ব্যাকগ্রাউন্ডের ল্যাব প্রিন্ট ছবি' },
              { id: 'guardianNidCopy', label: 'অভিভাবকের NID কপি', desc: 'অভিভাবক/পিতা-মাতার এনআইডি কপির ফটোকপি' },
              { id: 'utilityBillCopy', label: 'ইউটিলিটি বিলের কপি', desc: 'বিদ্যুৎ/গ্যাস/পানি বিলের সাম্প্রতিক কপি' },
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
              <span>পাসপোর্ট ফাইল তৈরি ও প্রিভিউ দেখুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
