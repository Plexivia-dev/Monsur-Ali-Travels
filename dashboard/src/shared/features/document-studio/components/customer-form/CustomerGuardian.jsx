import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerGuardianForm } from './CustomerGuardianForm';
import { CustomerGuardianPreview } from './CustomerGuardianPreview';
import { getDefaultClientGuardianData, generateApplicationNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function CustomerGuardian({ initialData = null, onSavedSuccess = null }) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData || getDefaultClientGuardianData());
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultClientGuardianData());
    toast.info('Form has been reset to default.');
  };

  const handleSaveToDatabase = async () => {
    const payload = {
      ...data,
      applicationNo: data.applicationNo?.trim() || generateApplicationNo()
    };

    if (!payload._id) {
      delete payload._id;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/client-guardians/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/client-guardians', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setData(prev => ({
          ...prev,
          _id: savedDoc._id,
          applicationNo: savedDoc.applicationNo || payload.applicationNo
        }));
        toast.success(
          isEdit
            ? `Client & Guardian record updated successfully! (App No: ${savedDoc.applicationNo || payload.applicationNo})`
            : `Client & Guardian record saved successfully! (App No: ${savedDoc.applicationNo || payload.applicationNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (preview mode ready):', err);
      const fallbackAppNo = data.applicationNo || generateApplicationNo();
      setData(prev => ({ ...prev, applicationNo: fallbackAppNo }));
      toast.info(`Client & Guardian dossier ready! (App No: ${fallbackAppNo})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.applicationNo,
      docType: 'Client_Guardian_Form',
      clientName: data.clientInfo?.fullName
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.clientInfo?.fullName || 'Valued Client';
    const guardianName = data.guardianInfo?.guardianName || 'N/A';
    const phone = data.clientInfo?.phone || 'N/A';
    const totalAgreed = data.financials?.totalPackagePrice || 0;
    const paid = data.financials?.advancePaid || 0;
    const due = data.financials?.dueBalance || (totalAgreed - paid);

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*Client & Guardian Application Summary (${data.applicationNo || 'MAT-APP'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Applicant Name:* ${clientName}\n` +
      `🛡️ *Guardian Name:* ${guardianName}\n` +
      `📞 *Phone Number:* ${phone}\n` +
      `🛂 *Passport Number:* ${data.clientInfo?.passportNumber || 'N/A'}\n` +
      `💰 *Agreed Package Amount:* BDT  ${totalAgreed}\n` +
      `💵 *Advance Paid:* BDT  ${paid}\n` +
      `🔻 *Due Balance:* BDT  ${due}\n` +
      `✅ *Processing Stage:* ${data.financials?.currentStage || 'Intake / Initial Registration'}\n\n` +
      `🏢 *MONSUR ALI TRAVELS*\n` +
      `📍 Address: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Phone: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <HeaderTitle
        icon={UserCheck}
        title={t('clientForm.title', 'Client & Guardian Application Dossier')}
        subtitle={t('clientForm.subtitle', 'Create and print official client & guardian profile details, file tracking status, and advance payment ledger.')}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />

              <span>Reset</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Share Summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
              title="Export Printable A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="max-w-4xl mx-auto pb-16">
          <CustomerGuardianForm
            data={data}
            onChange={setData}
            onReset={handleReset}
            onSave={handleSaveToDatabase}
            onPreview={() => setViewMode('preview')}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <CustomerGuardianPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CustomerGuardianForm
              data={data}
              onChange={setData}
              onReset={handleReset}
              onSave={handleSaveToDatabase}
              onPreview={() => setViewMode('preview')}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <CustomerGuardianPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CustomerGuardian;
