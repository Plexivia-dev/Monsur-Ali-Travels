import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, Award, ShieldCheck } from 'lucide-react';

export function CertificatePreview({ data, onPrint }) {
  const { memoNo, issueDate, language, candidate, conduct, authority } = data;

  const isBn = language === 'bn';

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Preview Bar (hidden during print) */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-foreground">Official Certificate Canvas</span>
          <span>•</span>
          <span className="text-[11px]">A4 Vector Print Ready</span>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate / PDF</span>
        </button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-certificate-canvas">
        
        {/* Double Border Frame for Official Look */}
        <div className="border-4 border-slate-900 p-6 sm:p-8 min-h-[1000px] flex flex-col justify-between relative bg-white">
          <div className="border-2 border-slate-700 p-6 sm:p-8 h-full flex flex-col justify-between space-y-8">
            
            {/* Header / Crest */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900">
                {authority.organizationName}
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                {authority.organizationSubtitle}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                {authority.officeAddress}
              </p>
            </div>

            {/* Memo & Date Row */}
            <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-800 border-b border-slate-300 pb-2">
              <div>স্মারক নং / Ref: <span className="underline">{memoNo}</span></div>
              <div>তারিখ / Date: <span className="underline">{issueDate}</span></div>
            </div>

            {/* Certificate Title */}
            <div className="text-center py-2">
              <div className="inline-block border-2 border-slate-900 px-8 py-2 rounded-md bg-slate-50">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900">
                  {isBn ? 'চারিত্রিক সনদপত্র' : 'CHARACTER CERTIFICATE'}
                </h2>
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-900 text-justify px-2 sm:px-4">
              {isBn ? (
                <>
                  <p>
                    এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{candidate.fullName}</strong>, 
                    পিতা: <strong>{candidate.fatherName}</strong>, 
                    মাতা: <strong>{candidate.motherName}</strong>, 
                    গ্রাম/মহল্লা: <strong>{candidate.village}</strong>, 
                    ডাকঘর: <strong>{candidate.postOffice}</strong>, 
                    উপজেলা/থানা: <strong>{candidate.upazila}</strong>, 
                    জেলা: <strong>{candidate.district}</strong>। 
                    {candidate.passportNo && <>পাসপোর্ট নম্বর: <strong className="font-mono">{candidate.passportNo}</strong>, </>}
                    {candidate.nidNo && <>জাতীয় পরিচয়পত্র নম্বর: <strong className="font-mono">{candidate.nidNo}</strong>।</>}
                  </p>

                  <p>
                    তিনি বিগত <strong>{conduct.durationYears}</strong> বছর যাবৎ আমার ব্যক্তিগতভাবে পরিচিত। {conduct.statementBn}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    This is to certify that <strong>{candidate.fullNameEn || candidate.fullName}</strong>, 
                    Son/Daughter of <strong>{candidate.fatherName}</strong> and <strong>{candidate.motherName}</strong>, 
                    resident of Village: <strong>{candidate.village}</strong>, Post Office: <strong>{candidate.postOffice}</strong>, 
                    Upazila: <strong>{candidate.upazila}</strong>, District: <strong>{candidate.district}</strong>. 
                    {candidate.passportNo && <>Passport No: <strong className="font-mono">{candidate.passportNo}</strong>, </>}
                    {candidate.nidNo && <>NID No: <strong className="font-mono">{candidate.nidNo}</strong>.</>}
                  </p>

                  <p>
                    He/She has been known to me for the last <strong>{conduct.durationYears}</strong> years. {conduct.statementEn}
                  </p>
                </>
              )}
            </div>

            {/* Seal & Signature Section */}
            <div className="pt-12 grid grid-cols-2 gap-8 items-end text-xs font-semibold text-slate-900">
              
              {/* Seal Placeholder */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  [ অফিশিয়াল সিল ]
                </div>
                <div className="text-[11px] text-slate-600">অফিসিয়াল সিল / Office Seal</div>
              </div>

              {/* Signature Line */}
              <div className="text-center space-y-1">
                <div className="border-b-2 border-slate-900 w-48 mx-auto mb-2"></div>
                <div className="font-bold text-sm">{authority.issuingPersonName}</div>
                <div className="text-slate-700">{authority.designation}</div>
                <div className="text-[11px] text-slate-600">{authority.organizationName}</div>
              </div>

            </div>

          </div>
        </div>

      </PrintablePaper>
    </div>
  );
}
