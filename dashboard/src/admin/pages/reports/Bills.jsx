import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { 
  Loader2, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Receipt,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await apiClient.get(`/api/v1/client/invoices?${params.toString()}`);
      if (res.data?.status === 'success' || res.data?.success) {
        setBills(res.data.data || []);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalCount: res.data.pagination?.totalCount || (res.data.data ? res.data.data.length : 0),
        });
      }
    } catch (err) {
      toast.error('Failed to load bills & invoices report.');
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBills();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalBilled = bills.reduce((acc, curr) => acc + (curr.grandTotal || curr.totalAmount || 0), 0);
  const totalDues = bills.reduce((acc, curr) => acc + (curr.totalDue !== undefined ? curr.totalDue : (curr.paymentStatus === 'Paid' ? 0 : curr.grandTotal || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="size-7 text-primary" />
            Bills & Invoices Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed ledger report of all client invoices, billed items, and payment statuses.
          </p>
        </div>

        <button
          onClick={fetchBills}
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
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Total Invoiced</span>
          <div className="text-2xl font-bold text-foreground mt-1 flex items-center gap-1.5">
            <ArrowUpRight className="size-5 text-primary" />
            {formatCurrency(totalBilled)}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Sum of current page bills</span>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Dues</span>
          <div className="text-2xl font-bold text-rose-600 mt-1 flex items-center gap-1.5">
            <AlertCircle className="size-5" />
            {formatCurrency(totalDues)}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Pending & overdue balances</span>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Invoices</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {pagination.totalCount.toLocaleString()}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Lifetime generated invoices</span>
        </Card>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice no, client, company..."
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
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <Card className="bg-white border border-gray-200 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice No</th>
                  <th className="px-6 py-4 font-medium">Issue Date</th>
                  <th className="px-6 py-4 font-medium">Client / Company</th>
                  <th className="px-6 py-4 font-medium">Grand Total</th>
                  <th className="px-6 py-4 font-medium">Paid Amount</th>
                  <th className="px-6 py-4 font-medium">Due Balance</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <Loader2 className="size-7 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground font-medium">Loading bills report...</span>
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-muted-foreground">
                      <Receipt className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="font-semibold text-foreground text-sm">No bills or invoices found</p>
                      <p className="text-xs mt-0.5">Try clearing filters or check search query.</p>
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => {
                    const clientName = bill.client?.name || bill.clientName || 'Unknown Client';
                    const company = bill.client?.company || '';
                    const status = bill.paymentStatus || bill.status || 'Pending';
                    const isPaid = status.toLowerCase() === 'paid';
                    const isPending = status.toLowerCase() === 'pending';
                    const isOverdue = status.toLowerCase() === 'overdue';

                    return (
                      <tr key={bill._id || bill.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-primary">
                          {bill.invoiceNo || bill.billNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(bill.createdAt || bill.issueDate || bill.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{clientName}</span>
                            {company && <span className="text-xs text-muted-foreground">{company}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(bill.grandTotal || bill.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold whitespace-nowrap">
                          {formatCurrency(bill.totalPaid || (isPaid ? (bill.grandTotal || bill.totalAmount) : 0))}
                        </td>
                        <td className="px-6 py-4 font-semibold text-rose-600 whitespace-nowrap">
                          {formatCurrency(bill.totalDue !== undefined ? bill.totalDue : (isPaid ? 0 : bill.grandTotal || 0))}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="size-3.5" /> Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <AlertCircle className="size-3.5" /> Overdue
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <Clock className="size-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              {status}
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
    </div>
  );
}
