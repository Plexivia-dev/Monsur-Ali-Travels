/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LandingPage } from './components/LandingPage';
import { VerificationPage } from './components/VerificationPage';

export default function App() {
  const path = window.location.pathname;
  const search = window.location.search;
  
  if (path.startsWith('/verify') || search.includes('id=') || search.includes('identifier=')) {
    return <VerificationPage />;
  }

  return <LandingPage />;
}
