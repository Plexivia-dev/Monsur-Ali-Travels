import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, CheckCircle2, Clock, ShieldCheck, QrCode } from 'lucide-react';
import agencyInfo from '../../../lib/information.json';
import logoImg from '../../../assets/logo.png';
import { formatToDdMmYyyy } from '../../../lib/utils';

// Helper component for single half-page receipt slip
function SingleReceiptSlip({ data = {}, copyType = 'গ্রাহক কপি (Customer Copy)' }) {
  const {
    receiptNo = 'MR-000000-0000',
    clientName = '',
    clientPhone = '',
    passportNumber = '',
    serviceType = 'ইন্ডিয়ান ভিসা প্রসেসিং',
    purpose = '',
    amount = 0,
    amountInWords = '',
    paymentMethod = 'Cash',
    status = 'pending',
    createdByName = 'ম্যানেজার (Manager)',
    confirmedByName = '',
    confirmedAt = null,
    createdAt = new Date().toISOString(),
  } = data || {};

  const isConfirmed = status === 'confirmed';

  return (
    <div className="border-2 border-slate-800 rounded-lg p-4 sm:p-5 bg-white flex flex-col justify-between relative text-slate-900 min-h-[460px]">
      
      {/* Watermark for Confirmed Seal */}
      {isConfirmed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="border-8 border-emerald-700 rounded-full p-8 rotate-[-20deg] text-center">
            <span className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-emerald-800">
              PAID & SEALED
            </span>
          </div>
        </div>
      )}

      {/* Header with Agency Branding */}
      <div className="border-b-2 border-slate-800 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Agency Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center p-1.5 shrink-0">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain filter invert" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase leading-none">
                {agencyInfo.agencyName || 'MONSUR ALI TOURS & TRAVELS'}
              </h1>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                {agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
              <p className="text-[10px] text-slate-700 font-mono">
                হেল্পলাইন: {agencyInfo.phone || '+8801345579534'} | {agencyInfo.email || 'contact@monsuralitravels.com'}
              </p>
            </div>
          </div>

          {/* Token Header & Badge */}
          <div className="text-right shrink-0">
            <span className="inline-block bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
              {copyType}
            </span>
            <div className="text-[11px] font-mono font-bold text-slate-800">
              টোকেন নং: <span className="text-primary font-black text-xs sm:text-sm">{receiptNo}</span>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
              তারিখ: {formatToDdMmYyyy(createdAt)} {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div className="flex items-center justify-between bg-slate-100 border border-slate-300 px-3 py-1 my-2 rounded">
        <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
          অভ্যন্তরীণ মানি রিসিট ও পেমেন্ট টোকেন (Money Receipt)
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
          isConfirmed 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
            : 'bg-amber-100 text-amber-800 border-amber-300'
        }`}>
          {isConfirmed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
          {isConfirmed ? 'ক্যাশ গ্রহণ ও সিল নিশ্চিত' : 'ক্যাশিয়ার পেমেন্ট পেন্ডিং'}
        </span>
      </div>

      {/* Client & Service Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border border-slate-200 rounded p-2.5 bg-slate-50/50 mb-2">
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold block">গ্রাহকের নাম (Client Name):</span>
          <span className="font-bold text-slate-900 text-sm">{clientName || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold block">মোবাইল নম্বর (Phone):</span>
          <span className="font-mono font-semibold text-slate-800">{clientPhone || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold block">পাসপোর্ট নম্বর (Passport No):</span>
          <span className="font-mono font-bold text-slate-900 uppercase">{passportNumber || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold block">সেবার ধরন (Service Type):</span>
          <span className="font-semibold text-slate-900">{serviceType}</span>
        </div>
        {purpose && (
          <div className="col-span-2 border-t border-slate-200 pt-1 mt-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">বিবরণ / পারপাস (Purpose/Remarks):</span>
            <span className="text-slate-800 text-[11px]">{purpose}</span>
          </div>
        )}
      </div>

      {/* Amount & Payment Method Highlight Box */}
      <div className="flex items-center justify-between border-2 border-slate-900 bg-slate-900 text-white rounded p-2.5 mb-2">
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-300">টাকার পরিমাণ (Amount to Pay / Paid)</div>
          <div className="text-base sm:text-xl font-black tracking-tight text-emerald-400">
            ৳ {Number(amount || 0).toLocaleString('en-IN')} BDT
          </div>
          {amountInWords && (
            <div className="text-[10px] text-slate-300 italic">
              কথায়: {amountInWords}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-300 uppercase">পেমেন্ট মাধ্যম</div>
          <div className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 inline-block mt-0.5">
            {paymentMethod}
          </div>
        </div>
      </div>

      {/* Signatures & Seal Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-300 items-end text-center">
        
        {/* Token Creator (Manager) */}
        <div>
          <div className="h-7 flex items-end justify-center">
            <span className="text-[10px] text-slate-400 italic">Signed</span>
          </div>
          <div className="border-t border-slate-700 pt-0.5 text-[10px] font-bold text-slate-800">
            {createdByName || 'ম্যানেজার'}
          </div>
          <div className="text-[9px] text-slate-500">টোকেন প্রস্তুতকারী</div>
        </div>

        {/* Official Seal Stamp Area */}
        <div className="border border-dashed border-slate-400 rounded p-1 bg-slate-50 min-h-[48px] flex flex-col items-center justify-center">
          {isConfirmed ? (
            <div className="text-emerald-700 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-[9px] font-black uppercase tracking-wider">OFFICIAL CASH SEAL</span>
              <span className="text-[8px] font-mono text-emerald-800">{formatToDdMmYyyy(confirmedAt || createdAt)}</span>
            </div>
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">একাউন্টেন্ট সিল ও সিলমোহর</span>
              <span className="text-[8px] italic">(ক্যাশ জমার পর সিল দিন)</span>
            </div>
          )}
        </div>

        {/* Accountant / Cashier Receiver */}
        <div>
          <div className="h-7 flex items-end justify-center">
            {isConfirmed ? (
              <span className="text-[10px] font-bold text-emerald-700">✓ Received</span>
            ) : (
              <span className="text-[10px] text-slate-300 italic">Pending</span>
            )}
          </div>
          <div className="border-t border-slate-700 pt-0.5 text-[10px] font-bold text-slate-800">
            {confirmedByName || 'ক্যাশিয়ার / একাউন্টস'}
          </div>
          <div className="text-[9px] text-slate-500">অর্থ ও সিল গ্রহীতা</div>
        </div>

      </div>

      {/* Bottom Micro Footer */}
      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-200 mt-2 pt-1 font-mono">
        <span>* এই টোকেনটি অভ্যন্তরীণ একাউন্টিং ও ডকুমেন্ট হস্তান্তরের জন্য প্রযোজ্য।</span>
        <span className="font-bold">{receiptNo}</span>
      </div>

    </div>
  );
}

/**
 * Main Printable Money Receipt Sheet
 * Formatted as an A4 page with 2 slips (Customer Copy & Office Copy)
 */
export function MoneyReceiptPrintSlip({ data = {}, onPrint }) {
  const handlePrint = onPrint || (() => window.print());

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Preview Action Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Money Receipt & Token Canvas (A4 Dual Slip)</span>
          <span>•</span>
          <span className="text-[11px]">১ পৃষ্ঠায় ২টি কপি (গ্রাহক ও অফিস)</span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>প্রিন্ট রিসিট / PDF</span>
        </button>
      </div>

      {/* A4 Paper Canvas */}
      <PrintablePaper id="printable-receipt-canvas" className="space-y-4">
        {/* Top Half: Customer Copy */}
        <SingleReceiptSlip data={data} copyType="গ্রাহক কপি (Customer Copy)" />

        {/* Perforated Divider Line */}
        <div className="relative py-1 text-center select-none">
          <div className="border-t-2 border-dashed border-slate-400 w-full" />
          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 text-[10px] font-mono text-slate-500 flex items-center gap-1">
            ✂️ ------------------ কেটে আলাদা করুন (Tear Along Line) ------------------ ✂️
          </span>
        </div>

        {/* Bottom Half: Office Copy */}
        <SingleReceiptSlip data={data} copyType="অফিস ও একাউন্টস কপি (Office & Accounts Copy)" />
      </PrintablePaper>
    </div>
  );
}
