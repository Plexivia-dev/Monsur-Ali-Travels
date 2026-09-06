/**
 * Resolves the API Base URL with strict localhost/dev isolation:
 * - When running on localhost / 127.0.0.1 or in Vite development mode,
 *   it will ALWAYS connect to the DEV server (https://server.plexivia.online)
 *   or an explicit local backend port (e.g. http://localhost:5093).
 *   It strictly prevents connecting to the LIVE server (*monsuralitravels.com) from localhost,
 *   regardless of whether the active git branch is 'dev' or 'live'.
 * - In production cloud deployments, it connects to the configured environment URL
 *   (e.g., https://api.monsuralitravels.com on live, https://server.plexivia.online on dev).
 */
export const getApiBaseUrl = (): string => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.'));

  if (isLocalhost || import.meta.env?.DEV) {
    const configured = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL;
    if (configured && !configured.includes('monsuralitravels.com')) {
      return configured;
    }
    return 'https://server.plexivia.online';
  }

  return (
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    'https://api.monsuralitravels.com'
  );
};

export const API_BASE_URL = getApiBaseUrl();
