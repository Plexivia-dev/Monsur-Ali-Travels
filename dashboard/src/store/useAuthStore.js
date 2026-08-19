import { create } from 'zustand';
import { getGenericErrorMessage } from '../lib/error-handler';
import { apiClient } from '../lib/api-client';

const getInitialUserState = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      if (storedUser && storedToken) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error('Failed to parse cached auth state:', e);
    }
  }
  return null;
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUserState(),
  isLoading: false,
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      if (!email || !password) {
        throw new Error('Please provide both email and password.');
      }

      const response = await apiClient.post('/api/v1/auth/login', { email, password });

      // If 2FA is required, return this to the component to handle the second step
      if (response.data?.requires2fa) {
        set({ isLoading: false });
        return response.data;
      }

      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser = {
        id: apiUser.id || apiUser._id,
        did: apiUser.did,
        email: apiUser.email || email,
        name: apiUser.name || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        role: apiUser.role || 'Employee',
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      }

      set({ user: loggedUser, isLoading: false });
      return { success: true, user: loggedUser };
    } catch (err) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    }
  },

  verify2fa: async (email, password, code) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/api/v1/auth/2fa/verify', { email, password, code });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser = {
        id: apiUser.id || apiUser._id,
        did: apiUser.did,
        email: apiUser.email || email,
        name: apiUser.name || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        role: apiUser.role || 'Employee',
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      }

      set({ user: loggedUser, isLoading: false });
      return { success: true, user: loggedUser };
    } catch (err) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, '2FA verification failed. Please check the code.'));
    }
  },

  loginWithGoogle: async (code, redirectUri) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/api/v1/auth/google', { code, redirectUri });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser = {
        id: apiUser.id || apiUser._id,
        did: apiUser.did,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      }

      set({ user: loggedUser, isLoading: false });
      return { success: true, user: loggedUser };
    } catch (err) {
      set({ isLoading: false });
      throw new Error(getGenericErrorMessage(err, 'Google Sign-in failed. Please verify your account.'));
    }
  },

  logout: async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken }).catch(() => {});
      }
    } catch (_) {
      // ignore logout failure if offline
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null });
  },
}));

export const useAuth = useAuthStore;
