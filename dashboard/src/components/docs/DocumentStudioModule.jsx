import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { TemplateStudio } from './templates/TemplateStudio';
import { DocumentDownloads } from './downloads/DocumentDownloads';

export function DocumentStudioModule() {
  const { activeSubmodule } = usePortal();

  const currentSubmodule = (activeSubmodule === 'downloads' || activeSubmodule === 'templates') 
    ? activeSubmodule 
    : 'templates';

  return (
    <div className="space-y-5">
      {/* Render Active Document Submodule Directly */}
      <div>
        {currentSubmodule === 'templates' && <TemplateStudio />}
        {currentSubmodule === 'downloads' && <DocumentDownloads />}
      </div>
    </div>
  );
}
