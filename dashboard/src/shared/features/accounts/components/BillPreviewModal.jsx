import React from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  User,
  Phone,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  UnifiedModalHeader,
  UnifiedModalBody,
  UnifiedModalFooter,
} from '../../../components/common/UnifiedModal';
import { printDocument } from '@/lib/utils';

export function BillPreviewModal({ isOpen, onClose, bill }) {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    printDocument('bill-printable-voucher', `${bill.billNumber || 'Company_Bill'}`);
  };

  const statusColor = {
    Paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Unpaid: 'bg-red-50 text-red-800 border-red-200',
    Partial: 'bg-amber-50 text-amber-800 border-amber-200',
  }[bill.paymentStatus] || 'bg-black/5 text-black border-black/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Dark Blue Header */}
        <UnifiedModalHeader
          title={`Bill Voucher #${bill.billNumber || bill.did || 'VIEW'}`}
          subtitle="Company expenditure, operational bill voucher details, and attached physical receipt."
          icon={Receipt}
          onClose={onClose}
        />

        {/* Scrollable Modal Body (h-[70vh]) */}
        <UnifiedModalBody className="h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Printable Voucher Area */}
          <div
            id="bill-printable-voucher"
            className="p-5 sm:p-6 bg-white border border-black/15 rounded-2xl space-y-5 text-black"
          >
            {/* Header / Brand */}
            <div className="flex items-start justify-between pb-4 border-b border-black/10">
              <div>
                <h3 className="text-base font-bold text-black tracking-tight">
                  MONSUR ALI TOURS &amp; TRAVELS
                </h3>
                <p className="text-[11px] text-black/60">Company Expense &amp; Bill Payment Voucher</p>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-xs text-black block">
                  {bill.billNumber || 'BILL-RECORD'}
                </span>
                <span className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold border ${statusColor}`}>
                  {bill.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>

            {/* Bill Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/10">
                <span className="text-[10px] font-bold uppercase text-black/50 block">Bill Date</span>
                <span className="font-bold text-black">
                  {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB') : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/10">
                <span className="text-[10px] font-bold uppercase text-black/50 block">Category</span>
                <span className="font-bold text-black truncate block">{bill.category || 'Office Expense'}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-black/50 block">Payment Method</span>
                <span className="font-bold text-black">{bill.paymentMethod || 'Cash'}</span>
              </div>
            </div>

            {/* Particulars & Payee */}
            <div className="p-4 rounded-xl bg-black/[0.02] border border-black/10 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-black/50 block">Bill Description / Title</span>
                  <h4 className="text-sm font-bold text-black mt-0.5">{bill.title}</h4>
                </div>
              </div>

              <div className="pt-2 border-t border-black/10 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-black/50 block">Paid To / Payee</span>
                  <p className="font-bold text-black">{bill.payee}</p>
                  {bill.payeePhone && <p className="text-[11px] text-black/60 font-mono">{bill.payeePhone}</p>}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-black/50 block">Recorded By</span>
                  <p className="font-medium text-black">{bill.createdByName || 'Accounts Officer'}</p>
                </div>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-4 rounded-xl bg-black/[0.04] border border-black/15 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-black">Total Bill Amount:</span>
                <span className="font-mono font-bold text-base text-black">
                  ৳ {Number(bill.amount || 0).toLocaleString('en-BD')} BDT
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-black/10 text-emerald-800">
                <span className="font-semibold">Paid Amount:</span>
                <span className="font-mono font-bold">
                  ৳ {Number(bill.paidAmount || 0).toLocaleString('en-BD')} BDT
                </span>
              </div>

              {Number(bill.dueAmount) > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-black/10 text-red-700">
                  <span className="font-semibold">Remaining Due:</span>
                  <span className="font-mono font-bold">
                    ৳ {Number(bill.dueAmount || 0).toLocaleString('en-BD')} BDT
                  </span>
                </div>
              )}
            </div>

            {/* Payment & Settlement History */}
            {bill.paymentHistory && bill.paymentHistory.length > 0 && (
              <div className="text-xs space-y-2 pt-2 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[10px] text-black/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Payment &amp; Settlement History ({bill.paymentHistory.length})
                  </span>
                </div>
                <div className="border border-black/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-black/[0.03] border-b border-black/10 font-bold text-black/60">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Method</th>
                        <th className="py-2 px-2.5">Account / Ref</th>
                        <th className="py-2 px-2.5">Recorded By</th>
                        <th className="py-2 px-2.5 text-right">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {bill.paymentHistory.map((p, idx) => (
                        <tr key={idx} className="hover:bg-black/[0.01]">
                          <td className="py-2 px-2.5 text-black/70">
                            {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-GB') : '—'}
                          </td>
                          <td className="py-2 px-2.5 font-semibold text-black">
                            {p.paymentMethod || 'Cash'}
                          </td>
                          <td className="py-2 px-2.5 text-black/60 font-mono text-[10px]">
                            {p.bankAccount || p.notes || '—'}
                          </td>
                          <td className="py-2 px-2.5 text-black/70">
                            {p.recordedBy || 'Accounts'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-700">
                            ৳ {Number(p.amount || 0).toLocaleString('en-BD')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {bill.notes && (
              <div className="text-xs space-y-1">
                <span className="font-bold uppercase text-[10px] text-black/50">Voucher Notes:</span>
                <p className="p-3 rounded-xl bg-black/[0.02] border border-black/10 text-black leading-relaxed whitespace-pre-line">
                  {bill.notes}
                </p>
              </div>
            )}
          </div>

          {/* Attached Document Section */}
          {bill.documentUrl && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-emerald-950 truncate">
                    {bill.documentName || 'Attached Physical Bill / Receipt'}
                  </h5>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {bill.documentSize || 'Attached'} • Physical Voucher Copy
                  </span>
                </div>
              </div>

              <a
                href={bill.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Attachment</span>
              </a>
            </div>
          )}
        </UnifiedModalBody>

        {/* Footer */}
        <div className="shrink-0 border-t border-black/10 p-4 sm:p-5 flex items-center justify-between gap-3 bg-white">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold px-4 h-9 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-black text-white hover:bg-black/90 font-bold text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill Voucher</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BillPreviewModal;
