import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { EmploymentAgreementStudio } from './agreement/EmploymentAgreementStudio';
import { TemplateStudio } from './templates/TemplateStudio';
import { DocumentDownloads } from './downloads/DocumentDownloads';
import { IdCardStudio } from './idcard/IdCardStudio';
import { SalarySlipStudio } from './payroll/SalarySlipStudio';
import { InvoiceBuilder } from './invoice/InvoiceBuilder';
import { PassportSubmissionStudio } from './passport/PassportSubmissionStudio';
import { IndianVisa } from './indian-visa/IndianVisa';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule || (activeSubmodule !== 'templates' && activeSubmodule !== 'idcard' && activeSubmodule !== 'downloads' && activeSubmodule !== 'payroll' && activeSubmodule !== 'invoice' && activeSubmodule !== 'passport-sub' && activeSubmodule !== 'indian-visa')) && (
        <EmploymentAgreementStudio />
      )}
      {activeSubmodule === 'payroll' && <SalarySlipStudio />}
      {activeSubmodule === 'invoice' && <InvoiceBuilder />}
      {activeSubmodule === 'passport-sub' && <PassportSubmissionStudio />}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}
      {activeSubmodule === 'templates' && <TemplateStudio />}
      {activeSubmodule === 'idcard' && <IdCardStudio />}
      {activeSubmodule === 'downloads' && <DocumentDownloads />}
    </div>
  );
}
