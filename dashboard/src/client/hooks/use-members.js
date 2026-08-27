import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const fetchMembers = async (params) => {
  const limit = params?.limit ?? 15;
  const page = params?.page ?? 1;

  try {
    const queryParams = {
      limit,
      page,
    };
    if (params?.search) queryParams.q = params.search;
    if (params?.segment) queryParams.segment = params.segment;

    const response = await apiClient.get(
      '/api/v1/members',
      { params: queryParams }
    );

    const rawData = response.data;
    const memberList = rawData?.data ?? (Array.isArray(rawData) ? rawData : []);
    const meta = rawData?.meta ?? {
      total: memberList.length,
      page,
      limit,
      totalPages: Math.ceil(memberList.length / limit) || 1,
    };

    const parsedMembers = (Array.isArray(memberList) ? memberList : []).map((m) => {
      const member = m || {};
      const orders = Array.isArray(member.orders) ? member.orders : [];
      const totalOrders = orders.length;
      const lifetimeSpent = orders.reduce(
        (sum, o) => {
          const value = o.value;
          if (typeof value === 'number') return sum + value;
          const totals = o.totals;
          return sum + (totals?.total ?? o.total ?? 0);
        },
        0
      );

      return {
        id: member.id || member._id,
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        totalOrders,
        lifetimeSpent,
        joinedDate: member.createdAt || new Date().toISOString(),
        segment: member.segment || undefined,
        avatar: member.avatar || undefined,
      };
    });

    return {
      data: parsedMembers,
      meta: {
        total: meta.total ?? parsedMembers.length,
        page: meta.page ?? page,
        limit: meta.limit ?? limit,
        totalPages: meta.totalPages ?? Math.ceil((meta.total ?? parsedMembers.length) / limit) || 1,
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

export function useMembers(params) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
  });
}
