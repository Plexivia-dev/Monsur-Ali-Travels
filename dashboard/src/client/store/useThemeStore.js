import { create } from 'zustand';

// Enforce default Light Mode for Client Dashboard
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('smart_erp_theme', 'light');
    return 'light';
  }
  return 'light';
};

export const useThemeStore = create((set) => ({
  theme: 'light',
  isDark: false,
  setTheme: (theme = 'light') => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smart_erp_theme', 'light');
    }
    set({ theme: 'light', isDark: false });
  },
  toggleTheme: () => {
    // Mode toggle disabled for Client Portal (Always Light Mode)
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smart_erp_theme', 'light');
    }
    set({ theme: 'light', isDark: false });
  },
}));

export const useTheme = useThemeStore;

export default useThemeStore;
