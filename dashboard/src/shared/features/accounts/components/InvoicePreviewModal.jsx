import React from 'react';
import { Printer, X, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedModalHeader, UnifiedModalFooter } from '../../../components/common/UnifiedModal';
import { InvoicePreview } from '../../../features/document-studio/components/invoice/InvoicePreview';
import { printDocument } from '@/lib/utils';

export function InvoicePreviewModal({ isOpen, invoiceData, onClose }) {
  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    printDocument({
      docId: invoiceData.invoiceNo,
      docType: 'Invoice',
      clientName: invoiceData.client?.name || invoiceData.customerName,
      elementId: 'printable-invoice-canvas',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <UnifiedModalHeader
          title={`Invoice #${invoiceData.invoiceNo || 'Bill'}`}
          subtitle={`Issued to ${invoiceData.client?.name || invoiceData.customerName || 'Valued Client'} • Total: BDT ${Number(invoiceData.grandTotal || invoiceData.totalAmount || 0).toLocaleString('en-BD')}`}
          icon={FileSpreadsheet}
          badge={invoiceData.paymentStatus || 'Invoice'}
          onClose={onClose}
        />

        {/* Modal Content / Preview Canvas */}
        <div className="p-4 sm:p-6 bg-black/[0.03] overflow-y-auto max-h-[72vh] flex justify-center">
          <div className="w-full max-w-[800px] bg-white rounded-lg shadow-md border border-black/10 p-2 sm:p-4">
            <InvoicePreview data={invoiceData} onPrint={handlePrint} />
          </div>
        </div>

        {/* Modal Footer */}
        <UnifiedModalFooter className="flex items-center justify-between p-4 bg-white border-t border-black/10">
          <div className="text-xs text-black/60 font-semibold font-mono">
            Ref: {invoiceData.caseNumber || invoiceData.did || invoiceData._id || 'N/A'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="cancel"
              size="sm"
              onClick={onClose}
              className="h-8 px-4 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-4 text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </Button>
          </div>
        </UnifiedModalFooter>
      </div>
    </div>
  );
}
