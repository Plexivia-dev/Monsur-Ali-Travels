import React, { useState } from 'react';
import { CashVoucherForm } from './CashVoucherForm';
import { CashVoucherPreview } from './CashVoucherPreview';
import { getDefaultCashVoucherData, generateVoucherNo } from './sampleData';
import { Printer, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { Button } from '@/components/ui/button';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

export function CashVoucher() {
  const [data, setData] = useState(getDefaultCashVoucherData());
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setData(getDefaultCashVoucherData());
    toast.info('Cash voucher form has been reset.');
  };

  const handleFormSubmit = async () => {
    if (!data.items || data.items.length === 0) {
      toast.error('Please add at least one expense item!');
      return;
    }
    if (!data.grandTotal || Number(data.grandTotal) <= 0) {
      toast.error('Grand Total must be greater than zero!');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const payload = {
        ...data,
        subtotal:   Number(data.subtotal   || 0),
        taxVat:     Number(data.taxVat     || 0),
        grandTotal: Number(data.grandTotal || 0),
      };

      const res = isEdit
        ? await apiClient.put(`/api/v1/client/cash-vouchers/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/cash-vouchers', payload);

      const saved = res.data?.data;
      if (res.data?.success || res.data?.status === 'success' || saved) {
        const returnedNo = saved?.voucherNo || data.voucherNo || generateVoucherNo();
        setData((prev) => ({
          ...prev,
          ...saved,
          _id:       saved?._id       || prev._id,
          voucherNo: returnedNo,
          qrCode:    saved?.qrCode    || prev.qrCode,
          did:       saved?.did       || prev.did,
        }));
        toast.success(
          isEdit
            ? `Cash voucher #${returnedNo} updated successfully!`
            : `Cash voucher #${returnedNo} saved to database!`
        );
        setViewMode('preview');
      } else {
        throw new Error(res.data?.message || 'Failed to save cash voucher.');
      }
    } catch (err) {
      console.warn('Cash voucher save warning (preview mode ready):', err);
      toast.info(`Cash voucher preview ready! (#${data.voucherNo})`);
      setViewMode('preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.voucherNo,
      docType: 'Cash_Voucher',
      clientName: data.paidTo || data.receivedBy,
    });
  };

  const handleWhatsAppShare = () => {
    const total = Number(data.grandTotal || 0).toLocaleString('en-IN');
    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*OFFICIAL CASH MONEY VOUCHER*\n` +
      `*Voucher No: ${data.voucherNo || 'MAT-KV-000000'}*\n` +
      `-----------------------------------------\n` +
      `📅 *Date:* ${data.voucherDate || 'N/A'}\n` +
      `💰 *Grand Total:* BDT  ${total}\n` +
      `📝 *In Words:* ${data.grandTotalInWordsEn || 'N/A'}\n` +
      (data.receivedBy ? `✍️ *Received By:* ${data.receivedBy}\n` : '') +
      `-----------------------------------------\n\n` +
      `🏢 *Monsur Ali Travels*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534\n` +
      `🌐 monsuralitravels.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Form Mode */}
      {viewMode === 'form' && (
        <CashVoucherForm
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
          <HeaderTitle
            variant="printables"
            title={`Cash Money Voucher (${data.voucherNo || 'MAT-KV'})`}
            subtitle="Cash voucher preview ready. Review details, print document, or return to edit form."
            actions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('form')}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Edit Form</span>
                </Button>

                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={handleWhatsAppShare}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  <span>Print Voucher (A4)</span>
                </Button>
              </>
            }
          />

          {/* Printable Preview */}
          <CashVoucherPreview data={data} />
        </div>
      )}
    </div>
  );
}

export default CashVoucher;
