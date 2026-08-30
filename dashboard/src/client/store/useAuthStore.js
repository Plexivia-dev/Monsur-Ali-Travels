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
        username: apiUser.username || '',
        phone: apiUser.phone || '',
        address: apiUser.address || '',
        role: apiUser.role || 'Employee',
        subRole: apiUser.subRole || apiUser.sub_role || '',
        department: apiUser.department || '',
        designation: apiUser.designation || '',
        avatar: apiUser.avatar || '',
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

  verify2fa: async (params, password, code, method = 'authenticator') => {
    try {
      set({ isLoading: true });
      const payload = typeof params === 'string'
        ? { email: params, password, code, method: method || 'authenticator' }
        : params;

      const token = payload?.twoFactorToken;
      const headers = token ? { Authorization: `Bearer ${token}`, 'X-Two-Factor-Token': token } : {};

      const response = await apiClient.post('/api/v1/auth/2fa/verify', payload, { headers });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;

      const loggedUser = {
        id: apiUser.id || apiUser._id || apiUser.did,
        did: apiUser.did,
        email: apiUser.email || (typeof params === 'string' ? params : params?.email) || '',
        name: apiUser.name || (apiUser.email || '').split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        username: apiUser.username || '',
        phone: apiUser.phone || '',
        address: apiUser.address || '',
        role: apiUser.role || 'Employee',
        subRole: apiUser.subRole || apiUser.sub_role || '',
        department: apiUser.department || '',
        designation: apiUser.designation || '',
        avatar: apiUser.avatar || '',
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
      throw new Error(getGenericErrorMessage(err, '2FA verification failed. Please try again.'));
    }
  },

  resendEmailOtp: async (twoFactorToken) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}`, 'X-Two-Factor-Token': twoFactorToken } : {};
      const response = await apiClient.post('/api/v1/auth/2fa/resend-email-otp', { twoFactorToken }, { headers });
      return response.data;
    } catch (err) {
      throw new Error(getGenericErrorMessage(err, 'Failed to resend verification code.'));
    }
  },

  setupAuthenticator: async (twoFactorToken) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}`, 'X-Two-Factor-Token': twoFactorToken } : {};
      const response = await apiClient.post('/api/v1/auth/2fa/setup-authenticator', { twoFactorToken }, { headers });
      return response.data?.data;
    } catch (err) {
      throw new Error(getGenericErrorMessage(err, 'Failed to load Authenticator QR setup.'));
    }
  },

  sendQrCodeEmail: async (twoFactorToken) => {
    try {
      const headers = twoFactorToken ? { Authorization: `Bearer ${twoFactorToken}`, 'X-Two-Factor-Token': twoFactorToken } : {};
      const response = await apiClient.post('/api/v1/auth/2fa/send-qr', { twoFactorToken }, { headers });
      return response.data;
    } catch (err) {
      throw new Error(getGenericErrorMessage(err, 'Failed to send QR code email.'));
    }
  },

  fetchProfile: async () => {
    try {
      const response = await apiClient.get('/api/v1/auth/me');
      if (response.data?.data) {
        const apiUser = response.data.data;
        const currentUser = get().user || {};
        const updatedUser = {
          ...currentUser,
          id: apiUser.id || apiUser._id || currentUser.id,
          did: apiUser.did || currentUser.did,
          email: apiUser.email || currentUser.email,
          name: apiUser.name || currentUser.name,
          username: apiUser.username ?? currentUser.username,
          phone: apiUser.phone ?? currentUser.phone,
          address: apiUser.address ?? currentUser.address,
          role: apiUser.role || currentUser.role,
          subRole: apiUser.subRole ?? apiUser.sub_role ?? currentUser.subRole ?? '',
          department: apiUser.department || currentUser.department,
          designation: apiUser.designation || currentUser.designation,
          avatar: apiUser.avatar || currentUser.avatar,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        set({ user: updatedUser });
        return updatedUser;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.put('/api/v1/auth/profile', profileData);
      const apiUser = response.data.data;
      const currentUser = get().user || {};

      const updatedUser = {
        ...currentUser,
        id: apiUser.id || apiUser._id || currentUser.id,
        did: apiUser.did || currentUser.did,
        name: apiUser.name !== undefined ? apiUser.name : currentUser.name,
        username: apiUser.username !== undefined ? apiUser.username : currentUser.username,
        phone: apiUser.phone !== undefined ? apiUser.phone : currentUser.phone,
        address: apiUser.address !== undefined ? apiUser.address : currentUser.address,
        avatar: apiUser.avatar !== undefined ? apiUser.avatar : currentUser.avatar,
        email: apiUser.email || currentUser.email,
        role: apiUser.role || currentUser.role,
        subRole: apiUser.subRole !== undefined ? apiUser.subRole : (apiUser.sub_role !== undefined ? apiUser.sub_role : currentUser.subRole),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      set({ user: updatedUser, isLoading: false });
      return { success: true, user: updatedUser };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
      });
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
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
        username: apiUser.username || '',
        phone: apiUser.phone || '',
        address: apiUser.address || '',
        role: apiUser.role,
        subRole: apiUser.subRole || apiUser.sub_role || '',
        department: apiUser.department || '',
        designation: apiUser.designation || '',
        avatar: apiUser.avatar || '',
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
