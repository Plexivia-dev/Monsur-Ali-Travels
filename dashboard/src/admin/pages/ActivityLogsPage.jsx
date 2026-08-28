import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
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
  Eye,
  X,
  FileJson,
} from 'lucide-react';
import {
  UnifiedDataTable,
  DataTableColumnHeader,
} from '@/components/ui/unified-table';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { PageAvatar } from '@shared/components/common/PageAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ROLE_BADGE_COLORS = {
  Owner: 'bg-purple-600 text-white font-bold shadow-2xs',
  Admin: 'bg-sky-600 text-white font-bold shadow-2xs',
  Manager: 'bg-amber-600 text-white font-bold shadow-2xs',
  Staff: 'bg-emerald-600 text-white font-bold shadow-2xs',
  Accountant: 'bg-indigo-600 text-white font-bold shadow-2xs',
};

const TARGET_LABELS = {
  clients: 'Client Profile',
  caseFiles: 'Case File',
  tasks: 'Task',
  moneyReceipts: 'Money Receipt',
  cashVouchers: 'Cash Voucher',
  invoices: 'Invoice',
  salarySlips: 'Salary / Payroll',
  passports: 'Passport Record',
  indianVisas: 'Indian Visa Application',
  agreements: 'Employment Agreement',
  jobVerifications: 'Job Verification',
  experienceCertificates: 'Experience Certificate',
  marriageCertificates: 'Marriage Certificate',
  characterCertificates: 'Character Certificate',
  idCards: 'Employee ID Card',
  clientGuardians: 'Client Application',
  users: 'User Profile',
  general: 'Record',
};

const TYPE_FILTERS = [
  { label: 'All Activities', type: 'all', role: 'all' },
  { label: '👥 Staff Actions', type: 'all', role: 'Staff' },
  { label: '👑 Admin Actions', type: 'all', role: 'Admin' },
  { label: '🔄 Transitions', type: 'STATUS_CHANGE', role: 'all' },
  { label: '💰 Payments', type: 'PAYMENT', role: 'all' },
  { label: '📝 Data Entry', type: 'DATA_ENTRY', role: 'all' },
  { label: '🔐 Logins', type: 'AUTH', role: 'all' },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilterIdx, setActiveFilterIdx] = useState(0);
  const [selectedPayload, setSelectedPayload] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilter = TYPE_FILTERS[activeFilterIdx];
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
      });

      if (activeFilter.role !== 'all') params.append('role', activeFilter.role);
      if (activeFilter.type !== 'all') params.append('type', activeFilter.type);

      const res = await apiClient.get(`/api/v1/admin/system/logs?${params.toString()}`);
      if (res.data?.status === 'success') {
        const rawLogs = res.data.data || [];
        const humanOnly = rawLogs.filter((l) => {
          const name = (l.actionDetails?.name || '').toLowerCase();
          const role = (l.actionDetails?.role || '').toLowerCase();
          return !name.includes('system') && !role.includes('system') && name.trim() !== '';
        });
        setLogs(humanOnly);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      toast.error('Failed to load user activity audit logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilterIdx]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActionDescription = (action, target) => {
    const targetLabel = TARGET_LABELS[target] || target;
    return `${action} on ${targetLabel}`;
  };

  // TanStack Column Definitions
  const columns = useMemo(
    () => [
      {
        id: 'user',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User & Role" />,
        cell: ({ row }) => {
          const log = row.original;
          const role = log.actionDetails?.role || log.role || 'Staff';
          const userName = log.actionDetails?.name || log.userName || log.user || 'User';
          const userDid = log.actionDetails?.did;
          const badgeClass = ROLE_BADGE_COLORS[role] || 'bg-zinc-700 text-white font-bold';

          return (
            <div className="flex items-center gap-3 py-0.5">
              <PageAvatar
                did={userDid}
                fallbackName={userName}
                showAvatarOnly={true}
                size="md"
              />
              <div className="space-y-1">
                <span className="font-black text-foreground block text-xs leading-tight tracking-tight">{userName}</span>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase ${badgeClass}`}>
                  {role}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: 'activityDetails',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Activity Summary" />,
        cell: ({ row }) => {
          const log = row.original;
          const action = log.action || 'Performed action';
          const target = log.targetCollection || 'general';

          return (
            <div className="text-xs text-foreground font-medium">
              {log.summary || formatActionDescription(action, target)}
            </div>
          );
        },
      },
      {
        accessorKey: 'targetCollection',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Target Module" />,
        cell: ({ row }) => {
          const target = row.getValue('targetCollection') || 'general';
          return (
            <Badge variant="outline" className="text-[11px] font-mono">
              {TARGET_LABELS[target] || target}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="size-3.5" />
            <span>{formatTimestamp(row.getValue('createdAt'))}</span>
          </div>
        ),
      },
      {
        id: 'payload',
        header: () => <div className="text-right text-xs uppercase font-semibold text-muted-foreground">Payload</div>,
        cell: ({ row }) => {
          const log = row.original;
          if (!log.payload || Object.keys(log.payload).length === 0) return null;

          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPayload(log);
                }}
                className="h-7 px-2 text-xs font-semibold cursor-pointer gap-1 text-muted-foreground hover:text-foreground"
              >
                <FileJson className="size-3.5" />
                <span>JSON</span>
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <HeaderTitle
        variant="general"
        icon={Shield}
        title="Activity & Audit Trail"
        badge={`${logs.length} Logged Actions`}
        subtitle="Real-time immutable audit trail for staff actions, document creations, visa statuses, and login sessions."
        actions={
          <Button
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-slate-800/80 hover:bg-slate-800 text-sky-400 border-sky-500/20"
            title="Refresh Logs"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TYPE_FILTERS.map((f, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFilterIdx(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeFilterIdx === idx
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TanStack Unified Data Table */}
      <UnifiedDataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        loadingRowCount={5}
        enablePagination={true}
        pageSize={15}
        pageSizeOptions={[10, 15, 25, 50]}
        enableSorting={true}
        enableFiltering={true}
        enableExport={true}
        exportFilename="agency-activity-audit-logs"
        searchPlaceholder="Search by user name, action, or module..."
        emptyTitle="No user activities recorded yet"
        emptyDescription="Actions taken by staff and admin users will appear here."
      />

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="size-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Audit Log Payload Details</h3>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-slate-950 text-slate-100 rounded-xl p-4 text-xs font-mono">
              <pre>{JSON.stringify(selectedPayload.payload || selectedPayload, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedPayload(null)}
                size="sm"
                className="text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
