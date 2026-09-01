import React, { useState } from 'react';
import {
  Receipt,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  DollarSign,
  User,
  Phone,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  UnifiedModalHeader,
  UnifiedModalBody,
  UnifiedModalFooter,
} from '../../../components/common/UnifiedModal';
import { apiClient } from '@/lib/api-client';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export const BILL_CATEGORIES = [
  'Employee Salary',
  'Office Rent',
  'Electricity / Utility',
  'Internet & Phone',
  'Office Supplies & Stationery',
  'Tea & Refreshments',
  'Vendor & Supplier Payment',
  'Travel & Transportation',
  'Legal & Trade Fees',
  'Visa Operations',
  'Maintenance & Repairs',
  'Other Office Expense',
];

export function CreateBillModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity / Utility',
    payee: '',
    payeePhone: '',
    amount: '',
    paidAmount: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentStatus: 'Paid', // 'Paid' | 'Unpaid' | 'Partial'
    paymentMethod: 'Cash',
    bankAccount: '',
    documentUrl: '',
    documentName: '',
    documentSize: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await apiClient.post('/api/v1/upload/single?documentType=company-bill', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      setFormData((prev) => ({
        ...prev,
        documentUrl: uploadedUrl,
        documentName: file.name,
        documentSize: sizeMb,
      }));

      toast.success(`Attached "${file.name}" successfully!`);
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Failed to upload bill receipt document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      documentUrl: '',
      documentName: '',
      documentSize: '',
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Bill Title / Description is required (e.g. September Office Rent)!');
      return;
    }
    if (!formData.payee.trim()) {
      toast.error('Paid To / Payee Name is required (e.g. DESCO, Rahim, Landlord)!');
      return;
    }
    const numAmt = Number(formData.amount);
    if (!numAmt || numAmt <= 0) {
      toast.error('Please enter a valid bill amount!');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountsService.createBill({
        ...formData,
        amount: numAmt,
        paidAmount:
          formData.paymentStatus === 'Paid'
            ? numAmt
            : formData.paymentStatus === 'Unpaid'
            ? 0
            : Number(formData.paidAmount) || 0,
      });

      toast.success(`Bill "${formData.title}" recorded successfully!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Dark Blue Header */}
        <UnifiedModalHeader
          title="Record Company Bill / Expense"
          subtitle="Add outgoing agency expenditure, utility bills, employee salary disbursements, and office payments."
          icon={Receipt}
          onClose={onClose}
        />

        {/* Scrollable Modal Body (h-[70vh]) */}
        <UnifiedModalBody className="h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Section 1: Bill Particulars */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-black/60" />
              <span>1. Bill Title &amp; Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">
                  Bill Title / Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. September Office Rent, Staff Salary - Rahim"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">
                  Expense Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none cursor-pointer"
                >
                  {BILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Beneficiary / Payee Details */}
          <div className="space-y-3 pt-1 border-t border-black/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-black/60" />
              <span>2. Payee / Beneficiary Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">
                  Paid To / Payee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DESCO, Landlord, Abdur Rahim (Staff)"
                  value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Payee Phone / Contact (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 01711234567"
                  value={formData.payeePhone}
                  onChange={(e) => setFormData({ ...formData, payeePhone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-mono text-xs focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Payment Terms */}
          <div className="space-y-3 pt-1 border-t border-black/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-black/60" />
              <span>3. Amount &amp; Payment Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">
                  Total Bill Amount (৳ BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-black/50 text-xs">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-black/15 rounded-xl text-black font-mono font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none cursor-pointer"
                >
                  <option value="Paid">Paid (Full)</option>
                  <option value="Unpaid">Unpaid / Due</option>
                  <option value="Partial">Partial Payment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">Bill Date</label>
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-medium text-xs focus:ring-2 focus:ring-black/10 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-medium text-xs focus:ring-2 focus:ring-black/10 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Physical Document / Receipt Attachment */}
          <div className="space-y-3 pt-1 border-t border-black/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-black/60" />
                <span>4. Physical Bill / Voucher Slip Attachment</span>
              </div>
              <span className="text-[10px] text-black/50 font-mono">PDF, PNG, JPG</span>
            </div>

            {formData.documentUrl ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-emerald-950 truncate">
                      {formData.documentName || 'Attached Bill Document'}
                    </h5>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      {formData.documentSize || 'Attached'} • Ready
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={formData.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                    title="Remove Attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="bill-doc-input"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="bill-doc-input"
                  className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-xs text-center ${
                    isUploading
                      ? 'border-black/30 bg-black/[0.03]'
                      : 'border-black/20 hover:border-black/40 bg-black/[0.01] hover:bg-black/[0.03]'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-black/60 mb-1" />
                      <span className="font-semibold text-black">Uploading document to server...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-black/50 mb-1" />
                      <span className="font-bold text-black">Click to upload physical Bill / Receipt slip</span>
                      <span className="text-[10px] text-black/50">Upload scan / receipt photo (PDF, JPG, PNG up to 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Section 5: Notes & Remarks */}
          <div className="space-y-2 pt-1 border-t border-black/10">
            <label className="block text-xs font-bold text-black uppercase tracking-wider">
              Notes &amp; Voucher Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Enter any additional remarks, transaction reference, meter number, or bank deposit ID..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black focus:ring-2 focus:ring-black/10 outline-none resize-none placeholder:text-black/40"
            />
          </div>
        </UnifiedModalBody>

        {/* Modal Footer */}
        <UnifiedModalFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          submitText="Record Bill Voucher"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default CreateBillModal;
