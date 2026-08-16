import React from 'react';
import { Plus, Trash2, Eye, RotateCcw } from 'lucide-react';
import { generateUniqueInvoiceNo } from './sampleData';

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="bg-card border border-border rounded-[4px] p-4 sm:p-5 space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-foreground text-sm">ইনভয়েস / বিল তৈরি ফরম (Create Invoice)</h3>
          
          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-foreground font-semibold">পেমেন্ট স্ট্যাটাস (Status): *</label>
            <select
              value={data.paymentStatus}
              onChange={e => onChange({ ...data, paymentStatus: e.target.value })}
              className={`border rounded-[4px] px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-colors ${getStatusColor(data.paymentStatus)}`}
            >
              <option value="Paid" className="bg-white text-emerald-600 font-bold">Paid (পরিশোধিত)</option>
              <option value="Pending" className="bg-white text-amber-600 font-bold">Pending (অপেক্ষমান)</option>
              <option value="Overdue" className="bg-white text-rose-600 font-bold">Overdue (বকেয়া)</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-foreground">ইনভয়েস নম্বর (Invoice No.)</label>
              <button
                type="button"
                onClick={() => onChange({ ...data, invoiceNo: generateUniqueInvoiceNo() })}
                className="text-[10px] text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                নতুন কোড জেনারেট
              </button>
            </div>
            <input
              type="text"
              value={data.invoiceNo}
              onChange={e => onChange({ ...data, invoiceNo: e.target.value })}
              placeholder="I-AB4829K513"
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">ইস্যুর তারিখ (Issue Date)</label>
            <input
              type="date"
              value={data.issueDate}
              onChange={e => onChange({ ...data, issueDate: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">পরিশোধের শেষ তারিখ (Due Date)</label>
            <input
              type="date"
              value={data.dueDate}
              onChange={e => onChange({ ...data, dueDate: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* BILLED TO */}
        <div className="border-t border-border pt-3 space-y-2">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600">বিল টু (BILLED TO)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">কাস্টমার / প্রতিষ্ঠানের নাম *</label>
              <input
                type="text"
                required
                value={data.client.name}
                onChange={e => handleClientChange('name', e.target.value)}
                placeholder="Apex Engineering & Construction Ltd."
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground font-bold outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">যোগাযোগকারীর নাম (Attn)</label>
              <input
                type="text"
                value={data.client.contactPerson}
                onChange={e => handleClientChange('contactPerson', e.target.value)}
                placeholder="Engr. Mahmudul Hassan"
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ফোন নম্বর</label>
              <input
                type="text"
                value={data.client.phone}
                onChange={e => handleClientChange('phone', e.target.value)}
                placeholder="+8801819998877"
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">ইমেইল অ্যাড্রেস</label>
              <input
                type="email"
                value={data.client.email}
                onChange={e => handleClientChange('email', e.target.value)}
                placeholder="accounts@apexengineering.bd"
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-foreground mb-1">ঠিকানা (Address)</label>
              <input
                type="text"
                value={data.client.address}
                onChange={e => handleClientChange('address', e.target.value)}
                placeholder="Plot #45, Industrial Zone, Gazipur, Bangladesh"
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* DYNAMIC MULTIPLE LINE ITEMS */}
        <div className="border-t border-border pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-emerald-600">
              বিল আইটেমস (Dynamic Invoice Line Items)
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>আইটেম যোগ করুন (+ Add Item)</span>
            </button>
          </div>

          {data.items.map((item, idx) => (
            <div key={item.id} className="bg-muted/30 border border-border p-3 rounded-[4px] space-y-2">
              <div className="flex items-center justify-between border-b border-border/50 pb-1">
                <span className="font-bold text-foreground">আইটেম #{idx + 1} (Item {idx + 1})</span>
                {data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-4">
                  <label className="block font-semibold text-foreground mb-0.5">আইটেম টাইটেল (Short Title) *</label>
                  <input
                    type="text"
                    required
                    value={item.title || ''}
                    onChange={e => handleUpdateItem(item.id, 'title', e.target.value)}
                    placeholder="Air Ticket Booking / Visa Processing Fee"
                    className="w-full bg-background border border-border rounded-[4px] px-2.5 py-1.5 text-foreground font-semibold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-foreground mb-0.5">বিবরণ (Description)</label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Dhaka - Jeddah flight ticket for 5 pax"
                    className="w-full bg-background border border-border rounded-[4px] px-2.5 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-0.5">পরিমাণ (Qty)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                    onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value !== '' ? parseFloat(e.target.value) : '')}
                    placeholder="— (ঐচ্ছিক)"
                    className="w-full bg-background border border-border rounded-[4px] px-2.5 py-1.5 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-0.5">মূল্য (Price ৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.unitPrice}
                    onChange={e => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="45000"
                    className="w-full bg-background border border-border rounded-[4px] px-2.5 py-1.5 text-foreground font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TAX RATE & TERMS */}
        <div className="border-t border-border pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">ট্যাক্স / ভ্যাট হার (Tax Rate %)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={data.taxRate}
                onChange={e => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-foreground font-mono outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">পেমেন্ট নির্দেশনাবলী ও শর্তাবলী (Payment Instructions & Terms)</label>
            <textarea
              rows={2}
              value={data.paymentTerms}
              onChange={e => onChange({ ...data, paymentTerms: e.target.value })}
              className="w-full bg-background border border-border rounded-[4px] p-2.5 text-foreground outline-none resize-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4 rounded-[4px] flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>ফর্ম রিসেট (Reset)</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>ডাটাবেজে সংরক্ষণ ও আইডি জেনারেট হচ্ছে...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>ইনভয়েস তৈরি ও প্রিভিউ দেখুন</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
