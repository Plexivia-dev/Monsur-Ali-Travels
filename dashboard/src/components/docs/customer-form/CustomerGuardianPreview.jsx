import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { formatToDdMmYyyy } from '../../../lib/utils';
import { STATUS_OPTIONS } from './sampleData';

export function CustomerGuardianPreview({ data }) {
  const {
    applicationNo,
    dateReceived,
    verifiedBy,
    serviceType,
    status = 'received',
    customer = {},
    guardian = {},
    requirementDocuments = [],
    payment = {},
    officeNotes,
    declarationDate
  } = data;

  const currentStatusObj = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];

  return (
    <div className="w-full flex flex-col items-center select-none">
      <PrintablePaper id="printable-customer-form-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 font-sans min-h-[990px] print:min-h-0 print:h-auto">
          
          <div className="space-y-3.5">
            {/* Top Bar with Tracking & Service Type in preview */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 text-[11px] font-mono text-slate-600">
              <div>
                <span className="font-bold text-slate-900">Application #:</span>{' '}
                <span className="font-bold text-[#103058]">{applicationNo || 'CGA-000000'}</span>
              </div>
              <div className="font-semibold text-slate-800">
                Service: <span className="text-[#103058] font-bold">{serviceType || 'Indian Visa'}</span>
              </div>
              <div>
                Date: <span className="font-bold">{formatToDdMmYyyy(dateReceived) || '—'}</span>
              </div>
            </div>

            {/* Main Form Header */}
            <div className="text-center pt-1 pb-1">
              <h1 className="text-[19px] font-[900] uppercase tracking-wide text-slate-950 font-sans leading-tight">
                CUSTOMER &amp; GUARDIAN INFORMATION APPLICATION FORM
              </h1>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Please complete all applicable information accurately and submit the required supporting documents.
              </p>
            </div>

            {/* 1. CUSTOMER DETAILS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>1. CUSTOMER DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">APPLICANT INFORMATION</span>
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Full Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-bold text-[11.5px] text-slate-900 uppercase truncate">
                    {customer.fullName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    NID Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-mono font-bold text-[11.5px] text-slate-900">
                    {customer.nidNumber || ''}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Passport Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900 uppercase">
                    {customer.passportNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800 leading-tight">
                    Country previously applied to and rejected by:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 truncate">
                    {customer.countryRejected || 'N/A'}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Father Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {customer.fatherName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mother Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {customer.motherName || ''}
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mobile Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900">
                    {customer.mobileNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Email:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-medium text-[11px] text-slate-900 truncate">
                    {customer.email || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GUARDIAN DETAILS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>2. GUARDIAN DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">EMERGENCY &amp; LEGAL GUARDIAN</span>
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Guardian Full Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-bold text-[11.5px] text-slate-900 uppercase truncate">
                    {guardian.fullName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    NID Card Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-mono font-bold text-[11.5px] text-slate-900">
                    {guardian.nidNumber || ''}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Father Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {guardian.fatherName || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mother Name:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-semibold text-[11px] text-slate-900 uppercase truncate">
                    {guardian.motherName || ''}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Mobile Number:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-mono font-bold text-[11.5px] text-slate-900">
                    {guardian.mobileNumber || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Email:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-medium text-[11px] text-slate-900 truncate">
                    {guardian.email || ''}
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 min-h-[29px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Address:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center border-r border-slate-300 font-medium text-[10.5px] text-slate-900 leading-tight">
                    {guardian.address || ''}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1.5 flex items-center border-r border-slate-300 text-[11px] text-slate-800 leading-tight">
                    Relationship with Customer:
                  </div>
                  <div className="col-span-3 px-2.5 py-1.5 flex items-center font-bold text-[11.5px] text-slate-900">
                    {guardian.relationship || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CUSTOMER REQUIREMENT DOCUMENTS */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
                3. CUSTOMER REQUIREMENT DOCUMENTS
              </div>
              <div className="border border-slate-400 text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-[#d7e5f3] font-bold text-slate-900 border-b border-slate-400 min-h-[27px] items-center text-[11px]">
                  <div className="col-span-1 text-center border-r border-slate-300 py-1 font-bold">No.</div>
                  <div className="col-span-6 px-3 border-r border-slate-300 py-1 font-bold">Required Document</div>
                  <div className="col-span-2 text-center border-r border-slate-300 py-1 font-bold">Submitted</div>
                  <div className="col-span-3 px-3 py-1 font-bold">Remarks</div>
                </div>

                {/* Table Rows */}
                {requirementDocuments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className={`grid grid-cols-12 items-stretch min-h-[24px] text-[11px] ${
                      idx !== requirementDocuments.length - 1 ? 'border-b border-slate-300' : ''
                    } ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <div className="col-span-1 text-center font-medium border-r border-slate-300 py-0.5 flex items-center justify-center text-slate-700">
                      {doc.id || idx + 1}
                    </div>
                    <div className="col-span-6 px-3 border-r border-slate-300 py-0.5 flex items-center font-semibold text-slate-900">
                      {doc.name}
                    </div>
                    <div className="col-span-2 text-center border-r border-slate-300 py-0.5 flex items-center justify-center font-bold text-slate-900">
                      {doc.submitted || ''}
                    </div>
                    <div className="col-span-3 px-3 py-0.5 flex items-center text-slate-700 font-medium text-[10.5px]">
                      {doc.remarks || ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ADVANCE PAYMENT & RECEIPT SECTION */}
            <div className="space-y-0">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>4. SERVICE FEE &amp; ADVANCE PAYMENT DETAILS</span>
                <span className="text-[10px] font-mono opacity-90">PAYMENT ACKNOWLEDGEMENT</span>
              </div>
              <div className="border border-slate-400 text-xs bg-slate-50/30">
                <div className="grid grid-cols-12 border-b border-slate-300 min-h-[28px] items-stretch">
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Total Agreed Fee:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center border-r border-slate-300 font-bold font-mono text-[11.5px] text-slate-900">
                    ৳ {Number(payment.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-3 bg-emerald-50/80 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-emerald-900">
                    Advance Paid (অগ্রিম):
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center font-mono font-black text-[12px] text-emerald-700">
                    ৳ {Number(payment.advancePaid || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-[28px] items-stretch">
                  <div className="col-span-3 bg-rose-50/80 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-rose-900">
                    Due Amount (বকেয়া):
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center border-r border-slate-300 font-mono font-black text-[12px] text-rose-600">
                    ৳ {Number(payment.dueAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-3 bg-slate-50/70 font-semibold px-2.5 py-1 flex items-center border-r border-slate-300 text-[11px] text-slate-800">
                    Payment Method:
                  </div>
                  <div className="col-span-3 px-2.5 py-1 flex items-center font-medium text-[11px] text-slate-900">
                    {payment.paymentMethod || 'Cash'} {payment.receiptNo ? `(${payment.receiptNo})` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. DECLARATION */}
            <div className="space-y-1.5 pt-0.5">
              <div className="bg-[#103058] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider">
                5. DECLARATION
              </div>
              <p className="text-[10px] text-slate-800 leading-snug text-justify px-1">
                I hereby declare that the information provided in this application form is true, complete and correct to the best of my knowledge. I understand that the submitted documents may be verified for official processing and that any false or misleading information may affect the application.
              </p>

              {/* Signature Block */}
              <div className="grid grid-cols-3 gap-6 pt-5 pb-1 text-center text-[11px]">
                <div>
                  <p className="font-bold text-slate-900 mb-5">Customer Signature</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-5">Guardian Signature</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-5">Authorized Officer</p>
                  <div className="border-b border-slate-800 w-3/4 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-700">
                    Date: <span className="font-medium">{formatToDdMmYyyy(declarationDate) || '______________'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Office Use Only Bar */}
          <div className="pt-2 border-t border-slate-300 text-[10px] font-mono flex flex-wrap items-center justify-between text-slate-700">
            <div>
              <span className="font-bold uppercase text-slate-900">OFFICE USE ONLY</span> Application No.:{' '}
              <span className="font-bold text-slate-900">{applicationNo || '______________'}</span>
            </div>
            <div>
              Date Received:{' '}
              <span className="font-bold text-slate-900">{formatToDdMmYyyy(dateReceived) || '______________'}</span>
            </div>
            <div>
              Status:{' '}
              <span className="font-bold text-[#103058] uppercase">
                {currentStatusObj?.label?.split('(')[0] || 'RECEIVED'}
              </span>
            </div>
            <div>
              Verified By:{' '}
              <span className="font-bold text-slate-900">{verifiedBy || '______________'}</span>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
