import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, ShieldCheck, Award } from 'lucide-react';
import { formatToDdMmYyyy } from '../../../lib/utils';

export function CharacterCertificatePreview({ data = {}, onPrint }) {
  const {
    memoNo = 'CC/2026/0001',
    issueDate = new Date().toISOString().split('T')[0],
    certificateTitle = 'CHARACTER CERTIFICATE',
    certificateSubtitle = 'TO WHOM IT MAY CONCERN',
    authority = {},
    candidate = {},
    conduct = {},
    signatory = {},
  } = data || {};

  const handlePrint = onPrint || (() => window.print());

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Character Certificate Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper */}
      <PrintablePaper id="printable-character-certificate" className="font-serif">
        
        {/* Single Clean Certificate Border Frame */}
        <div className="border-2 border-slate-900 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white text-slate-900 flex-1 min-h-[960px] print:min-h-0 print:p-5">
          
          {/* Header (Fully Customizable) */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              {authority.logoUrl && (
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-slate-900 overflow-hidden p-1">
                    <img src={authority.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-sans">
                {authority.organizationName || 'OFFICE OF THE ISSUING AUTHORITY'}
              </h1>
              
              {authority.organizationSubtitle && (
                <p className="text-xs font-semibold text-slate-700 font-sans tracking-wide">
                  {authority.organizationSubtitle}
                </p>
              )}

              <p className="text-[11px] text-slate-600 font-sans">
                {authority.officeAddress}
              </p>
              
              <p className="text-[10px] text-slate-600 font-sans font-mono">
                {authority.phone && `Tel: ${authority.phone}`} {authority.email && ` | Email: ${authority.email}`}
              </p>
            </div>

            {/* Memo & Date */}
            <div className="flex justify-between items-center text-xs font-bold font-sans text-slate-800 border-b border-slate-300 pb-2">
              <div>Memo / Ref No: <span className="font-mono underline">{memoNo}</span></div>
              <div>Date of Issue: <span className="font-mono underline">{formatToDdMmYyyy(issueDate)}</span></div>
            </div>

            {/* Title Badge */}
            <div className="text-center my-2">
              <div className="inline-block border-2 border-slate-900 px-6 py-1.5 rounded-xs bg-slate-50 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 font-sans">
                  {certificateTitle || 'CHARACTER CERTIFICATE'}
                </h2>
              </div>
              {certificateSubtitle && (
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans mt-1">
                  {certificateSubtitle}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-900 leading-relaxed text-justify px-2 font-serif">
              
              <p className="indent-6">
                {conduct.statement || `This is to certify that ${candidate.fullName}, Son of ${candidate.fatherName} and ${candidate.motherName}, resident of ${candidate.presentAddress}, bearing Passport No: ${candidate.passportNo || 'N/A'}, is known to me.`}
              </p>

              {/* Candidate Info Grid */}
              <div className="my-3 p-3.5 bg-slate-50 border border-slate-300 rounded-xs font-sans text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Candidate Name:</span>
                    <strong className="text-slate-900 uppercase font-bold">{candidate.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Father's Name:</span>
                    <strong className="text-slate-900 uppercase font-bold">{candidate.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Mother's Name:</span>
                    <strong className="text-slate-900 uppercase font-bold">{candidate.motherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Passport / NID No:</span>
                    <strong className="text-slate-900 font-mono font-bold uppercase">{candidate.passportNo || candidate.nidNo || 'N/A'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-medium block text-[10px] uppercase">Permanent Address:</span>
                    <strong className="text-slate-900">{candidate.permanentAddress}</strong>
                  </div>
                </div>
              </div>

              <p>
                {conduct.characterPraise || 'To the best of my knowledge and official verification, he bears good moral character, honesty, and peaceful disposition. He has not been involved in any anti-social or criminal activities against the law of the land.'}
              </p>

              <p>
                {conduct.recommendation || 'I recommend him for employment, visa processing, travel, or official administrative purposes, and wish him all success in his future life.'}
              </p>

            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t-2 border-slate-900 mt-6 font-sans">
              <div className="grid grid-cols-2 items-end">
                
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-full flex flex-col items-center justify-center p-2 text-center text-slate-500">
                    <ShieldCheck className="w-6 h-6 text-slate-400 mb-0.5" />
                    <span className="text-[8px] font-bold uppercase tracking-tight leading-none">
                      {signatory.sealText || 'OFFICIAL VERIFICATION SEAL'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    (Official Seal & Signature)
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-10 flex items-end justify-end">
                    <span className="text-xs text-slate-400 font-serif italic mr-4">Authorized Signature</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <p className="text-xs font-black uppercase text-slate-900 tracking-wide">
                      {signatory.name || 'AUTHORIZED SIGNATORY'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-700">
                      {signatory.designation || 'Issuing Authority'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {authority.organizationName}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

      </PrintablePaper>

    </div>
  );
}
