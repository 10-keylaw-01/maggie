import { createContext, useContext } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getSettings } from '../lib/api';

const Ctx = createContext({});

export function SettingsProvider({ children }) {
  const { data } = useAsync(getSettings, []);
  const s = data || {};
  // normalised, safe-to-read values with fallbacks so the UI never shows "undefined"
  const value = {
    ...s,
    brand_name: s.brand_name || 'Pharmacy',
    delivery_fee: Number(s.delivery_fee ?? 0),
    free_delivery_threshold: Number(s.free_delivery_threshold ?? 0),
    tax_rate: Number(s.tax_rate ?? 0),
    cod_enabled: s.cod_enabled === true,
    about_points: Array.isArray(s.about_points) ? s.about_points : [],
    about_stats: Array.isArray(s.about_stats) ? s.about_stats : [],
    loaded: !!data,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useSettings = () => useContext(Ctx);
