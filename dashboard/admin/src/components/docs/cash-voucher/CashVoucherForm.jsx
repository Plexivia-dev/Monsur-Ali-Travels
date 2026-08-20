import React, { useCallback } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { numberToWords, numberToWordsBn, generateVoucherNo } from './sampleData';

export function CashVoucherForm({ data, onChange, onReset, onSave, onPreview, isSubmitting }) {

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const recalc = useCallback((items, taxVat) => {
    const subtotal   = items.reduce((s, it) => s + Number(it.amount || 0), 0);
    const grandTotal = subtotal + Number(taxVat || 0);
    return { subtotal, grandTotal, grandTotalInWordsEn: numberToWords(grandTotal), grandTotalInWordsBn: numberToWordsBn(grandTotal) };
  }, []);

  const handleChange = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));

  // ─── Line Items ───────────────────────────────────────────────────────────
  const handleItemChange = (idx, field, value) => {
    const updated = data.items.map((it, i) =>
      i === idx ? { ...it, [field]: field === 'amount' ? Number(value) || 0 : value } : it
    );
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const addItem = () => {
    const updated = [...data.items, { slNo: data.items.length + 1, descriptionBn: '', descriptionEn: '', amount: 0 }];
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const removeItem = (idx) => {
    const updated = data.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, slNo: i + 1 }));
    onChange((prev) => ({ ...prev, items: updated, ...recalc(updated, prev.taxVat) }));
  };

  const handleTaxChange = (val) => {
    const taxVat = Number(val) || 0;
    onChange((prev) => ({ ...prev, taxVat, ...recalc(prev.items, taxVat) }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-foreground mb-4">Cash Voucher (ক্যাশ মানি ভাউচার)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Voucher No */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Voucher No</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.voucherNo}
                onChange={(e) => handleChange('voucherNo', e.target.value)}
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleChange('voucherNo', generateVoucherNo())}
                className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-xl text-xs font-bold text-muted-foreground transition-all cursor-pointer"
              >
                New
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
            <input
              type="date"
              value={data.voucherDate?.split('/').reverse().join('-') || ''}
              onChange={(e) => {
                const d = new Date(e.target.value);
                handleChange('voucherDate', d.toLocaleDateString('en-GB'));
              }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Expense Items */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Expense Items (খরচের বিবরণ)</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Row
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="px-2 py-2 text-left w-10">#</th>
                <th className="px-2 py-2 text-left">বিবরণ (Bengali)</th>
                <th className="px-2 py-2 text-left">Description (English)</th>
                <th className="px-2 py-2 text-right w-32">Amount (BDT)</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="px-2 py-2 text-muted-foreground text-center">{item.slNo}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.descriptionBn}
                      onChange={(e) => handleItemChange(idx, 'descriptionBn', e.target.value)}
                      placeholder="বাংলায় লিখুন..."
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.descriptionEn}
                      onChange={(e) => handleItemChange(idx, 'descriptionEn', e.target.value)}
                      placeholder="Write in English..."
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      min="0"
                      className="w-full bg-muted/60 border border-border/60 rounded-lg px-2 py-1.5 text-right text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex flex-col items-end gap-1 text-xs">
          <div className="flex gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground w-28 text-right">
              {Number(data.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-muted-foreground">Tax / VAT</span>
            <input
              type="number"
              value={data.taxVat}
              onChange={(e) => handleTaxChange(e.target.value)}
              min="0"
              className="w-28 bg-muted border border-border rounded-lg px-2 py-1 text-right text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-4 border-t border-border pt-1 mt-1">
            <span className="font-bold text-foreground">Grand Total</span>
            <span className="font-bold text-foreground w-28 text-right">
              {Number(data.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-foreground mb-4">Signatures / Received By</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Received By (Signature By)</label>
            <input
              type="text"
              value={data.receivedBy}
              onChange={(e) => handleChange('receivedBy', e.target.value)}
              placeholder="Name / Signature"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">প্রণকারীর স্বাক্ষর ও নাম</label>
            <input
              type="text"
              value={data.preparedBy}
              onChange={(e) => handleChange('preparedBy', e.target.value)}
              placeholder="Signature & Name"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">কর্তৃপক্ষর স্বাক্ষর ও পদবী</label>
            <input
              type="text"
              value={data.accountsSignature}
              onChange={(e) => handleChange('accountsSignature', e.target.value)}
              placeholder="Signature & Designation"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="px-5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Preview Only
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save & Preview'}
        </button>
      </div>
    </div>
  );
}

export default CashVoucherForm;
