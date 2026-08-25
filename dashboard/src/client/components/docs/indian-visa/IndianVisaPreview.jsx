import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { FileCheck, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import logoImg from '../../../assets/logo.png';
import { formatToDdMmYyyy } from '../../../lib/utils';

export function IndianVisaPreview({ data, onPrint }) {
  const {
    trackingNo,
    submissionDate,
    agencyInfo = {},
    applicantName,
    passportNo,
    nidBirthCertNo,
    applicantPhone,
    applicantEmail,
    address,
    visaType,
    entryPort,
    durationMonths,
    entryType,
    documentsProvided = {},
    remarks,
  } = data;

  const checklistItems = [
    { id: 'passportOriginal', label: 'মূল পাসপোর্ট (Original Passport)' },
    { id: 'nidCopy', label: 'জাতীয় পরিচয়পত্র (NID) / জন্ম সনদ কপি' },
    { id: 'photoLabPrint', label: '২x২ ইঞ্চি ল্যাব প্রিন্ট ছবি (2x2 Photo)' },
    { id: 'bankSolvency', label: 'ব্যাংক স্টেটমেন্ট / ডলার এনডোর্সমেন্ট' },
    { id: 'utilityBillCopy', label: 'ইউটিলিটি বিলের কপি (Utility Bill)' },
    { id: 'previousVisaCopy', label: 'পূর্ববর্তী ইন্ডিয়ান ভিসা কপি (Old Visa)' },
    { id: 'nocTradeLicense', label: 'NOC / ট্রেড লাইসেন্স / স্টুডেন্ট কার্ড' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <PrintablePaper id="printable-indian-visa-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 min-h-[960px] print:min-h-0 print:h-auto">
          
          <div className="space-y-4 flex-1">
            {/* Header Section */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-sm shrink-0 overflow-hidden">
                  <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {agencyInfo.name || 'MONSUR ALI TRAVELS'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {agencyInfo.tagline || 'Your Trusted Travel Partner'}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    Office: {agencyInfo.address || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'} | Cell: {agencyInfo.phone || '+8801345579534'}
                  </p>
                </div>
              </div>
              
              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="font-bold text-slate-900">Ref #: <span className="text-emerald-700">{trackingNo || 'IVISA-0000'}</span></div>
                <div className="text-slate-600 text-[11px]">Date: {formatToDdMmYyyy(submissionDate) || 'N/A'}</div>
              </div>
            </div>

            {/* Title Banner */}
            <div className="bg-slate-900 text-white py-2 px-4 rounded-md text-center shadow-sm">
              <h2 className="text-base font-extrabold tracking-wider uppercase flex items-center justify-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                INDIAN VISA APPLICATION ACKNOWLEDGEMENT
              </h2>
              <p className="text-[11px] font-semibold text-emerald-300">
                ইন্ডিয়ান ভিসা জমা ও আবেদনের তথ্য রসিদ
              </p>
            </div>

            {/* SECTION 1: APPLICANT INFORMATION */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                <UserCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ১. আবেদনকারীর তথ্যাবলী (Applicant Details)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">আবেদনকারীর নাম</span>
                  <span className="font-bold text-sm text-slate-900">{applicantName || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">পাসপোর্ট নম্বর (Passport No.)</span>
                  <span className="font-mono font-bold text-sm text-emerald-800">{passportNo || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NID / জন্ম সনদ নম্বর</span>
                  <span className="font-mono font-bold text-slate-900">{nidBirthCertNo || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">মোবাইল নম্বর (Phone)</span>
                  <span className="font-mono font-bold text-slate-900">{applicantPhone || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">ইমেইল অ্যাড্রেস</span>
                  <span className="font-semibold text-slate-800">{applicantEmail || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">ঠিকানা (Address)</span>
                  <span className="font-medium text-slate-800">{address || '—'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: VISA SPECIFICATIONS */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                <FileCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ২. ভিসা ক্যাটাগরি ও পোর্ট স্পেসিফিকেশন (Visa Details)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300">
                <div><strong className="text-slate-600">ভিসার ধরন:</strong> <span className="font-bold text-slate-900">{visaType}</span></div>
                <div><strong className="text-slate-600">এন্ট্রি পোর্ট:</strong> <span className="font-bold text-slate-900">{entryPort}</span></div>
                <div><strong className="text-slate-600">মেয়াদের সময়কাল:</strong> <span>{durationMonths}</span></div>
                <div><strong className="text-slate-600">এন্ট্রি মোড:</strong> <span className="font-bold text-emerald-700">{entryType}</span></div>
              </div>
            </div>

            {/* SECTION 3: CHECKLIST OF RECEIVED DOCUMENTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ৩. জমাকৃত ফাইল ও ডকুমেন্টস চেকলিস্ট (Submitted Files Checklist)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border border-slate-900 rounded p-3 bg-white">
                {checklistItems.map(item => {
                  const isProvided = Boolean(documentsProvided[item.id]);
                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      {isProvided ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={`font-medium ${isProvided ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {remarks && (
              <div className="p-2.5 border border-slate-300 bg-slate-50 rounded text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase">মন্তব্য / নোট (Remarks):</span>
                <p className="text-slate-800 mt-0.5">{remarks}</p>
              </div>
            )}

          </div>

          {/* Footer Signatures Pushed to Bottom via mt-auto */}
          <div className="mt-auto pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs print:break-inside-avoid page-break-inside-avoid">
            <div className="flex flex-col items-center justify-center">
              <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-16 h-16 object-contain rounded-[4px]" />
            </div>

            <div className="text-center space-y-1">
              <div className="border-b-2 border-slate-900 w-44 mx-auto mb-1"></div>
              <div className="font-bold text-xs text-slate-900">{agencyInfo.name || 'MONSUR ALI TRAVELS'}</div>
              <div className="text-slate-600 text-[10px]">অনুমোদিত ভিসা প্রসেসিং কর্মকর্তা</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
