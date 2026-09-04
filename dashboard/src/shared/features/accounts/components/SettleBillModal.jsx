import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  UnifiedModalHeader,
  UnifiedModalBody,
  UnifiedModalFooter,
} from '../../../components/common/UnifiedModal';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function SettleBillModal({ isOpen, onClose, bill, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = Number(bill?.amount) || 0;
  const alreadyPaid = Number(bill?.paidAmount) || 0;
  const remainingDue = Number(bill?.dueAmount) || Math.max(0, totalAmount - alreadyPaid);

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    bankAccount: '',
    paidDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (bill) {
      const due = Number(bill?.dueAmount) || Math.max(0, (Number(bill?.amount) || 0) - (Number(bill?.paidAmount) || 0));
      setFormData({
        amount: due > 0 ? due : '',
        paymentMethod: bill.paymentMethod || 'Cash',
        bankAccount: bill.bankAccount || '',
        paidDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [bill]);

  if (!isOpen || !bill) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const payNum = Number(formData.amount);
    if (!payNum || payNum <= 0) {
      toast.error('Please enter a valid payment amount!');
      return;
    }

    if (payNum > remainingDue) {
      toast.error(`Payment amount (৳${payNum}) exceeds remaining due (৳${remainingDue})!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const billId = bill._id || bill.did || bill.billNumber || bill.id;
      await accountsService.settleBillPayment(billId, {
        amount: payNum,
        paymentMethod: formData.paymentMethod,
        bankAccount: formData.bankAccount,
        paidDate: formData.paidDate,
        notes: formData.notes,
      });

      toast.success(`Payment of ৳${payNum.toLocaleString('en-BD')} recorded successfully for Bill ${bill.billNumber || ''}!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Settle bill error:', err);
      toast.error(err.response?.data?.message || 'Failed to record bill settlement payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-black/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <UnifiedModalHeader
          title={`Settle Bill #${bill.billNumber || bill.did || ''}`}
          subtitle="Record settlement payment for company expense, vendor bill, or operational dues."
          icon={CreditCard}
          onClose={onClose}
        />

        {/* Scrollable Modal Body (h-[70vh]) */}
        <UnifiedModalBody className="h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-4 text-black">
          {/* Bill Summary Card */}
          <div className="p-4 rounded-xl bg-black/[0.02] border border-black/10 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-black/[0.04] text-black/70 border border-black/10 uppercase mb-1">
                  {bill.category || 'Office Expense'}
                </span>
                <h3 className="text-sm font-bold text-black">{bill.title}</h3>
                <p className="text-xs text-black/60">Payee: <span className="font-semibold text-black">{bill.payee || '—'}</span></p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-black/50 block">Remaining Due</span>
                <span className="text-base font-black font-mono text-red-600">
                  ৳ {remainingDue.toLocaleString('en-BD')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10 text-[11px]">
              <div>
                <span className="text-black/50 block">Total Bill</span>
                <span className="font-mono font-bold text-black">৳ {totalAmount.toLocaleString('en-BD')}</span>
              </div>
              <div>
                <span className="text-black/50 block">Already Paid</span>
                <span className="font-mono font-bold text-emerald-600">৳ {alreadyPaid.toLocaleString('en-BD')}</span>
              </div>
              <div>
                <span className="text-black/50 block">Status</span>
                <span className="font-bold text-amber-600">{bill.paymentStatus || 'Unpaid'}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Amount to Pay */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-black">
                  Settlement Amount (BDT) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: remainingDue })}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Pay Full Due (৳{remainingDue.toLocaleString('en-BD')})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-black/40">৳</span>
                <input
                  type="number"
                  min="1"
                  max={remainingDue}
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-black/15 rounded-xl text-black font-bold font-mono text-sm focus:ring-2 focus:ring-black/10 outline-none"
                  required
                />
              </div>
              {Number(formData.amount) < remainingDue && Number(formData.amount) > 0 && (
                <p className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Partial payment: ৳{(remainingDue - Number(formData.amount)).toLocaleString('en-BD')} will remain due.
                </p>
              )}
            </div>

            {/* Payment Method & Bank Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none cursor-pointer"
                >
                  <option value="Cash">Cash (অফিস নগদ)</option>
                  <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Cheque">Cheque (চেক)</option>
                  <option value="Other">Other Electronic</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">
                  Bank / Trx Reference
                </label>
                <input
                  type="text"
                  placeholder={formData.paymentMethod === 'Cash' ? 'Office Cash Drawer' : 'e.g. City Bank / TrxID'}
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                />
              </div>
            </div>

            {/* Payment Date & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">
                  Settlement Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via cheque #5512 or final settlement"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none placeholder:text-black/40"
                />
              </div>
            </div>

            {/* Information Notice */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-800 text-[11px] leading-relaxed">
              💡 <strong>Accounting Sync:</strong> If paid via <strong>Cash</strong>, it will record as an outflow in the <strong>Cash Book</strong>. If paid via <strong>Bank Transfer / Cheque / bKash</strong>, it will automatically record as an outflow in the <strong>Bank Ledger</strong>.
            </div>
          </form>
        </UnifiedModalBody>

        {/* Modal Footer */}
        <UnifiedModalFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting ? 'Recording Payment...' : `Confirm Payment (৳${Number(formData.amount || 0).toLocaleString('en-BD')})`}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

export default SettleBillModal;
