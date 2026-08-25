import React from 'react';
import { RotateCcw, Eye, ShieldCheck, UserCheck, FileCheck, PhoneCall, Sparkles } from 'lucide-react';
import { generateUniquePassportTrackingNo } from './sampleData';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-6 text-sm shadow-xs">
        
        {/* Form Title & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
          <div>
            <h2 className="font-black text-foreground text-xl sm:text-2xl tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              পাসপোর্ট জমা ও আবেদন ফরম
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              আবেদনকারীর পাসপোর্ট সংক্রান্ত সকল তথ্য পূরণ করুন এবং রসিদ সংগ্রহ করুন।
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-foreground font-bold text-xs">স্ট্যাটাস:</label>
            <select
              value={data.status || 'pending'}
              onChange={e => onChange({ ...data, status: e.target.value })}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="pending">অপেক্ষমান</option>
              <option value="processing">প্রসেসিং চলছে</option>
              <option value="submitted">জমা দেওয়া হয়েছে</option>
              <option value="delivered">সম্পন্ন / ডেলিভার্ড</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground text-xs mb-1.5">জমার তারিখ</label>
            <DatePicker
              value={data.submissionDate}
              onChange={val => onChange({ ...data, submissionDate: val })}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground text-xs mb-1.5">আবেদনের ধরন</label>
            <select
              value={data.passportType}
              onChange={e => onChange({ ...data, passportType: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ই-পাসপোর্ট">ই-পাসপোর্ট</option>
              <option value="এমআরপি">এমআরপি পাসপোর্ট</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            ১. আবেদনকারীর প্রয়োজনীয় তথ্য
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">আবেদনকারীর পূর্ণ নাম <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={data.applicantName}
                onChange={e => onChange({ ...data, applicantName: e.target.value })}
                placeholder="আবেদনকারীর নাম লিখুন"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">জাতীয় পরিচয়পত্র / জন্ম সনদ নম্বর</label>
              <input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                placeholder="এনআইডি বা জন্ম সনদ নম্বর"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">পূর্ববর্তী পাসপোর্ট নম্বর (যদি থাকে)</label>
              <input
                type="text"
                value={data.previousPassportNo}
                onChange={e => onChange({ ...data, previousPassportNo: e.target.value })}
                placeholder="পুরাতন পাসপোর্ট নম্বর"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono text-xs outline-none focus:ring-1 focus:ring-primary uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">ব্যক্তিগত মোবাইল নম্বর <span className="text-rose-500">*</span></label>
              <BdPhoneInput
                value={data.applicantPhone}
                onChange={(val) => onChange({ ...data, applicantPhone: val })}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">ইমেইল অ্যাড্রেস</label>
              <input
                type="email"
                value={data.applicantEmail}
                onChange={e => onChange({ ...data, applicantEmail: e.target.value })}
                placeholder="ইমেইল ঠিকানা লিখুন"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">সম্পূর্ণ ঠিকানা (গ্রাম, থানা ও জেলা)</label>
              <input
                type="text"
                value={data.address}
                onChange={e => onChange({ ...data, address: e.target.value })}
                placeholder="বর্তমান ও স্থায়ী ঠিকানা"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GUARDIAN DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            ২. অভিভাবকের তথ্য
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">অভিভাবকের নাম</label>
              <input
                type="text"
                value={data.guardianName}
                onChange={e => onChange({ ...data, guardianName: e.target.value })}
                placeholder="অভিভাবকের পূর্ণ নাম"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">সম্পর্ক</label>
              <select
                value={data.relationship}
                onChange={e => onChange({ ...data, relationship: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="পিতা">পিতা</option>
                <option value="মাতা">মাতা</option>
                <option value="স্বামী">স্বামী</option>
                <option value="স্ত্রী">স্ত্রী</option>
                <option value="আইনগত অভিভাবক">আইনগত অভিভাবক</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">অভিভাবকের ফোন নম্বর</label>
              <BdPhoneInput
                value={data.guardianPhone}
                onChange={(val) => onChange({ ...data, guardianPhone: val })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            ৩. পাসপোর্ট স্পেসিফিকেশন ও অপশন
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">আবেদনের বিভাগ</label>
              <select
                value={data.applicationCategory}
                onChange={e => onChange({ ...data, applicationCategory: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="নতুন আবেদন">নতুন আবেদন</option>
                <option value="রি-ইস্যু / নবায়ন">রি-ইস্যু / নবায়ন</option>
                <option value="তথ্য সংশোধন">তথ্য সংশোধন</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">পৃষ্ঠা সংখ্যা</label>
              <select
                value={data.pageCount}
                onChange={e => onChange({ ...data, pageCount: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="৪৮ পৃষ্ঠা">৪৮ পৃষ্ঠা</option>
                <option value="৬৪ পৃষ্ঠা">৬৪ পৃষ্ঠা</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">মেয়াদের সময়সীমা</label>
              <select
                value={data.validityYears}
                onChange={e => onChange({ ...data, validityYears: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="১০ বছর">১০ বছর</option>
                <option value="৫ বছর">৫ বছর</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground text-xs mb-1.5">ডেলিভারির গতি</label>
              <select
                value={data.deliverySpeed}
                onChange={e => onChange({ ...data, deliverySpeed: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="সাধারণ">সাধারণ</option>
                <option value="জরুরি">জরুরি</option>
                <option value="অতি জরুরি">অতি জরুরি</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCUMENTS CHECKLIST */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-bold text-foreground text-sm uppercase tracking-wider text-emerald-600">
            ৪. প্রাপ্ত কাগজপত্রের চেকলিস্ট
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
            {[
              { id: 'nidCopy', label: 'জাতীয় পরিচয়পত্র কপি / অনলাইন কপি', desc: 'এনআইডি কার্ডের দুই পাশের স্পষ্ট কপি' },
              { id: 'birthCertOnline', label: 'অনলাইন জন্ম সনদ (১৭ ডিজিট)', desc: '১৭ ডিজিটের অনলাইন রেজিস্টার্ড জন্ম সনদ' },
              { id: 'oldPassportOriginal', label: 'মূল পুরাতন পাসপোর্ট', desc: 'রি-ইস্যু / নবায়নের ক্ষেত্রে অরিজিনাল পাসপোর্ট' },
              { id: 'photoLabPrint', label: 'পাসপোর্ট সাইজ ল্যাব ছবি', desc: 'সাদা ব্যাকগ্রাউন্ডের ল্যাব প্রিন্ট ছবি' },
              { id: 'guardianNidCopy', label: 'অভিভাবকের এনআইডি কপি', desc: 'অভিভাবক/পিতা-মাতার এনআইডি কপির ফটোকপি' },
              { id: 'utilityBillCopy', label: 'ইউটিলিটি বিলের কপি', desc: 'বিদ্যুৎ/গ্যাস/পানি বিলের সাম্প্রতিক কপি' },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.documentsProvided?.[item.id])}
                  onChange={e => handleChecklistChange(item.id, e.target.checked)}
                  className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-foreground block text-xs">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="border-t border-border pt-4">
          <label className="block font-bold text-foreground text-xs mb-1.5">অফিসিয়াল মন্তব্য / স্পেশাল নোট</label>
          <textarea
            rows={2}
            value={data.remarks}
            onChange={e => onChange({ ...data, remarks: e.target.value })}
            placeholder="প্রয়োজনীয় কোনো বিশেষ নির্দেশনা বা মন্তব্য থাকলে লিখুন..."
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-xs outline-none resize-none focus:ring-1 focus:ring-primary"
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          <span>ফর্ম রিসেট</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>সংরক্ষণ করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>পাসপোর্ট ফাইল তৈরি ও প্রিভিউ দেখুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
