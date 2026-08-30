import { create } from 'zustand';

export const parsePortalFromPath = (pathname) => {
  const cleanPath = (pathname || '')
    .replace(/^\/client\.html\/?/i, '/')
    .replace(/^\/client\/?/i, '/');
  const parts = cleanPath.split('/').filter(Boolean);
  let portal = 'overview';
  let submodule = 'tasks';

  if (parts.length === 0) {
    return { portal: 'overview', submodule: 'tasks' };
  }

  if (parts[0] === 'dashboard') {
    if (parts[1]) portal = parts[1];
    if (parts[2]) submodule = parts[2] === 'dashboard' ? 'tasks' : parts[2];
  } else if (parts[0] && parts[0] !== 'login') {
    portal = parts[0];
    if (parts[1]) submodule = parts[1] === 'dashboard' ? 'tasks' : parts[1];
  }

  const validPortals = ['overview', 'agency', 'accounts', 'docs', 'data', 'settings'];
  if (!validPortals.includes(portal)) {
    portal = 'overview';
    submodule = 'tasks';
  }

  return { portal, submodule };
};

const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard/overview';
const initialParsed = parsePortalFromPath(initialPath);

export const usePortalStore = create((set, get) => ({
  activePortal: initialParsed.portal,
  activeSubmodule: initialParsed.submodule,
  language: typeof window !== 'undefined' ? (localStorage.getItem('app_language') || 'en') : 'en',
  isSidebarOpen: true,
  searchOpen: false,
  searchQuery: '',
  toasts: [],
  notifications: [],

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') localStorage.setItem('app_language', lang);
    set({ language: lang });
  },

  toggleLanguage: () => {
    const current = get().language || 'en';
    const nextLang = current === 'en' ? 'bn' : 'en';
    if (typeof window !== 'undefined') localStorage.setItem('app_language', nextLang);
    set({ language: nextLang });
  },

  setActivePortal: (portal) => {
    const { activePortal } = get();
    if (activePortal !== portal) {
      set({ activePortal: portal });
    }
  },

  setActiveSubmodule: (submodule) => {
    const { activeSubmodule } = get();
    if (activeSubmodule !== submodule) {
      set({ activeSubmodule: submodule });
    }
  },

  switchPortal: (portal, submodule = 'dashboard') => {
    const { activePortal, activeSubmodule } = get();
    if (activePortal !== portal || activeSubmodule !== submodule) {
      set({ activePortal: portal, activeSubmodule: submodule });
    }
  },

  syncFromLocation: (pathname) => {
    if (pathname && pathname !== '/login') {
      const { portal, submodule } = parsePortalFromPath(pathname);
      const state = get();
      if (state.activePortal !== portal || state.activeSubmodule !== submodule) {
        set({ activePortal: portal, activeSubmodule: submodule });
      }
    }
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: typeof isOpen === 'function' ? isOpen(get().isSidebarOpen) : isOpen }),

  setSearchOpen: (isOpen) => set({ searchOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  addNotification: (notification) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id || (n.did && n.did === notification.did));
      if (exists) return state;
      return {
        notifications: [notification, ...state.notifications].slice(0, 50),
      };
    });
  },

  markNotificationRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id || n.did === id ? { ...n, unread: false, isRead: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false, isRead: true })),
    }));
  },
}));

export const usePortal = usePortalStore;
