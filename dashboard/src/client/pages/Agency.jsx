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

  let activeSub = params.submodule || storeSubmodule || 'tasks';
  if (location.pathname.includes('/agency/employees')) {
    activeSub = 'employees';
  } else if (location.pathname.includes('/agency/clients-add')) {
    activeSub = 'clients-add';
  } else if (location.pathname.includes('/agency/clients-all') || location.pathname.includes('/agency/clients')) {
    activeSub = 'clients';
  } else if (location.pathname.includes('/agency/cases') || location.pathname.includes('/agency/pipeline')) {
    activeSub = 'cases';
  } else if (location.pathname.includes('/agency/tasks') || location.pathname.includes('/agency/my-tasks')) {
    activeSub = 'tasks';
  }

  switch (activeSub) {
    case 'tasks':
    case 'my-tasks':
      return <MyTasks />;
    case 'employees':
      return <AgencyEmployeeList />;
    case 'clients-add':
      return <AgencyClientList autoOpenCreate={true} />;
    case 'cases':
    case 'pipeline':
    case 'clients':
    case 'clients-all':
    default:
      return <AgencyClientList />;
  }
}

export default Agency;
