import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileCheck, Trash2, Printer, Download, X, Edit3, Upload, Paperclip, CheckCircle2, Clock, Check, AlertCircle, Receipt } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { IndianVisaPreview } from '../docs/indian-visa/IndianVisaPreview';
import { MoneyReceiptModal } from '../docs/receipt/MoneyReceiptModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

const VISA_STAGES = [
  { id: 'pending', label: 'আবেদন গ্রহণ (Pending)', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'submitted', label: 'ফাইল সাবমিটেড (Submitted)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { id: 'accepted', label: 'ভিসা এক্সেপ্টেড (Visa Accepted)', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { id: 'rejected', label: 'ভিসা রিজেক্টেড (Visa Rejected)', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  { id: 'delivered', label: 'ডেলিভারি সম্পন্ন (Delivered)', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
];

export function IndianVisaDataTable() {
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

      const res = await apiClient.get('/api/v1/indian-visas', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Indian visa applications:', err);
      toast.error('ইন্ডিয়ান ভিসা আবেদনের তালিকা লোড করতে ব্যর্থ হয়েছে।');
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
        note: stageNote || `স্ট্যাটাস পরিবর্তন করে "${newStage}" করা হয়েছে।`,
        document: stageDocument.fileUrl ? stageDocument : null,
      };

      await apiClient.patch(`/api/v1/indian-visas/${stageModalItem._id}/stage`, payload);
      toast.success(`ভিসা স্ট্যাটাস সফলভাবে "${newStage}" এ আপডেট করা হয়েছে!`);
      setStageModalItem(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to update stage:', err);
      toast.error('ভিসা স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
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
        toast.success(`ডকুমেন্ট "${file.name}" সফলভাবে আপলোড হয়েছে!`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('ফাইল আপলোড করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/indian-visas/${deleteTarget.id}`);
      toast.success('ভিসা আবেদন রেকর্ড মুছে ফেলা হয়েছে।');
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete visa record:', err);
      toast.error('ভিসা আবেদন মুছতে সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            Indian Visa Applications (ইন্ডিয়ান ভিসা আবেদন তালিকা)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            সকল জমাকৃত ও প্রসেসিংরত ইন্ডিয়ান ভিসা আবেদনসমূহের সার্বিক ডাটাবেজ রেকর্ড।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'indian-visa')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>+ নতুন ভিসা আবেদন</span>
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
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="pending">Pending (অপেক্ষমান)</option>
            <option value="processing">Processing (প্রসেসিং)</option>
            <option value="submitted">Submitted (জমা দেওয়া হয়েছে)</option>
            <option value="delivered">Delivered (ডেলিভার্ড)</option>
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
                <th className="p-3">ট্র্যাকিং নম্বর (Tracking No)</th>
                <th className="p-3">আবেদনকারীর নাম</th>
                <th className="p-3">পাসপোর্ট নম্বর</th>
                <th className="p-3">ভিসা ক্যাটাগরি ও পোর্ট</th>
                <th className="p-3">জমার তারিখ</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                    কোনো ভিসা আবেদন রেকর্ড পাওয়া যায়নি।
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
                            title="ক্লিক করে স্ট্যাটাস ও ডকুমেন্ট পরিবর্তন করুন"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{stageInfo.label.split(' ')[0]}</span>
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
                          title="Update Status / Add Stage Document"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>আপডেট</span>
                        </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptModalData({
                                clientName: item.applicantName,
                                clientPhone: item.contactNo || item.phone,
                                passportNumber: item.passportNo,
                                serviceType: 'ইন্ডিয়ান ভিসা প্রসেসিং (Indian Visa)',
                                purpose: `ভিসা আবেদন ফি - ট্র্যাকিং #${item.trackingNo}`,
                                amount: item.fee || item.totalFee || '',
                                serviceRef: { modelName: 'IndianVisaSubmission', docId: item._id, trackingId: item.trackingNo },
                              })
                            }
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title="টোকেন / মানি রিসিট তৈরি করুন"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>টোকেন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title="View & Download/Print Visa Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download / Print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, trackingNo: item.trackingNo })}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete Record"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  ইন্ডিয়ান ভিসা আবেদন রশিদ — {previewItem.trackingNo || ''}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  আবেদনকারী: {previewItem.applicantName || '—'} | পাসপোর্ট: {previewItem.passportNo || '—'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/40 flex justify-center">
              <IndianVisaPreview data={previewItem} />
            </div>
          </div>
        </div>
      )}

      {/* Stage Status & Stage Document Update Modal */}
      {stageModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">ভিসা প্রসেসিং স্টেজ আপডেট</h3>
                  <p className="text-xs text-muted-foreground">
                    ট্র্যাকিং: <span className="font-mono font-bold text-emerald-600">{stageModalItem.trackingNo}</span> | {stageModalItem.applicantName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStageModalItem(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Dropdown Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                নতুন স্ট্যাটাস / স্টেজ নির্বাচন করুন:
              </label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-bold text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
              >
                {VISA_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Document Upload Option */}
            <div className="space-y-1.5 bg-muted/40 p-3.5 rounded-xl border border-border text-xs">
              <label className="block font-bold text-foreground flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-primary" />
                <span>স্টেজের ডকুমেন্ট / ভিসা কপি সংযুক্ত করুন (ঐচ্ছিক):</span>
              </label>
              
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 bg-background border border-border hover:bg-muted/80 text-foreground px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>ফাইল সিলেক্ট করুন</span>
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
                  <span className="text-[11px] text-muted-foreground">কোনো ফাইল যুক্ত করা হয়নি</span>
                )}
              </div>
            </div>

            {/* Note / Remarks */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                মন্তব্য / রিমার্কস (ঐচ্ছিক):
              </label>
              <textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="যেমন: এম্বাসিতে ফাইল জমা হয়েছে / ভিসা অনুমোদন হয়েছে"
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setStageModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveStageUpdate}
                disabled={isUpdatingStage}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isUpdatingStage ? 'আপডেট হচ্ছে...' : 'স্টেজ পরিবর্তন করুন'}</span>
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
