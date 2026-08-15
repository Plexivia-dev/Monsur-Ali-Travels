import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { TemplateStudio } from './templates/TemplateStudio';
import { DocumentDownloads } from './downloads/DocumentDownloads';
import { IdCardStudio } from './idcard/IdCardStudio';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {activeSubmodule === 'idcard' && <IdCardStudio />}
      {activeSubmodule === 'downloads' && <DocumentDownloads />}
      {(activeSubmodule === 'templates' || (activeSubmodule !== 'idcard' && activeSubmodule !== 'downloads')) && <TemplateStudio />}
    </div>
  );
}
