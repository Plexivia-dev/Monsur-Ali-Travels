import React from 'react';
import { usePortal } from '../context/PortalContext';
import { TemplateStudio } from '../components/docs/templates/TemplateStudio';
import { DocumentDownloads } from '../components/docs/downloads/DocumentDownloads';

export default function DocumentStudio() {
  const { activeSubmodule } = usePortal();

  const currentSubmodule = (activeSubmodule === 'downloads' || activeSubmodule === 'templates') 
    ? activeSubmodule 
    : 'templates';

  return (
    <div className="space-y-5">
      {currentSubmodule === 'templates' && <TemplateStudio />}
      {currentSubmodule === 'downloads' && <DocumentDownloads />}
    </div>
  );
}
