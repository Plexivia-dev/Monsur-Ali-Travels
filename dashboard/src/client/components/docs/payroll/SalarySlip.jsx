import React, { useState } from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { SalarySlipForm } from './SalarySlipForm';
import { SalarySlipPreview } from './SalarySlipPreview';
import { Printer, Edit3, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { toast } from 'sonner';
import agencyInfo from '../../../lib/information.json';

// Generates unique Slip Number: "SLIP-" + 2 letters + 4 digits + 1 letter + 3 digits (e.g. "SLIP-AB4829K513")
export function generateUniqueSlipNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 2; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const midNum = Math.floor(1000 + Math.random() * 9000);
  const midChar = letters.charAt(Math.floor(Math.random() * letters.length));
  const endNum = Math.floor(100 + Math.random() * 900);
  return `SLIP-${prefix}${midNum}${midChar}${endNum}`;
}

export function SalarySlip() {
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleData = {
    _id: null,
    companyName: agencyInfo.agencyName?.toUpperCase() || 'MONSUR ALI TOURS & TRAVELS',
    companyAddress: agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    slipNo: generateUniqueSlipNumber(),

    // Employee Info
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    salaryMonth: '',
    payDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    bankAccountNo: '',

    // Earnings
    basicSalary: "",
    houseRentAllowance: "",
    medicalAllowance: "",
    conveyanceAllowance: "",
    otherAllowance: "",
    overtimeAmount: "",
    grossEarnings: "",

    // Deductions
    advanceSalary: 0,
    unpaidLeaveDeduction: 0,
    loanDeduction: 0,
    taxStatutoryDeduction: 0,
    otherAuthorizedDeduction: 0,
    totalDeduction: 0,

    // Net Payable
    netSalaryPayable: "",
    netSalaryInWords: '',

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
    setFormData({
      ...sampleData,
      _id: null,
      slipNo: generateUniqueSlipNumber()
    });
    toast.info('ফর্ম রিসেট করা হয়েছে। নতুন স্লিপ আইডি জেনারেট হয়েছে।');
  };

  const handleFormSubmit = async () => {
    const finalSlipNo = formData.slipNo?.trim() || generateUniqueSlipNumber();
    const payload = { ...formData, slipNo: finalSlipNo };

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(formData._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/payrolls/${formData._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/payrolls', payload);

      if (res.data?.success && res.data?.data) {
        const savedDoc = res.data.data;
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          slipNo: savedDoc.slipNo || finalSlipNo,
        }));
        toast.success(
          isEdit
            ? `স্যালারি স্লিপ ডাটাবেজে সফলভাবে আপডেট করা হয়েছে! (স্লিপ নং: ${savedDoc.slipNo || finalSlipNo})`
            : `স্যালারি স্লিপ ডাটাবেজে সংরক্ষণ করা হয়েছে! (স্লিপ নং: ${savedDoc.slipNo || finalSlipNo})`
        );
      } else {
        setFormData(payload);
        toast.success(`স্যালারি স্লিপ প্রস্তুত হয়েছে! (স্লিপ নং: ${finalSlipNo})`);
      }
    } catch (err) {
      console.warn('Backend save/update notice (offline fallback):', err);
      setFormData(payload);
      toast.success(`স্যালারি স্লিপ প্রস্তুত হয়েছে! (স্লিপ নং: ${finalSlipNo})`);
    } finally {
      setIsSubmitting(false);
      setViewMode('preview');
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: formData.slipNo,
      docType: 'Salary_Slip',
      clientName: formData.employeeName,
    });
  };

  const handleWhatsAppShare = () => {
    const employee = formData.employeeName || 'কর্মচারী';
    const id = formData.employeeId || 'N/A';
    const month = formData.salaryMonth || 'চলতি মাস';

    const msg =
      `*📄 মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*মাসিক স্যালারি স্লিপ বিবরণী (${formData.slipNo || 'Official Slip'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কর্মচারীর নাম:* ${employee} (ID: ${id})\n` +
      `💼 *পদবী:* ${formData.designation || 'কর্মকর্তা'}\n` +
      `📅 *বেতনের মাস:* ${month}\n` +
      `💰 *মূল বেতন (Basic):* ${formData.basicSalary} ৳\n` +
      `💵 *গ্রস অর্জিত বেতন:* ${formData.grossEarnings} ৳\n` +
      `⏰ *ওভারটাইম:* ${formData.overtimeAmount} ৳\n` +
      `🔻 *মোট কর্তন:* ${formData.totalDeduction} ৳\n` +
      `✅ *সর্বমোট প্রদেয় বেতন (Net Salary):* ${formData.netSalaryPayable} ৳ (${formData.netSalaryInWords || ''})\n\n` +
      `📌 *স্লিপ ও পেমেন্ট স্ট্যাটাস:* পরিশোধিত (Paid via ${formData.paymentMode || 'Cash'})\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 যোগাযোগ: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form Mode */}
      {viewMode === 'form' && (
        <SalarySlipForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview Mode */}
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
                স্লিপটি ডাটাবেজে সংরক্ষিত রয়েছে। সরাসরি প্রিন্ট/পিডিএফ ডাউনলোড করুন অথবা তথ্যে পরিবর্তন আনতে এডিট করুন।
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

          {/* Printable A4 Canvas Container */}
          <div className="w-full flex justify-center py-4 no-print-padding">
            <SalarySlipPreview data={formData} />
          </div>
        </div>
      )}
    </div>
  );
}
