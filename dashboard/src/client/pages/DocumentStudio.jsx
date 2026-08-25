import React from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { DocumentStudioPage } from '../../shared/features/document-studio';

export default function DocumentStudio() {
  const activeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const switchPortal = usePortalStore((state) => state.switchPortal);

  return (
    <DocumentStudioPage
      activeSubmodule={activeSubmodule}
      onSelectGenerator={(genId) => switchPortal('docs', genId)}
    />
  );
}
