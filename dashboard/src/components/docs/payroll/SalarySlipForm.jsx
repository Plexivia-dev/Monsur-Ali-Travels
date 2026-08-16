import React from 'react';
import { User, Shield, Calendar, DollarSign, Clock, FileText, Building, Award, CheckCircle } from 'lucide-react';

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

export function SalarySlipForm({ formData, setFormData, onReset }) {
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

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          Salary Slip Input & Payroll Controls
        </h2>
        <button
          onClick={onReset}
          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          Reset Demo
        </button>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Employee & Payroll Control Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs text-emerald-600 border-b border-border/60 pb-1">
            <User className="w-3.5 h-3.5" /> 1. Employee Profile & Payroll Control Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Employee Name</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                placeholder="MD Hakimul Islam"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="123"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="Managing Director"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Management"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Joining Date</label>
              <input
                type="text"
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                placeholder="01-10-2025"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Salary Month</label>
              <input
                type="text"
                value={formData.salaryMonth}
                onChange={(e) => handleChange('salaryMonth', e.target.value)}
                placeholder="October 2025"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Pay Date</label>
              <input
                type="text"
                value={formData.payDate}
                onChange={(e) => handleChange('payDate', e.target.value)}
                placeholder="01-11-2025"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Slip No.</label>
              <input
                type="text"
                value={formData.slipNo}
                onChange={(e) => handleChange('slipNo', e.target.value)}
                placeholder="SLIP-2026-001"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-semibold"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Attendance Days</label>
              <input
                type="number"
                value={formData.attendanceDays}
                onChange={(e) => handleChange('attendanceDays', e.target.value)}
                placeholder="30"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs text-emerald-600 border-b border-border/60 pb-1">
            <DollarSign className="w-3.5 h-3.5" /> 2. Earnings / Allowances (BDT)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Basic Salary</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => handleChange('basicSalary', e.target.value)}
                placeholder="40000"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">House Rent Allowance</label>
              <input
                type="number"
                value={formData.houseRentAllowance}
                onChange={(e) => handleChange('houseRentAllowance', e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Medical Allowance</label>
              <input
                type="number"
                value={formData.medicalAllowance}
                onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                placeholder="3000"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Conveyance Allowance</label>
              <input
                type="number"
                value={formData.conveyanceAllowance}
                onChange={(e) => handleChange('conveyanceAllowance', e.target.value)}
                placeholder="2000"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Other Allowance</label>
              <input
                type="number"
                value={formData.otherAllowance}
                onChange={(e) => handleChange('otherAllowance', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Overtime / Extra Duty</label>
              <input
                type="number"
                value={formData.overtimeExtraDuty}
                onChange={(e) => handleChange('overtimeExtraDuty', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs text-rose-600 border-b border-border/60 pb-1">
            <DollarSign className="w-3.5 h-3.5" /> 3. Deductions / Adjustments (BDT)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Advance Salary</label>
              <input
                type="number"
                value={formData.advanceSalary}
                onChange={(e) => handleChange('advanceSalary', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Unpaid Leave / Absence</label>
              <input
                type="number"
                value={formData.unpaidLeaveAbsence}
                onChange={(e) => handleChange('unpaidLeaveAbsence', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Loan / Authorized Deduction</label>
              <input
                type="number"
                value={formData.loanAuthorizedDeduction}
                onChange={(e) => handleChange('loanAuthorizedDeduction', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Tax / Statutory Deduction</label>
              <input
                type="number"
                value={formData.taxStatutoryDeduction}
                onChange={(e) => handleChange('taxStatutoryDeduction', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-muted-foreground mb-1">Other Authorized Deduction</label>
              <input
                type="number"
                value={formData.otherAuthorizedDeduction}
                onChange={(e) => handleChange('otherAuthorizedDeduction', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Attendance Summary & Signatures */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs text-sky-600 border-b border-border/60 pb-1">
            <Clock className="w-3.5 h-3.5" /> 4. Attendance & Signatures
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Working Days</label>
              <input
                type="number"
                value={formData.workingDays}
                onChange={(e) => handleChange('workingDays', e.target.value)}
                placeholder="30"
                className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Present Days</label>
              <input
                type="number"
                value={formData.presentDays}
                onChange={(e) => handleChange('presentDays', e.target.value)}
                placeholder="30"
                className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Paid Leave</label>
              <input
                type="number"
                value={formData.paidLeave}
                onChange={(e) => handleChange('paidLeave', e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Unpaid Leave</label>
              <input
                type="number"
                value={formData.unpaidLeave}
                onChange={(e) => handleChange('unpaidLeave', e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-foreground text-xs font-mono"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
