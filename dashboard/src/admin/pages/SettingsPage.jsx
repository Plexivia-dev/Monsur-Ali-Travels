import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfileSettingsPage } from '@shared/features/profile';

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';

  return <UserProfileSettingsPage initialTab={tab} />;
}

export default SettingsPage;
