import React, { useState, useEffect } from 'react';
import { AgreementForm } from './AgreementForm';
import { AgreementPreview } from './AgreementPreview';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Edit3, CheckCircle2, Share2 } from 'lucide-react';
import { apiClient } from '@shared/lib/api-client';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { toast } from 'sonner';
import agencyInfoJson from '@shared/lib/information.json';

// Generates unique agreement number e.g. "AGR-10294"
export function generateUniqueAgreementId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AGR-${prefix}${num}`;
}

export function EmploymentAgreement() {
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState({
    name: agencyInfoJson.agencyName ? `${agencyInfoJson.agencyName} (MONSUR ALI TRAVELS)` : 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
    address: agencyInfoJson.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    phone: agencyInfoJson.phone || '+8801345579534',
    email: agencyInfoJson.email || 'contact@monsuralitravels.com'
  });

  const defaultData = {
    _id: null,
    agreementId: generateUniqueAgreementId(),
    header: {
      companyName: agencyInfo.name || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      officeAddress: agencyInfo.address || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'contact@monsuralitravels.com'
    },
    parties: {
      agreementDate: new Date().toISOString().split('T')[0],
      nidPassport: '',
      employerName: '',
      employerPhone: '',
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
      joiningDate: new Date().toISOString().split('T')[0],
      location: 'হেড অফিস, নাদampur',
      jobType: 'স্থায়ী / পূর্ণকালীন (Full-Time)',
      workSchedule: 'সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার'
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

  const [formData, setFormData] = useState(defaultData);

  const handleReset = () => {
    setFormData({
      ...defaultData,
      _id: null,
      agreementId: generateUniqueAgreementId()
    });
    toast.info('চুক্তিপত্রের ফর্ম রিসেট করা হয়েছে।');
  };

  const handleFormSubmit = async () => {
    const finalAgreementId = formData.agreementId?.trim() || generateUniqueAgreementId();
    const payload = {
      ...formData,
      agreementId: finalAgreementId
    };

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(formData._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/agreements/${formData._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/agreements', payload);

      if (res.data?.success && res.data?.data) {
        const savedDoc = res.data.data;
        setFormData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          agreementId: savedDoc.agreementId || finalAgreementId,
        }));
        toast.success(
          isEdit
            ? `চুক্তিপত্র সফলভাবে ডাটাবেজে আপডেট করা হয়েছে! (আইডি: ${savedDoc.agreementId || finalAgreementId})`
            : `চুক্তিপত্র সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে! (আইডি: ${savedDoc.agreementId || finalAgreementId})`
        );
      } else {
        setFormData(payload);
        toast.success(`চুক্তিপত্র সফলভাবে তৈরি হয়েছে! (আইডি: ${finalAgreementId})`);
      }
    } catch (err) {
      console.warn('Agreement save notice (offline preview fallback):', err);
      setFormData(payload);
      toast.success(`চুক্তিপত্র প্রস্তুত হয়েছে! (আইডি: ${finalAgreementId})`);
    } finally {
      setIsSubmitting(false);
      setViewMode('preview');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const employee = formData.parties?.employeeName || 'কর্মচারী';
    const post = formData.position?.designation || 'কর্মকর্তা';
    const gross = formData.salary?.grossSalary || '0';

    const msg =
      `*📄 মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*নিয়োগ ও চাকরির চুক্তিপত্র (${formData.agreementId || 'Legal Doc'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কর্মচারীর নাম:* ${employee}\n` +
      `💼 *পদবী:* ${post} (${formData.position?.department || 'অফিস'})\n` +
      `📅 *চুক্তির তারিখ:* ${formData.parties?.agreementDate || 'আজ'}\n` +
      `💰 *সর্বমোট মাসিক বেতন:* ${gross} ৳\n` +
      `📌 *চুক্তির ন্যূনতম মেয়াদ:* ২ (দুই) বছর বাধ্যতামূলক\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: ${formData.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}\n` +
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
          <HeaderTitle
            variant="printables"
            icon={CheckCircle2}
            title={`চুক্তিপত্র প্রস্তুত সম্পন্ন (আইডি: ${formData.agreementId})`}
            subtitle="চুক্তিপত্রটি প্রস্তুত হয়েছে। সরাসরি A4 প্রিন্ট / পিডিএফ ডাউনলোড করুন অথবা তথ্যে পরিবর্তন আনতে এডিট করুন।"
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setViewMode('form')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  <Edit3 className="size-3.5 text-primary" />
                  <span>তথ্য পরিবর্তন (Edit Form)</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                  title="Share Agreement Summary on WhatsApp"
                >
                  <Share2 className="size-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Printer className="size-3.5" />
                  <span>Download / Print PDF</span>
                </button>
              </>
            }
          />

          {/* Printable A4 Canvas Container */}
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
