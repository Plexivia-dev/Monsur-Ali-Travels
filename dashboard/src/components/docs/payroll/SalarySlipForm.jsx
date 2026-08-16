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
} from '@/components/ui/dialog';
import { DatePicker } from '../../ui/date-picker';

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

export function SalarySlipForm({ formData, setFormData, onSubmit, onReset, isSubmitting = false }) {
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
      
      // Calculate Gross Salary (Basic + House Rent + Medical + Conveyance + Other Allowance) - excluding overtime
      const gross = 
        (Number(updated.basicSalary) || 0) +
        (Number(updated.houseRentAllowance) || 0) +
        (Number(updated.medicalAllowance) || 0) +
        (Number(updated.conveyanceAllowance) || 0) +
        (Number(updated.otherAllowance) || 0);

      const overtime = Number(updated.overtimeExtraDuty) || 0;

      // Calculate Total Deductions
      const totalDed = 
        (Number(updated.advanceSalary) || 0) +
        (Number(updated.unpaidLeaveAbsence) || 0) +
        (Number(updated.loanAuthorizedDeduction) || 0) +
        (Number(updated.taxStatutoryDeduction) || 0) +
        (Number(updated.otherAuthorizedDeduction) || 0);

      // Net Salary = Gross Salary + Overtime - Total Deductions
      const netPayable = gross + overtime - totalDed;

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
    <div className="space-y-5 max-w-[850px] mx-auto">
      {/* Top Header Card */}
      <div className="bg-card border border-border p-6 rounded-[4px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
            <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
            Salary Slip Generator (Step {currentStep} of 4)
          </h2>
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

      {/* Corporate Clean Stepper (Max 4px Border Radius) */}
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

      {/* Main Form by Step */}
      <form onSubmit={handleNext} className="space-y-4">
        {/* STEP 1: Employee & Payroll Control Details */}
        {currentStep === 1 && (
          <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3 animate-in fade-in-50 duration-150">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
              <User className="w-4 h-4" /> ১. কর্মচারী ও স্যালারি নিয়ন্ত্রণ বিবরণী (Employee Profile & Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">কর্মচারীর পূর্ণ নাম (Employee Name) *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">কর্মচারী আইডি (Employee ID) *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পদবী (Designation)</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বিভাগ (Department)</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">যোগদানের তারিখ (Joining Date)</label>
                <DatePicker
                  value={formData.joiningDate}
                  onChange={(val) => handleChange('joiningDate', val)}
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বেতনের মাস (Salary Month) *</label>
                <input
                  type="text"
                  required
                  value={formData.salaryMonth}
                  onChange={(e) => handleChange('salaryMonth', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পরিশোধের তারিখ (Pay Date)</label>
                <DatePicker
                  value={formData.payDate}
                  onChange={(val) => handleChange('payDate', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-foreground">স্লিপ নম্বর (Slip No.)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                      const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
                      const getDigits = (len) => {
                        let res = '';
                        for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
                        return res;
                      };
                      const code = `SLIP-${getChar()}${getChar()}${getDigits(4)}${getChar()}${getDigits(3)}`;
                      handleChange('slipNo', code);
                    }}
                    className="text-[10px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    নতুন কোড জেনারেট
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.slipNo}
                  readOnly
                  className="w-full px-3 py-2 bg-muted/60 border border-border rounded-md text-foreground/80 text-xs font-mono font-bold outline-none cursor-not-allowed select-none"
                  placeholder="System Generated"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">পেমেন্ট মেথড (Payment Mode)</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleChange('paymentMode', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Earnings Section */}
        {currentStep === 2 && (
          <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3 animate-in fade-in-50 duration-150">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-emerald-600 border-b border-border pb-2">
              <DollarSign className="w-4 h-4" /> ২. অর্জিত বেতন ও ভাতাসমূহ / Earnings (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">মূল বেতন (Basic Salary) ৳</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">বাড়ি ভাড়া ভাতা (House Rent) ৳</label>
                <input
                  type="number"
                  value={formData.houseRentAllowance}
                  onChange={(e) => handleChange('houseRentAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">চিকিৎসা ভাতা (Medical) ৳</label>
                <input
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">যাতায়াত ভাতা (Conveyance) ৳</label>
                <input
                  type="number"
                  value={formData.conveyanceAllowance}
                  onChange={(e) => handleChange('conveyanceAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">অন্যান্য বিশেষ ভাতা ৳</label>
                <input
                  type="number"
                  value={formData.otherAllowance}
                  onChange={(e) => handleChange('otherAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ওভারটাইম / অতিরিক্ত দায়িত্ব ৳</label>
                <input
                  type="number"
                  value={formData.overtimeExtraDuty}
                  onChange={(e) => handleChange('overtimeExtraDuty', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">মোট অর্জিত গ্রস বেতন (Gross Earnings):</span>
                <span className="font-mono font-bold text-base text-emerald-600">
                  {Number(formData.grossEarnings).toLocaleString('en-BD')} ৳
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Deductions Section */}
        {currentStep === 3 && (
          <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3 animate-in fade-in-50 duration-150">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-rose-600 border-b border-border pb-2">
              <DollarSign className="w-4 h-4" /> ৩. কর্তন ও সমন্বয় / Deductions (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">অগ্রিম বেতন গ্রহণ (Advance Salary) ৳</label>
                <input
                  type="number"
                  value={formData.advanceSalary}
                  onChange={(e) => handleChange('advanceSalary', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">অনুপস্থিতি কর্তন (Unpaid Leave) ৳</label>
                <input
                  type="number"
                  value={formData.unpaidLeaveAbsence}
                  onChange={(e) => handleChange('unpaidLeaveAbsence', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ঋণ কর্তন (Loan Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.loanAuthorizedDeduction}
                  onChange={(e) => handleChange('loanAuthorizedDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">ট্যাক্স ও অন্যান্য কর্তন (Tax Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.taxStatutoryDeduction}
                  onChange={(e) => handleChange('taxStatutoryDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-foreground mb-1">অন্যান্য অনুমোদিত কর্তন (Other Deduction) ৳</label>
                <input
                  type="number"
                  value={formData.otherAuthorizedDeduction}
                  onChange={(e) => handleChange('otherAuthorizedDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">মোট কর্তন (Total Deductions):</span>
                <span className="font-mono font-bold text-base text-rose-600">
                  {Number(formData.totalDeduction).toLocaleString('en-BD')} ৳
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Attendance & Final Review */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Attendance Fields */}
            <div className="bg-card border border-border p-4 rounded-md shadow-xs space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-xs text-sky-600 border-b border-border pb-2">
                <Clock className="w-4 h-4" /> ৪. হাজিরা বিবরণী ও সাক্ষরকারী (Attendance & Signatures)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">মোট কর্মদিবস</label>
                  <input
                    type="number"
                    value={formData.workingDays}
                    onChange={(e) => handleChange('workingDays', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">উপস্থিত দিন</label>
                  <input
                    type="number"
                    value={formData.presentDays}
                    onChange={(e) => handleChange('presentDays', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">পেইড ছুটি</label>
                  <input
                    type="number"
                    value={formData.paidLeave}
                    onChange={(e) => handleChange('paidLeave', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">অনুপস্থিত দিন</label>
                  <input
                    type="number"
                    value={formData.unpaidLeave}
                    onChange={(e) => handleChange('unpaidLeave', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                চূড়ান্ত বেতন বিবরণী সারসংক্ষেপ (Final Payroll Summary)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">কর্মচারীর নাম ও আইডি:</span>
                  <span className="font-bold text-foreground">{formData.employeeName || 'নামহীন'} ({formData.employeeId || '-'})</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">মোট গ্রস বেতন:</span>
                  <span className="font-bold text-foreground font-mono">{Number(formData.grossEarnings).toLocaleString('en-BD')} ৳</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">মোট কর্তন:</span>
                  <span className="font-bold text-rose-600 font-mono">- {Number(formData.totalDeduction).toLocaleString('en-BD')} ৳</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">সর্বমোট প্রদেয় নিট বেতন:</span>
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    = {Number(formData.netSalaryPayable).toLocaleString('en-BD')} ৳
                  </div>
                  <div className="text-[11px] text-muted-foreground italic">({formData.netSalaryInWords})</div>
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
                  <span>স্যালারি স্লিপ তৈরি ও প্রিভিউ দেখুন</span>
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
              <DialogTitle className="text-base font-bold">ফর্মের সকল তথ্য রিসেট নিশ্চিতকরণ</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              আপনি কি নিশ্চিত যে স্যালারি স্লিপের সকল ইনপুট ডেটা মুছে ফেলে ডিফল্ট ফর্মে ফিরে যেতে চান?
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
