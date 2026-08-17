import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { EmploymentAgreementStudio } from './agreement/EmploymentAgreementStudio';
import { TemplateStudio } from './templates/TemplateStudio';
import { DocumentDownloads } from './downloads/DocumentDownloads';
import { IdCardStudio } from './idcard/IdCardStudio';
import { SalarySlipStudio } from './payroll/SalarySlipStudio';

export function DocumentStudioModule() {
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
