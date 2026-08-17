import React from 'react';
import { usePortal } from '../context/PortalContext';
import { EmploymentAgreementStudio } from '../components/docs/agreement/EmploymentAgreementStudio';
import { TemplateStudio } from '../components/docs/templates/TemplateStudio';
import { DocumentDownloads } from '../components/docs/downloads/DocumentDownloads';
import { IdCardStudio } from '../components/docs/idcard/IdCardStudio';
import { SalarySlipStudio } from '../components/docs/payroll/SalarySlipStudio';

export default function DocumentStudio() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule || (activeSubmodule !== 'templates' && activeSubmodule !== 'idcard' && activeSubmodule !== 'downloads' && activeSubmodule !== 'payroll')) && (
        <EmploymentAgreementStudio />
      )}
      {activeSubmodule === 'templates' && <TemplateStudio />}
      {activeSubmodule === 'idcard' && <IdCardStudio />}
      {activeSubmodule === 'downloads' && <DocumentDownloads />}
      {activeSubmodule === 'payroll' && <SalarySlipStudio />}
    </div>
  );
}
