import React, { useState, useEffect } from 'react';
import { JobVerificationForm } from './JobVerificationForm';
import { JobVerificationPreview } from './JobVerificationPreview';
import { getDefaultJobVerificationData, generateUniqueJobVerificationId } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns, Briefcase, Share2, Printer } from 'lucide-react';
import { apiClient } from '@shared/lib/api-client';
import { toast } from 'sonner';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function JobVerification({ initialData = null, onSavedSuccess = null, isLocked = false }) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(() => {
    if (initialData) {
      return { ...getDefaultJobVerificationData(), ...initialData, isLocked };
    }
    return getDefaultJobVerificationData();
  });

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        isLocked,
      }));
    }
  }, [initialData, isLocked]);

  const handleReset = () => {
    setData(getDefaultJobVerificationData());
    toast.info('Job verification form reset to default.');
  };

  const handleFormSubmit = async () => {
    const finalVerificationId = data.verificationId?.trim() || generateUniqueJobVerificationId();
    const payload = {
      ...data,
      verificationId: finalVerificationId,
    };

    if (!payload._id) {
      delete payload._id;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/job-verifications/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/job-verifications', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedId = savedDoc.verificationId || finalVerificationId;
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          verificationId: returnedId,
        }));
        toast.success(
          isEdit
            ? `Job verification updated! (ID: ${returnedId})`
            : `Job verification saved to database! (ID: ${returnedId})`
        );
        if (onSavedSuccess) onSavedSuccess(savedDoc);
      } else {
        throw new Error(res.data?.message || 'Failed to save job verification to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (preview mode ready):', err);
      const fallbackId = data.verificationId || generateUniqueJobVerificationId();
      setData((prev) => ({
        ...prev,
        verificationId: fallbackId,
      }));
      toast.info(`Document preview ready! (ID: ${fallbackId})`);
      if (onSavedSuccess) onSavedSuccess({ verificationId: fallbackId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.verificationId,
      docType: 'Job_Verification_Form',
      clientName: data.clientInfo?.clientName,
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.clientInfo?.clientName || 'Candidate';
    const destCountry = data.jobStayDetails?.destinationCountry || 'Overseas';
    const jobTitle = data.jobStayDetails?.jobTitle || 'General Worker';
    const helperName = data.helperInfo?.helperName || 'N/A';

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*Company, Client & Job Verification Details Form*\n` +
      `*Verification ID:* ${data.verificationId || 'JVF-OFFICIAL'}\n` +
      `-----------------------------------------\n` +
      `👤 *Client Name:* ${clientName}\n` +
      `📞 *Client Phone:* ${data.clientInfo?.clientPhone || 'N/A'}\n` +
      `🌍 *Destination Country:* ${destCountry}\n` +
      `💼 *Job Title:* ${jobTitle}\n` +
      `🤝 *Sponsor / Helper:* ${helperName}\n` +
      `💰 *Agreed Salary:* ${data.jobStayDetails?.salaryAmount || 'N/A'} ${data.jobStayDetails?.currency || 'EUR'}\n` +
      `✅ *Verification Status:* Verified & Approved\n\n` +
      `🏢 *Monsur Ali Tours & Travels*\n` +
      `📍 ${data.companyInfo?.companyAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}\n` +
      `📞 Phone: ${data.companyInfo?.companyPhone || '+8801345579534'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Briefcase}
        title={`Job Verification Document Generator (${data.verificationId || 'JVF-OFFICIAL'})`}
        subtitle="Official overseas employment, workplace sponsor and stay verification dossier generator for immigration and embassy authorities."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
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
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-md font-black'
                        : 'text-sky-100/80 hover:text-white hover:bg-white/10'
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
        <div className="max-w-4xl mx-auto">
          <JobVerificationForm
            formData={data}
            setFormData={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding">
          <JobVerificationPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <JobVerificationForm
              formData={data}
              setFormData={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="lg:col-span-7 bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <JobVerificationPreview data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobVerification;
