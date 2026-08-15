import React from 'react';
import { usePortal } from '../context/PortalContext';
import { TemplateStudio } from '../components/docs/templates/TemplateStudio';
import { DocumentDownloads } from '../components/docs/downloads/DocumentDownloads';
import { IdCardStudio } from '../components/docs/idcard/IdCardStudio';

export default function DocumentStudio() {
  const { activeSubmodule } = usePortal();

  return (
    <div className="space-y-5">
      {activeSubmodule === 'idcard' && <IdCardStudio />}
      {activeSubmodule === 'downloads' && <DocumentDownloads />}
      {(activeSubmodule === 'templates' || (activeSubmodule !== 'idcard' && activeSubmodule !== 'downloads')) && <TemplateStudio />}
    </div>
  );
}
