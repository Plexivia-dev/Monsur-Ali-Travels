import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { EmploymentAgreement } from './agreement/EmploymentAgreement';
import { IdCard } from './idcard/IdCard';
import { SalarySlip } from './payroll/SalarySlip';
import { Invoice } from './invoice/Invoice';
import { PassportSubmission } from './passport/PassportSubmission';
import { IndianVisa } from './indian-visa/IndianVisa';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule || (activeSubmodule !== 'idcard' && activeSubmodule !== 'payroll' && activeSubmodule !== 'invoice' && activeSubmodule !== 'passport-sub' && activeSubmodule !== 'indian-visa')) && (
        <EmploymentAgreement />
      )}
      {activeSubmodule === 'payroll' && <SalarySlip />}
      {activeSubmodule === 'invoice' && <Invoice />}
      {activeSubmodule === 'passport-sub' && <PassportSubmission />}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}
      {activeSubmodule === 'idcard' && <IdCard />}
    </div>
  );
}

