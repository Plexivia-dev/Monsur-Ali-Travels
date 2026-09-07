import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isOpen) => set((state) => ({
    isSidebarOpen: typeof isOpen === 'function' ? isOpen(state.isSidebarOpen) : Boolean(isOpen),
  })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export default useDashboardStore;
