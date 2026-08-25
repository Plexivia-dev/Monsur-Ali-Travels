import React from 'react';
import { Building2, User, FileText, Calendar, Briefcase, ShieldCheck, Sparkles, Upload, RotateCcw } from 'lucide-react';

const PRESETS = [
  {
    id: 'construction',
    label: '🏗️ Construction Carpenter (Greece/EU)',
    data: {
      designation: 'Senior Construction Carpenter & Formwork Specialist',
      department: 'Civil Construction & Structural Division',
      dutiesResponsibilities:
        'Reading structural architectural drawings, wood formwork installation, column/beam shuttering fabrication, concrete framework alignment, scaffolding safety, and site task execution.',
      totalDuration: '5 Years 4 Months',
    },
  },
  {
    id: 'agriculture',
    label: '🌾 Agriculture & Farm Worker (Greece/EU)',
    data: {
      designation: 'Agricultural Farm Specialist & Greenhouse Worker',
      department: 'Horticulture & Farm Operations',
      dutiesResponsibilities:
        'Crop planting, automated irrigation maintenance, greenhouse climate control, harvesting, soil treatment, pest control, and packing farm produce according to EU safety standards.',
      totalDuration: '4 Years 6 Months',
    },
  },
  {
    id: 'chef',
    label: '🍳 Chef / Restaurant Cook',
    data: {
      designation: 'Head Line Cook & Culinary Operations Specialist',
      department: 'Food & Beverage / Kitchen Operations',
      dutiesResponsibilities:
        'Meal preparation, Mediterranean and Asian cuisine recipes, food hygiene/HACCP compliance, inventory control, kitchen equipment maintenance, and quality assurance.',
      totalDuration: '5 Years',
    },
  },
  {
    id: 'electrician',
    label: '⚡ Electrician & Industrial Wiring',
    data: {
      designation: 'Certified Industrial Electrician & Wiring Technician',
      department: 'Electrical Maintenance & Engineering',
      dutiesResponsibilities:
        'Circuit installation, 3-phase wiring, breaker diagnostics, generator maintenance, conduit bending, lighting control systems, and electrical safety standards inspection.',
      totalDuration: '6 Years',
    },
  },
  {
    id: 'driver',
    label: '🚚 Heavy Transport Driver',
    data: {
      designation: 'Professional Heavy Commercial Vehicle Driver',
      department: 'Logistics & Supply Chain Transport',
      dutiesResponsibilities:
        'Long-haul cargo transportation, vehicle pre-trip mechanical inspection, GPS route navigation, load securing, cargo documentation, and clean accident-free driving record.',
      totalDuration: '7 Years',
    },
  },
];

export function ExperienceCertificateForm({ data = {}, onChange }) {
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

  const handleApplyPreset = (preset) => {
    onChange((prev) => {
      const empName = prev.employee?.fullName || 'MD. JAHIDUL ISLAM';
      const fatherName = prev.employee?.fatherName || 'MD. ABDUL MALEK';
      const passNo = prev.employee?.passportNo || 'A08924182';
      const compName = prev.company?.name || 'AL-MADINA CONSTRUCTION LTD.';

      return {
        ...prev,
        employee: {
          ...prev.employee,
          designation: preset.data.designation,
          department: preset.data.department,
          totalDuration: preset.data.totalDuration,
        },
        content: {
          ...prev.content,
          statement: `This is to certify that ${empName}, Son of ${fatherName}, bearing Passport No: ${passNo}, was a bona fide employee of ${compName} from January 15, 2019 to June 30, 2024. During his tenure with us, he served as ${preset.data.designation} with high dedication and professional competence.`,
          dutiesResponsibilities: preset.data.dutiesResponsibilities,
        },
      };
    });
  };

  return (
    <div className="space-y-6 text-foreground">
      
      {/* 1-Click Role Presets */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span>১-ক্লিক অভিজ্ঞতা ও পেশা প্রিসেট (Quick Job Role Presets)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 bg-background hover:bg-primary/10 hover:text-primary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issuing Company / Organization Section (Fully Customizable) */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            ১. ইস্যুকারী কোম্পানির তথ্য (Issuing Company Header)
          </h3>
          <span className="text-[11px] text-muted-foreground italic">
            *যেকোনো কোম্পানির নাম ও ঠিকানা দিতে পারবেন
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">কোম্পানির নাম (Company Name)</label>
            <input
              type="text"
              value={data.company?.name || ''}
              onChange={(e) => handleChange('company', 'name', e.target.value)}
              placeholder="e.g. AL-MADINA CONSTRUCTION & ENGINEERING LTD."
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ট্যাগলাইন / সাবটাইটেল (Subtitle)</label>
            <input
              type="text"
              value={data.company?.subtitle || ''}
              onChange={(e) => handleChange('company', 'subtitle', e.target.value)}
              placeholder="e.g. Civil Construction & Heavy Engineering"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ট্রেড লাইসেন্স / গভঃ রেজিঃ নং (Reg No)</label>
            <input
              type="text"
              value={data.company?.registrationNo || ''}
              onChange={(e) => handleChange('company', 'registrationNo', e.target.value)}
              placeholder="e.g. REG-C-89241/2018"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">কোম্পানির সম্পূর্ণ ঠিকানা (Address)</label>
            <input
              type="text"
              value={data.company?.address || ''}
              onChange={(e) => handleChange('company', 'address', e.target.value)}
              placeholder="e.g. Plot #42, Industrial Area, Tejgaon, Dhaka-1208, Bangladesh"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ফোন / মোবাইল (Phone)</label>
            <input
              type="text"
              value={data.company?.phone || ''}
              onChange={(e) => handleChange('company', 'phone', e.target.value)}
              placeholder="e.g. +880 2-9887766"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ইমেইল (Email)</label>
            <input
              type="text"
              value={data.company?.email || ''}
              onChange={(e) => handleChange('company', 'email', e.target.value)}
              placeholder="e.g. info@almadinaconstruction.com"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Certificate Reference & Title */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
          <FileText className="w-4 h-4" />
          ২. সার্টিফিকেটের শিরোনাম ও তারিখ (Title & Date)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">সার্টিফিকেট শিরোনাম (Title)</label>
            <input
              type="text"
              value={data.certificateTitle || ''}
              onChange={(e) => handleChange(null, 'certificateTitle', e.target.value)}
              placeholder="e.g. TO WHOM IT MAY CONCERN"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">স্মারক / রেফারেন্স নং (Ref No)</label>
            <input
              type="text"
              value={data.memoNo || ''}
              onChange={(e) => handleChange(null, 'memoNo', e.target.value)}
              placeholder="e.g. EXP/2026/0482"
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
        </div>
      </div>

      {/* Employee / Candidate Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
          <User className="w-4 h-4" />
          ৩. কর্মচারীর তথ্য (Employee Information)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">কর্মচারীর পূর্ণ নাম (Full Name)</label>
            <input
              type="text"
              value={data.employee?.fullName || ''}
              onChange={(e) => handleChange('employee', 'fullName', e.target.value)}
              placeholder="e.g. MD. JAHIDUL ISLAM"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পিতার নাম (Father's Name)</label>
            <input
              type="text"
              value={data.employee?.fatherName || ''}
              onChange={(e) => handleChange('employee', 'fatherName', e.target.value)}
              placeholder="e.g. MD. ABDUL MALEK"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পাসপোর্ট নম্বর (Passport No)</label>
            <input
              type="text"
              value={data.employee?.passportNo || ''}
              onChange={(e) => handleChange('employee', 'passportNo', e.target.value)}
              placeholder="e.g. A08924182"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-input bg-background uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পদবী / ডেজিগনেশন (Designation)</label>
            <input
              type="text"
              value={data.employee?.designation || ''}
              onChange={(e) => handleChange('employee', 'designation', e.target.value)}
              placeholder="e.g. Senior Construction Carpenter"
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">কাজের শুরু তারিখ (Start Date)</label>
            <input
              type="date"
              value={data.employee?.startDate || ''}
              onChange={(e) => handleChange('employee', 'startDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">কাজের শেষ তারিখ (End Date)</label>
            <input
              type="date"
              value={data.employee?.endDate || ''}
              onChange={(e) => handleChange('employee', 'endDate', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">মোট অভিজ্ঞতার সময়কাল (Total Duration)</label>
            <input
              type="text"
              value={data.employee?.totalDuration || ''}
              onChange={(e) => handleChange('employee', 'totalDuration', e.target.value)}
              placeholder="e.g. 5 Years 5 Months"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ডিপার্টমেন্ট / বিভাগ (Department)</label>
            <input
              type="text"
              value={data.employee?.department || ''}
              onChange={(e) => handleChange('employee', 'department', e.target.value)}
              placeholder="e.g. Civil & Structural Engineering"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Body Statement & Responsibilities */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
          <Briefcase className="w-4 h-4" />
          ৪. সার্টিফিকেটের বিবরণ ও দায়িত্বাবলী (Certificate Statement)
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">মূল প্রত্যয়ন বাক্য (Statement)</label>
            <textarea
              rows={3}
              value={data.content?.statement || ''}
              onChange={(e) => handleChange('content', 'statement', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">দায়িত্ব ও কাজের অভিজ্ঞতা (Core Duties)</label>
            <textarea
              rows={2}
              value={data.content?.dutiesResponsibilities || ''}
              onChange={(e) => handleChange('content', 'dutiesResponsibilities', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">আচরণ ও প্রশংসাপত্র (Conduct & Good Wishes)</label>
            <textarea
              rows={2}
              value={data.content?.conductReview || ''}
              onChange={(e) => handleChange('content', 'conductReview', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Signatory & Authority Section */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
          <ShieldCheck className="w-4 h-4" />
          ৫. স্বাক্ষরকারী ও সিলমোহর (Authorized Signatory)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">স্বাক্ষরকারীর নাম (Signatory Name)</label>
            <input
              type="text"
              value={data.signatory?.name || ''}
              onChange={(e) => handleChange('signatory', 'name', e.target.value)}
              placeholder="e.g. ENGR. TARIQUL ISLAM"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-bold focus:ring-1 focus:ring-primary outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">স্বাক্ষরকারীর পদবী (Designation)</label>
            <input
              type="text"
              value={data.signatory?.designation || ''}
              onChange={(e) => handleChange('signatory', 'designation', e.target.value)}
              placeholder="e.g. Head of Human Resources & Operations"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
