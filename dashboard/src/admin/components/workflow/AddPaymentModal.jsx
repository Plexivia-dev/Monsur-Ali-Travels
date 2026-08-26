import React, { useState } from 'react';
import { X, CreditCard, Plus, Loader2, Printer, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';
import { toast } from 'sonner';
import agencyInfo from '@/lib/information.json';

// A4 Printable Wrapper specific to the admin flow
const PrintablePaper = ({ children, id = 'printable-document-canvas' }) => (
  <div className="w-full flex justify-center py-2 sm:py-4 no-print-padding print:p-0 print:m-0 bg-gray-100 print:bg-white rounded-lg">
    <div
      id={id}
      className="printable-a4-paper bg-white text-slate-900 shadow-xl rounded-[4px] w-full max-w-[800px] p-6 sm:p-8 min-h-[1050px] flex flex-col justify-between print:min-h-0 print:h-[297mm] print:w-[210mm] print:p-8 print:m-0 print:shadow-none"
    >
      {children}
    </div>
  </div>
);

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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'Advance Payment',
    paymentMethod: 'Cash',
    notes: '',
  });

  const resolvedCaseDid = caseDoc?.did || caseDoc?._id || caseDid;
  const resolvedCaseNumber = caseDoc?.caseNumber || caseDoc?.fileNumber || caseNumber || 'CASE-FILE';
  const resolvedApplicantName = caseDoc?.applicantName || caseDoc?.clientInfo?.name || caseDoc?.clientInfo?.fullName || applicantName || 'Valued Client';
  const resolvedPhone = caseDoc?.phone || caseDoc?.clientInfo?.phone || 'N/A';

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
      toast.success('Payment added successfully! Generating invoice...');

      // Update receipt data to show in invoice view
      const generatedInvoiceNo = res.data?.data?.receiptNo || `INV-${new Date().getTime().toString().slice(-6)}`;
      setReceiptData({
        amountPaid: Number(formData.amount),
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        newPaidTotal: res.data?.data?.totalPaidAmount ?? (currentPaid + Number(formData.amount)),
        newDue: res.data?.data?.dueAmount ?? Math.max(0, due - Number(formData.amount)),
        totalBilled: res.data?.data?.totalAgreedAmount ?? totalAgreed,
        date: new Date(),
        invoiceNo: generatedInvoiceNo,
      });

      setPaymentSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: receiptData?.invoiceNo || `PAY-${new Date().getTime().toString().slice(-6)}`,
      docType: 'Payment_Receipt',
      clientName: resolvedApplicantName,
    });
  };

  const handleCloseAndFinish = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* If Payment is Success -> Show Invoice Format */}
      {paymentSuccess && receiptData ? (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] flex flex-col print:shadow-none print:w-full print:rounded-none">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 no-print">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Invoice Generated ({receiptData.invoiceNo})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={handleCloseAndFinish}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-xs cursor-pointer transition-all"
              >
                Done
              </button>
              <button
                onClick={handleCloseAndFinish}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 print:p-0 overflow-y-auto max-h-[85vh] print:max-h-none print:overflow-visible bg-gray-100">
            <PrintablePaper id="payment-invoice">
              {/* INVOICE CONTENT A4 */}
              <div className="flex flex-col h-full text-slate-900">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                      {agencyInfo.agencyName || 'MONSUR ALI TOURS & TRAVELS'}
                    </h1>
                    <p className="text-sm font-bold text-slate-700">{agencyInfo.tagline || 'Your Trusted Travel Partner'}</p>
                    <p className="text-xs text-slate-600 mt-2">{agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj'}</p>
                    <p className="text-xs text-slate-600">Phone: {agencyInfo.phone || '+8801345579534'}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded text-lg font-black uppercase tracking-wider mb-2">
                      PAYMENT RECEIPT
                    </div>
                    <div className="text-sm font-mono text-slate-800 space-y-1">
                      <div><strong>Receipt #:</strong> <span className="font-bold text-emerald-800">{receiptData.invoiceNo}</span></div>
                      <div><strong>Date:</strong> {formatToDdMmYyyy(receiptData.date)}</div>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-slate-50 p-4 rounded border border-slate-300 flex justify-between items-center mb-6">
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Billed To</div>
                    <div className="text-lg font-bold text-slate-900">{resolvedApplicantName}</div>
                    <div className="text-sm text-slate-600">Phone: {resolvedPhone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold uppercase">Case Reference</div>
                    <div className="text-lg font-bold text-slate-900">{resolvedCaseNumber}</div>
                    <div className="text-sm text-slate-600">Type: {formData.paymentType}</div>
                  </div>
                </div>

                {/* Ledger Summary */}
                <table className="w-full text-left border-collapse mb-6">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase text-slate-700">
                      <th className="py-2">Description</th>
                      <th className="py-2">Payment Method</th>
                      <th className="py-2 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    <tr>
                      <td className="py-4">
                        <div className="font-bold text-slate-900">{formData.paymentType}</div>
                        {formData.notes && <div className="text-xs text-slate-500 mt-1">{formData.notes}</div>}
                      </td>
                      <td className="py-4 font-mono font-medium">{formData.paymentMethod}</td>
                      <td className="py-4 text-right font-mono font-bold text-base text-slate-900">
                        {receiptData.amountPaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-64 space-y-2 border-t border-slate-300 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Agreed Bill:</span>
                      <span className="font-mono font-semibold">BDT {receiptData.totalBilled.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Paid to Date:</span>
                      <span className="font-mono font-bold text-emerald-700">BDT {receiptData.newPaidTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-900 pt-2">
                      <span>Remaining Balance:</span>
                      <span className="font-mono text-rose-700">BDT {receiptData.newDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="mt-auto border-t border-slate-300 pt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <div className="text-xs font-bold text-slate-600 uppercase">Customer Signature</div>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <div className="text-xs font-bold text-slate-600 uppercase">Authorized Signature</div>
                  </div>
                </div>
              </div>
            </PrintablePaper>
          </div>
        </div>
      ) : (
        /* Default Entry Form */
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-100">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Add Payment
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/80 flex justify-between items-center text-sm px-6">
            <div>
              <span className="text-slate-500 block text-xs">Total Bill</span>
              <span className="font-mono font-bold text-slate-800 text-base">BDT {totalAgreed.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-xs">Current Due</span>
              <span className="font-mono font-bold text-rose-600 text-base">BDT {due.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Advance Payment">Advance Payment</option>
                <option value="Offer Letter Approval">Offer Letter Approval</option>
                <option value="Final Delivery Payment">Final Delivery Payment</option>
                <option value="Additional Fee / Service">Additional Fee / Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (BDT) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="bKash / Nagad">bKash / Nagad (Mobile Banking)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Additional notes or payment reference..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Confirm & Generate Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddPaymentModal;
