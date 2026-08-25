import React from 'react';
import { Plus, Trash2, Eye, RotateCcw } from 'lucide-react';
import { generateUniqueInvoiceNo } from './sampleData';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';

export function InvoiceForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
  const handleClientChange = (field, value) => {
    onChange({
      ...data,
      client: { ...data.client, [field]: value }
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      quantity: '',
      unitPrice: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const handleUpdateItem = (id, field, value) => {
    onChange({
      ...data,
      items: data.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleRemoveItem = (id) => {
    onChange({
      ...data,
      items: data.items.filter(item => item.id !== id)
    });
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 font-bold';
    if (status === 'Pending') return 'bg-amber-500/15 text-amber-600 border-amber-500/40 font-bold';
    if (status === 'Overdue') return 'bg-rose-500/15 text-rose-600 border-rose-500/40 font-bold';
    return 'bg-background text-foreground border-border';
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full max-w-[850px] mx-auto space-y-5">
      <div className="bg-card border border-border rounded-[4px] p-6 sm:p-7 space-y-5 text-sm shadow-xs">
        
        {/* Form Title & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border pb-4 gap-3">
          <div>
            <h2 className="font-black text-foreground text-xl sm:text-2xl tracking-tight">
              Create Invoice
            </h2>
          </div>
          
          {/* Status Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-foreground font-bold text-sm">Payment Status: *</label>
            <select
              value={data.paymentStatus}
              onChange={e => onChange({ ...data, paymentStatus: e.target.value })}
              className={`border rounded-[4px] px-3 py-2 text-sm font-bold outline-none cursor-pointer transition-colors ${getStatusColor(data.paymentStatus)}`}
            >
              <option value="Paid" className="bg-white text-emerald-600 font-bold">Paid</option>
              <option value="Pending" className="bg-white text-amber-600 font-bold">Pending</option>
              <option value="Overdue" className="bg-white text-rose-600 font-bold">Overdue</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-bold text-foreground text-sm mb-1.5">Issue Date</label>
            <DatePicker
              value={data.issueDate}
              onChange={val => onChange({ ...data, issueDate: val })}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground text-sm mb-1.5">Due Date</label>
            <DatePicker
              value={data.dueDate}
              onChange={val => onChange({ ...data, dueDate: val })}
            />
          </div>
        </div>

        {/* BILLED TO */}
        <div className="border-t border-border pt-5 space-y-3">
          <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600">Billed To (Client Details)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">Client / Organization Name *</label>
              <input
                type="text"
                required
                value={data.client.name}
                onChange={e => handleClientChange('name', e.target.value)}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-bold text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">Contact Person (Attn)</label>
              <input
                type="text"
                value={data.client.contactPerson}
                onChange={e => handleClientChange('contactPerson', e.target.value)}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">Phone Number</label>
              <BdPhoneInput
                value={data.client.phone}
                onChange={(val) => handleClientChange('phone', val)}
              />
            </div>

            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">Email Address</label>
              <input
                type="email"
                value={data.client.email}
                onChange={e => handleClientChange('email', e.target.value)}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-foreground text-sm mb-1.5">Billing Address</label>
              <input
                type="text"
                value={data.client.address}
                onChange={e => handleClientChange('address', e.target.value)}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC MULTIPLE LINE ITEMS */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-base uppercase tracking-wider text-emerald-600">
              Invoice Line Items
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold text-xs px-3.5 py-2 rounded-[4px] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>

          {data.items.map((item, idx) => (
            <div key={item.id} className="bg-muted/30 border border-border p-4 rounded-[4px] space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="font-bold text-foreground text-sm">Item #{idx + 1}</span>
                {data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4">
                  <label className="block font-semibold text-foreground text-sm mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    value={item.title || ''}
                    onChange={e => handleUpdateItem(item.id, 'title', e.target.value)}
                    className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-semibold text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-foreground text-sm mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground text-sm mb-1">Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                    onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value !== '' ? parseFloat(e.target.value) : '')}
                    className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground text-sm mb-1">Unit Price (BDT) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.unitPrice}
                    onChange={e => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono font-bold text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TAX RATE & TERMS */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-foreground text-sm mb-1.5">Tax / VAT Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={data.taxRate}
                onChange={e => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2.5 text-foreground font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground text-sm mb-1.5">Payment Instructions & Terms</label>
            <textarea
              rows={2}
              value={data.paymentTerms}
              onChange={e => onChange({ ...data, paymentTerms: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] p-3 text-foreground text-sm outline-none resize-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4.5 rounded-[4px] flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] text-sm font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Saving to Database & Generating Invoice...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Generate Invoice & View Preview</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
