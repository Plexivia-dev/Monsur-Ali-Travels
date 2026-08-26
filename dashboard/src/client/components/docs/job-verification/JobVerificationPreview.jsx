import React from 'react';
import logoImg from '@shared/assets/logo.png';
import infoData from '@shared/lib/information.json';
import { formatToDdMmYyyy } from '@shared/lib/utils';
import { QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function JobVerificationPreview({ data }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const company = data.companyInfo || {};
  const client = data.clientInfo || {};
  const job = data.jobStayDetails || {};
  const helper = data.helperInfo || {};
  const verification = data.verificationDetails || {};

  return (
    <div
      id="job-verification-canvas"
      className="printable-a4-paper w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 print:p-6 flex flex-col justify-between font-sans shadow-xl border border-slate-300 relative rounded-none print:shadow-none print:border-0 print:m-0"
      style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif" }}
    >
      <div>
        {/* Top Header & Branding */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xs bg-white border border-slate-900 p-1 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={logoImg}
                alt="Monsur Ali Travels Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-[900] uppercase tracking-tight text-slate-900 leading-tight">
                {company.companyName || infoData.agencyName || 'MONSUR ALI TOURS & TRAVELS'}
              </h1>
              <p className="text-[10px] font-bold text-slate-700 tracking-wide">
                {infoData.tagline || 'Govt. Approved Overseas Employment & Immigration Consultancy'}
              </p>
              <p className="text-[9.5px] text-slate-600 font-medium">
                Head Office: {company.companyAddress || infoData.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
              <p className="text-[9px] text-slate-500 font-mono">
                Phone: {company.companyPhone || infoData.phone || '+8801345579534'} | Email: {company.companyEmail || infoData.email || 'contact@monsuralitravels.com'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[10.5px] flex flex-col items-end">
            <div className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded-xs text-[11px] tracking-wider mb-1">
              {data.verificationId || 'JVF-OFFICIAL'}
            </div>
            <div className="text-slate-700 font-semibold">
              Date: {formatToDdMmYyyy(verification.issueDate) || currentDate}
            </div>
            <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED DOCUMENT</span>
            </div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-[#0b2341] text-white py-2 px-4 rounded-xs text-center mb-4 shadow-2xs">
          <h2 className="text-sm font-[900] tracking-[1.5px] uppercase">
            COMPANY, CLIENT &amp; JOB VERIFICATION DETAILS FORM
          </h2>
          <p className="text-[9.5px] font-medium text-amber-400 tracking-wide mt-0.5">
            Official Overseas Employment, Workplace &amp; Stay Verification Protocol
          </p>
        </div>

        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="border border-slate-400 rounded-xs mb-3.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-3 py-1 text-[10.5px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>1. Company Information</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">SECTION A</span>
          </div>
          <div className="p-3 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1.5 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Company Name:</span>
              <span className="font-bold text-slate-900">{company.companyName || 'MONSUR ALI TOURS & TRAVELS'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Mobile / Phone:</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyPhone || '+8801345579534'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Email Address:</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyEmail || 'contact@monsuralitravels.com'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Tax / VAT Number:</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyTaxNumber || 'VAT-88492048-BD'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">ID / License Number:</span>
              <span className="font-bold text-slate-900 font-mono">{company.companyIdNumber || 'RL-1849 / GOVT-REG'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">City / District:</span>
              <span className="font-bold text-slate-900">{company.companyCity || 'Sunamganj'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">Office Address:</span>
              <span className="font-bold text-slate-900 text-right">{company.companyAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CLIENT INFORMATION */}
        <div className="border border-slate-400 rounded-xs mb-3.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-3 py-1 text-[10.5px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>2. Client Information</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">SECTION B</span>
          </div>
          <div className="p-3 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1.5 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Client Full Name:</span>
              <span className="font-bold text-slate-900 uppercase">{client.clientName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Mobile Number:</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Email Address:</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientEmail || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Tax Number:</span>
              <span className="font-bold text-slate-900 font-mono">{client.clientTaxNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">ID / Passport Number:</span>
              <span className="font-bold text-slate-900 font-mono uppercase">{client.clientIdNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">City / District:</span>
              <span className="font-bold text-slate-900">{client.clientCity || 'N/A'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">Present Address:</span>
              <span className="font-bold text-slate-900 text-right">{client.clientAddress || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: JOB & STAY DETAILS */}
        <div className="border border-slate-400 rounded-xs mb-3.5 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-3 py-1 text-[10.5px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>3. Job Specifications &amp; Overseas Stay Details</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">SECTION C</span>
          </div>
          <div className="p-3 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1.5 bg-white">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Destination Region:</span>
              <span className="font-bold text-slate-900">{job.destinationPlace || 'Europe / Overseas'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Destination Country:</span>
              <span className="font-bold text-slate-900 text-blue-900 uppercase">{job.destinationCountry || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Destination City:</span>
              <span className="font-bold text-slate-900">{job.destinationCity || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Accommodation Type:</span>
              <span className="font-bold text-slate-900">{job.accommodationType || 'Company Provided'}</span>
            </div>
            <div className="col-span-2 flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Residence / Stay Address:</span>
              <span className="font-bold text-slate-900 text-right">{job.residenceAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Job Nature / Sector:</span>
              <span className="font-bold text-slate-900">{job.jobNature || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Job Title / Designation:</span>
              <span className="font-bold text-slate-900">{job.jobTitle || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Daily Working Hours:</span>
              <span className="font-bold text-slate-900 font-mono">{job.dailyWorkingHours || '8 Hours'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Weekly Working Hours:</span>
              <span className="font-bold text-slate-900 font-mono">{job.weeklyWorkingHours || '48 Hours'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5 bg-emerald-50/60 p-1 rounded-xs">
              <span className="font-bold text-emerald-950">Agreed Salary / Remuneration:</span>
              <span className="font-black text-emerald-900 font-mono text-[11px]">
                {job.salaryAmount ? `${job.salaryAmount} ${job.currency || 'EUR'} / Month` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: WORK PERMIT & HELPER INFO */}
        <div className="border border-slate-400 rounded-xs mb-4 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-400 px-3 py-1 text-[10.5px] font-[900] text-[#0b2341] uppercase tracking-wide flex items-center justify-between">
            <span>4. Work Permit &amp; Helper / Sponsor Information</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">SECTION D</span>
          </div>
          <div className="p-3 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1.5 bg-white">
            <div className="col-span-2 flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Who Provided Work Permit &amp; Assisted?:</span>
              <span className="font-bold text-slate-900 uppercase">{helper.helperName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Relationship:</span>
              <span className="font-bold text-slate-900">{helper.helperRelationship || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Duration of Stay Abroad:</span>
              <span className="font-bold text-slate-900 font-mono">{helper.helperDurationOfStay || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Helper's Legal / Entry Status:</span>
              <span className="font-bold text-slate-900">{helper.helperImmigrationStatus || 'Legal Resident'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Personally Known?:</span>
              <span className="font-bold text-slate-900">
                {helper.knowsHelper === 'Yes' ? '[ ✔ ] Yes    [  ] No' : '[  ] Yes    [ ✔ ] No'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Duration Known:</span>
              <span className="font-bold text-slate-900">{helper.durationKnown || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-semibold text-slate-600">Helper's Date of Birth:</span>
              <span className="font-bold text-slate-900 font-mono">{formatToDdMmYyyy(helper.helperDob) || 'N/A'}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-0.5">
              <span className="font-semibold text-slate-600">Helper's Contact / Mobile Number:</span>
              <span className="font-bold text-slate-900 font-mono">{helper.helperPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: SIGNATURES & OFFICIAL SEAL */}
      <div className="pt-2">
        <div className="border-t-2 border-slate-900 pt-3">
          <p className="text-[8.5px] text-slate-500 text-center mb-6 leading-tight">
            I hereby declare that all the information provided above regarding the company, client profile, overseas job offer, and sponsor credentials is true, complete, and correct to the best of my knowledge and belief.
          </p>

          <div className="grid grid-cols-2 gap-12 text-center text-[10px]">
            {/* Client Signature */}
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-mono text-[11px] text-slate-700 italic">
                  {client.clientName || 'Applicant Signature'}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900 uppercase">
                Client's Signature &amp; Date
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Date: {formatToDdMmYyyy(verification.clientSignatureDate) || currentDate}
              </div>
            </div>

            {/* Authorized Company Signature */}
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-mono text-[11px] text-slate-900 font-bold">
                  {verification.authorizedSignatory || 'Managing Director'}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900 uppercase">
                Authorized Company Signature &amp; Seal
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {company.companyName || 'MONSUR ALI TOURS & TRAVELS'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-mono">
          <span>Verification Code: {data.verificationId || 'JVF-VERIFIED'}</span>
          <span>System Generated Official Document | Monsur Ali Travels ERP</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
