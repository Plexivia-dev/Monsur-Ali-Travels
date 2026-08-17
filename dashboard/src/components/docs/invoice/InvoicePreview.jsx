import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Receipt, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

export function InvoicePreview({ data, onPrint }) {
  const { invoiceNo, issueDate, dueDate, paymentStatus, currency, taxRate, biller, client, items, paymentTerms } = data;

  // Calculate financials
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Controls Bar (hidden during print) */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Live Invoice Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Invoice / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-invoice-canvas">
        <div className="space-y-8 text-slate-900">
          
          {/* Header Biller Info & Document Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2.5">
                <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-9 h-9 object-contain rounded-md" />
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">{biller.name}</h1>
              </div>
              <p className="text-xs text-slate-700 font-semibold">{biller.subtitle}</p>
              <p className="text-xs text-slate-600">{biller.address}, {biller.city}</p>
              <p className="text-xs text-slate-600">Phone: {biller.phone} | Email: {biller.email}</p>
              {biller.binNo && <p className="text-[11px] font-mono text-slate-500">BIN / VAT Reg: {biller.binNo}</p>}
            </div>

            <div className="text-right space-y-2">
              <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded text-lg font-black uppercase tracking-wider">
                INVOICE
              </div>
              
              <div className="text-xs font-mono text-slate-800 space-y-0.5">
                <div><strong>Invoice #:</strong> {invoiceNo}</div>
                <div><strong>Date:</strong> {issueDate}</div>
                <div><strong>Due Date:</strong> {dueDate}</div>
              </div>

              {/* Status Badge */}
              <div className="pt-1">
                {paymentStatus === 'Paid' && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded">
                    <CheckCircle className="w-3.5 h-3.5" /> PAID
                  </span>
                )}
                {paymentStatus === 'Pending' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded">
                    <Clock className="w-3.5 h-3.5" /> PENDING
                  </span>
                )}
                {paymentStatus === 'Overdue' && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-2.5 py-0.5 rounded">
                    <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client Billed-To Info */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">BILLED TO / CUSTOMER:</span>
            <div className="font-bold text-sm text-slate-900">{client.name}</div>
            {client.contactPerson && <div>Attn: {client.contactPerson}</div>}
            <div>{client.address}</div>
            <div>Phone: {client.phone} | Email: {client.email}</div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-900 rounded-sm overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center w-20">Qty</th>
                  <th className="p-3 text-right w-28">Rate ({currency})</th>
                  <th className="p-3 text-right w-32">Total ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 font-medium">
                      <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 text-slate-900 font-semibold">{item.description}</td>
                      <td className="p-3 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="max-w-md text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Payment Terms & Notes:</span>
              <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                {paymentTerms}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs font-mono border-t border-slate-300 pt-2">
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

              <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-2 bg-slate-100 p-2 rounded">
                <span>Grand Total:</span>
                <span>{grandTotal.toLocaleString('en-IN')} {currency}</span>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-16 flex justify-between items-end text-xs text-slate-900">
            <div className="text-center space-y-1">
              <div className="border-b border-slate-400 w-40 mb-1"></div>
              <div className="text-[11px] text-slate-500 font-medium">Customer Signature</div>
            </div>

            <div className="text-center space-y-1">
              <div className="border-b-2 border-slate-900 w-48 mb-1"></div>
              <div className="font-bold text-xs">{biller.name}</div>
              <div className="text-[11px] text-slate-600">Authorized Signature & Seal</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
