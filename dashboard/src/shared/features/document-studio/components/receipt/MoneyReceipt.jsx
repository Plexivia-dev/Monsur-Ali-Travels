import React, { useState } from 'react';
import { MoneyReceiptForm } from './MoneyReceiptForm';
import { MoneyReceiptPreview } from './MoneyReceiptPreview';
import { getDefaultMoneyReceiptData, generateReceiptNo } from './sampleData';
import { Download, RefreshCw, Eye, Edit3, Columns, Share2, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function MoneyReceipt() {
  const [data, setData] = useState(getDefaultMoneyReceiptData());
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
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
      } else {
        throw new Error(res.data?.message || 'Failed to save receipt.');
      }
    } catch (err) {
      console.warn('Receipt save warning (preview mode ready):', err);
      toast.info(`Money receipt voucher preview ready! (#${data.receiptNo})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.receiptNo,
      docType: 'Money_Receipt',
      clientName: data.clientName,
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.clientName || 'Client';
    const amountStr = Number(data.amount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*INTERNAL MONEY RECEIPT / VOUCHER (${data.receiptNo || 'MR-2026-000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Client / Passenger:* ${clientName}\n` +
      `🛂 *Passport:* ${data.passportNumber || 'N/A'}\n` +
      `📌 *Purpose:* ${data.purpose || 'Visa / Ticket Booking'}\n` +
      `💰 *Total Amount:* BDT  ${amountStr}\n` +
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
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Receipt}
        title={`Money Receipt Voucher (${data.receiptNo || 'MR-OFFICIAL'})`}
        subtitle="Generate and print official passenger money receipts, payment confirmations, and accounts ledger tokens."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
              {[
                { id: 'split', label: 'Split View', icon: Columns },
                { id: 'edit', label: 'Edit Form', icon: Edit3 },
                { id: 'preview', label: 'Live Preview', icon: Eye },
              ].map((btn) => {
                const Icon = btn.icon;
                const isActive = viewMode === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setViewMode(btn.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-md font-black'
                        : 'text-sky-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Share Summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
              title="Export Printable A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="max-w-4xl mx-auto">
          <MoneyReceiptForm
            data={data}
            onChange={setData}
            onReset={handleReset}
            onSave={handleFormSubmit}
            onPreview={() => setViewMode('preview')}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding">
          <MoneyReceiptPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <MoneyReceiptForm
              data={data}
              onChange={setData}
              onReset={handleReset}
              onSave={handleFormSubmit}
              onPreview={() => setViewMode('preview')}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="lg:col-span-7 bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <MoneyReceiptPreview data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoneyReceipt;
