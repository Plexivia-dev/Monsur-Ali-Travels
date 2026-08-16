import React, { useState } from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { SalarySlipForm } from './SalarySlipForm';
import { SalarySlipPreview } from './SalarySlipPreview';
import { Printer, Edit3, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { toast } from 'sonner';

export function SalarySlipStudio() {
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleData = {
    _id: null,
    companyName: 'MANSUR ALI TOURS & TRAVELS',
    companyAddress: 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
    slipNo: '',

    // Employee Info
    employeeName: '',
    employeeId: '',
    designation: 'অফিস এক্সিকিউটিভ',
    department: 'ভিসা ও পাসপোর্ট উইং',
    joiningDate: '01-10-2025',

    // Control Info
    salaryMonth: new Date().toLocaleDateString('en-BD', { month: 'long', year: 'numeric' }),
    payDate: new Date().toLocaleDateString('en-BD', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    paymentMode: 'Cash',
    attendanceDays: 30,

    // Earnings
    basicSalary: 20000,
    houseRentAllowance: 5000,
    medicalAllowance: 2000,
    conveyanceAllowance: 1500,
    otherAllowance: 0,
    overtimeExtraDuty: 0,
    grossEarnings: 28500,

    // Deductions
    advanceSalary: 0,
    unpaidLeaveAbsence: 0,
    loanAuthorizedDeduction: 0,
    taxStatutoryDeduction: 0,
    otherAuthorizedDeduction: 0,
    totalDeduction: 0,

    // Net Payable
    netSalaryPayable: 28500,
    netSalaryInWords: 'Twenty Eight Thousand Five Hundred Taka Only',

    // Attendance Values
    workingDays: 30,
    presentDays: 30,
    paidLeave: 0,
    unpaidLeave: 0,

    // Signatures
    preparedBy: 'HR Department',
    checkedBy: 'Accounts Department',
    authorizedSignatory: 'Managing Director',
    remarks: '',
  };

  const [formData, setFormData] = useState(sampleData);

  const handleReset = () => {
    setFormData(sampleData);
    toast.info('ফর্ম রিসেট করা হয়েছে।');
  };

  // Form submission strictly waits for backend MongoDB persistence and official slipNo
  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await apiClient.post('/api/v1/docs/payrolls', formData);
      
      if (res.data?.success && res.data?.data) {
        const savedDoc = res.data.data;
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          slipNo: savedDoc.slipNo,
        }));
        
        toast.success(`স্যালারি স্লিপ ডাটাবেজে সংরক্ষিত হয়েছে! (স্লিপ নং: ${savedDoc.slipNo})`);
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'ডাটাবেজে সেভ হতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Salary slip save error:', err);
      const msg = err.response?.data?.message || err.message || 'সার্ভারে সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const employee = formData.employeeName || 'কর্মচারী';
    const id = formData.employeeId || '-';
    const month = formData.salaryMonth || '';
    const gross = formData.grossEarnings || 0;
    const net = formData.netSalaryPayable || 0;

    const msg =
      `*📄 মুনসুর আলী ট্রাভেলস (MANSUR ALI TRAVELS)*\n` +
      `*মাসিক স্যালারি স্লিপ বিবরণী (${formData.slipNo || 'Official Slip'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কর্মচারীর নাম:* ${employee} (ID: ${id})\n` +
      `💼 *পদবী:* ${formData.designation || 'কর্মকর্তা'}\n` +
      `📅 *বেতনের মাস:* ${month}\n` +
      `💰 *মূল ও অন্যান্য ভাতা (Gross):* ${Number(gross).toLocaleString('en-BD')} ৳\n` +
      `🔻 *মোট কর্তন (Deductions):* ${Number(formData.totalDeduction).toLocaleString('en-BD')} ৳\n` +
      `💵 *সর্বমোট প্রদেয় নিট বেতন (Net Payable):* ${Number(net).toLocaleString('en-BD')} ৳\n` +
      `📝 *কথায়:* ${formData.netSalaryInWords || ''}\n\n` +
      `📌 মূল স্বাক্ষরিত স্যালারি স্লিপ প্রিন্ট কপি অফিসে সংরক্ষিত রয়েছে।`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form View Mode */}
      {viewMode === 'form' && (
        <SalarySlipForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview & Print View Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Action Header in Preview Mode */}
          <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                স্যালারি স্লিপ প্রস্তুত (স্লিপ নং: <span className="font-mono text-emerald-600 font-bold">{formData.slipNo}</span>)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                স্লিপটি ডাটাবেজে সংরক্ষিত হয়েছে। সরাসরি প্রিন্ট/পিডিএফ ডাউনলোড করুন অথবা তথ্যে পরিবর্তন আনতে এডিট করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-primary" />
                <span>তথ্য পরিবর্তন (Edit Form)</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                title="Share Salary Slip Summary on WhatsApp"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp-এ পাঠান</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-md shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>

          {/* Printable A4 Paper Container */}
          <div className="w-full flex justify-center pb-8">
            <PrintablePaper id="salary-slip-printable-paper">
              <SalarySlipPreview data={formData} />
            </PrintablePaper>
          </div>
        </div>
      )}
    </div>
  );
}
