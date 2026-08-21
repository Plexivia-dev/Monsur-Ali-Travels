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

  switch (activeSubmodule) {
    // ── Customer Profiles ──────────────────────────────────────
    case 'customer-profiles':
    case 'customer-add':
      return <CustomerDataTable />;

    // ── Agreement Records ──────────────────────────────────────
    case 'agreements':
    case 'agreement':
      return <AgreementDataTable />;

    // ── Customer Applications / Guardian Forms ─────────────────
    case 'customer-applications':
    case 'customer-guardians':
    case 'customer-forms':
    case 'customers':
      return <CustomerGuardianDataTable />;

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

    // ── Default / Fallback → Customer Profiles ─────────────────
    default:
      return <CustomerDataTable />;
  }
}
