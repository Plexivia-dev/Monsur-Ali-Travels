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
  System: 'bg-gray-100 text-gray-700 border-gray-300',
};

const ACTION_COLORS = {
  CREATE: 'bg-green-500/15 text-green-700 border-green-300',
  UPDATE: 'bg-blue-500/15 text-blue-700 border-blue-300',
  SOFT_DELETE: 'bg-red-500/15 text-red-700 border-red-300',
  AUTH_LOGIN: 'bg-sky-500/15 text-sky-700 border-sky-300',
  AUTH_LOGOUT: 'bg-slate-500/15 text-slate-700 border-slate-300',
  STATUS_TRANSITION: 'bg-indigo-500/15 text-indigo-700 border-indigo-300',
};

const TYPE_FILTERS = [
  { label: 'All Activities', type: 'all', role: 'all' },
  { label: '👥 Staff Actions Only', type: 'all', role: 'Staff' },
  { label: '🔄 Status Changes', type: 'STATUS_CHANGE', role: 'all' },
  { label: '💰 Payments & Billing', type: 'PAYMENT', role: 'all' },
  { label: '📝 Data Entry', type: 'DATA_ENTRY', role: 'all' },
  { label: '🔐 Auth & System', type: 'AUTH', role: 'all' },
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
        setLogs(res.data.data || []);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalCount: res.data.pagination?.totalCount || 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load system activity logs.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Activity Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise audit trail capturing real-time actions, role activities, and status transitions across the ERP.
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
            placeholder="Search by user, action, target collection..."
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
          <p className="text-xs text-muted-foreground font-medium">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-md p-10 text-center">
          <Database className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No audit logs found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {logs.map((log) => {
            const role = log.actionDetails?.role || 'System';
            const userName = log.actionDetails?.name || 'System Process';
            const action = log.action || 'CREATE';
            const roleBadgeClass = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.System;
            const actionBadgeClass = ACTION_COLORS[action] || ACTION_COLORS.CREATE;

            return (
              <Card
                key={log.did || log._id}
                className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {role === 'Staff' ? (
                          <User className="w-4 h-4 text-emerald-600" />
                        ) : role === 'Admin' || role === 'Owner' ? (
                          <Shield className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Database className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{userName}</h4>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border ${roleBadgeClass}`}>
                          {role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${actionBadgeClass}`}>
                        {action}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Target Collection:</span>
                      <span className="font-mono font-semibold text-foreground">{log.targetCollection}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Category:</span>
                      <span className="font-medium text-primary">{log.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {formatTimestamp(log.createdAt)}
                    </span>
                    {log.payload && (
                      <button
                        onClick={() => setSelectedPayload(log)}
                        className="flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View Details
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
