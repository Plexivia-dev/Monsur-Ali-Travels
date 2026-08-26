import React, { useState } from 'react';
import { PassportSubmissionForm } from './PassportSubmissionForm';
import { PassportSubmissionPreview } from './PassportSubmissionPreview';
import { getDefaultPassportSubmissionData, generateUniquePassportTrackingNo } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns, Share2, Printer, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function PassportSubmission() {
  const [data, setData] = useState(getDefaultPassportSubmissionData());
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setData(getDefaultPassportSubmissionData());
    toast.info('Passport intake form reset to default.');
  };

  const handleFormSubmit = async () => {
    const payload = { ...data };
    if (!payload.trackingNo) {
      delete payload.trackingNo;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/passports/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/passports', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedTrackingNo = savedDoc.trackingNo || generateUniquePassportTrackingNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          trackingNo: returnedTrackingNo,
        }));
        toast.success(
          isEdit
            ? `Passport submission updated! (Tracking ID: ${returnedTrackingNo})`
            : `Passport submission saved to database! (Tracking ID: ${returnedTrackingNo})`
        );
      } else {
        throw new Error(res.data?.message || 'Failed to save passport record to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackTrackingNo = data.trackingNo || generateUniquePassportTrackingNo();
      setData((prev) => ({
        ...prev,
        trackingNo: fallbackTrackingNo,
      }));
      toast.info(`Passport file preview ready! (Tracking ID: ${fallbackTrackingNo})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.trackingNo || data.submissionNo || data.barcode,
      docType: 'Passport_Submission',
      clientName: data.applicantName,
    });
  };

  const handleWhatsAppShare = () => {
    const applicantName = data.applicantName || 'Valued Applicant';

    const msg =
      `*📄 MONSUR ALI TOURS & TRAVELS*\n` +
      `*Passport Submission & Intake Slip (${data.trackingNo || 'PASS-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Applicant Name:* ${applicantName}\n` +
      `🛂 *Passport Type:* ${data.passportType || 'E-Passport'}\n` +
      `📌 *Category:* ${data.applicationCategory || 'New Application'}\n` +
      `📅 *Submission Date:* ${data.submissionDate || 'Today'}\n` +
      `📞 *Mobile:* ${data.applicantPhone || 'N/A'}\n\n` +
      `📌 *Status:* Passport file received and logged in official processing queue.\n\n` +
      `🏢 *Monsur Ali Tours & Travels*\n` +
      `📍 Head Office: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Universal Top Header Banner */}
      <HeaderTitle
        variant="printables"
        icon={BookOpen}
        title={`Passport Submission & Intake Receipt (${data.trackingNo || 'PASS-OFFICIAL'})`}
        subtitle="Passport submission slip, intake token, and delivery acknowledgment slip generator."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center space-x-1 bg-muted p-1 rounded-xl border border-border">
              {[
                { id: 'split', label: 'Split View', icon: Columns },
                { id: 'edit', label: 'Edit Form', icon: Edit3 },
                { id: 'preview', label: 'Live Preview', icon: Eye },
              ].map((btn) => {
                const Icon = btn.icon;
                const isActive = viewMode === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setViewMode(btn.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-card text-foreground shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Share Summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
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
        <div className="max-w-4xl mx-auto">
          <PassportSubmissionForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding">
          <PassportSubmissionPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <PassportSubmissionForm
              data={data}
              onChange={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="lg:col-span-7 bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <PassportSubmissionPreview data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PassportSubmission;
