import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export function EmailObfuscator() {
  const [revealed, setRevealed] = useState(false);
  const encodedEmail = 'Y29udGFjdEBtb25zdXJhbGl0cmF2ZWxzLmNvbQ=='; // Base64 for contact@monsuralitravels.com

  const handleReveal = () => {
    setRevealed(true);
  };

  const email = revealed ? atob(encodedEmail) : 'Click to reveal email';

  return (
    <button
      onClick={handleReveal}
      className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none font-medium"
      aria-label={revealed ? email : 'Reveal email address'}
    >
      <Mail className="w-5 h-5" />
      <span>{email}</span>
    </button>
  );
}
