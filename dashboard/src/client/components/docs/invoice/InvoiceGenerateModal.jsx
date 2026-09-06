import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Printer,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  DollarSign,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { toast } from 'sonner';
import { InvoicePreview } from './InvoicePreview';
import { useAuth } from '@shared/lib/auth-context';

export function InvoiceGenerateModal({
  isOpen,
  onClose,
  initialData = {},
  onSuccess,
  onCreated,
}) {
  const user = useAuth((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNo: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'Paid',
    currency: 'BDT',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    passportNumber: '',
    serviceTitle: 'Visa Processing & Case Handling Service',
    serviceDescription: '',
    amount: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setCreatedInvoice(null);
      const generatedNo = `INV-${Date.now().toString().slice(-6)}`;
      const clientName = initialData.clientName || initialData.applicantName || initialData.fullName || '';
      const clientPhone = initialData.clientPhone || initialData.phone || '';
      const clientAddress = initialData.clientAddress || initialData.address || (initialData.destinationCountry ? `Destination: ${initialData.destinationCountry}` : '');
      const passportNumber = initialData.passportNumber || '';
      const purpose = initialData.purpose || initialData.title || 'Visa Processing & Case Handling Service';
      const caseNumber = initialData.caseNumber || initialData.caseDid || '';
      const amount = initialData.amount || initialData.paymentAmount || '';

      setFormData({
        invoiceNo: initialData.invoiceNo || generatedNo,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentStatus: initialData.paymentStatus || 'Paid',
        currency: initialData.currency || 'BDT',
        clientName,
        clientPhone,
        clientAddress,
        passportNumber,
        serviceTitle: purpose,
        serviceDescription: caseNumber ? `Payment for Case File #${caseNumber} (${clientName})` : `Service fee for ${clientName}`,
        amount: amount ? String(amount) : '',
        paymentMethod: initialData.paymentMethod || 'Cash',
        notes: initialData.notes || '',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error('Client name is required.');
      return;
    }
    const parsedAmount = Number(formData.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid billing amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      const invoicePayload = {
        invoiceNo: formData.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        paymentStatus: formData.paymentStatus,
        currency: formData.currency || 'BDT',
        client: {
          name: formData.clientName.trim(),
          phone: formData.clientPhone.trim(),
          address: formData.clientAddress.trim(),
          passportNumber: formData.passportNumber.trim(),
        },
        items: [
          {
            id: 'item-1',
            title: formData.serviceTitle.trim() || 'Visa Processing Service',
            description: formData.serviceDescription.trim() || `Service invoice for ${formData.clientName}`,
            quantity: 1,
            unitPrice: parsedAmount,
          },
        ],
        subtotal: parsedAmount,
        grandTotal: parsedAmount,
        taxRate: 0,
        taxAmount: 0,
        paymentTerms: `Paid via ${formData.paymentMethod}. ${formData.notes || ''}`.trim(),
        notes: formData.notes,
        createdByDid: user?.did,
        createdByName: user?.name || 'Staff Member',
      };

      const res = await apiClient.post('/api/v1/client/docs/invoices', invoicePayload);
      const savedInvoice = res.data?.data || invoicePayload;

      setCreatedInvoice(savedInvoice);
      toast.success(`Invoice #${savedInvoice.invoiceNo || formData.invoiceNo} successfully created!`);
      onCreated?.(savedInvoice);
      onSuccess?.(savedInvoice);
    } catch (err) {
      console.error('Invoice create error:', err);
      toast.error(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const docId = createdInvoice?.invoiceNo || formData.invoiceNo;
    const clientName = createdInvoice?.client?.name || formData.clientName;
    printDocument({
      docId,
      docType: 'Invoice',
      clientName,
      elementId: 'printable-invoice-canvas',
    });
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container: Strict 70vh Fixed Height */}
      <div className="relative bg-white border border-black/10 rounded-2xl max-w-3xl w-full h-[70vh] flex flex-col shadow-2xl z-10 my-auto text-black overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* 1. Header (Sticky) */}
        <div className="shrink-0 border-b border-black/10 p-4 sm:p-5 flex items-center justify-between bg-black/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                {createdInvoice ? 'Print & Preview Invoice' : 'Generate Client Invoice'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {createdInvoice ? createdInvoice.invoiceNo : formData.invoiceNo}
                </span>
              </h3>
              <p className="text-xs text-black/60">
                {createdInvoice
                  ? 'Official client invoice bill is ready for download and printing.'
                  : 'Create and issue official billing invoice for this client file.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 text-xs space-y-4">
          {createdInvoice ? (
            /* Print Preview State */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-3.5 rounded-xl font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>
                    Invoice Generated Successfully! Invoice No:{' '}
                    <strong className="font-mono text-sm">{createdInvoice.invoiceNo}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreatedInvoice(null)}
                    className="h-8 px-3 text-xs font-semibold cursor-pointer gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Invoice</span>
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handlePrint}
                    className="h-8 px-3.5 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </Button>
                </div>
              </div>

              <div className="border border-black/10 rounded-xl p-3 bg-black/[0.02] flex justify-center">
                <div className="w-full max-w-[760px] bg-white rounded-lg shadow-xs border border-black/10 p-2 sm:p-4">
                  <InvoicePreview data={createdInvoice} onPrint={handlePrint} />
                </div>
              </div>
            </div>
          ) : (
            /* Form State */
            <form id="invoice-generate-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Section 1: Client Particulars */}
              <div className="p-3.5 bg-black/[0.02] border border-black/10 rounded-xl space-y-3">
                <h4 className="font-bold text-black flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-primary">
                  <User className="w-3.5 h-3.5" />
                  Client &amp; Case Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-black mb-1">
                      Client Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="e.g. Mohammad Rafiq"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Client Phone Number</label>
                    <input
                      type="text"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      placeholder="e.g. +880 1711-000000"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Passport / NID Reference</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="e.g. A01234567"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Address / Destination</label>
                    <input
                      type="text"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleChange}
                      placeholder="e.g. Destination: Greece (Athens)"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Billing & Invoice Particulars */}
              <div className="p-3.5 bg-black/[0.02] border border-black/10 rounded-xl space-y-3">
                <h4 className="font-bold text-black flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-primary">
                  <DollarSign className="w-3.5 h-3.5" />
                  Service &amp; Billing Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-black mb-1">
                      Billing Amount (BDT) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 bg-white border border-emerald-500/40 rounded-xl text-black font-bold focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-black mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Cash">Cash Payment</option>
                      <option value="Bank Transfer">Bank Transfer (Deposit / EFT)</option>
                      <option value="bKash">bKash Mobile Banking</option>
                      <option value="Nagad">Nagad Mobile Banking</option>
                      <option value="Cheque">Cheque Payment</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-black mb-1">
                      Service Line Item Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="serviceTitle"
                      value={formData.serviceTitle}
                      onChange={handleChange}
                      placeholder="e.g. 1st Milestone Visa Processing Fee"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-black mb-1">Description / Notes on Bill</label>
                    <input
                      type="text"
                      name="serviceDescription"
                      value={formData.serviceDescription}
                      onChange={handleChange}
                      placeholder="e.g. Official fee deposit received for file processing"
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* 3. Footer (Sticky) */}
        <div className="shrink-0 border-t border-black/10 p-4 sm:p-5 flex items-center justify-between bg-black/[0.02]">
          <div className="text-[11px] text-black/60 font-mono">
            {createdInvoice ? `Status: ${createdInvoice.paymentStatus || 'Paid'}` : 'Auto-links to task & case dossier'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="cancel"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              {createdInvoice ? 'Close' : 'Cancel'}
            </Button>

            {!createdInvoice ? (
              <Button
                type="submit"
                form="invoice-generate-form"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create &amp; Issue Invoice</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerateModal;
