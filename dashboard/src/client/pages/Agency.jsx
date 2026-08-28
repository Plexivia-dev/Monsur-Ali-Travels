import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePortalStore } from '../store/usePortalStore';
import { AgencyClientList } from '../components/agency/AgencyClientList';
import { AgencyEmployeeList } from '../components/agency/AgencyEmployeeList';

export function Agency() {
  const storeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const location = useLocation();
  const params = useParams();

  let activeSub = params.submodule || storeSubmodule || 'clients';
  if (location.pathname.includes('/agency/employees')) {
    activeSub = 'employees';
  } else if (location.pathname.includes('/agency/clients')) {
    activeSub = 'clients';
  }

  return (
    <div className="space-y-6">
      {activeSub === 'employees' ? <AgencyEmployeeList /> : <AgencyClientList />}
    </div>
  );
}

export default Agency;
