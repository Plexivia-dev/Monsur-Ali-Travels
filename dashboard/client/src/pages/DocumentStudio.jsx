import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { EmploymentAgreement } from '../components/docs/agreement/EmploymentAgreement';
import { IdCard } from '../components/docs/idcard/IdCard';
import { SalarySlip } from '../components/docs/payroll/SalarySlip';
import { Invoice } from '../components/docs/invoice/Invoice';
import { PassportSubmission } from '../components/docs/passport/PassportSubmission';
import { IndianVisa } from '../components/docs/indian-visa/IndianVisa';
import { CustomerGuardian } from '../components/docs/customer-form/CustomerGuardian';
import { MoneyReceipt } from '../components/docs/receipt/MoneyReceipt';
import { CashVoucher } from '../components/docs/cash-voucher/CashVoucher';
import { ExperienceCertificate } from '../components/docs/certificate-experience/ExperienceCertificate';
import { CharacterCertificate } from '../components/docs/certificate-character/CharacterCertificate';
import { MarriageCertificate } from '../components/docs/certificate-marriage/MarriageCertificate';

export default function DocumentStudio() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);

  return (
    <div className="space-y-5">
      {/* Default to agreement if no valid submodule is set */}
      {(!activeSubmodule ||
        activeSubmodule === 'agreement' ||
        (activeSubmodule !== 'idcard' &&
          activeSubmodule !== 'payroll' &&
          activeSubmodule !== 'invoice' &&
          activeSubmodule !== 'money-receipt' &&
          activeSubmodule !== 'receipt' &&
          activeSubmodule !== 'cash-voucher' &&
          activeSubmodule !== 'passport-sub' &&
          activeSubmodule !== 'indian-visa' &&
          activeSubmodule !== 'customer-form' &&
          activeSubmodule !== 'experience-certificate' &&
          activeSubmodule !== 'certificate-exp' &&
          activeSubmodule !== 'character-certificate' &&
          activeSubmodule !== 'certificate-char' &&
          activeSubmodule !== 'marriage-certificate' &&
          activeSubmodule !== 'certificate-marr')) && <EmploymentAgreement />}

      {activeSubmodule === 'payroll' && <SalarySlip />}
      {activeSubmodule === 'invoice' && <Invoice />}
      {(activeSubmodule === 'money-receipt' || activeSubmodule === 'receipt') && <MoneyReceipt />}
      {activeSubmodule === 'cash-voucher' && <CashVoucher />}
      {activeSubmodule === 'passport-sub' && <PassportSubmission />}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}
      {activeSubmodule === 'idcard' && <IdCard />}
      {activeSubmodule === 'customer-form' && <CustomerGuardian />}

      {/* New Certificates */}
      {(activeSubmodule === 'experience-certificate' || activeSubmodule === 'certificate-exp') && (
        <ExperienceCertificate />
      )}
      {(activeSubmodule === 'character-certificate' || activeSubmodule === 'certificate-char') && (
        <CharacterCertificate />
      )}
      {(activeSubmodule === 'marriage-certificate' || activeSubmodule === 'certificate-marr') && (
        <MarriageCertificate />
      )}
    </div>
  );
}
