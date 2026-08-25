import React, { useState } from 'react';
import { MoneyReceiptForm } from './MoneyReceiptForm';
import { MoneyReceiptPreview } from './MoneyReceiptPreview';
import { getDefaultMoneyReceiptData, generateReceiptNo } from './sampleData';
import { Printer, Edit3, Share2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@shared/lib/api-client';

export function MoneyReceipt() {
  const [data, setData] = useState(getDefaultMoneyReceiptData());
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setData(getDefaultMoneyReceiptData());
    toast.info('Money receipt form has been reset.');
  };

  const handleFormSubmit = async () => {
    if (!data.clientName?.trim()) {
      toast.error('Client / Passenger Name is required!');
      return;
    }
    if (!data.amount || Number(data.amount) <= 0) {
      toast.error('Valid Total Amount is required!');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const payload = {
        ...data,
        amount: Number(data.amount),
      };

      const res = isEdit
        ? await apiClient.put(`/api/v1/client/receipts/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/receipts', payload);

      const saved = res.data?.data;
      if (res.data?.success || res.data?.status === 'success' || saved) {
        const returnedNo = saved?.receiptNo || data.receiptNo || generateReceiptNo();
        setData((prev) => ({
          ...prev,
          ...saved,
          _id: saved?._id || prev._id,
          receiptNo: returnedNo,
          qrCode: saved?.qrCode || prev.qrCode,
          did: saved?.did || prev.did,
        }));
        toast.success(
          isEdit
            ? `Money receipt #${returnedNo} updated successfully!`
            : `Money receipt #${returnedNo} saved to database!`
        );
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'Failed to save receipt.');
      }
    } catch (err) {
      console.warn('Receipt save warning (preview mode ready):', err);
      toast.info(`Money receipt voucher preview ready! (#${data.receiptNo})`);
      setViewMode('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const clientName = data.clientName || 'Customer';
    const amountStr = Number(data.amount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*INTERNAL MONEY RECEIPT / VOUCHER (${data.receiptNo || 'MR-2026-000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Client / Passenger:* ${clientName}\n` +
      `🛂 *Passport:* ${data.passportNumber || 'N/A'}\n` +
      `📌 *Purpose:* ${data.purpose || 'Visa / Ticket Booking'}\n` +
      `💰 *Total Amount:* ৳ ${amountStr}\n` +
      `💳 *Payment Method:* ${data.paymentMethod || 'Cash'}\n` +
      `📅 *Date:* ${data.date || 'Today'} (${data.time || '11:30 AM'})\n` +
      `✍️ *Received By:* ${data.receivedBy || 'Accounts Officer'}\n` +
      `-----------------------------------------\n\n` +
      `🏢 *Monsur Ali Travels*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form Mode */}
      {viewMode === 'form' && (
        <MoneyReceiptForm
          data={data}
          onChange={setData}
          onReset={handleReset}
          onSave={handleFormSubmit}
          onPreview={() => setViewMode('preview')}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview & Print Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-xs no-print">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Form</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher (A4)</span>
              </button>
            </div>
          </div>

          {/* Printable Voucher Paper Canvas */}
          <MoneyReceiptPreview data={data} />
        </div>
      )}
    </div>
  );
}

export default MoneyReceipt;
