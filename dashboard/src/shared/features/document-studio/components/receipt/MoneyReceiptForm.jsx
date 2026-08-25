import React, { useRef, useState } from 'react';
import {
  Receipt,
  User,
  Phone,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  Eye,
  Save,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { PAYMENT_METHODS, SERVICE_PURPOSES, numberToWords } from './sampleData';
import { apiClient } from '@shared/lib/api-client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function MoneyReceiptForm({ data, onChange, onReset, onSave, onPreview, isSubmitting }) {
  const { t } = useTranslation();
  const [detectedCustomer, setDetectedCustomer] = useState(null);
  const [hasPromptedFor, setHasPromptedFor] = useState(new Set());
  const lookupTimeoutRef = useRef(null);

  // Auto-detect existing customer by phone or passport
  const checkExistingCustomer = async (queryValue) => {
    if (!queryValue || queryValue.length < 7) return;
    if (hasPromptedFor.has(queryValue.trim())) return;

    try {
      const res = await apiClient.get('/api/v1/client/customers/lookup', {
        params: { query: queryValue.trim() },
      });
      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        const matched = res.data.data[0];
        setDetectedCustomer(matched);
        setHasPromptedFor((prev) => new Set(prev).add(queryValue.trim()));
      }
    } catch (err) {
      console.warn('Customer lookup skipped:', err.message);
    }
  };

  const handleFieldChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));

    if (field === 'amount') {
      const numVal = parseFloat(value) || 0;
      onChange((prev) => ({
        ...prev,
        amount: numVal,
        amountInWords: numberToWords(numVal),
      }));
    }

    if (field === 'phone' || field === 'passportNumber') {
      if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
      lookupTimeoutRef.current = setTimeout(() => {
        checkExistingCustomer(value);
      }, 700);
    }
  };

  const handleAutoFillCustomer = () => {
    if (!detectedCustomer) return;
    onChange((prev) => ({
      ...prev,
      clientName: detectedCustomer.fullName || prev.clientName,
      phone: detectedCustomer.phone || prev.phone,
      passportNumber: detectedCustomer.passportNumber || prev.passportNumber,
    }));
    toast.success(`Customer "${detectedCustomer.fullName}" info auto-filled!`);
    setDetectedCustomer(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Money Receipt &amp; Payment Voucher Generator
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate and print professional internal money receipts, vouchers, and accounts tokens for A4 slip printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Existing Customer Auto-Fill Notification */}
      {detectedCustomer && (
        <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              Existing customer found: <strong className="text-foreground">{detectedCustomer.fullName}</strong> ({detectedCustomer.phone})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillCustomer}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
            >
              Auto-Fill
            </button>
            <button
              type="button"
              onClick={() => setDetectedCustomer(null)}
              className="text-muted-foreground hover:text-foreground text-[11px] px-1.5 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Meta Bar: Receipt No, Date, Time & Print Mode */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Receipt No.</label>
            <input
              type="text"
              value={data.receiptNo || ''}
              onChange={(e) => handleFieldChange('receiptNo', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Date</label>
            <DatePicker
              value={data.date || ''}
              onChange={(val) => handleFieldChange('date', val)}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Time</label>
            <input
              type="text"
              value={data.time || ''}
              placeholder="e.g. 11:30 AM"
              onChange={(e) => handleFieldChange('time', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Print Layout Format</label>
            <select
              value={data.dualPrint !== false ? 'dual' : 'single'}
              onChange={(e) => handleFieldChange('dualPrint', e.target.value === 'dual')}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="dual">Dual Slip on 1 A4 (Original + Office Copy)</option>
              <option value="single">Single Voucher Slip Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Passenger / Client Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#0B3A60] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>1. Client &amp; Passenger Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Client / Passenger Name *</label>
            <input
              type="text"
              value={data.clientName || ''}
              placeholder="e.g. Md. Abdul Karim"
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Passport / NID No.</label>
            <input
              type="text"
              value={data.passportNumber || ''}
              placeholder="e.g. A08492014"
              onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-medium text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Phone / Mobile No.</label>
            <BdPhoneInput
              value={data.phone || ''}
              onChange={(val) => handleFieldChange('phone', val)}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Service Purpose & Authorizer */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#0B3A60] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>2. Purpose, Service Head &amp; Officer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Purpose / Service Head *</label>
            <input
              type="text"
              list="service-purpose-options"
              value={data.purpose || ''}
              placeholder="e.g. Visa Processing & Flight Ticket Booking (Saudi Arabia)"
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary"
            />
            <datalist id="service-purpose-options">
              {SERVICE_PURPOSES.map((sp, idx) => (
                <option key={idx} value={sp} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Received / Paid By (Accounts Officer)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.receivedBy || ''}
                placeholder="e.g. Md. Tanvir Hossain"
                onChange={(e) => handleFieldChange('receivedBy', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={data.receivedByRole || ''}
                placeholder="Role (e.g. Accounts Officer)"
                onChange={(e) => handleFieldChange('receivedByRole', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Payment & Amount */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#0B3A60] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <DollarSign className="w-4 h-4" />
          <span>3. Payment Method &amp; Amount Breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/20 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground mb-1.5">Payment Method</label>
            <div className="space-y-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    data.paymentMethod === pm.id
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-background border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={data.paymentMethod === pm.id}
                    onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                    className="accent-primary"
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Total Amount (টাকার পরিমাণ) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">৳</span>
                <input
                  type="number"
                  value={data.amount || ''}
                  placeholder="e.g. 50000"
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold text-sm focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Amount in Words (কথায়)</label>
              <input
                type="text"
                value={data.amountInWords || ''}
                placeholder="e.g. Fifty Thousand Taka Only."
                onChange={(e) => handleFieldChange('amountInWords', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-medium text-xs italic focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Signatures & Authorizations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#0B3A60] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>4. Signatures &amp; Approvals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Prepared / Paid By</label>
            <input
              type="text"
              value={data.preparedBy || ''}
              placeholder="প্রদানকারী"
              onChange={(e) => handleFieldChange('preparedBy', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Received By</label>
            <input
              type="text"
              value={data.receivedBySignature || ''}
              placeholder="গ্রহণকারী"
              onChange={(e) => handleFieldChange('receivedBySignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Accounts Officer</label>
            <input
              type="text"
              value={data.accountsSignature || ''}
              placeholder="একাউন্টেন্ট"
              onChange={(e) => handleFieldChange('accountsSignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Approved By</label>
            <input
              type="text"
              value={data.approvedBySignature || ''}
              placeholder="জিএম / প্রোপাইটার"
              onChange={(e) => handleFieldChange('approvedBySignature', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onPreview}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-4 h-4 text-primary" />
          <span>Preview Voucher</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save & Generate Voucher'}</span>
        </button>
      </div>
    </div>
  );
}
