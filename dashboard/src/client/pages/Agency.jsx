import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePortalStore } from '../store/usePortalStore';
import { AgencyClientList } from '../components/agency/AgencyClientList';
import { AgencyEmployeeList } from '../components/agency/AgencyEmployeeList';
import { MyTasks } from '../components/agency/MyTasks';

export function Agency() {
  const storeSubmodule = usePortalStore((state) => state.activeSubmodule);
  const location = useLocation();
  const params = useParams();

  let activeSub = params.submodule || storeSubmodule || 'clients';
  if (location.pathname.includes('/agency/employees')) {
    activeSub = 'employees';
  } else if (location.pathname.includes('/agency/clients')) {
    activeSub = 'clients';
  } else if (location.pathname.includes('/agency/tasks') || location.pathname.includes('/agency/my-tasks')) {
    activeSub = 'tasks';
  }

  switch (activeSub) {
    case 'tasks':
    case 'my-tasks':
      return <MyTasks />;
    case 'employees':
      return <AgencyEmployeeList />;
    case 'clients':
    default:
      return <AgencyClientList />;
  }
}

export default Agency;
