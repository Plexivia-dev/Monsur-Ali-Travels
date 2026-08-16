import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Trash2 } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';

export function InvoiceDataTable() {
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/invoices', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      toast.error('ইনভয়েস তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, status);
  };

  const handleDelete = async (id, invoiceNo) => {
    if (!window.confirm(`আপনি কি ইনভয়েস "${invoiceNo || id}" মুছে ফেলতে চান?`)) return;
    try {
      await apiClient.delete(`/api/v1/invoices/${id}`);
      toast.success('ইনভয়েস মুছে ফেলা হয়েছে।');
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      toast.error('ইনভয়েস মুছতে সমস্যা হয়েছে।');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Paid') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Paid</span>;
    }
    if (status === 'Pending') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">Pending</span>;
    }
    if (status === 'Overdue') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Overdue</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{status || 'Draft'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            Invoices & Billing History (ইনভয়েস ও বিলিং রেকর্ড)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            কাস্টমার ও এজেন্সি বিলিং ইনভয়েস রেকর্ড, পেমেন্ট স্ট্যাটাস এবং বকেয়া হিসেব।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'invoice')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>+ নতুন ইনভয়েস তৈরি</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="Paid">Paid (পরিশোধিত)</option>
            <option value="Pending">Pending (অপেক্ষমান)</option>
            <option value="Overdue">Overdue (বকেয়া)</option>
          </select>

          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search, status)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">ইনভয়েস নং (Invoice No)</th>
                <th className="p-3">কাস্টমার / ক্লায়েন্ট</th>
                <th className="p-3">ইস্যুর তারিখ</th>
                <th className="p-3">পরিশোধের শেষ তারিখ</th>
                <th className="p-3">আইটেম সংখ্যা</th>
                <th className="p-3 text-center">পেমেন্ট স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                    কোনো ইনভয়েস পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-center font-mono text-muted-foreground">
                      {pagination.skip + idx + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {item.invoiceNo || '—'}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {item.client?.name || '—'}
                      {item.client?.phone && (
                        <div className="text-[10px] text-muted-foreground font-mono font-normal">
                          {item.client.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatToDdMmYyyy(item.issueDate) || '—'}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatToDdMmYyyy(item.dueDate) || '—'}
                    </td>
                    <td className="p-3 font-mono text-foreground font-semibold">
                      {item.items?.length || 0} টি
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(item.paymentStatus)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.invoiceNo)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <DataTablePagination
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={(p) => fetchData(p, pagination.limit, search, status)}
          onLimitChange={(l) => fetchData(1, l, search, status)}
        />
      </div>
    </div>
  );
}
