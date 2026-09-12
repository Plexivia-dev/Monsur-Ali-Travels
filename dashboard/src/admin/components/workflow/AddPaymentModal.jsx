import React, { useState } from 'react';
import { X, CreditCard, Plus, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export const AddPaymentModal = ({
  isOpen = true,
  caseDoc = {},
  caseDid,
  caseNumber,
  applicantName,
  dueAmount,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'Advance Payment',
    paymentMethod: 'Cash',
    notes: '',
  });

  const resolvedCaseDid = caseDoc?.did || caseDoc?._id || caseDid;
  const resolvedCaseNumber = caseDoc?.caseNumber || caseDoc?.fileNumber || caseNumber || 'CASE-FILE';
  const resolvedApplicantName = caseDoc?.applicantName || caseDoc?.clientInfo?.name || caseDoc?.clientInfo?.fullName || applicantName || 'Valued Client';

  const totalAgreed = caseDoc?.paymentLedger?.totalAgreedAmount || 0;
  const currentPaid = caseDoc?.paymentLedger?.totalPaidAmount || 0;
  const due = dueAmount !== undefined ? dueAmount : Math.max(0, totalAgreed - currentPaid);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error('Enter a valid payment amount');
    }

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/admin/cases/${resolvedCaseDid}/payments`, formData);
      const receiptNo = res.data?.data?.receiptNo || res.data?.data?.receipt?.receiptNo || '';
      toast.success(
        receiptNo
          ? `Payment recorded & Money Receipt #${receiptNo} generated!`
          : 'Payment recorded and Money Receipt generated successfully!'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 text-zinc-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.02] shrink-0">
          <h2 className="font-bold text-zinc-900 text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Add Payment & Issue Money Receipt
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-4 bg-black/[0.02] border-b border-black/10 flex justify-between items-center text-xs px-6 shrink-0">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Bill</span>
            <span className="font-mono font-bold text-zinc-900 text-sm">BDT {totalAgreed.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 block text-[11px]">Current Due</span>
            <span className="font-mono font-bold text-red-600 text-sm">BDT {due.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs flex-1 min-h-0 overflow-y-auto">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Payment Type</label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-zinc-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="Advance Payment">Advance Payment</option>
              <option value="Offer Letter Approval">Offer Letter Approval</option>
              <option value="Final Delivery Payment">Final Delivery Payment</option>
              <option value="Additional Fee / Service">Additional Fee / Service</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Amount (BDT) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 50000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-zinc-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="bKash / Nagad">bKash / Nagad (Mobile Banking)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Additional notes or payment reference..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-3.5 border-t border-black/10 flex items-center justify-end gap-2.5 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 font-semibold text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Confirm & Generate Money Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
