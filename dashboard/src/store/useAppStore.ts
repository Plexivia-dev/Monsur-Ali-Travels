import { create } from 'zustand';

export type PortalType = 'factory' | 'agency' | 'admin';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AppState {
  // Navigation & Layout
  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (isOpen: boolean) => void;

  // User Profile & Session
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
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
