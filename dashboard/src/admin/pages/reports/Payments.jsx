import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { 
  Loader2, 
  Search, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Wallet,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import ClientProfileDrawer from '@/components/clients/ClientProfileDrawer';

// Renders the Payments and Money Receipts audit report for Admin Dashboard
const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });
  const [selectedClientDid, setSelectedClientDid] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await apiClient.get(`/api/v1/client/receipts?${params.toString()}`);
      if (res.data?.status === 'success' || res.data?.success) {
        setPayments(res.data.data || []);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalCount: res.data.pagination?.totalCount || (res.data.data ? res.data.data.length : 0),
        });
      }
    } catch (err) {
      toast.error('Failed to load payments report.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const confirmedCount = payments.filter((p) => p.status === 'confirmed' || p.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Wallet className="size-7 text-primary" />
            Payments Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comprehensive audit report of all received client payments, vouchers, and money receipts.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Total Collected</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <ArrowDownLeft className="size-5" />
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Based on current filter view</span>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Records</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {pagination.totalCount.toLocaleString()}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Total money receipt entries</span>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirmed on Page</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="size-5" />
            {confirmedCount} / {payments.length}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Verified & deposited payments</span>
        </Card>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by receipt no, client, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-lg text-foreground focus:outline-none focus:border-primary transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-lg text-foreground focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="draft">Draft / Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="bg-white border border-gray-200 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Receipt No</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Service / Purpose</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <Loader2 className="size-7 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground font-medium">Loading payments report...</span>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-muted-foreground">
                      <Wallet className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="font-semibold text-foreground text-sm">No payment records found</p>
                      <p className="text-xs mt-0.5">Try clearing filters or checking back later.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const client = payment.clientName || payment.clientId?.fullName || 'N/A';
                    const phone = payment.clientPhone || payment.clientId?.phone || '';
                    const isConfirmed = payment.status === 'confirmed' || payment.status === 'paid';
                    const isCancelled = payment.status === 'cancelled';

                    return (
                      <tr key={payment._id || payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-primary">
                          {payment.receiptNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(payment.createdAt || payment.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            onClick={() => {
                              const did = payment.clientDid || payment.clientId?.did || payment.clientId;
                              if (did) setSelectedClientDid(did);
                            }}
                            className="flex flex-col cursor-pointer group"
                            title="Click to view full client profile"
                          >
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{client}</span>
                            {phone && <span className="text-xs text-muted-foreground">{phone}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                          {payment.serviceType || payment.purpose || 'General Service'}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium uppercase">
                            {payment.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="size-3.5" /> Confirmed
                            </span>
                          ) : isCancelled ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <Clock className="size-3.5" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs">
          <span className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.totalCount} records)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Client 360 Degree Profile Drawer */}
      <ClientProfileDrawer
        clientDid={selectedClientDid}
        isOpen={Boolean(selectedClientDid)}
        onClose={() => setSelectedClientDid(null)}
        onRefresh={fetchPayments}
      />
    </div>
  );
};

export default Payments;
