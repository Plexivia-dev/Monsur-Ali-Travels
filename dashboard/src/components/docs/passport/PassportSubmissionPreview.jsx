import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { ShieldCheck, CheckCircle2, XCircle, PhoneCall, Mail, UserCheck, FileCheck } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

export function PassportSubmissionPreview({ data, onPrint }) {
  const {
    trackingNo,
    submissionDate,
    agencyInfo = {},
    applicantName,
    nidBirthCertNo,
    previousPassportNo,
    applicantPhone,
    applicantEmail,
    address,
    guardianName,
    guardianPhone,
    relationship,
    passportType,
    applicationCategory,
    pageCount,
    validityYears,
    deliverySpeed,
    documentsProvided = {},
    remarks,
  } = data;

  const checklistItems = [
    { id: 'nidCopy', label: 'জাতীয় পরিচয়পত্র (NID) কপি / অনলাইন কপি' },
    { id: 'birthCertOnline', label: '১৭ ডিজিটের অনলাইন জন্ম সনদ (Birth Cert)' },
    { id: 'oldPassportOriginal', label: 'মূল পুরাতন পাসপোর্ট (Original Old Passport)' },
    { id: 'photoLabPrint', label: 'পাসপোর্ট সাইজ ল্যাব ছবি (Photo 2x2)' },
    { id: 'guardianNidCopy', label: 'অভিভাবকের NID ফটোকপি (Guardian NID)' },
    { id: 'utilityBillCopy', label: 'ইউটিলিটি বিলের কপি (Utility Bill Copy)' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <PrintablePaper id="printable-passport-canvas">
        <div className="border-2 border-slate-900 p-6 flex flex-col justify-between bg-white text-slate-900 font-sans print:p-0 print:border-0 space-y-6">
          
          {/* Header Section */}
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-sm shrink-0 overflow-hidden">
                  <img src={logoImg} alt="Monsur Ali Travels Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {agencyInfo.name || 'MONSUR ALI TRAVELS'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Government Approved Overseas Manpower & Passport Processing Agency
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    License No: {agencyInfo.licenseNo || 'RL-1842'} | Office: {agencyInfo.address || 'Sunamganj, Sylhet, Bangladesh'} | Cell: {agencyInfo.phone || '+8801345579534'}
                  </p>
                </div>
              </div>
              
              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="font-bold text-slate-900">Ref #: <span className="text-emerald-700">{trackingNo || 'PASS-0000'}</span></div>
                <div className="text-slate-600 text-[11px]">Date: {submissionDate || 'N/A'}</div>
              </div>
            </div>

            {/* Title Banner */}
            <div className="bg-slate-900 text-white py-2 px-4 rounded-md text-center shadow-sm mb-4">
              <h2 className="text-base font-extrabold tracking-wider uppercase flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                PASSPORT SUBMISSION & APPLICATION ACKNOWLEDGEMENT
              </h2>
              <p className="text-[11px] font-semibold text-emerald-300">
                পাসপোর্ট জমা ও আবেদনের তথ্য রসিদ
              </p>
            </div>

            {/* SECTION 1: APPLICANT INFORMATION */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                <UserCheck className="w-4 h-4 text-slate-900 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ১. আবেদনকারীর ব্যক্তিগত তথ্যাবলী (Applicant Details)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">আবেদনকারীর নাম</span>
                  <span className="font-bold text-sm text-slate-900">{applicantName || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NID / জন্ম সনদ নম্বর</span>
                  <span className="font-mono font-bold text-slate-900">{nidBirthCertNo || '—'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">পূর্ববর্তী পাসপোর্ট নম্বর</span>
                  <span className="font-mono font-semibold text-slate-900">{previousPassportNo || 'নাই (N/A)'}</span>
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

            {/* SECTION 2: GUARDIAN & SPECIFICATIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              
              {/* Guardian Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                    ২. অভিভাবকের তথ্য (Guardian)
                  </h3>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-300 text-xs space-y-1">
                  <div><strong className="text-slate-600">নাম:</strong> <span className="font-bold">{guardianName || '—'}</span></div>
                  <div><strong className="text-slate-600">সম্পর্ক:</strong> <span>{relationship || 'পিতা'}</span></div>
                  <div><strong className="text-slate-600">ফোন:</strong> <span className="font-mono font-semibold">{guardianPhone || '—'}</span></div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1">
                  <FileCheck className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                    ৩. পাসপোর্ট ক্যাটাগরি (Specifications)
                  </h3>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-300 text-xs space-y-1">
                  <div><strong className="text-slate-600">ধরন:</strong> <span className="font-bold">{passportType}</span></div>
                  <div><strong className="text-slate-600">ক্যাটাগরি:</strong> <span>{applicationCategory}</span></div>
                  <div><strong className="text-slate-600">পৃষ্ঠা ও মেয়াদ:</strong> <span>{pageCount} | {validityYears}</span></div>
                  <div><strong className="text-slate-600">ডেলিভারি:</strong> <span className="font-bold text-emerald-700">{deliverySpeed}</span></div>
                </div>
              </div>

            </div>

            {/* SECTION 3: CHECKLIST OF RECEIVED DOCUMENTS */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ৪. জমাকৃত ফাইল ও ডকুমেন্টস চেকলিস্ট (Submitted Files Checklist)
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
              <div className="p-2.5 border border-slate-300 bg-slate-50 rounded text-xs mb-4">
                <span className="font-bold text-slate-700 block text-[11px] uppercase">মন্তব্য / নোট (Remarks):</span>
                <p className="text-slate-800 mt-0.5">{remarks}</p>
              </div>
            )}

          </div>

          {/* Footer Signatures */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-6 items-end text-xs">
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-mono">
                [ এজেন্সির সিল ]
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">অফিসিয়াল সিল / Stamp</div>
            </div>

            <div className="text-center space-y-1">
              <div className="border-b-2 border-slate-900 w-44 mx-auto mb-1"></div>
              <div className="font-bold text-xs text-slate-900">{agencyInfo.name || 'MONSUR ALI TRAVELS'}</div>
              <div className="text-slate-600 text-[10px]">অনুমোদিত প্রসেসিং কর্মকর্তা</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
