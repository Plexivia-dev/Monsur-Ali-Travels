import React from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { ClientDataTable } from '@client/components/data/ClientDataTable';
import { AgreementDataTable } from '@client/components/data/AgreementDataTable';
import { IndianVisaDataTable } from '@client/components/data/IndianVisaDataTable';
import { PassportSubmissionDataTable } from '@client/components/data/PassportSubmissionDataTable';
import { SalarySlipDataTable } from '@client/components/data/SalarySlipDataTable';
import { InvoiceDataTable } from '@client/components/data/InvoiceDataTable';
import { ClientGuardianDataTable } from '@client/components/data/ClientGuardianDataTable';
import { MoneyReceiptDataTable } from '@client/components/data/MoneyReceiptDataTable';
import { CashVoucherDataTable } from '@client/components/data/CashVoucherDataTable';
import { JobVerificationDataTable } from '@client/components/data/JobVerificationDataTable';
import { MarriageCertificateDataTable } from '@client/components/data/MarriageCertificateDataTable';
import { CharacterCertificateDataTable } from '@client/components/data/CharacterCertificateDataTable';

export function DocumentDataPage() {
  const params = useParams();
  const location = useLocation();

  let activeSubmodule = params.submodule;
  if (!activeSubmodule && location.pathname.includes('/data/')) {
    activeSubmodule = location.pathname.split('/data/')[1]?.split('/')[0];
  }

  // Determine user role
  let userRole = '';
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userRole = String(parsed.role || parsed.subRole || parsed.sub_role || parsed.designation || '').toLowerCase();
    }
  } catch (_) {}

  const isAccountant = userRole.includes('account');

  // If user is an Accountant, restrict to financial document records only
  if (isAccountant) {
    switch (activeSubmodule) {
      case 'invoices':
      case 'invoice':
        return <InvoiceDataTable />;

      case 'money-receipts':
      case 'receipts':
      case 'tokens':
        return <MoneyReceiptDataTable />;

      case 'cash-vouchers':
      case 'cash-voucher':
      case 'vouchers':
      case 'voucher':
        return <CashVoucherDataTable />;

      case 'salary-slips':
      case 'payrolls':
      case 'payroll':
      default:
        return <SalarySlipDataTable />;
    }
  }

  switch (activeSubmodule) {
    case 'agreements':
    case 'agreement':
    case 'agreement-records':
      return <AgreementDataTable />;

    case 'client-applications':
    case 'client-guardians':
    case 'client-forms':
    case 'applications':
    case 'clients':
      return <ClientGuardianDataTable />;

    case 'indian-visas':
    case 'indian-visa':
      return <IndianVisaDataTable />;

    case 'passports':
    case 'passport-sub':
    case 'passport':
      return <PassportSubmissionDataTable />;

    case 'salary-slips':
    case 'payrolls':
    case 'payroll':
    case 'salaries':
      return <SalarySlipDataTable />;

    case 'invoices':
    case 'invoice':
      return <InvoiceDataTable />;

    case 'money-receipts':
    case 'receipts':
    case 'tokens':
      return <MoneyReceiptDataTable />;

    case 'cash-vouchers':
    case 'cash-voucher':
    case 'vouchers':
    case 'voucher':
      return <CashVoucherDataTable />;

    case 'job-verifications':
    case 'job-verification':
    case 'job-verify':
      return <JobVerificationDataTable />;

    case 'marriage-certificates':
    case 'marriage-certificate':
    case 'marriage':
      return <MarriageCertificateDataTable />;

    case 'character-certificates':
    case 'character-certificate':
    case 'character':
      return <CharacterCertificateDataTable />;

    case 'client-profiles':
      return <ClientDataTable />;

    default:
      return <Navigate to="/admin/data/salary-slips" replace />;
  }
}

export default DocumentDataPage;
