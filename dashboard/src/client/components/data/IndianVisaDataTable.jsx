import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileCheck, Trash2, Printer, Download, X, Edit3, Upload, Paperclip, CheckCircle2, Clock, Check, AlertCircle, Receipt } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { IndianVisaPreview, MoneyReceiptModal } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';

const VISA_STAGES = [
  { id: 'received', label: 'File Received', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'sent_to_senior', label: 'Sent to Senior', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { id: 'received_by_senior', label: 'Received by Senior', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { id: 'sent_to_lawyer', label: 'Sent to Lawyer', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  { id: 'online_submitted', label: 'Online Submitted', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  { id: 'approved', label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { id: 'indian_visa_submitted', label: 'Indian Visa Submitted', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  { id: 'indian_visa_completed', label: 'Indian Visa Completed', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  { id: 'police_clearance_applied', label: 'Police Clearance Applied', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  { id: 'ready_for_ecc_nda', label: 'Ready for ECC & NDA', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { id: 'submitted_to_bsf', label: 'Submitted to BSF Center', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20' },
  { id: 'complete_process', label: 'Complete Process', color: 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20' },
];

import { useTranslation } from 'react-i18next';

export function IndianVisaDataTable() {
  const { t } = useTranslation();
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  
  // Stage Status Update Modal State
  const [stageModalItem, setStageModalItem] = useState(null);
  const [newStage, setNewStage] = useState('pending');
  const [stageNote, setStageNote] = useState('');
  const [stageDocument, setStageDocument] = useState({ name: '', fileUrl: '', fileType: 'pdf' });
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/client/indian-visas', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Indian visa applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, status);
  };

  const handleOpenStageModal = (item) => {
    setStageModalItem(item);
    setNewStage(item.status || 'pending');
    setStageNote('');
    setStageDocument({ name: '', fileUrl: '', fileType: 'pdf' });
  };

  const handleSaveStageUpdate = async () => {
    if (!stageModalItem) return;
    try {
      setIsUpdatingStage(true);
      const payload = {
        status: newStage,
        note: stageNote || `Status updated to "${newStage}".`,
        document: stageDocument.fileUrl ? stageDocument : null,
      };

      await apiClient.patch(`/api/v1/client/indian-visas/${stageModalItem._id}/stage`, payload);
      toast.success(`Visa status successfully updated to "${newStage}"!`);
      setStageModalItem(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to update stage:', err);
      toast.error('Failed to update visa status.');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post('/api/v1/upload/single?folder=visa-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setStageDocument({
          name: file.name,
          fileUrl: res.data.data.url,
          fileType: file.type.includes('image') ? 'image' : 'pdf'
        });
        toast.success(`Document "${file.name}" uploaded successfully!`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('File upload failed.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/client/indian-visas/${deleteTarget.id}`);
      toast.success('Visa application record deleted successfully.');
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete visa record:', err);
      toast.error('Failed to delete visa record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: previewItem?.trackingNo || previewItem?.submissionNo || previewItem?.webFileNo,
      docType: 'Indian_Visa',
      clientName: previewItem?.applicantName,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            {t('indianVisas.title', 'Indian Visa Applications')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('indianVisas.subtitle', 'Complete database of submitted and processing Indian visa applications.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'indian-visa')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>{t('indianVisas.newVisa', '+ New Visa Application')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{t('common.allStatus', 'All Status')}</option>
            {VISA_STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {t('visaStatus.' + st.id, st.label)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search, status)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{t('tables.trackingNo', 'Tracking No')}</th>
                <th className="p-3">{t('tables.applicantName', 'Applicant Name')}</th>
                <th className="p-3">{t('tables.passportNo', 'Passport No')}</th>
                <th className="p-3">{t('tables.visaCategoryPort', 'Visa Category & Port')}</th>
                <th className="p-3">{t('tables.submissionDate', 'Submission Date')}</th>
                <th className="p-3 text-center">{t('tables.status', 'Status')}</th>
                <th className="p-3 text-right">{t('tables.action', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>{t('common.loadingData', 'Loading data...')}</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                    {t('common.noData', 'No data found')}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-center font-mono text-muted-foreground">
                      {pagination.skip + idx + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {item.trackingNo || '—'}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {item.applicantName || '—'}
                      {item.applicantPhone && (
                        <div className="text-[10px] text-muted-foreground font-mono font-normal">
                          {item.applicantPhone}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.passportNo || '—'}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{item.visaType || '—'}</div>
                      <div className="text-[10px] text-muted-foreground">{item.entryPort || '—'}</div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatToDdMmYyyy(item.submissionDate) || '—'}
                    </td>
                    <td className="p-3 text-center">
                      {(() => {
                        const stageInfo = VISA_STAGES.find(s => s.id === item.status) || VISA_STAGES[0];
                        return (
                          <button
                            type="button"
                            onClick={() => handleOpenStageModal(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-all hover:scale-105 cursor-pointer shadow-2xs ${stageInfo.color}`}
                            title="Click to update status and documents"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{t('visaStatus.' + stageInfo.id, stageInfo.label)}</span>
                          </button>
                        );
                      })()}
                    </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenStageModal(item)}
                            className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={t('common.updateStatus', 'Update Status / Add Stage Document')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{t('common.update', 'Update')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptModalData({
                                clientName: item.applicantName,
                                clientPhone: item.contactNo || item.phone,
                                passportNumber: item.passportNo,
                                serviceType: 'Indian Visa Processing',
                                purpose: `Visa Fee - Tracking #${item.trackingNo}`,
                                amount: item.fee || item.totalFee || '',
                                serviceRef: { modelName: 'IndianVisaSubmission', docId: item._id, trackingId: item.trackingNo },
                              })
                            }
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={t('common.createToken', 'Create Token / Money Receipt')}
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>{t('common.token', 'Token')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={t('common.downloadPrint', 'View & Download/Print Visa Receipt')}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('common.downloadPrint', 'Download / Print')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, trackingNo: item.trackingNo })}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title={t('common.delete', 'Delete Record')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <DataTablePagination
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={(p) => fetchData(p, pagination.limit, search, status)}
          onLimitChange={(l) => fetchData(1, l, search, status)}
        />
      </div>

      {/* Full Preview & Download Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white text-zinc-900 border border-black/10 rounded-2xl shadow-2xl max-w-4xl w-full h-[70vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-black/10 bg-black/[0.02] flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {t('indianVisas.receiptTitle', 'Indian Visa Application Receipt')} — {previewItem.trackingNo || ''}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {t('common.applicant', 'Applicant')}: {previewItem.applicantName || '—'} | {t('common.passport', 'Passport')}: {previewItem.passportNo || '—'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 h-9 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-black/[0.02] flex justify-center">
              <IndianVisaPreview data={previewItem} />
            </div>
          </div>
        </div>
      )}

      {/* Stage Status & Stage Document Update Modal */}
      {stageModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white border border-black/10 rounded-2xl max-w-lg w-full h-[70vh] flex flex-col shadow-2xl text-zinc-900 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.02] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{t('visa.stageUpdateTitle', 'Visa Processing Stage Update')}</h3>
                  <p className="text-xs text-zinc-500">
                    Tracking: <span className="font-mono font-bold text-emerald-600">{stageModalItem.trackingNo}</span> | {stageModalItem.applicantName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStageModalItem(null)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4 text-xs">
              {/* Stage Dropdown Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  {t('visa.selectNewStatus', 'Select New Status / Stage:')}
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-zinc-900 font-bold text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
                >
                  {VISA_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {t('visaStatus.' + st.id, st.label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Document Upload Option */}
              <div className="space-y-1.5 bg-black/[0.02] p-3.5 rounded-xl border border-black/10 text-xs">
                <label className="block font-bold text-zinc-700 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-primary" />
                  <span>{t('visa.attachStageDoc', 'Attach Stage Document / Visa Copy (Optional):')}</span>
                </label>
                
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 bg-white border border-black/10 hover:bg-black/[0.03] text-zinc-900 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>{t('common.selectFile', 'Select File')}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </label>
                  
                  {stageDocument.fileUrl ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium truncate">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{stageDocument.name}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500">{t('visa.noFile', 'No file attached')}</span>
                  )}
                </div>
              </div>

              {/* Note / Remarks */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  {t('common.remarks', 'Note / Remarks (Optional):')}
                </label>
                <textarea
                  value={stageNote}
                  onChange={(e) => setStageNote(e.target.value)}
                  placeholder="e.g. File submitted to embassy / Visa approved"
                  rows={2}
                  className="w-full px-3 py-2 bg-black/[0.03] border border-black/10 rounded-xl text-xs text-zinc-900 focus:ring-1 focus:ring-primary outline-hidden"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-black/10 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setStageModalItem(null)}
                className="px-4 h-9 rounded-xl text-xs font-semibold border border-red-500/30 text-red-600 hover:bg-red-500/10 cursor-pointer flex items-center justify-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveStageUpdate}
                disabled={isUpdatingStage}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 h-9 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isUpdatingStage ? t('common.updating', 'Updating...') : t('visa.updateStage', 'Update Stage')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Money Receipt Modal */}
      <MoneyReceiptModal
        isOpen={Boolean(receiptModalData)}
        onClose={() => setReceiptModalData(null)}
        initialData={receiptModalData || {}}
      />

      {/* Confirm Delete Alert Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this?"
        description={`Indian visa application "${deleteTarget?.trackingNo || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}
