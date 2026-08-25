import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Heart, ShieldCheck, Award } from 'lucide-react';
import { formatToDdMmYyyy } from '@shared/lib/utils';

export function MarriageCertificatePreview({ data = {}, onPrint }) {
  const {
    memoNo = 'MC/2026/0001',
    issueDate = new Date().toISOString().split('T')[0],
    marriageDate = '2021-11-20',
    marriagePlace = '',
    volumeNo = 'Vol-IV/2021',
    pageNo = 'Page #48',
    certificateTitle = 'MARRIAGE CERTIFICATE',
    certificateSubtitle = 'OFFICIAL MARITAL STATUS & NIKAHNAMA EXTRACT',
    registrar = {},
    groom = {},
    bride = {},
    marriageTerms = {},
    declaration = {},
  } = data || {};

  const handlePrint = onPrint || (() => window.print());

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Action Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Marriage Certificate Canvas</span>
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
      <PrintablePaper id="printable-marriage-certificate" className="font-serif">
        
        {/* Single Clean Certificate Border Frame */}
        <div className="border-2 border-slate-900 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-white text-slate-900 flex-1 min-h-[960px] print:min-h-0 print:p-5">
          
          {/* Header (Registrar / Kazi Office) */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
              {registrar.logoUrl && (
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-slate-900 overflow-hidden p-1">
                    <img src={registrar.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
                {registrar.officeName || 'OFFICE OF THE MARRIAGE REGISTRAR & KAZI'}
              </h1>
              
              {registrar.officeSubtitle && (
                <p className="text-[11px] font-semibold text-slate-700 font-sans tracking-wide">
                  {registrar.officeSubtitle}
                </p>
              )}

              <p className="text-[10px] text-slate-600 font-sans">
                {registrar.officeAddress} {registrar.jurisdiction && ` | Jurisdiction: ${registrar.jurisdiction}`}
              </p>
              
              {registrar.govLicenseNo && (
                <p className="text-[9px] text-slate-500 font-sans font-mono">
                  Govt. Registration / License No: {registrar.govLicenseNo}
                </p>
              )}
            </div>

            {/* Memo & Volume Info Row */}
            <div className="grid grid-cols-3 text-[11px] font-bold font-sans text-slate-800 border-b border-slate-300 pb-1.5">
              <div>Ref / Memo: <span className="font-mono underline">{memoNo}</span></div>
              <div className="text-center font-mono">Reg Vol: {volumeNo} ({pageNo})</div>
              <div className="text-right">Issue Date: <span className="font-mono underline">{formatToDdMmYyyy(issueDate)}</span></div>
            </div>

            {/* Certificate Title Badge */}
            <div className="text-center my-1">
              <div className="inline-block border-2 border-slate-900 px-6 py-1 rounded-xs bg-slate-50 shadow-2xs">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-slate-900 font-sans">
                  {certificateTitle || 'MARRIAGE CERTIFICATE'}
                </h2>
              </div>
              {certificateSubtitle && (
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-sans mt-0.5">
                  {certificateSubtitle}
                </p>
              )}
            </div>

            {/* Groom & Bride Comparative Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              
              {/* Groom Box */}
              <div className="border border-slate-800 rounded p-3 bg-slate-50/70 space-y-1.5">
                <div className="border-b border-slate-700 pb-1 flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-slate-900 text-xs">
                    👨 GROOM (বরের বিবরণ)
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">{groom.religion || 'Islam'}</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Full Name:</span>
                    <strong className="text-slate-900 uppercase font-bold text-xs">{groom.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Father's Name:</span>
                    <strong className="text-slate-900 uppercase">{groom.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Mother's Name:</span>
                    <strong className="text-slate-900 uppercase">{groom.motherName}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Passport No:</span>
                      <strong className="font-mono text-slate-900 uppercase">{groom.passportNo || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Date of Birth:</span>
                      <strong className="font-mono text-slate-900">{formatToDdMmYyyy(groom.birthDate)}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Address:</span>
                    <span className="text-[10px] text-slate-800 leading-tight block">{groom.address}</span>
                  </div>
                </div>
              </div>

              {/* Bride Box */}
              <div className="border border-slate-800 rounded p-3 bg-slate-50/70 space-y-1.5">
                <div className="border-b border-slate-700 pb-1 flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-slate-900 text-xs">
                    👰 BRIDE (কনের বিবরণ)
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">{bride.religion || 'Islam'}</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Full Name:</span>
                    <strong className="text-slate-900 uppercase font-bold text-xs">{bride.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Father's Name:</span>
                    <strong className="text-slate-900 uppercase">{bride.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Mother's Name:</span>
                    <strong className="text-slate-900 uppercase">{bride.motherName}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Passport No:</span>
                      <strong className="font-mono text-slate-900 uppercase">{bride.passportNo || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Date of Birth:</span>
                      <strong className="font-mono text-slate-900">{formatToDdMmYyyy(bride.birthDate)}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Address:</span>
                    <span className="text-[10px] text-slate-800 leading-tight block">{bride.address}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Marriage Terms & Solemnization Box */}
            <div className="p-3 bg-slate-100/70 border border-slate-300 rounded font-sans text-xs space-y-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Date of Marriage (বিবাহের তারিখ):</span>
                  <strong className="font-mono text-slate-900 text-xs block">{formatToDdMmYyyy(marriageDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Place of Solemnization (স্থান):</span>
                  <strong className="text-slate-900 text-xs block">{marriagePlace}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Dower / দেনমোহর:</span>
                  <strong className="font-mono text-slate-900 text-xs block">
                    ৳ {marriageTerms.dowerAmount} BDT {marriageTerms.dowerPaid && `(Paid: ৳ ${marriageTerms.dowerPaid})`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Wakil / উসিল:</span>
                  <strong className="text-slate-900 text-xs block">{marriageTerms.wakilName || 'N/A'}</strong>
                </div>
              </div>
              
              {(marriageTerms.witness1 || marriageTerms.witness2) && (
                <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-700 grid grid-cols-2 gap-2">
                  <div><strong>Witness 1:</strong> {marriageTerms.witness1}</div>
                  <div><strong>Witness 2:</strong> {marriageTerms.witness2}</div>
                </div>
              )}
            </div>

            {/* Official Declaration */}
            <div className="space-y-1.5 text-xs text-slate-900 leading-relaxed text-justify px-1 font-serif">
              <p className="indent-4">
                {declaration.statement || `This is to solemnly certify that the marriage between ${groom.name} and ${bride.name} was solemnized and duly registered in accordance with the law.`}
              </p>
              <p>
                {declaration.livingStatus || 'They have been living together peacefully as lawfully wedded husband and wife without any legal impediment or dispute.'}
              </p>
            </div>

            {/* Signatures & Seal Section */}
            <div className="pt-3 border-t-2 border-slate-900 mt-2 font-sans">
              <div className="grid grid-cols-3 gap-2 items-end text-center">
                
                {/* Groom & Bride Signatures */}
                <div className="text-left space-y-3">
                  <div className="border-t border-slate-700 pt-0.5">
                    <p className="text-[10px] font-bold uppercase text-slate-900">Signature of Groom (বর)</p>
                  </div>
                  <div className="border-t border-slate-700 pt-0.5">
                    <p className="text-[10px] font-bold uppercase text-slate-900">Signature of Bride (কনে)</p>
                  </div>
                </div>

                {/* Official Kazi Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-full flex flex-col items-center justify-center p-1 text-center text-slate-600">
                    <ShieldCheck className="w-5 h-5 text-slate-500 mb-0.5" />
                    <span className="text-[7px] font-black uppercase tracking-tight leading-none">
                      OFFICIAL MARRIAGE REGISTRAR SEAL
                    </span>
                  </div>
                </div>

                {/* Kazi / Registrar Signature */}
                <div className="text-right space-y-1">
                  <div className="h-8 flex items-end justify-end">
                    <span className="text-xs text-slate-400 font-serif italic mr-2">Official Registrar</span>
                  </div>
                  <div className="border-t border-slate-800 pt-0.5">
                    <p className="text-[11px] font-black uppercase text-slate-900">
                      {registrar.kaziName || 'MARRIAGE REGISTRAR & KAZI'}
                    </p>
                    <p className="text-[9px] text-slate-600">
                      Government Licensed Muslim Marriage Registrar
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
