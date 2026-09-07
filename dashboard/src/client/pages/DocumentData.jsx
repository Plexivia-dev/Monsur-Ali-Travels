import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { ClientDataTable } from '../components/data/ClientDataTable';
import { AgreementDataTable } from '../components/data/AgreementDataTable';
import { IndianVisaDataTable } from '../components/data/IndianVisaDataTable';
import { PassportSubmissionDataTable } from '../components/data/PassportSubmissionDataTable';
import { SalarySlipDataTable } from '../components/data/SalarySlipDataTable';
import { InvoiceDataTable } from '../components/data/InvoiceDataTable';
import { ClientGuardianDataTable } from '../components/data/ClientGuardianDataTable';
import { MoneyReceiptDataTable } from '../components/data/MoneyReceiptDataTable';
import { CashVoucherDataTable } from '../components/data/CashVoucherDataTable';
import { JobVerificationDataTable } from '../components/data/JobVerificationDataTable';
import { MarriageCertificateDataTable } from '../components/data/MarriageCertificateDataTable';
import { CharacterCertificateDataTable } from '../components/data/CharacterCertificateDataTable';

export default function DocumentData() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

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

  // Standard/Admin view
  switch (activeSubmodule) {
    // ── Agreement Records ──────────────────────────────────────
    case 'agreements':
    case 'agreement':
    case 'agreement-records':
      return <AgreementDataTable />;

    // ── Client Applications / Guardian Forms ─────────────────
    case 'client-applications':
    case 'client-guardians':
    case 'client-forms':
    case 'clients':
      return <ClientGuardianDataTable />;

    // ── Indian Visa Records ────────────────────────────────────
    case 'indian-visas':
    case 'indian-visa':
      return <IndianVisaDataTable />;

    // ── Passport Submission Records ────────────────────────────
    case 'passports':
    case 'passport-sub':
      return <PassportSubmissionDataTable />;

    // ── Salary Slip / Payroll Records ──────────────────────────
    case 'salary-slips':
    case 'payrolls':
    case 'payroll':
      return <SalarySlipDataTable />;

    // ── Invoice & Billing Records ──────────────────────────────
    case 'invoices':
    case 'invoice':
      return <InvoiceDataTable />;

    // ── Money Receipts ─────────────────────────────────────────
    case 'money-receipts':
    case 'receipts':
    case 'tokens':
      return <MoneyReceiptDataTable />;

    // ── Cash Money Vouchers ────────────────────────────────────
    case 'cash-vouchers':
    case 'cash-voucher':
    case 'vouchers':
    case 'voucher':
      return <CashVoucherDataTable />;

    // ── Job & Stay Verification Forms ─────────────────────────
    case 'job-verifications':
    case 'job-verification':
    case 'job-verify':
      return <JobVerificationDataTable />;

    // ── Marriage Certificate Records ──────────────────────────
    case 'marriage-certificates':
    case 'marriage-certificate':
    case 'marriage':
      return <MarriageCertificateDataTable />;

    // ── Character Certificate Records ─────────────────────────
    case 'character-certificates':
    case 'character-certificate':
    case 'character':
      return <CharacterCertificateDataTable />;

    // ── Default / Fallback → Client Profiles ─────────────────
    default:
      return <ClientDataTable />;
  }
}
