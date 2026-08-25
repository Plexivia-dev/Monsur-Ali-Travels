import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientGuardianForm } from './ClientGuardianForm';
import { ClientGuardianPreview } from './ClientGuardianPreview';
import { getDefaultClientGuardianData, generateApplicationNo } from './sampleData';
import { Printer, Edit3, CheckCircle2, FileText, Download, Share2, Sparkles, Save, Database } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api-client';
import { Button } from '@/components/ui/button';

export function ClientGuardian({ initialData = null, onSavedSuccess = null }) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData || getDefaultClientGuardianData());
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultClientGuardianData());
    toast.info(t('clientForm.clearReset', 'Form data reset'));
  };

  const handleSaveToDatabase = async () => {
    if (!data.client?.fullName?.trim()) {
      toast.error(t('clientForm.fullNamePlaceholder', 'Client full name is required'));
      return;
    }

    const payload = { ...data };
    if (!payload.applicationNo) {
      payload.applicationNo = generateApplicationNo();
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/client-guardians/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/client-guardians', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        setData(savedDoc);
        toast.success(
          isEdit
            ? `${t('clientForm.updateDb', 'Updated')} (App No: ${savedDoc.applicationNo})`
            : `${t('clientForm.saveDb', 'Saved')} (App No: ${savedDoc.applicationNo})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'Failed to save');
      }
    } catch (err) {
      console.warn('Backend API save warning (offline preview mode):', err);
      const fallbackAppNo = data.applicationNo || generateApplicationNo();
      setData(prev => ({ ...prev, applicationNo: fallbackAppNo }));
      toast.info(`Preview ready (App No: ${fallbackAppNo})`);
      setViewMode('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const clientName = data.client?.fullName || 'Client';
    const total = Number(data.payment?.totalAmount || 0).toLocaleString('en-IN');
    const advance = Number(data.payment?.advancePaid || 0).toLocaleString('en-IN');
    const due = Number(data.payment?.dueAmount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*CUSTOMER & GUARDIAN APPLICATION FORM (${data.applicationNo || 'APP-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Name:* ${clientName}\n` +
      `📌 *Service:* ${data.serviceType || 'Indian Visa'}\n` +
      `🆔 *NID:* ${data.client?.nidNumber || 'N/A'}\n` +
      `🛂 *Passport:* ${data.client?.passportNumber || 'N/A'}\n` +
      `👥 *Guardian:* ${data.guardian?.fullName || 'N/A'} (${data.guardian?.relationship || 'Guardian'})\n` +
      `-----------------------------------------\n` +
      `💰 *Total Fee:* ৳ ${total}\n` +
      `✅ *Advance Paid:* ৳ ${advance}\n` +
      `⏳ *Due Amount:* ৳ ${due}\n` +
      `-----------------------------------------\n` +
      `📅 *Date:* ${data.dateReceived || 'Today'}\n\n` +
      `🏢 *MONSUR ALI TRAVELS*\n` +
      `📍 Address: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Phone: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('clientForm.title', 'Client & Guardian Information Application Form')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('clientForm.subtitle', 'Create and print official client & guardian profile details, file tracking status, and advance payment ledger.')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('clientForm.editForm', 'Edit Form')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('clientForm.printPreview', 'Print Preview')}</span>
            </button>
          </div>

          {/* WhatsApp Share */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            title="WhatsApp Share"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">WhatsApp</span>
          </Button>

          {/* Print / Download Button */}
          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            <span>{t('clientForm.downloadPrint', 'Download PDF / Print')}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'form' ? (
        <ClientGuardianForm
          data={data}
          onChange={setData}
          onReset={handleReset}
          onSave={handleSaveToDatabase}
          onPreview={() => setViewMode('preview')}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-muted/20 border border-border p-4 sm:p-6 rounded-2xl flex flex-col items-center">
          <ClientGuardianPreview data={data} />
        </div>
      )}
    </div>
  );
}
