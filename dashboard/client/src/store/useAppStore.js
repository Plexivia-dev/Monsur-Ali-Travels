import { create } from 'zustand';

export const useAppStore = create((set) => ({
  activePortal: 'factory',
  setActivePortal: (portal) => set({ activePortal: portal }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchModalOpen: false,
  setSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),

  user: {
    name: 'Monsur Ali Admin',
    email: 'admin@monsuralitravelsbd.com',
    role: 'Super Administrator',
  },
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null });
  },
}));
