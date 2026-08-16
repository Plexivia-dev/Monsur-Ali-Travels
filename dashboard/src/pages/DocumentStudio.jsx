import React from 'react';
import { usePortal } from '../context/PortalContext';
import { EmploymentAgreementStudio } from '../components/docs/agreement/EmploymentAgreementStudio';
import { TemplateStudio } from '../components/docs/templates/TemplateStudio';
import { DocumentDownloads } from '../components/docs/downloads/DocumentDownloads';
import { IdCardStudio } from '../components/docs/idcard/IdCardStudio';
import { SalarySlipStudio } from '../components/docs/payroll/SalarySlipStudio';
import { InvoiceBuilder } from '../components/docs/invoice/InvoiceBuilder';
import { PassportSubmissionStudio } from '../components/docs/passport/PassportSubmissionStudio';
import { IndianVisa } from '../components/docs/indian-visa/IndianVisa';

export default function DocumentStudio() {
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
