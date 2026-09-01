import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  UnifiedModalHeader,
  UnifiedModalBody,
  UnifiedModalFooter,
} from '../../../components/common/UnifiedModal';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function generateBillInvoiceNo() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yy}${mm}-${rand}`;
}

export function CreateBillModal({ isOpen, onClose, onSuccess, onOpenStudio }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientDid, setSelectedClientDid] = useState('');

  const [formData, setFormData] = useState({
    invoiceNo: generateBillInvoiceNo(),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'Pending', // 'Paid' | 'Partial' | 'Pending' | 'Overdue'
    paymentMethod: 'Cash',
    taxRate: 0,
    paidAmount: '',
    client: {
      name: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
    },
    caseNumber: '',
    caseDid: '',
    items: [
      {
        id: 'item-1',
        title: '',
        description: '',
        quantity: 1,
        unitPrice: '',
      },
    ],
    paymentTerms: 'Payment due within 15 days of invoice date.',
    notes: 'Thank you for choosing Monsur Ali Tours & Travels!',
  });

  // Fetch recent clients for quick autofill
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        invoiceNo: generateBillInvoiceNo(),
      }));

      apiClient
        .get('/api/v1/client/cases?limit=50')
        .then((res) => {
          if (res.data?.data) {
            setClients(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Client Autofill Selection
  const handleClientSelect = (caseItem) => {
    if (!caseItem) return;
    const name = caseItem.applicantName || caseItem.clientInfo?.fullName || caseItem.clientInfo?.name || '';
    const phone = caseItem.phone || caseItem.clientInfo?.phone || '';
    const email = caseItem.email || caseItem.clientInfo?.email || '';
    const address = caseItem.clientInfo?.presentAddress || caseItem.clientInfo?.address || '';
    const caseNum = caseItem.caseNumber || caseItem.fileNumber || '';
    const destination = caseItem.destinationCountry || caseItem.caseType || 'Travel & Visa Processing';
    const agreedAmt = caseItem.agreedAmount || caseItem.totalAgreedAmount || '';

    setSelectedClientDid(caseItem.did || caseItem._id);
    setFormData((prev) => ({
      ...prev,
      caseNumber: caseNum,
      caseDid: caseItem.did || caseItem._id,
      client: {
        name,
        contactPerson: name,
        phone,
        email,
        address,
      },
      items: [
        {
          id: 'item-1',
          title: `${destination} - Processing & Service Charge`,
          description: `Case File #${caseNum} • ${caseItem.tradeSkill || 'Standard Service'}`,
          quantity: 1,
          unitPrice: agreedAmt || prev.items[0]?.unitPrice || '',
        },
      ],
    }));

    toast.info(`Client details loaded for ${name || 'Case'}`);
  };

  // Line Items Calculation
  const subtotal = formData.items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const taxAmount = (subtotal * (parseFloat(formData.taxRate) || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  // Sync paid & due amounts with paymentStatus
  const calculatedPaid =
    formData.paymentStatus === 'Paid'
      ? grandTotal
      : formData.paymentStatus === 'Pending'
      ? 0
      : parseFloat(formData.paidAmount) || 0;

  const calculatedDue = Math.max(0, grandTotal - calculatedPaid);

  const handleAddItem = () => {
    const newId = `item-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, title: '', description: '', quantity: 1, unitPrice: '' },
      ],
    }));
  };

  const handleRemoveItem = (id) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const handleClientFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.client.name.trim()) {
      toast.error('Client / Organization Name is required!');
      return;
    }

    if (formData.items.some((it) => !it.title.trim() || !it.unitPrice || Number(it.unitPrice) <= 0)) {
      toast.error('Please enter a valid Service Title and Unit Price for all bill items!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        customerName: formData.client.name,
        customerPhone: formData.client.phone,
        customerEmail: formData.client.email,
        subtotal,
        taxAmount,
        grandTotal,
        paidAmount: calculatedPaid,
        dueAmount: calculatedDue,
      };

      const res = await apiClient.post('/api/v1/client/docs/invoices', payload);
      if (res.data?.success || res.data?.status === 'success') {
        const returnedNo = res.data?.data?.invoiceNo || formData.invoiceNo;
        toast.success(`Bill / Invoice #${returnedNo} created successfully!`);

        // If linked to a case, register document in Case Vault
        if (formData.caseDid) {
          try {
            await apiClient.post(`/api/v1/client/cases/${formData.caseDid}/documents`, {
              documentName: `Client Bill / Invoice #${returnedNo}`,
              fileName: `Invoice-${returnedNo}.pdf`,
              fileUrl: res.data?.data?.pdfUrl || `/api/v1/client/docs/invoices/${res.data?.data?._id}/pdf`,
              fileType: 'application/pdf',
              fileSize: '1.2 MB',
              accessLevel: 'Public',
            });
          } catch (_) {}
        }

        if (onSuccess) onSuccess(res.data?.data);
        if (onClose) onClose();
      } else {
        throw new Error(res.data?.message || 'Failed to create bill.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <UnifiedModalHeader
          title="Create New Bill / Client Invoice"
          subtitle="Generate itemized billing invoice, record charges, and register into accounts receivable ledger."
          icon={Receipt}
          badge={formData.invoiceNo}
          onClose={onClose}
        />

        {/* Modal Body with internal scroll */}
        <UnifiedModalBody className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Quick Case / Client Picker */}
          {clients.length > 0 && (
            <div className="p-3.5 bg-black/[0.02] border border-black/10 rounded-xl space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Autofill from Active Case Dossier
              </label>
              <select
                value={selectedClientDid}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedClientDid(val);
                  const found = clients.find((c) => (c.did || c._id) === val);
                  if (found) handleClientSelect(found);
                }}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">-- Or select an existing client case file --</option>
                {clients.map((c) => (
                  <option key={c.did || c._id} value={c.did || c._id}>
                    {c.applicantName || c.clientInfo?.fullName || 'Client'} ({c.caseNumber || 'No Ref'}) •{' '}
                    {c.destinationCountry || c.caseType || 'Service'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Client / Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/80 flex items-center gap-2 pb-1.5 border-b border-black/10">
              <User className="w-4 h-4 text-primary" />
              1. Client / Customer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Client / Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MD Ikram Hossain"
                  value={formData.client.name}
                  onChange={(e) => handleClientFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Phone / Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +880 1712-345678"
                  value={formData.client.phone}
                  onChange={(e) => handleClientFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={formData.client.email}
                  onChange={(e) => handleClientFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-black mb-1">Billing Address</label>
                <input
                  type="text"
                  placeholder="e.g. House #12, Road #4, Dhanmondi, Dhaka"
                  value={formData.client.address}
                  onChange={(e) => handleClientFieldChange('address', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Case / Tracking Ref</label>
                <input
                  type="text"
                  placeholder="e.g. PASS-2026-5395"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, caseNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Line Items & Charges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black/80 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                2. Invoice Line Items &amp; Charges ({formData.items.length})
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                className="h-7 text-xs font-bold px-2.5 border-black/15 text-black hover:bg-black/5 gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {formData.items.map((item, idx) => {
                const qty = parseFloat(item.quantity) || 1;
                const price = parseFloat(item.unitPrice) || 0;
                const lineTotal = qty * price;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-black/[0.02] border border-black/10 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black flex items-center gap-1.5">
                        <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        Item #{idx + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="Service Title (e.g. Visa Processing Fee) *"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black font-semibold focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black text-center focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="Price (BDT) *"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black text-right focus:outline-none focus:border-primary font-mono font-bold"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-end px-2 font-mono font-black text-black">
                        BDT {lineTotal.toLocaleString('en-BD')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: VAT, Settlement & Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/80 flex items-center gap-2 pb-1.5 border-b border-black/10">
              <CreditCard className="w-4 h-4 text-primary" />
              3. Payment Status &amp; Financial Settlement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Pending">Pending (Unpaid)</option>
                  <option value="Partial">Partial Paid</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-black/15 rounded-xl text-black focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {formData.paymentStatus === 'Partial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Amount Paid (BDT) *</label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={formData.paidAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paidAmount: e.target.value }))}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col justify-center text-xs">
                  <span className="text-black/60 font-semibold">Remaining Balance Due:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    BDT {calculatedDue.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>
            )}

            {/* Live Financial Summary */}
            <div className="p-4 bg-black/[0.03] border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-black/60">Subtotal ({formData.items.length} item{formData.items.length > 1 ? 's' : ''}):</span>
                  <span className="font-mono font-bold text-black">BDT {subtotal.toLocaleString('en-BD')}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-black/60">VAT ({formData.taxRate}%):</span>
                    <span className="font-mono font-bold text-black">BDT {taxAmount.toLocaleString('en-BD')}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black/60 block">
                  Grand Total Bill
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-primary">
                  BDT {grandTotal.toLocaleString('en-BD')}
                </span>
              </div>
            </div>
          </div>
        </UnifiedModalBody>

        {/* Footer */}
        <UnifiedModalFooter className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-t border-black/10">
          <div>
            {onOpenStudio && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenStudio}
                className="h-8 text-xs px-3 font-semibold border-black/15 text-black hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                <span>Open Full Document Studio</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="cancel"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-8 px-5 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Bill...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Save &amp; Issue Bill</span>
                </>
              )}
            </Button>
          </div>
        </UnifiedModalFooter>
      </div>
    </div>
  );
}
