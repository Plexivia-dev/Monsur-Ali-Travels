import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function InvoiceForm({ data, onChange }) {
  const handleBillerChange = (field, value) => {
    onChange({
      ...data,
      biller: { ...data.biller, [field]: value }
    });
  };

  const handleClientChange = (field, value) => {
    onChange({
      ...data,
      client: { ...data.client, [field]: value }
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: 'Service / Product Item',
      quantity: 1,
      unitPrice: 1000
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

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-foreground text-sm">ইনভয়েস / বিল ইনপুট ফর্ম</h3>
        <div className="flex items-center space-x-2">
          <label className="text-muted-foreground font-medium">Status:</label>
          <select
            value={data.paymentStatus}
            onChange={e => onChange({ ...data, paymentStatus: e.target.value })}
            className="bg-background border border-input rounded-lg px-2.5 py-1 text-foreground font-semibold outline-none"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* METADATA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-muted-foreground mb-1">Invoice Number</label>
          <input
            type="text"
            value={data.invoiceNo}
            onChange={e => onChange({ ...data, invoiceNo: e.target.value })}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-muted-foreground mb-1">Issue Date</label>
          <input
            type="date"
            value={data.issueDate}
            onChange={e => onChange({ ...data, issueDate: e.target.value })}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
          />
        </div>

        <div>
          <label className="block text-muted-foreground mb-1">Due Date</label>
          <input
            type="date"
            value={data.dueDate}
            onChange={e => onChange({ ...data, dueDate: e.target.value })}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
          />
        </div>
      </div>

      {/* CLIENT DETAILS */}
      <div className="border-t border-border pt-3 space-y-2">
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">ক্লায়েন্ট / বিল গ্রাহকের তথ্য (Client Details)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-muted-foreground mb-1">কোম্পানি / ক্লায়েন্টের নাম</label>
            <input
              type="text"
              value={data.client.name}
              onChange={e => handleClientChange('name', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-semibold outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">যোগাযোগকারীর নাম</label>
            <input
              type="text"
              value={data.client.contactPerson}
              onChange={e => handleClientChange('contactPerson', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">ফোন নম্বর</label>
            <input
              type="text"
              value={data.client.phone}
              onChange={e => handleClientChange('phone', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">ইমেইল</label>
            <input
              type="email"
              value={data.client.email}
              onChange={e => handleClientChange('email', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-muted-foreground mb-1">ঠিকানা</label>
            <input
              type="text"
              value={data.client.address}
              onChange={e => handleClientChange('address', e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>
        </div>
      </div>

      {/* DYNAMIC LINE ITEMS */}
      <div className="border-t border-border pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">বিল আইটেমস (Invoice Line Items)</h4>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {data.items.map((item, idx) => (
          <div key={item.id} className="bg-muted/40 border border-border p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Item #{idx + 1}</span>
              {data.items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive/80 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-6">
                <label className="block text-muted-foreground mb-0.5">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-muted-foreground mb-0.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground font-mono outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-muted-foreground mb-0.5">Unit Price (BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={e => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground font-mono outline-none"
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
            <label className="block text-muted-foreground mb-1">Tax / VAT Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.taxRate}
              onChange={e => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground font-mono outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-muted-foreground mb-1">Payment Instructions & Terms</label>
          <textarea
            rows={3}
            value={data.paymentTerms}
            onChange={e => onChange({ ...data, paymentTerms: e.target.value })}
            className="w-full bg-background border border-input rounded-lg p-2.5 text-foreground outline-none resize-none"
          />
        </div>
      </div>

    </div>
  );
}
