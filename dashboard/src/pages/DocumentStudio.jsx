import React from 'react';
import { usePortal } from '../context/PortalContext';
import { EmploymentAgreement } from '../components/docs/agreement/EmploymentAgreement';
import { IdCard } from '../components/docs/idcard/IdCard';
import { SalarySlip } from '../components/docs/payroll/SalarySlip';
import { Invoice } from '../components/docs/invoice/Invoice';
import { PassportSubmission } from '../components/docs/passport/PassportSubmission';
import { IndianVisa } from '../components/docs/indian-visa/IndianVisa';
import { CustomerGuardian } from '../components/docs/customer-form/CustomerGuardian';

export default function DocumentStudio() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule || (activeSubmodule !== 'idcard' && activeSubmodule !== 'payroll' && activeSubmodule !== 'invoice' && activeSubmodule !== 'passport-sub' && activeSubmodule !== 'indian-visa' && activeSubmodule !== 'customer-form')) && (
        <EmploymentAgreement />
      )}
      {activeSubmodule === 'payroll' && <SalarySlip />}
      {activeSubmodule === 'invoice' && <Invoice />}
      {activeSubmodule === 'passport-sub' && <PassportSubmission />}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}
      {activeSubmodule === 'idcard' && <IdCard />}
      {activeSubmodule === 'customer-form' && <CustomerGuardian />}
    </div>
  );
}

