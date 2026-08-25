import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  FolderOpen,
  Phone,
  FileText,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import CreateClientModal from '@/components/clients/CreateClientModal';
import ClientProfileDrawer from '@/components/clients/ClientProfileDrawer';
import {
  UnifiedDataTable,
  DataTableColumnHeader,
} from '@/components/ui/unified-table';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Renders the Client Management & Directory page for Admin Dashboard
const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  // Modal & Drawer State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClientDid, setSelectedClientDid] = useState(null);

  // Fetches paginated client records with filters
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (clientTypeFilter !== 'all') params.append('clientType', clientTypeFilter);

      const res = await apiClient.get(`/api/v1/client/clients?${params.toString()}`);
      if (res.data?.status === 'success' || res.data?.success) {
        setClients(res.data.data || []);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalCount: res.data.pagination?.totalCount || (res.data.data ? res.data.data.length : 0),
        });
      }
    } catch (err) {
      console.error('Failed to load clients list:', err);
      toast.error('Failed to load client directory.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, clientTypeFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Formats ISO date string into readable local representation
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Client Name & DID" />,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {client.fullName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <span className="font-bold text-foreground hover:text-primary transition-colors block">
                  {client.fullName}
                </span>
                <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                  {client.did?.slice(0, 16)}...
                </div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Info" />,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <Phone className="size-3 text-primary" />
                {client.phone}
              </div>
              {client.email && (
                <div className="text-muted-foreground truncate max-w-[150px]">
                  {client.email}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'passportNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport & NID" />,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="font-mono text-xs">
              {client.passportNumber ? (
                <span className="font-bold text-sky-600 dark:text-sky-400 block">
                  {client.passportNumber}
                </span>
              ) : (
                <span className="text-muted-foreground italic block">—</span>
              )}
              {client.nidNumber && (
                <div className="text-[10px] text-muted-foreground">
                  NID: {client.nidNumber}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'clientType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Client Type" />,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-bold text-xs">
            {row.getValue('clientType') || 'Individual'}
          </Badge>
        ),
      },
      {
        id: 'activeFiles',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active Files" />,
        cell: ({ row }) => {
          const client = row.original;
          const casesCount = (client.clientCases?.length || 0) + (client.applications?.length || 0);
          return (
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 text-xs">
              {casesCount} Files
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') || 'Active';
          const isActive = status === 'Active';
          return (
            <Badge
              className={
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right text-xs uppercase font-semibold text-muted-foreground">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClientDid(row.original.did);
              }}
              className="h-7 px-2.5 text-xs font-semibold cursor-pointer gap-1"
            >
              <Eye className="size-3.5 text-primary" />
              <span>View 360°</span>
            </Button>
          </div>
        ),
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
        icon={Users}
        title="Client Management"
        badge={`${pagination.totalCount} Registered Clients`}
        subtitle="Unified database of visa applicants, pilgrimage groups, and corporate agents with full 360° milestone history."
        actions={
          <>
            <button
              onClick={() => fetchClients()}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-sky-400 rounded-xl border border-sky-500/20 transition-all cursor-pointer shadow-xs"
              title="Refresh Records"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
              <span>New Client File</span>
            </button>
          </>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Directory
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {pagination.totalCount}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Cases
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {clients.reduce((acc, c) => acc + (c.clientCases?.length || c.applications?.length || 0), 0)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <FolderOpen className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Active Status Ratio
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {clients.filter((c) => c.status === 'Active' || !c.status).length} <span className="text-xs font-normal text-muted-foreground">Active</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Quick Actions
              </span>
              <div className="mt-1.5">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="size-3.5" /> Register New File
                </button>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Unified Data Table */}
      <UnifiedDataTable
        columns={columns}
        data={clients}
        isLoading={loading}
        loadingRowCount={5}
        enablePagination={true}
        pageSize={15}
        pageSizeOptions={[10, 15, 25, 50]}
        enableSorting={true}
        enableFiltering={true}
        enableRowSelection={false}
        enableExport={true}
        exportFilename="monsur-ali-travels-clients"
        searchPlaceholder="Search by Name, Phone, Passport, DID..."
        onRowClick={(client) => setSelectedClientDid(client.did)}
        emptyTitle="No client records found."
        emptyDescription="Click '+ New Client File' to register a new client and case workflow."
        emptyAction={
          <Button
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            className="text-xs font-bold cursor-pointer"
          >
            <UserPlus className="size-3.5 mr-1" /> Register Client
          </Button>
        }
      />

      {/* Create New Client Modal */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchClients();
        }}
      />

      {/* Client 360 Degree Profile Drawer */}
      <ClientProfileDrawer
        clientDid={selectedClientDid}
        isOpen={Boolean(selectedClientDid)}
        onClose={() => setSelectedClientDid(null)}
        onRefresh={fetchClients}
      />
    </div>
  );
};

export default ClientsPage;
