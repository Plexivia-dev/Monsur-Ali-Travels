import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/error-handler';

const ROLES_ADMIN = ['Owner', 'Admin'];

// ── helpers ───────────────────────────────────────────────────────────────────

const readCachedUser = () => {
  try {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    return raw && token ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const mapApiUser = (apiUser, email) => ({
  id: apiUser.id || apiUser._id,
  did: apiUser.did,
  email: apiUser.email || email || '',
  name:
    apiUser.name ||
    (email || '').split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  username: apiUser.username || '',
  phone: apiUser.phone || '',
  address: apiUser.address || '',
  role: apiUser.role || 'Employee',
  department: apiUser.department || '',
  designation: apiUser.designation || '',
  avatar:
    apiUser.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
});

// ── store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create((set, get) => ({
  user: readCachedUser(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
      if (data?.requires2fa) return { success: false, requires2fa: true };

      const { user: apiUser, accessToken, refreshToken } = data.data;
      const loggedUser = mapApiUser(apiUser, email);

      if (!ROLES_ADMIN.includes(loggedUser.role)) {
        throw new Error('Access denied. Only Owners and Admins are allowed to access this portal.');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      set({ user: loggedUser });
      return { success: true };
    } catch (err) {
      throw new Error(err.message || getErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    } finally {
      set({ isLoading: false });
    }
  },

  verify2fa: async (email, password, code) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/api/v1/auth/2fa/verify', { email, password, code });
      const { user: apiUser, accessToken, refreshToken } = data.data;
      const loggedUser = mapApiUser(apiUser, email);

      if (!ROLES_ADMIN.includes(loggedUser.role)) {
        throw new Error('Access denied. Only Owners and Admins are allowed to access this portal.');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      set({ user: loggedUser });
    } catch (err) {
      throw new Error(err.message || getErrorMessage(err, '2FA verification failed.'));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await apiClient.get('/api/v1/auth/me');
      if (!data?.data) return;
      const current = get().user || {};
      const updated = { ...current, ...mapApiUser(data.data) };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
    } catch {
      // silent — stale cache is fine
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.put('/api/v1/auth/profile', profileData);
      const current = get().user || {};
      const updated = { ...current, ...mapApiUser(data.data) };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (current, next) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await apiClient.post('/api/v1/auth/logout', { refreshToken: rt }).catch(() => {});
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null });
    }
  },

  hasRole: (roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },
}));

// shorthand hook
export const useAuth = useAuthStore;
export const ADMIN_ROLES = ROLES_ADMIN;
