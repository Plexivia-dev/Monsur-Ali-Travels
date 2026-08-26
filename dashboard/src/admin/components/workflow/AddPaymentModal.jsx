import React, { useState, useRef } from 'react';
import { X, CreditCard, Plus, Loader2, Printer, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';
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
      return toast.error('Enter a valid amount');
    }

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/admin/cases/${resolvedCaseDid}/payments`, formData);
      toast.success('Payment added successfully! Generating invoice...');
      
      // Update receipt data to show in invoice view
      setReceiptData({
        amountPaid: Number(formData.amount),
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        newPaidTotal: res.data?.data?.totalPaidAmount ?? (currentPaid + Number(formData.amount)),
        newDue: res.data?.data?.dueAmount ?? Math.max(0, due - Number(formData.amount)),
        totalBilled: res.data?.data?.totalAgreedAmount ?? totalAgreed,
        date: new Date(),
        invoiceNo: `INV-${new Date().getTime().toString().slice(-6)}`
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
      docId: createdPayment?.invoiceNo || `PAY-${new Date().getTime().toString().slice(-6)}`,
      docType: 'Payment_Receipt',
      clientName: client?.name,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* If Payment is Success -> Show Invoice Format */}
      {paymentSuccess && receiptData ? (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] flex flex-col print:shadow-none print:w-full print:rounded-none">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 no-print">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Invoice Generated
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-bold">
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
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
                  <div className="text-sm space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">RECEIVED FROM:</span>
                    <div className="font-bold text-lg text-slate-900">{resolvedApplicantName}</div>
                    <div className="text-slate-700">Phone: {resolvedPhone}</div>
                    <div className="text-slate-700">Case ID: {resolvedCaseNumber}</div>
                  </div>
                  <div className="text-right">
                     <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-400 text-sm font-black px-3 py-1 rounded">
                       <CheckCircle className="w-4 h-4 text-emerald-600" /> AMOUNT RECEIVED
                     </span>
                  </div>
                </div>

                {/* Payment Details Table */}
                <div className="border border-slate-900 rounded overflow-hidden text-sm mb-6">
                  <table className="w-full text-left border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-900 text-white uppercase text-xs font-bold">
                        <th className="p-3 border border-slate-900">Description</th>
                        <th className="p-3 border border-slate-900 text-center">Payment Method</th>
                        <th className="p-3 border border-slate-900 text-right">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-12 font-medium">
                        <td className="p-3 border border-slate-300 font-bold text-slate-900">
                          {receiptData.paymentType} 
                          {receiptData.notes && <span className="block text-xs font-normal text-slate-500 mt-1">{receiptData.notes}</span>}
                        </td>
                        <td className="p-3 border border-slate-300 text-center text-slate-800">{receiptData.paymentMethod}</td>
                        <td className="p-3 border border-slate-300 text-right font-mono font-bold text-emerald-700 text-lg">
                          {receiptData.amountPaid.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Account Summary */}
                <div className="flex justify-between items-start mt-4 pt-4 border-t border-slate-300">
                  <div className="w-1/2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notice:</p>
                    <p className="text-xs text-slate-600 italic">This is a system-generated payment receipt. Keep this copy for your records and future references.</p>
                  </div>
                  <div className="w-64 space-y-2 text-sm font-mono border border-slate-300 p-4 rounded bg-slate-50 shadow-sm">
                    <div className="flex justify-between text-slate-700">
                      <span>Total Agreed:</span>
                      <span>{receiptData.totalBilled.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Total Paid:</span>
                      <span>{receiptData.newPaidTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-rose-700 border-t border-slate-400 pt-2">
                      <span>Remaining Due:</span>
                      <span>{receiptData.newDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Block (Pushed to bottom) */}
                <div className="mt-auto pt-10 flex justify-between items-end">
                  <div className="text-center">
                    <div className="border-b border-slate-400 w-48 mb-2"></div>
                    <div className="text-sm text-slate-600">Client Signature</div>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-slate-900 w-56 mb-2"></div>
                    <div className="font-bold text-slate-900">{agencyInfo.agencyName || 'MONSUR ALI TOURS & TRAVELS'}</div>
                    <div className="text-sm text-slate-600">Authorized Accountant Sign & Seal</div>
                  </div>
                </div>

              </div>
            </PrintablePaper>
          </div>
        </div>
      ) : (
        /* Original Payment Entry Form (No-print wrapper) */
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden no-print">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Add Payment
            </h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-500 text-xs">Total Bill</p>
              <p className="font-bold text-gray-800">BDT {totalAgreed.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">Current Due</p>
              <p className="font-bold text-rose-600">BDT {due.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Payment Type</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="Advance Payment">Advance Payment</option>
                <option value="Installment">Installment</option>
                <option value="Final Settlement">Final Settlement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Amount (BDT) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 50000"
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Banking (bKash/Nagad)">Mobile Banking (bKash/Nagad)</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any reference or remarks..."
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[80px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Confirm & Generate Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
