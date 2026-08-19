import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { CustomerDataTable } from '../components/data/CustomerDataTable';
import { AgreementDataTable } from '../components/data/AgreementDataTable';
import { IndianVisaDataTable } from '../components/data/IndianVisaDataTable';
import { PassportSubmissionDataTable } from '../components/data/PassportSubmissionDataTable';
import { SalarySlipDataTable } from '../components/data/SalarySlipDataTable';
import { InvoiceDataTable } from '../components/data/InvoiceDataTable';
import { CustomerGuardianDataTable } from '../components/data/CustomerGuardianDataTable';
import { MoneyReceiptDataTable } from '../components/data/MoneyReceiptDataTable';

export default function DocumentData() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  return (
    <div className="space-y-6">
      {(activeSubmodule === 'customer-profiles' || activeSubmodule === 'customer-add') && (
        <CustomerDataTable />
      )}
      {(activeSubmodule === 'agreements' || activeSubmodule === 'agreement' || activeSubmodule === 'dashboard') && (
        <AgreementDataTable />
      )}
      {(activeSubmodule === 'customer-guardians' || activeSubmodule === 'customer-forms' || activeSubmodule === 'customers' || activeSubmodule === 'customer-applications') && (
        <CustomerGuardianDataTable />
      )}
      {(activeSubmodule === 'indian-visas' || activeSubmodule === 'indian-visa') && (
        <IndianVisaDataTable />
      )}
      {(activeSubmodule === 'passports' || activeSubmodule === 'passport-sub') && (
        <PassportSubmissionDataTable />
      )}
      {(activeSubmodule === 'payrolls' || activeSubmodule === 'payroll' || activeSubmodule === 'salary-slips') && (
        <SalarySlipDataTable />
      )}
      {(activeSubmodule === 'invoices' || activeSubmodule === 'invoice') && (
        <InvoiceDataTable />
      )}
      {(activeSubmodule === 'receipts' || activeSubmodule === 'money-receipts' || activeSubmodule === 'tokens') && (
        <MoneyReceiptDataTable />
      )}
    </div>
  );
}
