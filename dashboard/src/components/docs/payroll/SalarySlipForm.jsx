import React, { useState } from 'react';
import {
  User,
  DollarSign,
  Clock,
  FileText,
  RotateCcw,
  Eye,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

// Number to Words converter for BDT currency
export function numberToWords(num) {
  if (isNaN(num) || num === 0) return 'Zero Taka Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str;
  }

  const words = inWords(Math.floor(num)).trim();
  return `${words} Taka Only`;
}

export function SalarySlipForm({ formData, setFormData, onSubmit, onReset }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const steps = [
    { id: 1, title: 'কর্মচারীর তথ্য', subtitle: 'Employee Info', icon: User },
    { id: 2, title: 'অর্জিত বেতন ও ভাতা', subtitle: 'Earnings & Allowances', icon: DollarSign },
    { id: 3, title: 'কর্তন ও সমন্বয়', subtitle: 'Deductions', icon: DollarSign },
    { id: 4, title: 'হাজিরা ও রিভিউ', subtitle: 'Attendance & Review', icon: Clock },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Calculate Gross Earnings
      const gross = 
        (Number(updated.basicSalary) || 0) +
        (Number(updated.houseRentAllowance) || 0) +
        (Number(updated.medicalAllowance) || 0) +
        (Number(updated.conveyanceAllowance) || 0) +
        (Number(updated.otherAllowance) || 0) +
        (Number(updated.overtimeExtraDuty) || 0);

      // Calculate Total Deductions
      const totalDed = 
        (Number(updated.advanceSalary) || 0) +
        (Number(updated.unpaidLeaveAbsence) || 0) +
        (Number(updated.loanAuthorizedDeduction) || 0) +
        (Number(updated.taxStatutoryDeduction) || 0) +
        (Number(updated.otherAuthorizedDeduction) || 0);

      const netPayable = gross - totalDed;

      return {
        ...updated,
        grossEarnings: gross,
        totalDeduction: totalDed,
        netSalaryPayable: netPayable > 0 ? netPayable : 0,
        netSalaryInWords: numberToWords(netPayable > 0 ? netPayable : 0),
      };
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.employeeName || !formData.employeeName.trim()) {
        alert('অনুগ্রহ করে কর্মচারীর পূর্ণ নাম পূরণ করুন।');
        return;
      }
      if (!formData.employeeId || !formData.employeeId.trim()) {
        alert('অনুগ্রহ করে কর্মচারী আইডি পূরণ করুন।');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            মাসিক স্যালারি স্লিপ মাল্টি-স্টেপ ফরম (Step {currentStep} of 4)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            প্রতিটি ধাপ সঠিকভাবে সম্পন্ন করে সবশেষে প্রিন্ট-রেডি স্যালারি স্লিপ প্রিভিউ তৈরি করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট (Reset)</span>
        </button>
      </div>

      {/* Modern Multi-Step Progress Stepper */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isPassed = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500 text-foreground font-bold shadow-xs'
                    : isPassed
                    ? 'bg-muted/40 border-border text-foreground hover:bg-muted cursor-pointer'
                    : 'bg-background border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isPassed
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
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

      {/* Main Form by Step */}
      <form onSubmit={handleNext} className="space-y-6">
        {/* STEP 1: Employee & Payroll Control Details */}
        {currentStep === 1 && (
          <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 animate-in fade-in-50 duration-200">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm text-emerald-600 border-b border-border pb-2.5">
              <User className="w-4 h-4" /> ১. কর্মচারী ও স্যালারি নিয়ন্ত্রণ বিবরণী (Employee Profile & Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">কর্মচারীর পূর্ণ নাম (Employee Name) *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  placeholder="MD Hakimul Islam"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">কর্মচারী আইডি (Employee ID) *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  placeholder="123"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পদবী (Designation)</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="Managing Director"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বিভাগ (Department)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Management"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">যোগদানের তারিখ (Joining Date)</label>
                <input
                  type="text"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                  placeholder="01-10-2025"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বেতনের মাস (Salary Month) *</label>
                <input
                  type="text"
                  required
                  value={formData.salaryMonth}
                  onChange={(e) => handleChange('salaryMonth', e.target.value)}
                  placeholder="October 2025"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পরিশোধের তারিখ (Pay Date)</label>
                <input
                  type="text"
                  value={formData.payDate}
                  onChange={(e) => handleChange('payDate', e.target.value)}
                  placeholder="01-11-2025"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">স্লিপ নম্বর (Slip No.)</label>
                <input
                  type="text"
                  value={formData.slipNo}
                  onChange={(e) => handleChange('slipNo', e.target.value)}
                  placeholder="SLIP-2026-001"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পেমেন্ট মেথড (Payment Mode)</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleChange('paymentMode', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                  <option value="Cheque">Cheque (চেক)</option>
                  <option value="Other">Other (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">হাজিরা দিন (Attendance Days)</label>
                <input
                  type="number"
                  value={formData.attendanceDays}
                  onChange={(e) => handleChange('attendanceDays', e.target.value)}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Earnings Section */}
        {currentStep === 2 && (
          <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 animate-in fade-in-50 duration-200">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm text-emerald-600 border-b border-border pb-2.5">
              <DollarSign className="w-4 h-4" /> ২. অর্জিত বেতন ও ভাতাসমূহ / Earnings (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">মূল বেতন (Basic Salary) ৳</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  placeholder="40000"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বাড়ি ভাড়া ভাতা (House Rent) ৳</label>
                <input
                  type="number"
                  value={formData.houseRentAllowance}
                  onChange={(e) => handleChange('houseRentAllowance', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">চিকিৎসা ভাতা (Medical) ৳</label>
                <input
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                  placeholder="3000"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">যাতায়াত ভাতা (Conveyance) ৳</label>
                <input
                  type="number"
                  value={formData.conveyanceAllowance}
                  onChange={(e) => handleChange('conveyanceAllowance', e.target.value)}
                  placeholder="2000"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">অন্যান্য বিশেষ ভাতা ৳</label>
                <input
                  type="number"
                  value={formData.otherAllowance}
                  onChange={(e) => handleChange('otherAllowance', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ওভারটাইম / অতিরিক্ত দায়িত্ব ৳</label>
                <input
                  type="number"
                  value={formData.overtimeExtraDuty}
                  onChange={(e) => handleChange('overtimeExtraDuty', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="sm:col-span-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-foreground">মোট অর্জিত গ্রস বেতন (Gross Earnings):</span>
                <span className="font-mono font-bold text-base sm:text-lg text-emerald-600">
                  {Number(formData.grossEarnings).toLocaleString('en-BD')} ৳
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Deductions Section */}
        {currentStep === 3 && (
          <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 animate-in fade-in-50 duration-200">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm text-rose-600 border-b border-border pb-2.5">
              <DollarSign className="w-4 h-4" /> ৩. কর্তন ও সমন্বয় / Deductions (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">অগ্রিম বেতন গ্রহণ (Advance Salary) ৳</label>
                <input
                  type="number"
                  value={formData.advanceSalary}
                  onChange={(e) => handleChange('advanceSalary', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">অনুপস্থিতি কর্তন (Unpaid Leave) ৳</label>
                <input
                  type="number"
                  value={formData.unpaidLeaveAbsence}
                  onChange={(e) => handleChange('unpaidLeaveAbsence', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ঋণ কর্তন (Loan Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.loanAuthorizedDeduction}
                  onChange={(e) => handleChange('loanAuthorizedDeduction', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ট্যাক্স ও অন্যান্য কর্তন (Tax Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.taxStatutoryDeduction}
                  onChange={(e) => handleChange('taxStatutoryDeduction', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-foreground mb-1">অন্যান্য অনুমোদিত কর্তন (Other Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.otherAuthorizedDeduction}
                  onChange={(e) => handleChange('otherAuthorizedDeduction', e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="sm:col-span-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-foreground">মোট কর্তন (Total Deductions):</span>
                <span className="font-mono font-bold text-base sm:text-lg text-rose-600">
                  {Number(formData.totalDeduction).toLocaleString('en-BD')} ৳
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Attendance & Final Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Attendance Fields */}
            <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-sm text-sky-600 border-b border-border pb-2.5">
                <Clock className="w-4 h-4" /> ৪. হাজিরা বিবরণী ও সাক্ষরকারী (Attendance & Signatures)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">মোট কর্মদিবস</label>
                  <input
                    type="number"
                    value={formData.workingDays}
                    onChange={(e) => handleChange('workingDays', e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">উপস্থিত দিন</label>
                  <input
                    type="number"
                    value={formData.presentDays}
                    onChange={(e) => handleChange('presentDays', e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">পেইড ছুটি</label>
                  <input
                    type="number"
                    value={formData.paidLeave}
                    onChange={(e) => handleChange('paidLeave', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">অনুপস্থিত দিন</label>
                  <input
                    type="number"
                    value={formData.unpaidLeave}
                    onChange={(e) => handleChange('unpaidLeave', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                চূড়ান্ত বেতন বিবরণী সারসংক্ষেপ (Final Payroll Summary)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-background border border-border rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">কর্মচারীর নাম ও আইডি:</span>
                  <span className="font-bold text-foreground">{formData.employeeName || 'নামহীন'} ({formData.employeeId || '-'})</span>
                </div>
                <div className="p-3 bg-background border border-border rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">মোট গ্রস বেতন:</span>
                  <span className="font-bold text-foreground font-mono">{Number(formData.grossEarnings).toLocaleString('en-BD')} ৳</span>
                </div>
                <div className="p-3 bg-background border border-border rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">মোট কর্তন:</span>
                  <span className="font-bold text-rose-600 font-mono">- {Number(formData.totalDeduction).toLocaleString('en-BD')} ৳</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">সর্বমোট প্রদেয় নিট বেতন:</span>
                  <div className="text-xl font-black text-emerald-600 font-mono">
                    = {Number(formData.netSalaryPayable).toLocaleString('en-BD')} ৳
                  </div>
                  <div className="text-[11px] text-muted-foreground italic">({formData.netSalaryInWords})</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>পরবর্তী ধাপ (Next Step)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>স্যালারি স্লিপ তৈরি ও প্রিভিউ দেখুন</span>
            </button>
          )}
        </div>
      </form>

      {/* Shadcn UI Alert / Confirm Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">ফর্মের সকল তথ্য রিসেট নিশ্চিতকরণ</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              আপনি কি নিশ্চিত যে স্যালারি স্লিপের সকল ইনপুট ডেটা মুছে ফেলে ডিফল্ট ফর্মে ফিরে যেতে চান? এই কাজটি পুনরায় ফিরিয়ে আনা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setResetDialogOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer"
            >
              হ্যাঁ, রিসেট করুন
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
