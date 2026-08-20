import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('smart_erp_theme');
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return savedTheme;
    }
    // Default to dark or system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return initial;
  }
  return 'dark';
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  isDark: typeof window !== 'undefined' ? (localStorage.getItem('smart_erp_theme') || 'dark') === 'dark' : true,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('smart_erp_theme', theme);
    }
    set({ theme, isDark: theme === 'dark' });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('smart_erp_theme', nextTheme);
      }
      return { theme: nextTheme, isDark: nextTheme === 'dark' };
    });
  },
}));

export const useTheme = useThemeStore;
