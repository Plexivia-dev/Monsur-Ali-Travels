import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

export function InvoicePreview({ data, onPrint }) {
  const { invoiceNo, issueDate, dueDate, paymentStatus, currency, taxRate, biller = {}, client = {}, items = [], paymentTerms } = data;

  // Calculate line items and totals
  const processedItems = items.map(item => {
    const qtyNum = parseFloat(item.quantity);
    const hasQty = !isNaN(qtyNum) && qtyNum > 0;
    const priceNum = parseFloat(item.unitPrice) || 0;
    const lineTotal = hasQty ? (qtyNum * priceNum) : priceNum;

    return {
      ...item,
      isEmpty: false,
      hasQty,
      qtyDisplay: hasQty ? qtyNum : '-',
      lineTotal
    };
  });

  // Ensure a minimum of 4 rows are always rendered in the A4 table
  const MIN_ROWS = 4;
  const displayItems = [...processedItems];
  while (displayItems.length < MIN_ROWS) {
    displayItems.push({
      id: `empty-row-${displayItems.length}`,
      isEmpty: true,
      title: '',
      description: '',
      qtyDisplay: '-',
      unitPrice: 0,
      lineTotal: 0
    });
  }

  const subtotal = processedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Controls Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-[4px] px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-foreground">Live Invoice Canvas</span>
          <span>•</span>
          <span className="text-xs">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-[4px] shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Invoice / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-invoice-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 min-h-[960px] print:min-h-[270mm]">
          
          <div className="space-y-6 flex-1">
            {/* Header Biller Info & Document Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2.5">
                  <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-9 h-9 object-contain rounded-[4px]" />
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">{biller.name}</h1>
                </div>
                <p className="text-xs text-slate-700 font-bold">{biller.subtitle}</p>
                <p className="text-xs text-slate-600">{biller.address}</p>
                <p className="text-xs text-slate-600">Phone: {biller.phone} | Email: {biller.email}</p>
                {biller.binNo && <p className="text-xs font-mono text-slate-500 font-semibold">License / BIN: {biller.binNo}</p>}
              </div>

              <div className="text-right space-y-2">
                <div className="inline-block bg-slate-900 text-white px-4 py-1 rounded-[4px] text-lg font-black uppercase tracking-wider">
                  INVOICE
                </div>
                
                <div className="text-xs font-mono text-slate-800 space-y-0.5">
                  <div><strong>Invoice #:</strong> <span className="font-bold text-emerald-800">{invoiceNo}</span></div>
                  <div><strong>Date:</strong> {issueDate}</div>
                  <div><strong>Due Date:</strong> {dueDate}</div>
                </div>

                {/* Status Badge */}
                <div className="pt-1">
                  {paymentStatus === 'Paid' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-black px-2.5 py-0.5 rounded-[4px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> PAID
                    </span>
                  )}
                  {paymentStatus === 'Pending' && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-400 text-xs font-black px-2.5 py-0.5 rounded-[4px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING
                    </span>
                  )}
                  {paymentStatus === 'Overdue' && (
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-400 text-xs font-black px-2.5 py-0.5 rounded-[4px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> OVERDUE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Client Billed-To Info */}
            <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-300 text-sm space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">BILLED TO:</span>
              <div className="font-bold text-base text-slate-900">{client.name || 'সম্মানিত কাস্টমার'}</div>
              {client.contactPerson && <div>Attn: {client.contactPerson}</div>}
              {client.address && <div>Address: {client.address}</div>}
              {(client.phone || client.email) && (
                <div>Phone: {client.phone || 'N/A'} | Email: {client.email || 'N/A'}</div>
              )}
            </div>

            {/* Line Items Table with Visible Cell Grid Borders */}
            <div className="border border-slate-900 rounded-[4px] overflow-hidden text-sm">
              <table className="w-full text-left border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-xs font-bold">
                    <th className="p-3 w-10 text-center border border-slate-900">#</th>
                    <th className="p-3 w-48 border border-slate-900">Item Title</th>
                    <th className="p-3 border border-slate-900">Description</th>
                    <th className="p-3 text-center w-20 border border-slate-900">Qty</th>
                    <th className="p-3 text-right w-28 border border-slate-900">Rate ({currency})</th>
                    <th className="p-3 text-right w-32 border border-slate-900">Total ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {displayItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 font-medium h-10">
                      <td className="p-3 text-center text-slate-500 font-mono border border-slate-300">{idx + 1}</td>
                      <td className="p-3 text-slate-900 font-bold border border-slate-300">{item.isEmpty ? '—' : (item.title || 'Service Item')}</td>
                      <td className="p-3 text-slate-800 border border-slate-300">{item.isEmpty ? '—' : (item.description || '—')}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900 border border-slate-300">{item.qtyDisplay}</td>
                      <td className="p-3 text-right font-mono border border-slate-300">{item.isEmpty ? '-' : (parseFloat(item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 border border-slate-300">{item.isEmpty ? '-' : item.lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Financial Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-1">
              <div className="max-w-md text-xs space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">Payment Terms & Notes:</span>
                <p className="bg-slate-50 p-3 rounded-[4px] border border-slate-300 text-slate-700 leading-relaxed text-xs">
                  {paymentTerms || 'Payment due within 15 days of invoice date.'}
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-sm font-mono border-t border-slate-400 pt-2">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString('en-IN')} {currency}</span>
                </div>
                
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Tax ({taxRate}%):</span>
                    <span>{taxAmount.toLocaleString('en-IN')} {currency}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-2 bg-slate-100 p-2.5 rounded-[4px]">
                  <span>Grand Total:</span>
                  <span>{grandTotal.toLocaleString('en-IN')} {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Block Pushed to Bottom via mt-auto */}
          <div className="mt-auto pt-8 flex justify-between items-end text-xs text-slate-900 print:break-inside-avoid page-break-inside-avoid">
            <div className="text-center space-y-1">
              <div className="border-b border-slate-400 w-44 mb-1"></div>
              <div className="text-xs text-slate-500 font-medium">Customer Signature</div>
            </div>

            <div className="text-center space-y-1">
              <div className="border-b-2 border-slate-900 w-52 mb-1"></div>
              <div className="font-bold text-sm text-slate-900">{biller.name}</div>
              <div className="text-xs text-slate-600">Authorized Signature & Seal</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
