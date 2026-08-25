import React from 'react';
import { Building2, User, Heart, FileText, Calendar, DollarSign } from 'lucide-react';

export function MarriageCertificateForm({ data = {}, onChange }) {
  const handleChange = (section, field, value) => {
    if (section) {
      onChange((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      onChange((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 1. Registrar / Kazi Office Information */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Building2 className="w-4 h-4 text-sky-200" />
          <span>১. কাজী অফিস বা রেজিস্ট্রি তথ্য (Registrar / Kazi Office)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">কাজী অফিসের নাম (Office Name)</label>
            <input
              type="text"
              value={data.registrar?.officeName || ''}
              onChange={(e) => handleChange('registrar', 'officeName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">রেজিস্ট্রার / কাজীর নাম (Kazi Name)</label>
            <input
              type="text"
              value={data.registrar?.kaziName || ''}
              onChange={(e) => handleChange('registrar', 'kaziName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">গভঃ লাইসেন্স নং (Govt License No)</label>
            <input
              type="text"
              value={data.registrar?.govLicenseNo || ''}
              onChange={(e) => handleChange('registrar', 'govLicenseNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">অফিসের ঠিকানা (Address)</label>
            <input
              type="text"
              value={data.registrar?.officeAddress || ''}
              onChange={(e) => handleChange('registrar', 'officeAddress', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Certificate Meta & Marriage Dates */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Calendar className="w-4 h-4 text-sky-200" />
          <span>২. রেজিস্ট্রেশন ও বিবাহের তারিখ (Registration Details)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">রেফারেন্স / স্মারক নং (Ref No)</label>
            <input
              type="text"
              value={data.memoNo || ''}
              onChange={(e) => handleChange(null, 'memoNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ভলিউম ও পৃষ্ঠা নং (Vol & Page)</label>
            <input
              type="text"
              value={data.volumeNo || ''}
              onChange={(e) => handleChange(null, 'volumeNo', e.target.value)}
              placeholder="e.g. Vol-IV/2021 (Page #48)"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ইস্যুর তারিখ (Issue Date)</label>
            <input
              type="date"
              value={data.issueDate || ''}
              onChange={(e) => handleChange(null, 'issueDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">বিবাহের তারিখ (Marriage Date)</label>
            <input
              type="date"
              value={data.marriageDate || ''}
              onChange={(e) => handleChange(null, 'marriageDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">বিবাহের স্থান (Marriage Place)</label>
            <input
              type="text"
              value={data.marriagePlace || ''}
              onChange={(e) => handleChange(null, 'marriagePlace', e.target.value)}
              placeholder="e.g. Mominpur, Jagannathpur, Sunamganj"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 3. Groom Details (বর) */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>৩. বরের বিবরণ (Groom Information)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">বরের পূর্ণ নাম (Groom Name)</label>
            <input
              type="text"
              value={data.groom?.name || ''}
              onChange={(e) => handleChange('groom', 'name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পিতার নাম (Father's Name)</label>
            <input
              type="text"
              value={data.groom?.fatherName || ''}
              onChange={(e) => handleChange('groom', 'fatherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">মাতার নাম (Mother's Name)</label>
            <input
              type="text"
              value={data.groom?.motherName || ''}
              onChange={(e) => handleChange('groom', 'motherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পাসপোর্ট নম্বর (Passport No)</label>
            <input
              type="text"
              value={data.groom?.passportNo || ''}
              onChange={(e) => handleChange('groom', 'passportNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">জন্ম তারিখ (Birth Date)</label>
            <input
              type="date"
              value={data.groom?.birthDate || ''}
              onChange={(e) => handleChange('groom', 'birthDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ঠিকানা (Address)</label>
            <input
              type="text"
              value={data.groom?.address || ''}
              onChange={(e) => handleChange('groom', 'address', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 4. Bride Details (কনে) */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <Heart className="w-4 h-4 text-sky-200" />
          <span>৪. কনের বিবরণ (Bride Information)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">কনের পূর্ণ নাম (Bride Name)</label>
            <input
              type="text"
              value={data.bride?.name || ''}
              onChange={(e) => handleChange('bride', 'name', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পিতার নাম (Father's Name)</label>
            <input
              type="text"
              value={data.bride?.fatherName || ''}
              onChange={(e) => handleChange('bride', 'fatherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">মাতার নাম (Mother's Name)</label>
            <input
              type="text"
              value={data.bride?.motherName || ''}
              onChange={(e) => handleChange('bride', 'motherName', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পাসপোর্ট নম্বর (Passport No)</label>
            <input
              type="text"
              value={data.bride?.passportNo || ''}
              onChange={(e) => handleChange('bride', 'passportNo', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">জন্ম তারিখ (Birth Date)</label>
            <input
              type="date"
              value={data.bride?.birthDate || ''}
              onChange={(e) => handleChange('bride', 'birthDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ঠিকানা (Address)</label>
            <input
              type="text"
              value={data.bride?.address || ''}
              onChange={(e) => handleChange('bride', 'address', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 5. Dower & Terms */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <DollarSign className="w-4 h-4 text-sky-200" />
          <span>৫. দেনমোহর ও সাক্ষীদের বিবরণ (Dower & Witnesses)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">মোট দেনমোহর (৳)</label>
            <input
              type="text"
              value={data.marriageTerms?.dowerAmount || ''}
              onChange={(e) => handleChange('marriageTerms', 'dowerAmount', e.target.value)}
              placeholder="e.g. 500,000"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">উসিল / উকিল (Wakil Name)</label>
            <input
              type="text"
              value={data.marriageTerms?.wakilName || ''}
              onChange={(e) => handleChange('marriageTerms', 'wakilName', e.target.value)}
              placeholder="e.g. MD. DELWAR HOSSAIN (Father of Bride)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">১ম সাক্ষী (Witness 1)</label>
            <input
              type="text"
              value={data.marriageTerms?.witness1 || ''}
              onChange={(e) => handleChange('marriageTerms', 'witness1', e.target.value)}
              placeholder="e.g. MD. ANWARUL HOQUE, NID: 1980..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">২য় সাক্ষী (Witness 2)</label>
            <input
              type="text"
              value={data.marriageTerms?.witness2 || ''}
              onChange={(e) => handleChange('marriageTerms', 'witness2', e.target.value)}
              placeholder="e.g. MD. SHAHJAHAN MIAH, NID: 1985..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
