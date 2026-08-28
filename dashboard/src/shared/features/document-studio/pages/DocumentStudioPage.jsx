import React from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import { EmploymentAgreement } from '../components/agreement/EmploymentAgreement';
import { IdCard } from '../components/idcard/IdCard';
import { JobVerification } from '../components/job-verification/JobVerification';
import { SalarySlip } from '../components/payroll/SalarySlip';
import { Invoice } from '../components/invoice/Invoice';
import { PassportSubmission } from '../components/passport/PassportSubmission';
import { IndianVisa } from '../components/indian-visa/IndianVisa';
import { ClientGuardian } from '../components/client-form/ClientGuardian';
import { MoneyReceipt } from '../components/receipt/MoneyReceipt';
import { CashVoucher } from '../components/cash-voucher/CashVoucher';
import { ExperienceCertificate } from '../components/certificate-experience/ExperienceCertificate';
import { CharacterCertificate } from '../components/certificate-character/CharacterCertificate';
import { MarriageCertificate } from '../components/certificate-marriage/MarriageCertificate';

export function DocumentStudioPage({
  activeSubmodule: propSubmodule,
}) {
  const location = useLocation();
  const params = useParams();

  const routeGenerator = params.generator || params.submodule || null;

  // Resolve current active submodule
  let resolvedSubmodule = propSubmodule;
  if (resolvedSubmodule === undefined) {
    if (routeGenerator) {
      resolvedSubmodule = routeGenerator;
    } else if (location.pathname.includes('/docs/')) {
      const parts = location.pathname.split('/docs/').filter(Boolean);
      if (parts[1]) resolvedSubmodule = parts[1].split('/')[0];
    } else if (location.pathname.includes('/document-studio/')) {
      const parts = location.pathname.split('/document-studio/').filter(Boolean);
      if (parts[1]) resolvedSubmodule = parts[1].split('/')[0];
    }
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If no generator is specified, determine role-based default
  if (!resolvedSubmodule || resolvedSubmodule === 'overview' || resolvedSubmodule === 'studio' || resolvedSubmodule === 'all') {
    const defaultGen = isAccountant ? 'payroll' : 'agreement';
    const targetPath = isAdminRoute ? `/admin/docs/${defaultGen}` : `/dashboard/docs/${defaultGen}`;
    return <Navigate to={targetPath} replace />;
  }

  // Security guard for Accountant role on non-financial generators
  const nonFinancialGenerators = [
    'agreement',
    'client-form',
    'indian-visa',
    'passport-sub',
    'job-verification',
    'job-verify',
    'job-verification-form',
    'idcard',
    'experience-certificate',
    'certificate-exp',
    'exp-cert',
    'character-certificate',
    'certificate-char',
    'char-cert',
    'marriage-certificate',
    'certificate-marr',
    'marr-cert',
  ];

  if (isAccountant && nonFinancialGenerators.includes(resolvedSubmodule)) {
    const fallbackPath = isAdminRoute ? '/admin/docs/payroll' : '/dashboard/docs/payroll';
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="space-y-6">
      {resolvedSubmodule === 'agreement' && <EmploymentAgreement />}
      {resolvedSubmodule === 'client-form' && <ClientGuardian />}
      {resolvedSubmodule === 'indian-visa' && <IndianVisa />}
      {resolvedSubmodule === 'passport-sub' && <PassportSubmission />}
      {(resolvedSubmodule === 'job-verification' || resolvedSubmodule === 'job-verify' || resolvedSubmodule === 'job-verification-form') && (
        <JobVerification />
      )}
      {resolvedSubmodule === 'idcard' && <IdCard />}
      {(resolvedSubmodule === 'payroll' || resolvedSubmodule === 'salary-slip' || resolvedSubmodule === 'salary') && (
        <SalarySlip />
      )}
      {resolvedSubmodule === 'invoice' && <Invoice />}
      {(resolvedSubmodule === 'money-receipt' || resolvedSubmodule === 'receipt') && <MoneyReceipt />}
      {(resolvedSubmodule === 'cash-voucher' || resolvedSubmodule === 'cash-money-voucher') && <CashVoucher />}
      {(resolvedSubmodule === 'experience-certificate' || resolvedSubmodule === 'certificate-exp' || resolvedSubmodule === 'exp-cert') && (
        <ExperienceCertificate />
      )}
      {(resolvedSubmodule === 'character-certificate' || resolvedSubmodule === 'certificate-char' || resolvedSubmodule === 'char-cert') && (
        <CharacterCertificate />
      )}
      {(resolvedSubmodule === 'marriage-certificate' || resolvedSubmodule === 'certificate-marr' || resolvedSubmodule === 'marr-cert') && (
        <MarriageCertificate />
      )}
    </div>
  );
}

export default DocumentStudioPage;

