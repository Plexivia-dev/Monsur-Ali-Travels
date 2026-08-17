import React, { useState } from 'react';
import { AgreementForm } from './AgreementForm';
import { AgreementPreview } from './AgreementPreview';
import { PrintablePaper } from '../common/PrintablePaper';
import agencyInfo from '../../../lib/information.json';
import { apiClient } from '../../../lib/api-client';
import { toast } from 'sonner';
import {
  FileText,
  Printer,
  Edit3,
  CheckCircle2
} from 'lucide-react';

export function EmploymentAgreementStudio() {
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData = {
    _id: null,
    agreementId: '',
    header: {
      companyName: agencyInfo.agencyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      officeAddress: agencyInfo.address?.full || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'monsuralitravels@gmail.com'
    },
    parties: {
      agreementDate: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      nidPassport: '',
      employerName: 'মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)',
      employerPhone: agencyInfo.phone || '+8801345579534',
      employeeName: '',
      employeeEmail: '',
      fatherHusbandName: '',
      address: ''
    },
    guardian: {
      guardianName: '',
      guardianPhone: '',
      relationship: 'পিতা',
      emergencyPhone: '',
      guardianNid: '',
      guardianAddress: ''
    },
    position: {
      designation: 'অফিস এক্সিকিউটিভ / প্রসেসিং অফিসার',
      department: 'পাসপোর্ট ও ভিসা প্রসেসিং উইং',
      joiningDate: '০১ সেপ্টেম্বর ২০২৬',
      location: 'হেড অফিস, নাদampur',
      jobType: 'স্থায়ী / পূর্ণকালীন (Full-Time)',
      workSchedule: 'সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতেবৃহস্পতিবার'
    },
    salary: {
      basicSalary: '15000',
      houseRent: '5000',
      medical: '2000',
      conveyance: '1500',
      specialAllowance: '1500',
      grossSalary: '25,000',
      grossSalaryInWords: 'পঁচিশ হাজার টাকা মাত্র'
    },
    leave: {
      casualDays: '10',
      sickDays: '14',
      earnedDays: '18',
      lunchProvided: true,
      teaSnacks: true,
      lunchAllowance: ''
    },
    witnesses: {
      firstWitnessName: '',
      firstWitnessPhone: '',
      firstWitnessAddress: '',
      secondWitnessName: '',
      secondWitnessPhone: '',
      secondWitnessAddress: ''
    }
  };

  const [formData, setFormData] = useState(initialData);

  const handleReset = () => {
    setFormData(initialData);
    toast.info('ফর্মের সকল তথ্য রিসেট করা হয়েছে।');
  };

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true);
      const isEdit = Boolean(formData._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/docs/employment-agreement/${formData._id}`, formData)
        : await apiClient.post('/api/v1/docs/employment-agreement', formData);

      if (res.data?.status === 'success' && res.data?.data) {
        const savedDoc = res.data.data;
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          agreementId: savedDoc.agreementId,
        }));

        toast.success(
          isEdit
            ? `চুক্তিপত্র ডাটাবেজে সফলভাবে আপডেট করা হয়েছে! (আইডি: ${savedDoc.agreementId})`
            : `চুক্তিপত্র সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে! (আইডি: ${savedDoc.agreementId})`
        );
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'ডাটাবেজে সংরক্ষণ/আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Agreement save/update error:', err);
      const msg = err.response?.data?.message || err.message || 'সার্ভারে সংরক্ষণ/আপডেট ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const employee = formData.parties?.employeeName || 'কর্মচারী';
    const designation = formData.position?.designation || 'কর্মকর্তা';
    const joiningDate = formData.position?.joiningDate || 'অপেক্ষমান';
    const gross = formData.salary?.grossSalary || 'নির্ধারিত';

    const msg =
      `*📄 মুনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*নিয়োগ ও চাকরির চুক্তিপত্র (${formData.agreementId || 'Official Agreement'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কর্মচারীর নাম:* ${employee}\n` +
      `💼 *পদবী:* ${designation}\n` +
      `🏢 *বিভাগ:* ${formData.position?.department || 'প্রসেসিং উইং'}\n` +
      `📅 *যোগদানের তারিখ:* ${joiningDate}\n` +
      `💰 *মাসিক সর্বমোট বেতন:* ${gross} ৳ (${formData.salary?.grossSalaryInWords || ''})\n` +
      `⏱️ *ন্যূনতম মেয়াদ:* ২ (দুই) বছর ও ৩ মাসের নোটিশ পলিসি\n\n` +
      `📌 *স্বাক্ষীগণের তথ্য ও চুক্তিপত্র:* চুক্তিপত্রের মূল প্রিন্ট কপি অফিসে প্রস্তুত রয়েছে।\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: ${formData.header?.officeAddress || 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh'}\n` +
      `📞 যোগাযোগ: ${formData.header?.phone || '+8801345579534'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form Mode */}
      {viewMode === 'form' && (
        <AgreementForm
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
                নিয়োগ চুক্তিপত্র প্রস্তুত (আইডি: <span className="font-mono text-emerald-600 font-bold">{formData.agreementId}</span>)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                চুক্তিপত্রটি ডাটাবেজে সংরক্ষিত রয়েছে। সরাসরি প্রিন্ট/পিডিএফ ডাউনলোড করুন অথবা তথ্যে পরিবর্তন আনতে এডিট করুন।
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
                title="Share Contract Summary on WhatsApp"
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

          {/* Printable A4 Legal Paper Container */}
          <div className="w-full flex justify-center">
            <PrintablePaper id="printable-agreement-canvas">
              <AgreementPreview data={formData} />
            </PrintablePaper>
          </div>
        </div>
      )}
    </div>
  );
}
