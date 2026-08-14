import monsuralitravelsConfig from './01monsuralitravels/config.json';
import engulficConfig from './02engulfic/config.json';
import toyolandConfig from './03toyoland/config.json';

const clientConfigs = {
  monsuralitravels: monsuralitravelsConfig,
  engulfic: engulficConfig,
  toyoland: toyolandConfig,
};

// Resolve the active client identifier
const envClient = import.meta.env?.VITE_CLIENT?.toLowerCase().trim();

// Fallback to hostname detection
const getClientFromHostname = () => {
  if (typeof window === 'undefined') return 'monsuralitravels';
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('engulfic')) return 'engulfic';
  if (hostname.includes('toyoland')) return 'toyoland';
  return 'monsuralitravels';
};

const activeKey = envClient || getClientFromHostname();

export const clientConfig = clientConfigs[activeKey] || monsuralitravelsConfig;
export const getActiveClientKey = () => activeKey;
export default clientConfig;
