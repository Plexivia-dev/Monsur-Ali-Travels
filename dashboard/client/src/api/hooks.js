import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from './axiosClient';
import { apiClient } from '../lib/api-client';

// Query Keys
export const QUERY_KEYS = {
  FACTORY: 'factoryData',
  AGENCY: 'agencyData',
  ADMIN: 'adminData',
};

// Custom Query Hooks
export const useFactoryData = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FACTORY],
    queryFn: async () => {
      const res = await mockApi.getFactoryData();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAgencyData = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.AGENCY],
    queryFn: async () => {
      const res = await mockApi.getAgencyData();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminData = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/dashboard/overview');
        const backendData = res.data?.data || {};
        const mockRes = await mockApi.getAdminData();
        const baseData = mockRes.data || {};
        
        return {
          ...baseData,
          ownerOverview: {
            ...baseData.ownerOverview,
            timeframes: {
              ...baseData.ownerOverview.timeframes,
              'Today': {
                ...baseData.ownerOverview.timeframes?.['Today'],
                totalVisas: backendData.totalVisas || 0,
                totalPassports: backendData.totalPassports || 0,
                totalAgreements: backendData.totalAgreements || 0,
              }
            }
          },
          notifications: backendData.notifications || []
        };
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
        const res = await mockApi.getAdminData();
        return res.data;
      }
    },
    staleTime: 1000 * 60 * 1, // Poll every minute or keep fresh
  });
};

// Mutation Hooks
export const useAddFactoryEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.addFactoryEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FACTORY] });
    },
  });
};

export const useCreateFactoryBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createFactoryBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FACTORY] });
    },
  });
};

export const useCreateFactoryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createFactoryPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FACTORY] });
    },
  });
};

export const useAddAgencyEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.addAgencyEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENCY] });
    },
  });
};

export const useCreateAgencyBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createAgencyBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENCY] });
    },
  });
};

export const useCreateAgencyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.createAgencyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENCY] });
    },
  });
};

export const useAddAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.addAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN] });
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN] });
    },
  });
};
