import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Plus, Loader2, Printer, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [studioInvoicePayload, setStudioInvoicePayload] = useState(null);

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
      
      const payload = {
        invoiceNo: generatedInvoiceNo,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentStatus: 'Paid',
        currency: 'BDT',
        client: {
          name: resolvedApplicantName,
          contactPerson: resolvedApplicantName,
          phone: resolvedPhone,
          address: caseDoc?.destinationCountry ? `Destination: ${caseDoc.destinationCountry}` : (caseDoc?.clientInfo?.address || ''),
          email: caseDoc?.email || caseDoc?.clientInfo?.email || '',
          passportNumber: caseDoc?.passportNumber || caseDoc?.clientInfo?.passportNumber || '',
          nidNumber: caseDoc?.nidNumber || caseDoc?.clientInfo?.nidNumber || '',
        },
        items: [
          {
            id: 'item-1',
            title: formData.paymentType || 'Visa Processing & Case Handling Service',
            description: formData.notes || `Payment received for Case #${resolvedCaseNumber} (${resolvedApplicantName})`,
            quantity: '1',
            unitPrice: Number(formData.amount),
          },
        ],
        subtotal: Number(formData.amount),
        grandTotal: Number(formData.amount),
        paymentTerms: `Paid via ${formData.paymentMethod}. Case File #${resolvedCaseNumber}.`,
      };

      setStudioInvoicePayload(payload);
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

  const handleOpenInStudio = () => {
    if (onSuccess) onSuccess();
    onClose();
    navigate('/admin/docs/invoice', {
      state: {
        invoiceData: studioInvoicePayload || {
          invoiceNo: receiptData?.invoiceNo,
          client: { name: resolvedApplicantName, phone: resolvedPhone },
          items: [{ id: 'item-1', title: formData.paymentType, unitPrice: Number(formData.amount) }],
        },
      },
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* If Payment is Success -> Show Invoice Format */}
      {paymentSuccess && receiptData ? (
        <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl w-full max-w-[900px] flex flex-col overflow-hidden print:shadow-none print:w-full print:rounded-none">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-linear-to-r from-zinc-950 via-slate-950 to-black no-print">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Invoice Generated ({receiptData.invoiceNo})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInStudio}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                title="Open and edit in Document Studio"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in Studio</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={handleCloseAndFinish}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                Done
              </button>
              <button
                onClick={handleCloseAndFinish}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500/80 shadow-xs transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="p-4 print:p-0 overflow-y-auto max-h-[85vh] print:max-h-none print:overflow-visible bg-black/50">
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
                      <span className="text-slate-600">Total Amount Paid:</span>
                      <span className="font-mono font-semibold text-emerald-800">BDT {receiptData.newPaidTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-slate-900 pt-2 text-rose-800">
                      <span>Remaining Due:</span>
                      <span className="font-mono">BDT {receiptData.newDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="border-t border-slate-300 pt-4 flex justify-between items-end text-xs text-slate-500 mt-auto">
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Terms & Instructions:</p>
                    <p>• All official receipts are system-generated and do not require a physical signature.</p>
                    <p>• Retain this receipt for future case processing and embassy verification.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-slate-400">Powered by Monsur Ali ERP System</p>
                  </div>
                </div>
              </div>
            </PrintablePaper>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-linear-to-r from-zinc-950 via-slate-950 to-black">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Add Payment
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500/80 shadow-xs transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex justify-between items-center text-xs px-6">
            <div>
              <span className="text-zinc-400 block text-[11px]">Total Bill</span>
              <span className="font-mono font-bold text-zinc-100 text-sm">BDT {totalAgreed.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 block text-[11px]">Current Due</span>
              <span className="font-mono font-bold text-rose-400 text-sm">BDT {due.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">Payment Type</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Advance Payment" className="bg-zinc-950 text-zinc-100">Advance Payment</option>
                <option value="Offer Letter Approval" className="bg-zinc-950 text-zinc-100">Offer Letter Approval</option>
                <option value="Final Delivery Payment" className="bg-zinc-950 text-zinc-100">Final Delivery Payment</option>
                <option value="Additional Fee / Service" className="bg-zinc-950 text-zinc-100">Additional Fee / Service</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">Amount (BDT) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Cash" className="bg-zinc-950 text-zinc-100">Cash</option>
                <option value="Bank Transfer" className="bg-zinc-950 text-zinc-100">Bank Transfer</option>
                <option value="bKash / Nagad" className="bg-zinc-950 text-zinc-100">bKash / Nagad (Mobile Banking)</option>
                <option value="Cheque" className="bg-zinc-950 text-zinc-100">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Additional notes or payment reference..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-300 border border-rose-500/40 hover:border-rose-500/80 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Confirm & Generate Invoice</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddPaymentModal;
