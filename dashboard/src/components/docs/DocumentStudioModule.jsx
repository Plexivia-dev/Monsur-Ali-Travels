import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { EmploymentAgreementStudio } from './agreement/EmploymentAgreementStudio';
import { TemplateStudio } from './templates/TemplateStudio';
import { DocumentDownloads } from './downloads/DocumentDownloads';
import { IdCardStudio } from './idcard/IdCardStudio';
import { SalarySlipStudio } from './payroll/SalarySlipStudio';
import { InvoiceBuilder } from './invoice/InvoiceBuilder';
import { PassportSubmissionStudio } from './passport/PassportSubmissionStudio';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule || (activeSubmodule !== 'templates' && activeSubmodule !== 'idcard' && activeSubmodule !== 'downloads' && activeSubmodule !== 'payroll' && activeSubmodule !== 'invoice' && activeSubmodule !== 'passport-sub')) && (
        <EmploymentAgreementStudio />
      )}
      {activeSubmodule === 'payroll' && <SalarySlipStudio />}
      {activeSubmodule === 'invoice' && <InvoiceBuilder />}
      {activeSubmodule === 'passport-sub' && <PassportSubmissionStudio />}
      {activeSubmodule === 'templates' && <TemplateStudio />}
      {activeSubmodule === 'idcard' && <IdCardStudio />}
      {activeSubmodule === 'downloads' && <DocumentDownloads />}
    </div>
  );
}
