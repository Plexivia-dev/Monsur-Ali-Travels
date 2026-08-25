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
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';

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
    { id: 1, title: 'Employee Info', icon: User },
    { id: 2, title: 'Earnings & Allowances', icon: DollarSign },
    { id: 3, title: 'Deductions', icon: DollarSign },
    { id: 4, title: 'Attendance & Review', icon: Clock },
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
        alert('Please enter the employee full name.');
        return;
      }
      if (!formData.employeeId || !formData.employeeId.trim()) {
        alert('Please enter the employee ID.');
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

        <Button
          type="button"
          variant="reset"
          size="sm"
          onClick={() => setResetDialogOpen(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
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
              <User className="w-4 h-4" /> 1. Employee Profile & Payroll Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Joining Date</label>
                <DatePicker
                  value={formData.joiningDate}
                  onChange={(val) => handleChange('joiningDate', val)}
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Salary Month *</label>
                <input
                  type="text"
                  required
                  value={formData.salaryMonth}
                  onChange={(e) => handleChange('salaryMonth', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Pay Date</label>
                <DatePicker
                  value={formData.payDate}
                  onChange={(val) => handleChange('payDate', val)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-foreground">Slip No.</label>
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
                    Generate Random
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
                <label className="block font-semibold text-foreground mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleChange('paymentMode', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Attendance Days</label>
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
              <DollarSign className="w-4 h-4" /> 2. Earnings (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Basic Salary (BDT)</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">House Rent Allowance (BDT)</label>
                <input
                  type="number"
                  value={formData.houseRentAllowance}
                  onChange={(e) => handleChange('houseRentAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Medical Allowance (BDT)</label>
                <input
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Conveyance Allowance (BDT)</label>
                <input
                  type="number"
                  value={formData.conveyanceAllowance}
                  onChange={(e) => handleChange('conveyanceAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Other Special Allowance (BDT)</label>
                <input
                  type="number"
                  value={formData.otherAllowance}
                  onChange={(e) => handleChange('otherAllowance', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Overtime / Extra Duty (BDT)</label>
                <input
                  type="number"
                  value={formData.overtimeExtraDuty}
                  onChange={(e) => handleChange('overtimeExtraDuty', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">Gross Earnings:</span>
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
              <DollarSign className="w-4 h-4" /> 3. Deductions & Adjustments (BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Advance Salary (BDT)</label>
                <input
                  type="number"
                  value={formData.advanceSalary}
                  onChange={(e) => handleChange('advanceSalary', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Unpaid Leave Absence (BDT)</label>
                <input
                  type="number"
                  value={formData.unpaidLeaveAbsence}
                  onChange={(e) => handleChange('unpaidLeaveAbsence', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Loan Deduction (BDT)</label>
                <input
                  type="number"
                  value={formData.loanAuthorizedDeduction}
                  onChange={(e) => handleChange('loanAuthorizedDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Tax / Statutory Deduction (BDT)</label>
                <input
                  type="number"
                  value={formData.taxStatutoryDeduction}
                  onChange={(e) => handleChange('taxStatutoryDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-foreground mb-1">Other Authorized Deduction (BDT)</label>
                <input
                  type="number"
                  value={formData.otherAuthorizedDeduction}
                  onChange={(e) => handleChange('otherAuthorizedDeduction', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">Total Deductions:</span>
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
                <Clock className="w-4 h-4" /> 4. Attendance Summary & Signatures
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Total Working Days</label>
                  <input
                    type="number"
                    value={formData.workingDays}
                    onChange={(e) => handleChange('workingDays', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Present Days</label>
                  <input
                    type="number"
                    value={formData.presentDays}
                    onChange={(e) => handleChange('presentDays', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Paid Leave</label>
                  <input
                    type="number"
                    value={formData.paidLeave}
                    onChange={(e) => handleChange('paidLeave', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Unpaid / Absent Days</label>
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
                Final Payroll Summary
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">Employee Name & ID:</span>
                  <span className="font-bold text-foreground">{formData.employeeName || 'Unnamed'} ({formData.employeeId || '-'})</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">Total Gross Earnings:</span>
                  <span className="font-bold text-foreground font-mono">{Number(formData.grossEarnings).toLocaleString('en-BD')} ৳</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-md">
                  <span className="text-muted-foreground block text-[10px]">Total Deductions:</span>
                  <span className="font-bold text-rose-600 font-mono">- {Number(formData.totalDeduction).toLocaleString('en-BD')} ৳</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Net Salary Payable:</span>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="success"
              size="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Saving to Database & Generating ID...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Generate Salary Slip & View Preview</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Shadcn UI Confirm Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">Confirm Form Reset</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to clear all input data and reset the salary slip form?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmReset}
            >
              Yes, Reset Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SalarySlipForm;
