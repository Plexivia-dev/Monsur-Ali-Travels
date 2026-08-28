import React from 'react';
import logoImg from '@shared/assets/logo.png';
import infoData from '@shared/lib/information.json';
import { formatToDdMmYyyy } from '@shared/lib/utils';
import { ShieldCheck } from 'lucide-react';

export function JobVerificationPreview({ data }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const company = data?.companyInfo || {};
  const client = data?.clientInfo || {};
  const job = data?.jobStayDetails || {};
  const helper = data?.helperInfo || {};
  const verification = data?.verificationDetails || {};

  return (
    <div
      id="job-verification-canvas"
      className="printable-a4-paper w-[210mm] max-w-full min-h-[296mm] bg-white text-slate-900 px-6 py-5 flex flex-col justify-between font-sans shadow-xl border border-slate-300 relative box-border print:shadow-none print:border-0 print:m-0 print:p-0"
      style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif" }}
    >
      <div className="w-full">
        {/* Top Header & Branding */}
        <div className="border-b-2 border-slate-900 pb-2.5 mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xs bg-white border border-slate-900 p-1 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={logoImg}
                alt="Monsur Ali Travels Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-[17px] font-[900] uppercase tracking-tight text-slate-900 leading-none mb-1">
                {company.companyName || infoData.agencyName || 'MONSUR ALI TOURS & TRAVELS'}
              </h1>
              <p className="text-[9.5px] font-bold text-slate-700 tracking-wide leading-tight">
                {infoData.tagline || 'Govt. Approved Overseas Employment & Immigration Consultancy'}
              </p>
              <p className="text-[9px] text-slate-600 font-medium leading-tight mt-0.5">
                Head Office: {company.companyAddress || infoData.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
              <p className="text-[8.5px] text-slate-500 font-mono leading-tight">
                Phone: {company.companyPhone || infoData.phone || '+8801345579534'} | Email: {company.companyEmail || infoData.email || 'contact@monsuralitravels.com'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[10px] flex flex-col items-end shrink-0">
            <div className="px-2 py-0.5 bg-slate-900 text-white font-bold rounded-xs text-[10.5px] tracking-wider mb-0.5">
              {data?.verificationId || 'JVF-OFFICIAL'}
            </div>
            <div className="text-slate-700 font-semibold text-[9.5px]">
              Date: {formatToDdMmYyyy(verification.issueDate) || currentDate}
            </div>
            <div className="text-[8.5px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>OFFICIAL VERIFICATION</span>
            </div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-[#0b2341] text-white py-1.5 px-3 rounded-xs text-center mb-3 shadow-2xs">
          <h2 className="text-[11.5px] font-[900] tracking-[1px] uppercase">
            কোম্পানি, ক্লায়েন্ট ও কাজের বিস্তারিত তথ্য ফরম
          </h2>
          <p className="text-[9.5px] font-semibold text-amber-400 tracking-wide mt-0.5 uppercase">
            Company, Client &amp; Job Verification Details Form
          </p>
        </div>

        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="border border-slate-400 rounded-xs mb-2.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-2.5 py-0.5 text-[10px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>১. কোম্পানির তথ্য (Company Information)</span>
            <span className="text-[8.5px] font-mono text-slate-500 font-bold">SECTION 1</span>
          </div>
          <div className="p-2 text-[9.5px] grid grid-cols-2 gap-x-4 gap-y-1 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কোম্পানির নাম (Company Name):</span>
              <span className="font-bold text-slate-900">{company.companyName || 'MONSUR ALI TOURS & TRAVELS'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">মোবাইল নাম্বার (Mobile Number):</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyPhone || '+8801345579534'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ইমেইল (Email):</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyEmail || 'contact@monsuralitravels.com'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ট্যাক্স নাম্বার (Tax Number):</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyTaxNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">আইডি নাম্বার (ID Number):</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyIdNumber || 'RL-1849'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">শহর (City):</span>
              <span className="font-bold text-slate-900">{company.companyCity || 'Sunamganj'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">ঠিকানা (Address):</span>
              <span className="font-bold text-slate-900 text-right">{company.companyAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CLIENT INFORMATION */}
        <div className="border border-slate-400 rounded-xs mb-2.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-2.5 py-0.5 text-[10px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>২. ক্লায়েন্টের তথ্য (Client Information)</span>
            <span className="text-[8.5px] font-mono text-slate-500 font-bold">SECTION 2</span>
          </div>
          <div className="p-2 text-[9.5px] grid grid-cols-2 gap-x-4 gap-y-1 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ক্লায়েন্টের নাম (Client Name):</span>
              <span className="font-bold text-slate-900 uppercase">{client.clientName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">মোবাইল নাম্বার (Mobile Number):</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ইমেইল (Email):</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientEmail || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ট্যাক্স নাম্বার (Tax Number):</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientTaxNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">আইডি নাম্বার (ID Number):</span>
              <span className="font-bold text-slate-900 font-mono uppercase">{client.clientIdNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">শহর (City):</span>
              <span className="font-bold text-slate-900">{client.clientCity || 'N/A'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">ঠিকানা (Address):</span>
              <span className="font-bold text-slate-900 text-right">{client.clientAddress || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: JOB & STAY DETAILS */}
        <div className="border border-slate-400 rounded-xs mb-2.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-2.5 py-0.5 text-[10px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>৩. কাজের বিবরণী ও আবাসন (Job &amp; Stay Details)</span>
            <span className="text-[8.5px] font-mono text-slate-500 font-bold">SECTION 3</span>
          </div>
          <div className="p-2 text-[9.5px] grid grid-cols-2 gap-x-4 gap-y-1 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কোথায় যাচ্ছেন? (Where are you going?):</span>
              <span className="font-bold text-slate-900">{job.destinationPlace || 'Europe / Overseas'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কোন দেশে যাচ্ছেন? (Destination Country):</span>
              <span className="font-bold text-blue-900 uppercase">{job.destinationCountry || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কোন শহরে যাচ্ছেন? (Destination City):</span>
              <span className="font-bold text-slate-900">{job.destinationCity || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কোথায় থাকবেন? / থাকার স্থান (Accommodation):</span>
              <span className="font-bold text-slate-900">{job.accommodationType || 'Company Provided'}</span>
            </div>
            <div className="col-span-2 flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">আপনি কোথায় থাকবেন তার অ্যাড্রেস? (Residence Address):</span>
              <span className="font-bold text-slate-900 text-right">{job.residenceAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কি কাজ করবেন? (Job Nature/Type):</span>
              <span className="font-bold text-slate-900">{job.jobNature || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">আপনার জব টাইটেল কি? (Job Title):</span>
              <span className="font-bold text-slate-900">{job.jobTitle || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">দৈনিক কত ঘণ্টা কাজ করবেন? (Daily Working Hours):</span>
              <span className="font-bold text-slate-900 font-mono">{job.dailyWorkingHours || '8 Hours'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">সপ্তাহে কত ঘণ্টা কাজ করবেন? (Weekly Working Hours):</span>
              <span className="font-bold text-slate-900 font-mono">{job.weeklyWorkingHours || '48 Hours'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5 bg-emerald-50/70 px-2 py-1 rounded-xs border border-emerald-200">
              <span className="font-bold text-emerald-950">আপনার বেতন কত? (Salary/Remuneration):</span>
              <span className="font-black text-emerald-900 font-mono text-[10.5px]">
                {job.salaryAmount ? `${job.salaryAmount} ${job.currency || 'EUR'} / Month` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: WORK PERMIT & HELPER INFO */}
        <div className="border border-slate-400 rounded-xs mb-3 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-2.5 py-0.5 text-[10px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>৪. ওয়ার্ক পারমিট ও সহায়তাকারীর বিবরণ (Work Permit &amp; Helper Info)</span>
            <span className="text-[8.5px] font-mono text-slate-500 font-bold">SECTION 4</span>
          </div>
          <div className="p-2 text-[9.5px] grid grid-cols-2 gap-x-4 gap-y-1 bg-white">
            <div className="col-span-2 flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">ওয়ার্ক পারমিট কে দিয়েছে ও সাহায্য করেছে? (Who Provided Work Permit?):</span>
              <span className="font-bold text-slate-900 uppercase">{helper.helperName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">সম্পর্ক/রিলেশনশিপ (Relationship, e.g. Uncle/চাচা/মামা):</span>
              <span className="font-bold text-slate-900">{helper.helperRelationship || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">সহায়তাকারী কতদিন ওই জায়গায় স্টে করতেছে? (Duration of Stay):</span>
              <span className="font-bold text-slate-900 font-mono">{helper.helperDurationOfStay || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">তিনি কিভাবে গেছেন? লিগ্যাল না ইল্লিগ্যাল? (Legal/Illegal Entry):</span>
              <span className="font-bold text-slate-900">{helper.helperImmigrationStatus || 'Legal Resident'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">তাকে আপনি চিনেন? (Do you know him?):</span>
              <span className="font-bold text-slate-900 font-mono">
                {helper.knowsHelper === 'Yes' ? '[ ✔ ] হ্যাঁ / Yes    [  ] না / No' : '[  ] হ্যাঁ / Yes    [ ✔ ] না / No'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">কতদিন ধরে তাকে চিনেন? (How long known?):</span>
              <span className="font-bold text-slate-900">{helper.durationKnown || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-0.5">
              <span className="font-semibold text-slate-600">সহায়তাকারীর জন্ম তারিখ (Helper's Date of Birth):</span>
              <span className="font-bold text-slate-900 font-mono">{formatToDdMmYyyy(helper.helperDob) || 'N/A'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">সহায়তাকারীর মোবাইল নাম্বার (Helper's Mobile Number):</span>
              <span className="font-bold text-slate-900 font-mono">{helper.helperPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: SIGNATURES & OFFICIAL SEAL */}
      <div className="w-full pt-1">
        <div className="border-t-2 border-slate-900 pt-2">
          <p className="text-[8px] text-slate-500 text-center mb-5 leading-tight">
            I hereby declare that all the information provided above regarding the company, client profile, overseas job offer, and sponsor credentials is true, complete, and correct to the best of my knowledge and belief.
          </p>

          <div className="grid grid-cols-2 gap-10 text-center text-[9.5px]">
            {/* Client Signature */}
            <div>
              <div className="h-8 flex items-end justify-center">
                <span className="font-mono text-[10.5px] text-slate-700 italic">
                  {client.clientName || 'Applicant Signature'}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                ক্লায়েন্টের স্বাক্ষর (Client's Signature)
              </div>
              <div className="text-[8.5px] text-slate-500 font-mono">
                Date: {formatToDdMmYyyy(verification.clientSignatureDate) || currentDate}
              </div>
            </div>

            {/* Authorized Company Signature */}
            <div>
              <div className="h-8 flex items-end justify-center">
                <span className="font-mono text-[10.5px] text-slate-900 font-bold">
                  {verification.authorizedSignatory || 'Managing Director'}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                কোম্পানি কর্তৃপক্ষের স্বাক্ষর (Authorized Signature)
              </div>
              <div className="text-[8.5px] text-slate-500 font-mono">
                {company.companyName || 'MONSUR ALI TOURS & TRAVELS'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-3 pt-1 border-t border-slate-200 flex items-center justify-between text-[7.5px] text-slate-400 font-mono">
          <span>Verification ID: {data?.verificationId || 'JVF-VERIFIED'}</span>
          <span>System Generated Official Document | Monsur Ali Travels ERP</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}

export default JobVerificationPreview;
