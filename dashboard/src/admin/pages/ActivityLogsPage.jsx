import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Search,
  RefreshCw,
  Loader2,
  Shield,
  User,
  Clock,
  Database,
  Tag,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileJson,
} from 'lucide-react';

const ROLE_BADGE_COLORS = {
  Owner: 'bg-purple-100 text-purple-800 border-purple-300',
  Admin: 'bg-blue-100 text-blue-800 border-blue-300',
  Manager: 'bg-amber-100 text-amber-800 border-amber-300',
  Staff: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const ACTION_COLORS = {
  CREATE: 'bg-green-500/15 text-green-700 border-green-300',
  UPDATE: 'bg-blue-500/15 text-blue-700 border-blue-300',
  SOFT_DELETE: 'bg-red-500/15 text-red-700 border-red-300',
  AUTH_LOGIN: 'bg-sky-500/15 text-sky-700 border-sky-300',
  AUTH_LOGOUT: 'bg-slate-500/15 text-slate-700 border-slate-300',
  STATUS_TRANSITION: 'bg-indigo-500/15 text-indigo-700 border-indigo-300',
};

const TARGET_LABELS = {
  clients: 'Client (কাস্টমার)',
  customers: 'Client (কাস্টমার)',
  caseFiles: 'Case File (ফাইল)',
  tasks: 'Task (টাস্ক)',
  moneyReceipts: 'Money Receipt (রিসিপ্ট)',
  cashVouchers: 'Cash Voucher (ভাউচার)',
  invoices: 'Invoice (ইনভয়েস)',
  salarySlips: 'Salary / Payroll',
  candidates: 'Candidate (ক্যান্ডিডেট)',
  passports: 'Passport Record',
  indianVisas: 'Indian Visa',
  agreements: 'Agreement Document',
  users: 'User Profile',
  general: 'Record',
};

const TYPE_FILTERS = [
  { label: 'All User Activities', type: 'all', role: 'all' },
  { label: '👥 Staff Actions Only', type: 'all', role: 'Staff' },
  { label: '👑 Admin & Owner Actions', type: 'all', role: 'Admin' },
  { label: '🔄 Status Transitions', type: 'STATUS_CHANGE', role: 'all' },
  { label: '💰 Payments & Billing', type: 'PAYMENT', role: 'all' },
  { label: '📝 Data Entry & Forms', type: 'DATA_ENTRY', role: 'all' },
  { label: '🔐 User Logins', type: 'AUTH', role: 'all' },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilterIdx, setActiveFilterIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });
  const [selectedPayload, setSelectedPayload] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilter = TYPE_FILTERS[activeFilterIdx];
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (activeFilter.role !== 'all') params.append('role', activeFilter.role);
      if (activeFilter.type !== 'all') params.append('type', activeFilter.type);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiClient.get(`/api/v1/admin/system/logs?${params.toString()}`);
      if (res.data?.status === 'success') {
        const rawLogs = res.data.data || [];
        const humanOnly = rawLogs.filter((l) => {
          const name = (l.actionDetails?.name || '').toLowerCase();
          const role = (l.actionDetails?.role || '').toLowerCase();
          return !name.includes('system') && !role.includes('system') && name.trim() !== '';
        });
        setLogs(humanOnly);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalCount: humanOnly.length || res.data.pagination?.totalCount || 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load user activity logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilterIdx, search, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (idx) => {
    setActiveFilterIdx(idx);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActionDescription = (action, target) => {
    const act = (action || '').toUpperCase();
    const targetLabel = TARGET_LABELS[target] || target;

    if (act === 'CREATE') {
      return (
        <span>
          Created new <span className="font-semibold text-foreground">{targetLabel}</span>
        </span>
      );
    }
    if (act === 'UPDATE') {
      return (
        <span>
          Updated <span className="font-semibold text-foreground">{targetLabel}</span>
        </span>
      );
    }
    if (act === 'SOFT_DELETE' || act === 'DELETE') {
      return (
        <span>
          Deleted <span className="font-semibold text-rose-600">{targetLabel}</span>
        </span>
      );
    }
    if (act === 'AUTH_LOGIN') {
      return <span className="text-sky-700 font-medium">Logged into the portal</span>;
    }
    if (act === 'AUTH_LOGOUT') {
      return <span className="text-slate-600 font-medium">Logged out of the portal</span>;
    }
    if (act === 'STATUS_TRANSITION') {
      return (
        <span>
          Updated status of <span className="font-semibold text-foreground">{targetLabel}</span>
        </span>
      );
    }
    return (
      <span>
        Performed {action} on <span className="font-semibold text-foreground">{targetLabel}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Activity Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time audit trail tracking actions, updates, and status changes performed by staff and administrators.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_FILTERS.map((f, idx) => (
            <button
              key={idx}
              onClick={() => handleFilterChange(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeFilterIdx === idx
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user name, action, or module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl text-foreground focus:outline-none focus:border-primary shadow-xs"
          />
        </form>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading user activity logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-md p-10 text-center">
          <Database className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No user activities recorded yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Actions taken by staff and admin users will appear here.</p>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Activity Details</th>
                  <th className="px-6 py-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log, index) => {
                  const role = log.actionDetails?.role || 'Staff';
                  const userName = log.actionDetails?.name || 'User';
                  const action = log.action || 'Performed action';
                  const target = log.targetCollection || 'general';
                  const serialNo = (page - 1) * 20 + index + 1;

                  return (
                    <tr key={log.did || log._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground w-12">{serialNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{userName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.summary ? (
                          <span className="text-foreground">{log.summary}</span>
                        ) : (
                          formatActionDescription(action, target)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground text-xs whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimestamp(log.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs">
          <span className="text-xs text-muted-foreground">
            Total Logs: <strong className="text-foreground">{pagination.totalCount}</strong> (Page {page} of {pagination.totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Audit Log Payload Details</h3>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-slate-950 text-slate-100 rounded-xl p-4 text-xs font-mono">
              <pre>{JSON.stringify(selectedPayload.payload, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
