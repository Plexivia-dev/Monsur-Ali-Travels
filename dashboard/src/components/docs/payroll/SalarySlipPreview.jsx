import React from 'react';
import logoImg from '../../../assets/logo.png';
import infoData from '../../../lib/information.json';

export function SalarySlipPreview({ data }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const grossEarnings = Number(data.grossEarnings) || 0;
  const totalDeduction = Number(data.totalDeduction) || 0;
  const netPayable = Number(data.netSalaryPayable) || 0;

  return (
    <div 
      id="salary-slip-canvas"
      className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 flex flex-col justify-between font-sans shadow-2xl border border-slate-300 relative print:p-6 print:shadow-none print:border-0 print:m-0"
      style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
    >
      <div>
        {/* Top Header & Logo */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl bg-white border-2 border-slate-900 p-1 shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-[900] uppercase tracking-tight text-slate-900 leading-none">
                {infoData.agencyName || 'MANSUR ALI TOURS & TRAVELS'}
              </h1>
              <p className="text-[10px] font-bold text-slate-700 mt-1">
                Government Approved Overseas Manpower & Visa Facilitation Agency ({infoData.licenseNo || 'RL-1842'})
              </p>
              <p className="text-[9.5px] text-slate-600 font-medium mt-0.5">
                Head Office: {infoData.address?.full || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[10.5px]">
            <div className="font-bold text-slate-900">Slip No: {data.slipNo || 'SLIP-2026-001'}</div>
            <div className="text-slate-600">Date: {data.payDate || currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-[#0b2341] text-white py-2 px-4 rounded-lg text-center shadow-xs mb-4">
          <h2 className="text-sm font-[900] tracking-[1px] uppercase">
            INDIVIDUAL MONTHLY SALARY SHEET / SALARY SLIP
          </h2>
          <p className="text-[9.5px] font-semibold text-amber-400 mt-0.5">
            ব্যক্তিগত মাসিক বেতন শিট / পে-স্লিপ
          </p>
        </div>

        {/* Employee Profile & Payroll Control Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-[10.5px] border border-slate-300 rounded-xl p-3.5 bg-slate-50/50">
          {/* Column 1: EMPLOYEE PROFILE DETAILS */}
          <div className="space-y-1.5 border-r border-slate-300 pr-3">
            <h3 className="text-[10px] font-[900] uppercase tracking-wider text-[#0b2341] border-b border-slate-300 pb-1 mb-2">
              EMPLOYEE PROFILE DETAILS
            </h3>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Employee Name:</span>
              <span className="font-bold text-slate-900">{data.employeeName || 'MD Hakimul Islam'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Employee ID:</span>
              <span className="font-bold text-slate-900 font-mono">{data.employeeId || '123'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Designation:</span>
              <span className="font-bold text-slate-900">{data.designation || 'Managing Director'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Joining Date:</span>
              <span className="font-bold text-slate-900 font-mono">{data.joiningDate || '01-10-2025'}</span>
            </div>
          </div>

          {/* Column 2: PAYROLL CONTROL DETAILS */}
          <div className="space-y-1.5 pl-1">
            <h3 className="text-[10px] font-[900] uppercase tracking-wider text-[#0b2341] border-b border-slate-300 pb-1 mb-2">
              PAYROLL CONTROL DETAILS
            </h3>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Salary Month:</span>
              <span className="font-bold text-slate-900">{data.salaryMonth || 'October 2025'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Pay Date:</span>
              <span className="font-bold text-slate-900 font-mono">{data.payDate || currentDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Department:</span>
              <span className="font-bold text-slate-900">{data.department || 'Management'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Payment Mode:</span>
              <span className="font-bold text-slate-900">{data.paymentMode || 'Cash'}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Earnings & Deductions Table */}
        <div className="border border-slate-900 rounded-xl overflow-hidden mb-4 text-[10.5px]">
          <div className="grid grid-cols-2 bg-[#0b2341] text-white font-bold text-[10px] uppercase tracking-wider border-b border-slate-900">
            <div className="p-2 border-r border-slate-700 flex justify-between">
              <span>EARNINGS / ALLOWANCES</span>
              <span>AMOUNT (BDT)</span>
            </div>
            <div className="p-2 flex justify-between">
              <span>DEDUCTIONS / ADJUSTMENTS</span>
              <span>AMOUNT (BDT)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-300">
            {/* Earnings Left Side */}
            <div className="p-2.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Basic Salary</span>
                <span className="font-mono font-bold">{Number(data.basicSalary || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">House Rent Allowance</span>
                <span className="font-mono font-bold">{Number(data.houseRentAllowance || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Medical Allowance</span>
                <span className="font-mono font-bold">{Number(data.medicalAllowance || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Conveyance Allowance</span>
                <span className="font-mono font-bold">{Number(data.conveyanceAllowance || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Other Allowance</span>
                <span className="font-mono font-bold">{Number(data.otherAllowance || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Overtime / Extra Duty</span>
                <span className="font-mono font-bold">{Number(data.overtimeExtraDuty || 0).toLocaleString('en-BD')}</span>
              </div>
            </div>

            {/* Deductions Right Side */}
            <div className="p-2.5 space-y-1.5 bg-slate-50/50">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Advance Salary</span>
                <span className="font-mono font-bold">{Number(data.advanceSalary || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Unpaid Leave / Absence</span>
                <span className="font-mono font-bold">{Number(data.unpaidLeaveAbsence || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Loan / Authorized Deduction</span>
                <span className="font-mono font-bold">{Number(data.loanAuthorizedDeduction || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Tax / Statutory Deduction</span>
                <span className="font-mono font-bold">{Number(data.taxStatutoryDeduction || 0).toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Other Authorized Deduction</span>
                <span className="font-mono font-bold">{Number(data.otherAuthorizedDeduction || 0).toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>

          {/* Subtotals Footer */}
          <div className="grid grid-cols-2 bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
            <div className="p-2 border-r border-slate-300 flex justify-between">
              <span>GROSS EARNINGS</span>
              <span className="font-mono text-emerald-700">BDT {grossEarnings.toLocaleString('en-BD')}</span>
            </div>
            <div className="p-2 flex justify-between">
              <span>TOTAL DEDUCTION</span>
              <span className="font-mono text-rose-700">BDT {totalDeduction.toLocaleString('en-BD')}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Payable Banner */}
        <div className="bg-emerald-900 text-white p-3 rounded-xl shadow-xs mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
              NET SALARY PAYABLE
            </span>
            <span className="text-[11px] italic text-emerald-100 font-medium mt-0.5 block">
              In Words: <span className="font-bold text-white uppercase">{data.netSalaryInWords || 'Zero Taka Only'}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-[900] font-mono text-amber-300">
              BDT {netPayable.toLocaleString('en-BD')}
            </span>
          </div>
        </div>

        {/* Attendance & Leave Summary Table */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-[10.5px]">
          {/* Attendance Summary */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-1">
            <h4 className="font-[800] text-[#0b2341] uppercase text-[10px] border-b border-slate-300 pb-1 mb-1.5">
              ATTENDANCE & LEAVE VALUE
            </h4>
            <div className="grid grid-cols-2 gap-1 font-semibold">
              <span>Working Days: <strong className="font-mono">{data.workingDays || 30}</strong></span>
              <span>Present Days: <strong className="font-mono">{data.presentDays || 30}</strong></span>
              <span>Paid Leave: <strong className="font-mono">{data.paidLeave || 0}</strong></span>
              <span>Unpaid Leave: <strong className="font-mono">{data.unpaidLeave || 0}</strong></span>
            </div>
          </div>

          {/* Payroll Summary */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-1">
            <h4 className="font-[800] text-[#0b2341] uppercase text-[10px] border-b border-slate-300 pb-1 mb-1.5">
              PAYROLL SUMMARY
            </h4>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Gross Earnings:</span>
                <span className="font-mono font-bold">BDT {grossEarnings.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions:</span>
                <span className="font-mono font-bold text-rose-600">BDT {totalDeduction.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-0.5 font-bold text-emerald-700">
                <span>Net Payable:</span>
                <span className="font-mono">BDT {netPayable.toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Certification Statement */}
        <div className="p-3 border border-slate-300 bg-slate-50 rounded-xl text-[10px] text-slate-800 leading-relaxed mb-6">
          <span className="font-bold text-[#0b2341] block mb-0.5 uppercase tracking-wide">
            PAYROLL CERTIFICATION:
          </span>
          This salary statement is prepared from the company's payroll and attendance records. Applicable salary, overtime, deductions and benefits should be processed according to the employee's appointment terms and applicable Bangladesh labour laws and rules.
        </div>
      </div>

      {/* Signatures & Seal Block (Bottom Fixed on Page) */}
      <div className="pt-4 border-t border-slate-300">
        <div className="grid grid-cols-4 gap-4 text-center text-[10px] items-end">
          {/* Employee Acknowledgement */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 w-28 mx-auto mb-1" />
            <div className="font-bold text-slate-900 uppercase">EMPLOYEE ACKNOWLEDGEMENT</div>
            <div className="text-slate-600 text-[9px]">Signature & Date</div>
          </div>

          {/* Prepared By */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 w-28 mx-auto mb-1" />
            <div className="font-bold text-slate-900 uppercase">PREPARED BY</div>
            <div className="text-slate-600 text-[9px]">{data.preparedBy || 'HR Department'}</div>
          </div>

          {/* Checked By */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 w-28 mx-auto mb-1" />
            <div className="font-bold text-slate-900 uppercase">CHECKED BY</div>
            <div className="text-slate-600 text-[9px]">{data.checkedBy || 'Accounts Dept'}</div>
          </div>

          {/* Authorized Signatory */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 w-28 mx-auto mb-1" />
            <div className="font-bold text-slate-900 uppercase">AUTHORIZED SIGNATORY</div>
            <div className="text-slate-600 text-[9px]">Managing Director</div>
          </div>
        </div>

        {/* Company Seal Box */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="text-[9.5px] text-slate-500 font-medium">
            Mansur Ali Tours & Travels • Confidential Payroll Document • One Employee
          </div>

          <div className="w-28 h-12 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[8.5px] text-slate-400 font-mono text-center leading-tight">
            COMPANY SEAL / STAMP
          </div>
        </div>
      </div>

    </div>
  );
}
