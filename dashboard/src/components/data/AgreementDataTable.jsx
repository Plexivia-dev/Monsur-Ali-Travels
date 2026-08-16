import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileText, Trash2, Eye, ExternalLink } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';

export function AgreementDataTable() {
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

      const res = await apiClient.get('/api/v1/agreements', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch agreements:', err);
      toast.error('নিয়োগ চুক্তিপত্র তালিকা লোড করতে ব্যর্থ হয়েছে।');
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

  const handleDelete = async (id, agreementId) => {
    if (!window.confirm(`আপনি কি চুক্তিপত্র "${agreementId || id}" মুছে ফেলতে চান?`)) return;
    try {
      await apiClient.delete(`/api/v1/agreements/${id}`);
      toast.success('চুক্তিপত্র মুছে ফেলা হয়েছে।');
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete agreement:', err);
      toast.error('চুক্তিপত্র মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Employment Agreements (নিয়োগ চুক্তিপত্র তালিকা)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            ডাটাবেজে সংরক্ষিত সকল কর্মচারীর চুক্তিপত্রের বিস্তারিত রেকর্ড ও প্রিন্ট লিস্ট।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'agreement')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>+ নতুন চুক্তিপত্র তৈরি</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
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
            <option value="active">Active (সক্রিয়)</option>
            <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
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
                <th className="p-3">আইডি (Agreement ID)</th>
                <th className="p-3">কর্মচারীর নাম</th>
                <th className="p-3">পদবী ও বিভাগ</th>
                <th className="p-3">চুক্তির তারিখ</th>
                <th className="p-3">মাসিক বেতন (৳)</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
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
                    কোনো চুক্তিপত্র পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const empName = item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || item.parties?.employeeName || '—';
                  const designation = item.পদের_বিবরণ?.পদের_নাম || item.position?.designation || '—';
                  const dept = item.পদের_বিবরণ?.বিভাগ || item.position?.department || '';
                  const agreementDate = item.সাধারণ_তথ্য?.চুক্তির_তারিখ || item.parties?.agreementDate || '';
                  const gross = item.বেতন_কাঠামো?.সর্বমোট_মাসিক_বেতন || item.salary?.grossSalary || '0';

                  return (
                    <tr key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-center font-mono text-muted-foreground">
                        {pagination.skip + idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600">
                        {item.agreementId || '—'}
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        {empName}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{designation}</div>
                        {dept && <div className="text-[10px] text-muted-foreground">{dept}</div>}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {formatToDdMmYyyy(agreementDate) || '—'}
                      </td>
                      <td className="p-3 font-mono font-bold text-foreground">
                        {gross} ৳
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {item.স্ট্যাটাস || item.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.agreementId)}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
