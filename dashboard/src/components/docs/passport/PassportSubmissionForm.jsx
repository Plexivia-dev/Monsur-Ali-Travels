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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      <div className="bg-card border border-border rounded-md p-4 sm:p-5 space-y-5 text-xs shadow-xs">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3">
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              পাসপোর্ট ফাইল জমা ও আবেদন ফরম (Passport Submission Form)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              পাসপোর্ট নবায়ন ও নতুন আবেদনের প্রয়োজনীয় কাগজপত্র ও কাস্টমারের তথ্যাবলী সঠিকভাবে দিন।
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-foreground font-semibold">স্ট্যাটাস (Status):</label>
            <select
              value={data.status || 'pending'}
              onChange={e => onChange({ ...data, status: e.target.value })}
              className="bg-background border border-border rounded-md px-3 py-1 text-xs font-bold text-foreground outline-none"
            >
              <option value="pending">Pending (অপেক্ষমান)</option>
              <option value="processing">Processing (প্রসেসিং চলছে)</option>
              <option value="submitted">Submitted (জমা দেওয়া হয়েছে)</option>
              <option value="delivered">Delivered (সম্পন্ন / ডেলিভার্ড)</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-md border border-border">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-foreground">ট্র্যাকিং নম্বর (Tracking No.)</label>
              <button
                type="button"
                onClick={() => onChange({ ...data, trackingNo: generateUniquePassportTrackingNo() })}
                className="text-[10px] text-emerald-600 hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" />
                নতুন কোড
              </button>
            </div>
            <input
              type="text"
              value={data.trackingNo}
              onChange={e => onChange({ ...data, trackingNo: e.target.value })}
              placeholder="PASS-AB4829K513"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">জমার তারিখ (Submission Date)</label>
            <input
              type="text"
              value={data.submissionDate}
              onChange={e => onChange({ ...data, submissionDate: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">আবেদনের ধরন (Passport Type)</label>
            <select
              value={data.passportType}
              onChange={e => onChange({ ...data, passportType: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-semibold outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ই-পাসপোর্ট (E-Passport)">ই-পাসপোর্ট (E-Passport)</option>
              <option value="এমআরপি (MRP Passport)">এমআরপি (MRP Passport)</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="border-t border-border pt-3 space-y-3">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            ১. আবেদনকারীর প্রয়োজনীয় তথ্য (Applicant Information)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">আবেদনকারীর পূর্ণ নাম (Full Name) *</label>
              <input
                type="text"
                required
                value={data.applicantName}
                onChange={e => onChange({ ...data, applicantName: e.target.value })}
                placeholder="Md. Ikramul Hassan"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-bold outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">NID / জন্ম সনদ নম্বর (NID or Birth Certificate No.)</label>
              <input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                placeholder="19959192837482910"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">পূর্ববর্তী পাসপোর্ট নম্বর (Old Passport No. if any)</label>
              <input
                type="text"
                value={data.previousPassportNo}
                onChange={e => onChange({ ...data, previousPassportNo: e.target.value })}
                placeholder="A01928374 / EF0928371"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ব্যক্তিগত মোবাইল নম্বর (Phone Number) *</label>
              <input
                type="text"
                required
                value={data.applicantPhone}
                onChange={e => onChange({ ...data, applicantPhone: e.target.value })}
                placeholder="+8801712345678"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ইমেইল অ্যাড্রেস (Email Address)</label>
              <input
                type="email"
                value={data.applicantEmail}
                onChange={e => onChange({ ...data, applicantEmail: e.target.value })}
                placeholder="applicant@gmail.com"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ঠিকানা (Village, Upazila, District)</label>
              <input
                type="text"
                value={data.address}
                onChange={e => onChange({ ...data, address: e.target.value })}
                placeholder="Nadampur, Jagannathpur, Sunamganj"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GUARDIAN DETAILS */}
        <div className="border-t border-border pt-3 space-y-3">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            ২. অভিভাবকের তথ্য (Guardian Details)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">অভিভাবকের নাম (Guardian Name)</label>
              <input
                type="text"
                value={data.guardianName}
                onChange={e => onChange({ ...data, guardianName: e.target.value })}
                placeholder="Md. Abdul Goni"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">সম্পর্ক (Relationship)</label>
              <select
                value={data.relationship}
                onChange={e => onChange({ ...data, relationship: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-semibold outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="পিতা">পিতা (Father)</option>
                <option value="মাতা">মাতা (Mother)</option>
                <option value="স্বামী">স্বামী (Husband)</option>
                <option value="স্ত্রী">স্ত্রী (Wife)</option>
                <option value="আইনগত অভিভাবক">আইনগত অভিভাবক (Legal Guardian)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">অভিভাবকের ফোন নম্বর</label>
              <input
                type="text"
                value={data.guardianPhone}
                onChange={e => onChange({ ...data, guardianPhone: e.target.value })}
                placeholder="+8801819998877"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="border-t border-border pt-3 space-y-3">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            ৩. পাসপোর্ট স্পেসিফিকেশন ও অপশন (Passport Specifications)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">আবেদনের বিভাগ (Category)</label>
              <select
                value={data.applicationCategory}
                onChange={e => onChange({ ...data, applicationCategory: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="নতুন আবেদন (New Passport)">নতুন আবেদন (New Passport)</option>
                <option value="রি-ইস্যু / নবায়ন (Re-issue / Renewal)">রি-ইস্যু / নবায়ন (Re-issue)</option>
                <option value="তথ্য সংশোধন (Data Correction)">তথ্য সংশোধন (Correction)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">পৃষ্ঠা সংখ্যা (Page Count)</label>
              <select
                value={data.pageCount}
                onChange={e => onChange({ ...data, pageCount: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="৪৮ পৃষ্ঠা (48 Pages)">৪৮ পৃষ্ঠা (48 Pages)</option>
                <option value="৬৪ পৃষ্ঠা (64 Pages)">৬৪ পৃষ্ঠা (64 Pages)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">মেয়াদের মেয়াদ (Validity)</label>
              <select
                value={data.validityYears}
                onChange={e => onChange({ ...data, validityYears: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="১০ বছর (10 Years)">১০ বছর (10 Years)</option>
                <option value="৫ বছর (5 Years)">৫ বছর (5 Years)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ডেলিভারির সময়সীমা (Speed)</label>
              <select
                value={data.deliverySpeed}
                onChange={e => onChange({ ...data, deliverySpeed: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="সাধারণ (Regular)">সাধারণ (Regular)</option>
                <option value="জরুরি (Express)">জরুরি (Express)</option>
                <option value="অতি জরুরি (Super Express)">অতি জরুরি (Super Express)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCUMENTS CHECKLIST */}
        <div className="border-t border-border pt-3 space-y-3">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600">
            ৪. প্রাপ্ত কাগজপত্রের চেকলিস্ট (Checklist of Provided Required Files)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-emerald-500/5 p-3.5 rounded-md border border-emerald-500/20">
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
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-foreground block text-xs">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div>
          <label className="block font-semibold text-foreground mb-1">অফিসিয়াল মন্তব্য / স্পেশাল নোট (Office Remarks)</label>
          <textarea
            rows={2}
            value={data.remarks}
            onChange={e => onChange({ ...data, remarks: e.target.value })}
            placeholder="পাসপোর্ট ফি জমা রসিদ বা বায়োমেট্রিক সম্পর্কিত নোট..."
            className="w-full bg-background border border-border rounded-md p-2.5 text-foreground outline-none resize-none focus:ring-1 focus:ring-primary"
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4 rounded-md flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>ফর্ম রিসেট (Reset)</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>ডাটাবেজে সংরক্ষণ ও আইডি জেনারেট হচ্ছে...</span>
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
