import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const fetchSystemUsers = async (params) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 15;

  try {
    const queryParams = {
      limit,
      page,
    };
    if (params?.search) queryParams.q = params.search;
    if (params?.role && params.role !== 'All') queryParams.role = params.role;

    const response = await apiClient.get('/api/v1/users', { params: queryParams });
    const rawData = response.data;
    const userList = rawData?.data ?? (Array.isArray(rawData) ? rawData : []);
    const meta = rawData?.meta ?? {
      total: userList.length,
      page,
      limit,
      totalPages: Math.ceil(userList.length / limit) || 1,
    };

    const parsedUsers = (Array.isArray(userList) ? userList : []).map((u) => ({
      id: u.id || u._id,
      name: u.name || u.fullName || '',
      email: u.email || '',
      role: u.role || 'Staff',
      status: u.status || 'Active',
      lastLogin: u.lastLogin || u.updatedAt || new Date().toISOString(),
      avatar: u.avatar || undefined,
    }));

    return {
      data: parsedUsers,
      meta: {
        total: meta.total ?? parsedUsers.length,
        page: meta.page ?? page,
        limit: meta.limit ?? limit,
        totalPages: meta.totalPages ?? (Math.ceil((meta.total ?? parsedUsers.length) / limit) || 1),
      },
    };
  } catch (err) {
    return {
      data: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 1,
      },
    };
  }
};

export function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchSystemUsers(params),
  });
}
