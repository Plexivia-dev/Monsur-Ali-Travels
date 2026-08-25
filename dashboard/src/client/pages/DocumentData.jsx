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

export default function DocumentData() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  switch (activeSubmodule) {
    // ── Client Profiles ──────────────────────────────────────
    case 'client-profiles':
    case 'client-add':
    case 'client-profiles':
    case 'client-add':
    case 'clients-all':
      return <ClientDataTable />;

    // ── Agreement Records ──────────────────────────────────────
    case 'agreements':
    case 'agreement':
    case 'agreement-records':
      return <AgreementDataTable />;

    // ── Client Applications / Guardian Forms ─────────────────
    case 'client-applications':
    case 'client-guardians':
    case 'client-forms':
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

    // ── Default / Fallback → Client Profiles ─────────────────
    default:
      return <ClientDataTable />;
  }
}
