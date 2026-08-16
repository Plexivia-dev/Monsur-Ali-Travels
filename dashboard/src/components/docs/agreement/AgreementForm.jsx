import React from 'react';
import {
  FileText,
  User,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Eye,
  RotateCcw
} from 'lucide-react';

export function AgreementForm({ formData, setFormData, onSubmit, onReset }) {
  const updateNested = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Calculate gross salary automatically
  const handleSalaryChange = (field, value) => {
    const updatedSalary = {
      ...formData.salary,
      [field]: value
    };

    const basic = parseFloat(updatedSalary.basicSalary) || 0;
    const house = parseFloat(updatedSalary.houseRent) || 0;
    const med = parseFloat(updatedSalary.medical) || 0;
    const conv = parseFloat(updatedSalary.conveyance) || 0;
    const spec = parseFloat(updatedSalary.specialAllowance) || 0;

    const total = basic + house + med + conv + spec;
    if (total > 0 && field !== 'grossSalary') {
      updatedSalary.grossSalary = total.toLocaleString('en-BD');
    }

    setFormData((prev) => ({
      ...prev,
      salary: updatedSalary
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Form Top Banner */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            নিয়োগ ও চাকরির চুক্তিপত্র ফরম (Employment Agreement Form)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            সকল প্রয়োজনীয় তথ্য বাংলায় বা ইংরেজিতে পূরণ করুন। তথ্য পূরণ শেষে নিচের বাটনে ক্লিক করে প্রিন্ট-রেডি চুক্তিপত্র তৈরি করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট (Reset)</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>চুক্তিপত্র তৈরি ও দেখুন</span>
          </button>
        </div>
      </div>

      {/* Header Info Section */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border pb-2">
          <Building2 className="w-4 h-4" />
          প্রতিষ্ঠানের বিবরণ (Company / Agency Profile)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">প্রতিষ্ঠানের নাম :</label>
            <input
              type="text"
              value={formData.header?.companyName || ''}
              onChange={(e) => updateNested('header', 'companyName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="মনসুর আলী ট্রাভেলস"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">অফিসের ঠিকানা :</label>
            <input
              type="text"
              value={formData.header?.officeAddress || ''}
              onChange={(e) => updateNested('header', 'officeAddress', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">মোবাইল নম্বর :</label>
            <input
              type="text"
              value={formData.header?.phone || ''}
              onChange={(e) => updateNested('header', 'phone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+8801345579534"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">ইমেইল অ্যাড্রেস :</label>
            <input
              type="email"
              value={formData.header?.email || ''}
              onChange={(e) => updateNested('header', 'email', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="monsuralitravels@gmail.com"
            />
          </div>
        </div>
      </div>

      {/* ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2 border-b border-border pb-2">
          <User className="w-4 h-4" />
          ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">চুক্তির তারিখ :</label>
            <input
              type="text"
              value={formData.parties?.agreementDate || ''}
              onChange={(e) => updateNested('parties', 'agreementDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="১৬ আগস্ট ২০২৬"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">জাতীয় পরিচয়পত্র / পাসপোর্ট নং :</label>
            <input
              type="text"
              value={formData.parties?.nidPassport || ''}
              onChange={(e) => updateNested('parties', 'nidPassport', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="1998561234567890"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">নিয়োগকর্তা / কর্তৃপক্ষের নাম :</label>
            <input
              type="text"
              value={formData.parties?.employerName || ''}
              onChange={(e) => updateNested('parties', 'employerName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কর্তৃপক্ষের মোবাইল নম্বর :</label>
            <input
              type="text"
              value={formData.parties?.employerPhone || ''}
              onChange={(e) => updateNested('parties', 'employerPhone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+8801345579534"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কর্মচারীর পূর্ণ নাম :</label>
            <input
              type="text"
              required
              value={formData.parties?.employeeName || ''}
              onChange={(e) => updateNested('parties', 'employeeName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none font-semibold"
              placeholder="কর্মচারীর পুরো নাম লিখুন"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কর্মচারীর ইমেইল অ্যাড্রেস :</label>
            <input
              type="text"
              value={formData.parties?.employeeEmail || ''}
              onChange={(e) => updateNested('parties', 'employeeEmail', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="employee@example.com"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">পিতা / স্বামীর নাম :</label>
            <input
              type="text"
              value={formData.parties?.fatherHusbandName || ''}
              onChange={(e) => updateNested('parties', 'fatherHusbandName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="পিতার বা স্বামীর নাম"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">বর্তমান ও স্থায়ী ঠিকানা :</label>
            <input
              type="text"
              value={formData.parties?.address || ''}
              onChange={(e) => updateNested('parties', 'address', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
            />
          </div>
        </div>
      </div>

      {/* ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-border pb-2">
          <Users className="w-4 h-4" />
          ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">অভিভাবক / পিতার নাম :</label>
            <input
              type="text"
              value={formData.guardian?.guardianName || ''}
              onChange={(e) => updateNested('guardian', 'guardianName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="অভিভাবকের পুরো নাম"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">মোবাইল নম্বর (প্রধান) :</label>
            <input
              type="text"
              value={formData.guardian?.guardianPhone || ''}
              onChange={(e) => updateNested('guardian', 'guardianPhone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+880 1XXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কর্মচারীর সাথে সম্পর্ক :</label>
            <select
              value={formData.guardian?.relationship || 'পিতা'}
              onChange={(e) => updateNested('guardian', 'relationship', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="পিতা">পিতা (Father)</option>
              <option value="মাতা">মাতা (Mother)</option>
              <option value="অভিভাবক">অভিভাবক (Legal Guardian)</option>
              <option value="স্বামী/স্ত্রী">স্বামী/স্ত্রী (Spouse)</option>
            </select>
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">বিকল্প জরুরি নম্বর :</label>
            <input
              type="text"
              value={formData.guardian?.emergencyPhone || ''}
              onChange={(e) => updateNested('guardian', 'emergencyPhone', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+880 1XXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">জাতীয় পরিচয়পত্র নং (অভিভাবক) :</label>
            <input
              type="text"
              value={formData.guardian?.guardianNid || ''}
              onChange={(e) => updateNested('guardian', 'guardianNid', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="অভিভাবকের NID নম্বর"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">স্থায়ী / বর্তমান ঠিকানা :</label>
            <input
              type="text"
              value={formData.guardian?.guardianAddress || ''}
              onChange={(e) => updateNested('guardian', 'guardianAddress', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="অভিভাবকের ঠিকানা"
            />
          </div>
        </div>
      </div>

      {/* ৩. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2 border-b border-border pb-2">
          <Briefcase className="w-4 h-4" />
          ৩. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">পদের নাম (Designation) :</label>
            <input
              type="text"
              value={formData.position?.designation || ''}
              onChange={(e) => updateNested('position', 'designation', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              placeholder="যেমন: সিনিয়র অফিসার / এক্সিকিউটিভ"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">বিভাগ (Department) :</label>
            <input
              type="text"
              value={formData.position?.department || ''}
              onChange={(e) => updateNested('position', 'department', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="যেমন: পাসপোর্ট ও ভিসা প্রসেসিং উইং"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">যোগদানের তারিখ :</label>
            <input
              type="text"
              value={formData.position?.joiningDate || ''}
              onChange={(e) => updateNested('position', 'joiningDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="০১ সেপ্টেম্বর ২০২৬"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কর্মস্থল (Location) :</label>
            <input
              type="text"
              value={formData.position?.location || ''}
              onChange={(e) => updateNested('position', 'location', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="হেড অফিস, নাদampur"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">নিয়োগের ধরন :</label>
            <select
              value={formData.position?.jobType || 'স্থায়ী / পূর্ণকালীন (Full-Time)'}
              onChange={(e) => updateNested('position', 'jobType', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="স্থায়ী / পূর্ণকালীন (Full-Time)">স্থায়ী / পূর্ণকালীন (Full-Time)</option>
              <option value="খণ্ডকালীন (Part-Time)">খণ্ডকালীন (Part-Time)</option>
              <option value="চুক্তিভিত্তিক (Contractual)">চুক্তিভিত্তিক (Contractual)</option>
            </select>
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">কাজের সময় ও ছুটি :</label>
            <input
              type="text"
              value={formData.position?.workSchedule || ''}
              onChange={(e) => updateNested('position', 'workSchedule', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার"
            />
          </div>
        </div>
      </div>

      {/* ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2 border-b border-border pb-2">
          <DollarSign className="w-4 h-4" />
          ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">১. মূল বেতন (Basic) ৳ :</label>
            <input
              type="number"
              value={formData.salary?.basicSalary || ''}
              onChange={(e) => handleSalaryChange('basicSalary', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="15000"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">২. বাড়ি ভাড়া ভাতা ৳ :</label>
            <input
              type="number"
              value={formData.salary?.houseRent || ''}
              onChange={(e) => handleSalaryChange('houseRent', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">৩. চিকিৎসা ভাতা ৳ :</label>
            <input
              type="number"
              value={formData.salary?.medical || ''}
              onChange={(e) => handleSalaryChange('medical', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">৪. যাতায়াত ভাতা ৳ :</label>
            <input
              type="number"
              value={formData.salary?.conveyance || ''}
              onChange={(e) => handleSalaryChange('conveyance', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="1500"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">৫. বিশেষ ভাতা / ইনসেন্টিভ ৳ :</label>
            <input
              type="number"
              value={formData.salary?.specialAllowance || ''}
              onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="1500"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">সর্বমোট মাসিক বেতন (Gross) ৳ :</label>
            <input
              type="text"
              value={formData.salary?.grossSalary || ''}
              onChange={(e) => updateNested('salary', 'grossSalary', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-primary font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="25,000"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-foreground font-semibold mb-1">বেতন কথায় (Gross Salary in Words) :</label>
            <input
              type="text"
              value={formData.salary?.grossSalaryInWords || ''}
              onChange={(e) => updateNested('salary', 'grossSalaryInWords', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="পঁচিশ হাজার টাকা মাত্র"
            />
          </div>
        </div>
      </div>

      {/* ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2 border-b border-border pb-2">
          <Calendar className="w-4 h-4" />
          ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">নৈমিত্তিক ছুটি (Casual) দিন :</label>
            <input
              type="number"
              value={formData.leave?.casualDays || ''}
              onChange={(e) => updateNested('leave', 'casualDays', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">অসুস্থতাজনিত ছুটি (Sick) দিন :</label>
            <input
              type="number"
              value={formData.leave?.sickDays || ''}
              onChange={(e) => updateNested('leave', 'sickDays', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="14"
            />
          </div>
          <div>
            <label className="block text-foreground font-semibold mb-1">অর্জিত ছুটি (Earned) দিন :</label>
            <input
              type="number"
              value={formData.leave?.earnedDays || ''}
              onChange={(e) => updateNested('leave', 'earnedDays', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="18"
            />
          </div>
          <div className="sm:col-span-3 flex flex-wrap gap-4 pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={formData.leave?.lunchProvided ?? true}
                onChange={(e) => updateNested('leave', 'lunchProvided', e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span>কোম্পানি কর্তৃক ফ্রি লাঞ্চ প্রদান</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={formData.leave?.teaSnacks ?? true}
                onChange={(e) => updateNested('leave', 'teaSnacks', e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span>দৈনিক চা/কফি ও বিকালের নাস্তা</span>
            </label>
          </div>
        </div>
      </div>

      {/* ৮. স্বাক্ষীগণের বিবরণ (Witnesses Details) */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-2 border-b border-border pb-2">
          <ShieldCheck className="w-4 h-4" />
          ৮. স্বাক্ষীগণের বিবরণ (Witnesses Details)
        </h3>
        <p className="text-xs text-muted-foreground">
          প্রথম পক্ষ (নিয়োগকারী কর্তৃপক্ষ) এবং দ্বিতীয় পক্ষ (কর্মচারী)-এর দুইজন সাক্ষীর তথ্য প্রদান করুন:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* ১ম পক্ষের সাক্ষী */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 text-primary">
              <span>প্রথম পক্ষের সাক্ষী (নিয়োগকারী পক্ষ) :</span>
            </h4>
            <div>
              <label className="block text-foreground font-semibold mb-1">সাক্ষীর নাম :</label>
              <input
                type="text"
                value={formData.witnesses?.firstWitnessName || ''}
                onChange={(e) => updateNested('witnesses', 'firstWitnessName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="১ম পক্ষের সাক্ষীর নাম"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">মোবাইল নম্বর :</label>
              <input
                type="text"
                value={formData.witnesses?.firstWitnessPhone || ''}
                onChange={(e) => updateNested('witnesses', 'firstWitnessPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">ঠিকানা :</label>
              <input
                type="text"
                value={formData.witnesses?.firstWitnessAddress || ''}
                onChange={(e) => updateNested('witnesses', 'firstWitnessAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="১ম পক্ষের সাক্ষীর পূর্ণ ঠিকানা"
              />
            </div>
          </div>

          {/* ২য় পক্ষের সাক্ষী */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 text-emerald-500">
              <span>দ্বিতীয় পক্ষের সাক্ষী (কর্মচারী পক্ষ) :</span>
            </h4>
            <div>
              <label className="block text-foreground font-semibold mb-1">সাক্ষীর নাম :</label>
              <input
                type="text"
                value={formData.witnesses?.secondWitnessName || ''}
                onChange={(e) => updateNested('witnesses', 'secondWitnessName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="২য় পক্ষের সাক্ষীর নাম"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">মোবাইল নম্বর :</label>
              <input
                type="text"
                value={formData.witnesses?.secondWitnessPhone || ''}
                onChange={(e) => updateNested('witnesses', 'secondWitnessPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-foreground font-semibold mb-1">ঠিকানা :</label>
              <input
                type="text"
                value={formData.witnesses?.secondWitnessAddress || ''}
                onChange={(e) => updateNested('witnesses', 'secondWitnessAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="২য় পক্ষের সাক্ষীর পূর্ণ ঠিকানা"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Submission Bar */}
      <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-muted-foreground">
          ফর্মের সকল তথ্য পর্যালোচনা করে চুক্তিপত্র প্রিভিউ ও প্রিন্ট করুন।
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>নিয়োগ চুক্তিপত্র তৈরি ও ডাউনলোড করুন</span>
        </button>
      </div>
    </form>
  );
}
