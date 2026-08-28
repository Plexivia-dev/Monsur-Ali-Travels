import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { getDefaultInvoiceData, generateUniqueInvoiceNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '@shared/lib/api-client';
import { printDocument } from '@shared/lib/utils';
import { toast } from 'sonner';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function InvoiceBuilder() {
  const location = useLocation();
  const incomingInvoiceData = location.state?.invoiceData || location.state?.initialData || null;

  const [data, setData] = useState(() => {
    const defaultData = getDefaultInvoiceData();
    if (!incomingInvoiceData) return defaultData;
    return {
      ...defaultData,
      ...incomingInvoiceData,
      client: {
        ...defaultData.client,
        ...(incomingInvoiceData.client || {}),
      },
      biller: {
        ...defaultData.biller,
        ...(incomingInvoiceData.biller || {}),
      },
      items:
        incomingInvoiceData.items && incomingInvoiceData.items.length > 0
          ? incomingInvoiceData.items
          : defaultData.items,
    };
  });

  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (incomingInvoiceData) {
      toast.success(
        `Invoice autofilled for ${incomingInvoiceData.client?.name || incomingInvoiceData.clientName || 'Client'}`
      );
    }
  }, []);

  const handleReset = () => {
    setData(getDefaultInvoiceData());
    toast.info('Invoice data reset to default.');
  };

  const handleFormSubmit = async () => {
    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => {
      const qtyNum = parseFloat(item.quantity);
      const hasQty = !isNaN(qtyNum) && qtyNum > 0;
      const priceNum = parseFloat(item.unitPrice) || 0;
      const lineTotal = hasQty ? (qtyNum * priceNum) : priceNum;
      return acc + lineTotal;
    }, 0);
    const taxAmount = (subtotal * (parseFloat(data.taxRate) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    const payload = {
      ...data,
      subtotal,
      taxAmount,
      grandTotal,
    };

    if (!payload.invoiceNo) {
      delete payload.invoiceNo;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/invoices/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/invoices', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedInvoiceNo = savedDoc.invoiceNo || generateUniqueInvoiceNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          invoiceNo: returnedInvoiceNo,
          qrCode: savedDoc.qrCode || prev.qrCode || '',
        }));
        toast.success(
          isEdit
            ? `Invoice successfully updated! (Invoice No: ${returnedInvoiceNo})`
            : `Invoice successfully saved to database! (Invoice No: ${returnedInvoiceNo})`
        );
      } else {
        throw new Error(res.data?.message || 'Failed to save invoice to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackInvoiceNo = data.invoiceNo || generateUniqueInvoiceNo();
      setData((prev) => ({
        ...prev,
        invoiceNo: fallbackInvoiceNo,
      }));
      toast.info(`Invoice preview ready! (Invoice No: ${fallbackInvoiceNo})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.invoiceNo,
      docType: 'Invoice',
      clientName: data.client?.name,
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.client?.name || 'Valued Client';
    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
    const taxAmount = (subtotal * (parseFloat(data.taxRate) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*Invoice & Billing Details (${data.invoiceNo || 'Official Invoice'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Billed To:* ${clientName}\n` +
      `📞 *Phone:* ${data.client?.phone || 'N/A'}\n` +
      `💰 *Total Amount:* BDT  ${Number(grandTotal).toLocaleString('en-IN')}\n` +
      `📌 *Status:* ${data.paymentStatus || 'Paid'}\n` +
      `📅 *Date:* ${data.issueDate || 'Today'}\n\n` +
      `🏢 *MONSUR ALI TRAVELS*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Contact Helpline: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={FileSpreadsheet}
        title={`Invoice & Billing Generator (${data.invoiceNo || 'INV-OFFICIAL'})`}
        subtitle="Official agency invoice builder with auto-tax, line items calculations, and QR verification."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="w-full pb-16">
          <InvoiceForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
          />
          <div className="hidden print:block w-full">
            <InvoicePreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <InvoicePreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <InvoiceForm
              data={data}
              onChange={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <InvoicePreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default InvoiceBuilder;
