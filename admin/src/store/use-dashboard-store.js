import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
