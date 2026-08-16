import React, { useState } from 'react';
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
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export function AgreementForm({ formData, setFormData, onSubmit, onReset, isSubmitting = false }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const steps = [
    { id: 1, title: 'সাধারণ ও অভিভাবক তথ্য', subtitle: 'Parties & Guardian', icon: User },
    { id: 2, title: 'পদের বিবরণ ও সময়সূচি', subtitle: 'Position & Schedule', icon: Briefcase },
    { id: 3, title: 'বেতন কাঠামো ও ছুটি', subtitle: 'Salary & Leave Policy', icon: DollarSign },
    { id: 4, title: 'মেয়াদ, NDA ও স্বাক্ষর', subtitle: 'Notice, NDA & Signatures', icon: ShieldCheck },
  ];

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

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.parties?.employeeName || !formData.parties.employeeName.trim()) {
        alert('অনুগ্রহ করে কর্মচারীর পূর্ণ নাম পূরণ করুন।');
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const confirmReset = () => {
    onReset();
    setCurrentStep(1);
    setResetDialogOpen(false);
  };

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-card border border-border p-4 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            নিয়োগ ও চাকরির চুক্তিপত্র ইনপুট ফরম (Step {currentStep} of 4)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            প্রতিটি ধাপের আইনি তথ্য সঠিকভাবে পূরণ করুন। সবশেষে সম্পূর্ণ এগ্রিমেন্টের প্রিন্ট-রেডি লিগ্যাল কপি তৈরি হবে।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট (Reset)</span>
        </button>
      </div>

      {/* Corporate Stepper Header */}
      <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-muted rounded-xs overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isPassed = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`p-2.5 rounded-md text-left border transition-all flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-600 text-foreground font-bold shadow-xs'
                    : isPassed
                    ? 'bg-muted/40 border-border text-foreground hover:bg-muted cursor-pointer'
                    : 'bg-background border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-xs flex items-center justify-center shrink-0 text-xs font-bold ${
                    isPassed || isCurrent ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">{step.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{step.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Step Form Fields */}
      <form onSubmit={handleNext} className="space-y-4">
        {/* STEP 1: Parties & Guardian Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Header Office Details */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <Building2 className="w-4 h-4" /> প্রতিষ্ঠানের বিবরণ (Company Header Information)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">প্রতিষ্ঠানের নাম :</label>
                  <input
                    type="text"
                    value={formData.header?.companyName || ''}
                    onChange={(e) => updateNested('header', 'companyName', e.target.value)}
                    placeholder="মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">অফিসের ঠিকানা :</label>
                  <input
                    type="text"
                    value={formData.header?.officeAddress || ''}
                    onChange={(e) => updateNested('header', 'officeAddress', e.target.value)}
                    placeholder="Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">মোবাইল নম্বর :</label>
                  <input
                    type="text"
                    value={formData.header?.phone || ''}
                    onChange={(e) => updateNested('header', 'phone', e.target.value)}
                    placeholder="+8801345579534"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">ইমেইল অ্যাড্রেস :</label>
                  <input
                    type="email"
                    value={formData.header?.email || ''}
                    onChange={(e) => updateNested('header', 'email', e.target.value)}
                    placeholder="monsuralitravels@gmail.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details) */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <User className="w-4 h-4" /> ১. কর্মচারী ও নিয়োগকারীর সাধারণ তথ্য (Parties Details)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">চুক্তির তারিখ :</label>
                  <input
                    type="text"
                    value={formData.parties?.agreementDate || ''}
                    onChange={(e) => updateNested('parties', 'agreementDate', e.target.value)}
                    placeholder="১৬ আগস্ট ২০২৬"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">জাতীয় পরিচয়পত্র / পাসপোর্ট : *</label>
                  <input
                    type="text"
                    required
                    value={formData.parties?.nidPassport || ''}
                    onChange={(e) => updateNested('parties', 'nidPassport', e.target.value)}
                    placeholder="NID: 1992837482928 / Passport"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">নিয়োগকর্তা / কর্তৃপক্ষ :</label>
                  <input
                    type="text"
                    value={formData.parties?.employerName || ''}
                    onChange={(e) => updateNested('parties', 'employerName', e.target.value)}
                    placeholder="মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">কর্তৃপক্ষের মোবাইল নম্বর :</label>
                  <input
                    type="text"
                    value={formData.parties?.employerPhone || ''}
                    onChange={(e) => updateNested('parties', 'employerPhone', e.target.value)}
                    placeholder="+8801345579534"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">কর্মচারীর পূর্ণ নাম : *</label>
                  <input
                    type="text"
                    required
                    value={formData.parties?.employeeName || ''}
                    onChange={(e) => updateNested('parties', 'employeeName', e.target.value)}
                    placeholder="মো: রাহিমুল ইসলাম"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">কর্মচারীর ইমেইল অ্যাড্রেস :</label>
                  <input
                    type="email"
                    value={formData.parties?.employeeEmail || ''}
                    onChange={(e) => updateNested('parties', 'employeeEmail', e.target.value)}
                    placeholder="rahimul@gmail.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">পিতা / স্বামীর নাম :</label>
                  <input
                    type="text"
                    value={formData.parties?.fatherHusbandName || ''}
                    onChange={(e) => updateNested('parties', 'fatherHusbandName', e.target.value)}
                    placeholder="মোঃ আব্দুল করিম"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">বর্তমান ও স্থায়ী ঠিকানা :</label>
                  <input
                    type="text"
                    value={formData.parties?.address || ''}
                    onChange={(e) => updateNested('parties', 'address', e.target.value)}
                    placeholder="গ্রাম: সৈয়দপুর, ডাকঘর: সৈয়দপুর, থানা: জগন্নাথপুর, সুনামগঞ্জ"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details) */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <Users className="w-4 h-4" /> ২. অভিভাবক / পিতামাতার যোগাযোগের বিবরণ (Parent / Guardian Details)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">অভিভাবক / পিতার নাম :</label>
                  <input
                    type="text"
                    value={formData.guardian?.guardianName || ''}
                    onChange={(e) => updateNested('guardian', 'guardianName', e.target.value)}
                    placeholder="মোঃ আব্দুল করিম"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">মোবাইল নম্বর (প্রধান) :</label>
                  <input
                    type="text"
                    value={formData.guardian?.guardianPhone || ''}
                    onChange={(e) => updateNested('guardian', 'guardianPhone', e.target.value)}
                    placeholder="01712-XXXXXX"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">কর্মচারীর সাথে সম্পর্ক :</label>
                  <select
                    value={formData.guardian?.relationship || 'পিতা'}
                    onChange={(e) => updateNested('guardian', 'relationship', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="পিতা">পিতা (Father)</option>
                    <option value="মাতা">মাতা (Mother)</option>
                    <option value="আইনসম্মত অভিভাবক">আইনসম্মত অভিভাবক (Legal Guardian)</option>
                    <option value="স্বামী/স্ত্রী">স্বামী/স্ত্রী (Spouse)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">বিকল্প জরুরি নম্বর :</label>
                  <input
                    type="text"
                    value={formData.guardian?.emergencyPhone || ''}
                    onChange={(e) => updateNested('guardian', 'emergencyPhone', e.target.value)}
                    placeholder="01812-XXXXXX"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">জাতীয় পরিচয়পত্র নং :</label>
                  <input
                    type="text"
                    value={formData.guardian?.guardianNid || ''}
                    onChange={(e) => updateNested('guardian', 'guardianNid', e.target.value)}
                    placeholder="NID: 198273645281"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">স্থায়ী / বর্তমান ঠিকানা :</label>
                  <input
                    type="text"
                    value={formData.guardian?.guardianAddress || ''}
                    onChange={(e) => updateNested('guardian', 'guardianAddress', e.target.value)}
                    placeholder="জগন্নাথপুর, সুনামগঞ্জ"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Position & Schedule */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <Briefcase className="w-4 h-4" /> ৩. পদের বিবরণ ও কাজের সময়সূচি (Position & Schedule)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">পদের নাম (Designation) :</label>
                  <input
                    type="text"
                    value={formData.position?.designation || ''}
                    onChange={(e) => updateNested('position', 'designation', e.target.value)}
                    placeholder="অফিস এক্সিকিউটিভ / প্রসেসিং অফিসার"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">বিভাগ (Department) :</label>
                  <input
                    type="text"
                    value={formData.position?.department || ''}
                    onChange={(e) => updateNested('position', 'department', e.target.value)}
                    placeholder="পাসপোর্ট ও ভিসা প্রসেসিং উইং"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">যোগদানের তারিখ :</label>
                  <input
                    type="text"
                    value={formData.position?.joiningDate || ''}
                    onChange={(e) => updateNested('position', 'joiningDate', e.target.value)}
                    placeholder="০১ সেপ্টেম্বর ২০২৬"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">কর্মস্থল (Location) :</label>
                  <input
                    type="text"
                    value={formData.position?.location || ''}
                    onChange={(e) => updateNested('position', 'location', e.target.value)}
                    placeholder="হেড অফিস, নাদampur"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">নিয়োগের ধরন :</label>
                  <select
                    value={formData.position?.jobType || 'স্থায়ী / পূর্ণকালীন (Full-Time)'}
                    onChange={(e) => updateNested('position', 'jobType', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="স্থায়ী / পূর্ণকালীন (Full-Time)">স্থায়ী / পূর্ণকালীন (Full-Time)</option>
                    <option value="খণ্ডকালীন (Part-Time)">খণ্ডকালীন (Part-Time)</option>
                    <option value="চুক্তিভিত্তিক (Contractual)">চুক্তিভিত্তিক (Contractual)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">কাজের সময় ও ছুটি :</label>
                  <input
                    type="text"
                    value={formData.position?.workSchedule || ''}
                    onChange={(e) => updateNested('position', 'workSchedule', e.target.value)}
                    placeholder="সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার (অন্যান্য: সাপ্তাহিক ছুটি শুক্রবার/শনিবার)"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Salary & Leave Policy */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review) */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <DollarSign className="w-4 h-4" /> ৪. বেতন কাঠামো ও ইনক্রিমেন্ট (Salary Structure & Review)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">১. মূল বেতন (Basic Salary) ৳</label>
                  <input
                    type="number"
                    value={formData.salary?.basicSalary || ''}
                    onChange={(e) => handleSalaryChange('basicSalary', e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">২. বাড়ি ভাড়া ভাতা (House Rent) ৳</label>
                  <input
                    type="number"
                    value={formData.salary?.houseRent || ''}
                    onChange={(e) => handleSalaryChange('houseRent', e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">৩. চিকিৎসা ভাতা (Medical) ৳</label>
                  <input
                    type="number"
                    value={formData.salary?.medical || ''}
                    onChange={(e) => handleSalaryChange('medical', e.target.value)}
                    placeholder="2000"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">৪. যাতায়াত / কনভেয়েন্স ভাতা ৳</label>
                  <input
                    type="number"
                    value={formData.salary?.conveyance || ''}
                    onChange={(e) => handleSalaryChange('conveyance', e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">৫. অন্যান্য বিশেষ ভাতা ৳</label>
                  <input
                    type="number"
                    value={formData.salary?.specialAllowance || ''}
                    onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">সর্বমোট মাসিক বেতন (Gross) ৳</label>
                  <input
                    type="text"
                    value={formData.salary?.grossSalary || ''}
                    onChange={(e) => handleSalaryChange('grossSalary', e.target.value)}
                    placeholder="25,000"
                    className="w-full px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-600 font-bold text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-foreground mb-1">বেতন কথায় (Gross Salary in Words) :</label>
                  <input
                    type="text"
                    value={formData.salary?.grossSalaryInWords || ''}
                    onChange={(e) => updateNested('salary', 'grossSalaryInWords', e.target.value)}
                    placeholder="পঁচিশ হাজার টাকা মাত্র"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment) */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <Calendar className="w-4 h-4" /> ৫. ছুটি, উৎসব এবং খাবার/নাস্তা সুবিধা (Leave Policy, Holidays & Refreshment)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">নৈমিত্তিক ছুটি (Casual Leave Days) :</label>
                  <input
                    type="number"
                    value={formData.leave?.casualDays || '10'}
                    onChange={(e) => updateNested('leave', 'casualDays', e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">অসুস্থতাজনিত ছুটি (Sick Leave Days) :</label>
                  <input
                    type="number"
                    value={formData.leave?.sickDays || '14'}
                    onChange={(e) => updateNested('leave', 'sickDays', e.target.value)}
                    placeholder="14"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">অর্জিত ছুটি (Earned Leave Days) :</label>
                  <input
                    type="number"
                    value={formData.leave?.earnedDays || '18'}
                    onChange={(e) => updateNested('leave', 'earnedDays', e.target.value)}
                    placeholder="18"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-3 flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.leave?.lunchProvided ?? true}
                      onChange={(e) => updateNested('leave', 'lunchProvided', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">কোম্পানি কর্তৃক ফ্রি লাঞ্চ প্রদান</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.leave?.teaSnacks ?? true}
                      onChange={(e) => updateNested('leave', 'teaSnacks', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">দৈনিক চা/কফি ও বিকালের নাস্তা সুবিধা</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Legal Notice, NDA & Signatures */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* ৬ & ৭ আইনি শর্তাবলী প্রিভিউ কার্ড */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                ৬. চাকরির ন্যূনতম মেয়াদ (২ বছর), ৩ মাসের নোটিশ ও ৭. গোপনীয়তা রক্ষা (NDA)
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/30 border border-border/70 rounded-md space-y-1.5">
                <p>• <strong>২ বছরের বাধ্যতামূলক কার্যকাল:</strong> যোগদানের তারিখ হতে টানা ২ বছর নিয়মিত দায়িত্ব পালনে অঙ্গীকারাবদ্ধ।</p>
                <p>• <strong>৩ মাসের লিখিত নোটিশ:</strong> মেয়াদের পূর্বে চাকরি ছাড়তে হলে ৩ মাস আগে লিখিত পদত্যাগপত্র জমা দিতে হবে, অন্যথায় সমপরিমাণ মূল বেতন ক্ষতিপূরণ কর্তন হবে।</p>
                <p>• <strong>সাইবার নিরাপত্তা ও আইনি ব্যবস্থা:</strong> গোপনীয়তা লঙ্ঘন বা বাণিজ্যিক ডেটা ফাঁসে বাংলাদেশ শ্রম আইন, কপিরাইট আইন ও সাইবার নিরাপত্তা আইনে ফৌজদারি ও ক্ষতিপূরণ মামলা কার্যকর হবে।</p>
              </div>
            </div>

            {/* ৮. যৌথ স্বাক্ষীগণের বিবরণ ও স্বাক্ষর (Witnesses Details) */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
                <Users className="w-4 h-4" /> ৮. স্বাক্ষীগণের বিবরণ (Witnesses Details)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* ১ম পক্ষের সাক্ষী */}
                <div className="p-3 bg-muted/20 border border-border rounded-md space-y-2">
                  <span className="font-bold text-foreground block border-b border-border pb-1">১ম পক্ষের সাক্ষী (কোম্পানি পক্ষ) :</span>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">নাম :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.firstWitnessName || ''}
                      onChange={(e) => updateNested('witnesses', 'firstWitnessName', e.target.value)}
                      placeholder="সাক্ষীর নাম"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">ফোন নম্বর :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.firstWitnessPhone || ''}
                      onChange={(e) => updateNested('witnesses', 'firstWitnessPhone', e.target.value)}
                      placeholder="01712-XXXXXX"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">ঠিকানা :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.firstWitnessAddress || ''}
                      onChange={(e) => updateNested('witnesses', 'firstWitnessAddress', e.target.value)}
                      placeholder="ঠিকানা"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* ২য় পক্ষের সাক্ষী */}
                <div className="p-3 bg-muted/20 border border-border rounded-md space-y-2">
                  <span className="font-bold text-foreground block border-b border-border pb-1">২য় পক্ষের সাক্ষী (কর্মচারী পক্ষ) :</span>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">নাম :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.secondWitnessName || ''}
                      onChange={(e) => updateNested('witnesses', 'secondWitnessName', e.target.value)}
                      placeholder="সাক্ষীর নাম"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">ফোন নম্বর :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.secondWitnessPhone || ''}
                      onChange={(e) => updateNested('witnesses', 'secondWitnessPhone', e.target.value)}
                      placeholder="01812-XXXXXX"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">ঠিকানা :</label>
                    <input
                      type="text"
                      value={formData.witnesses?.secondWitnessAddress || ''}
                      onChange={(e) => updateNested('witnesses', 'secondWitnessAddress', e.target.value)}
                      placeholder="ঠিকানা"
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                চূড়ান্ত চুক্তিপত্র সারসংক্ষেপ (Final Agreement Summary)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">কর্মচারীর নাম ও এনআইডি:</span>
                  <span className="font-bold text-foreground">{formData.parties?.employeeName || 'নামহীন'}</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">{formData.parties?.nidPassport || '-'}</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">নির্ধারিত পদবী ও বিভাগ:</span>
                  <span className="font-bold text-foreground">{formData.position?.designation || '-'}</span>
                  <span className="text-[10px] text-muted-foreground block">{formData.position?.department || '-'}</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">সর্বমোট মাসিক বেতন:</span>
                  <span className="font-bold text-emerald-600 font-mono">{formData.salary?.grossSalary || '0'} ৳</span>
                  <span className="text-[10px] text-muted-foreground block truncate">({formData.salary?.grossSalaryInWords || ''})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="bg-card border border-border p-4 rounded-md flex items-center justify-between gap-3 shadow-xs">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ (Previous)</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
            >
              <span>পরবর্তী ধাপ (Next Step)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
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
                  <span>চুক্তিপত্র তৈরি ও প্রিভিউ দেখুন</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Shadcn UI Confirm Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">চুক্তিপত্রের তথ্য রিসেট নিশ্চিতকরণ</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              আপনি কি নিশ্চিত যে চুক্তিপত্রের সকল ইনপুট ডেটা মুছে ফেলে ডিফল্ট ফর্মে ফিরে যেতে চান?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setResetDialogOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="px-4 py-1.5 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            >
              হ্যাঁ, রিসেট করুন
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
