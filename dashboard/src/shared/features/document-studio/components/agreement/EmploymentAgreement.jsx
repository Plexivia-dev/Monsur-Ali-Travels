import React, { useState, useEffect } from 'react';
import { AgreementForm } from './AgreementForm';
import { AgreementPreview } from './AgreementPreview';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Edit3, CheckCircle2, Share2 } from 'lucide-react';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
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
    name: agencyInfoJson.agencyName ? `${agencyInfoJson.agencyName} (MONSUR ALI TRAVELS)` : 'MONSUR ALI TRAVELS',
    address: agencyInfoJson.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    phone: agencyInfoJson.phone || '+8801345579534',
    email: agencyInfoJson.email || 'contact@monsuralitravels.com'
  });

  const defaultData = {
    _id: null,
    agreementId: generateUniqueAgreementId(),
    header: {
      companyName: agencyInfo.name || 'MONSUR ALI TRAVELS',
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
      relationship: 'Father',
      emergencyPhone: '',
      guardianNid: '',
      guardianAddress: ''
    },
    position: {
      designation: 'Office Executive / Processing Officer',
      department: 'Passport & Visa Processing Wing',
      joiningDate: new Date().toISOString().split('T')[0],
      location: 'Head Office, Nadampur',
      jobType: 'Permanent (Full-Time)',
      workSchedule: '9:00 AM - 6:00 PM, Sunday to Thursday'
    },
    salary: {
      basicSalary: '15000',
      houseRent: '5000',
      medical: '2000',
      conveyance: '1500',
      specialAllowance: '1500',
      grossSalary: '25,000',
      grossSalaryInWords: 'Twenty Five Thousand BDT Only'
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
    toast.info('Agreement form has been reset.');
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
            ? `Employment agreement updated successfully in database! (Agreement ID: ${savedDoc.agreementId || finalAgreementId})`
            : `Employment agreement saved successfully in database! (Agreement ID: ${savedDoc.agreementId || finalAgreementId})`
        );
      } else {
        setFormData(payload);
        toast.success(`Employment agreement created successfully! (Agreement ID: ${finalAgreementId})`);
      }
    } catch (err) {
      console.warn('Agreement save notice (offline preview fallback):', err);
      setFormData(payload);
      toast.success(`Employment agreement generated successfully! (Agreement ID: ${finalAgreementId})`);
    } finally {
      setIsSubmitting(false);
      setViewMode('preview');
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: formData.agreementId,
      docType: 'Employment_Agreement',
      clientName: formData.parties?.employeeName,
    });
  };

  const handleWhatsAppShare = () => {
    const employee = formData.parties?.employeeName || 'Employee';
    const post = formData.position?.designation || 'Official';
    const gross = formData.salary?.grossSalary || '0';

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*Employment & Service Agreement (${formData.agreementId || 'Legal Doc'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Employee Name:* ${employee}\n` +
      `💼 *Designation:* ${post} (${formData.position?.department || 'Office'})\n` +
      `📅 *Agreement Date:* ${formData.parties?.agreementDate || 'Today'}\n` +
      `💰 *Gross Monthly Salary:* ${gross} BDT \n` +
      `📌 *Minimum Contract Duration:* 2 (Two) Years\n\n` +
      `🏢 *MONSUR ALI TRAVELS*\n` +
      `📍 Address: ${formData.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}\n` +
      `📞 Helpline Contact: ${formData.header?.phone || '+8801345579534'}`;

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
            title={`Employment Agreement Ready (Agreement ID: ${formData.agreementId})`}
            subtitle="Employment agreement dossier is ready. Export to printable A4 PDF or edit terms."
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setViewMode('form')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  <Edit3 className="size-3.5 text-primary" />
                  <span>Edit Form</span>
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
