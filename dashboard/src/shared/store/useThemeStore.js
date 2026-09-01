import { create } from 'zustand';

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
  setTheme: () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smart_erp_theme', 'light');
    }
    set({ theme: 'light', isDark: false });
  },
  toggleTheme: () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smart_erp_theme', 'light');
    }
    set({ theme: 'light', isDark: false });
  },
}));

export const useTheme = useThemeStore;
export default useThemeStore;
