import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/core/api-client';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const normalized = status.toString().trim().toLowerCase();
  if (normalized === 'paid') return 'Completed';
  if (normalized === 'failed') return 'Failed';
  return 'Pending';
};

const mapPayment = (payment) => {
  const order = payment.orderId || {};
  const invoiceId = order.orderNumber || order.did || order._id || payment.id || payment._id || 'Unknown';
  const clientName = order.client?.fullName || 'Guest Client';
  const method = payment.paymentMethod || 'Unknown';
  const amount = typeof payment.amount === 'number' ? payment.amount : Number(payment.paidAmount ?? payment.totalAmount ?? 0);

  return {
    id: payment.id || payment._id || 'unknown',
    invoiceId,
    clientName,
    method,
    date: formatDate(payment.createdAt || payment.updatedAt),
    amount,
    status: normalizeStatus(payment.status || payment.paymentStatus),
  };
};

const fetchPayments = async () => {
  try {
    const response = await apiClient.get('/api/v1/payments');
    const rawData = response.data;
    const paymentList = rawData?.data ?? (Array.isArray(rawData) ? rawData : []);
    return (Array.isArray(paymentList) ? paymentList : []).map(mapPayment);
  } catch (err) {
    return [];
  }
};

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });
}
