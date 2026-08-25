import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  UserPlus,
  RefreshCw,
  FolderOpen,
  Phone,
  CheckCircle2,
  TrendingUp,
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import CreateClientModal from '@/components/clients/CreateClientModal';
import ClientProfileDrawer from '@/components/clients/ClientProfileDrawer';
import { UnifiedDataTable } from '@shared/components/tables/UnifiedDataTable';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1 });

  // Modal & Drawer State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClientDid, setSelectedClientDid] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetches paginated client records with filters
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (activeTab !== 'all') {
        if (['Active', 'Inactive', 'Archived'].includes(activeTab)) {
          params.status = activeTab;
        } else {
          params.clientType = activeTab;
        }
      }

      const res = await apiClient.get('/api/v1/client/clients', { params });
      const responseData = res.data;

      if (responseData?.status === 'success' || responseData?.success || Array.isArray(responseData?.data)) {
        const clientList = responseData.data || [];
        const totalCount = Number(responseData.pagination?.totalCount || responseData.total || clientList.length || 0);
        const totalPages = Number(responseData.pagination?.totalPages || Math.ceil(totalCount / limit) || 1);
        setMeta({ totalCount, totalPages });
      } else if (Array.isArray(responseData)) {
        setClients(responseData);
        setMeta({ totalCount: responseData.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load clients list:', err);
      toast.error(err.response?.data?.message || 'Failed to load client directory.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeTab]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Formats ISO date string into readable local representation
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Toggles a client's active/inactive status
  const handleToggleStatus = useCallback(async (client) => {
    const clientId = client._id || client.did;
    if (!clientId) return;
    const currentStatus = client.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setTogglingId(clientId);
    try {
      await apiClient.patch(`/api/v1/client/clients/${client.did || client._id}/status`, {
        status: newStatus,
      });
      toast.success(`Client "${client.fullName}" marked as ${newStatus}.`);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update client status.');
    } finally {
      setTogglingId(null);
    }
  }, [fetchClients]);

  // Deletes a client record after confirmation
  const handleDeleteClient = useCallback(async (client) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${client.fullName}"? This action cannot be undone.`)) return;
    const clientId = client.did || client._id;
    setDeletingId(clientId);
    try {
      await apiClient.delete(`/api/v1/client/clients/${clientId}`);
      toast.success(`Client "${client.fullName}" deleted successfully.`);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client record.');
    } finally {
      setDeletingId(null);
    }
  }, [fetchClients]);

  // Column Definitions for UnifiedDataTable (custom table — row = raw data object)
  const columns = [
    {
      accessorKey: 'fullName',
      header: 'Client Name & DID',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {row.fullName?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div>
            <span
              onClick={() => setSelectedClientDid(row.did)}
              className="font-bold text-foreground hover:text-primary transition-colors block cursor-pointer"
            >
              {row.fullName || 'Unnamed Client'}
            </span>
            <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
              {row.did ? `${row.did.slice(0, 16)}...` : row._id?.slice(0, 16) || '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact Info',
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-foreground flex items-center gap-1">
            <Phone className="size-3 text-primary shrink-0" />
            <span>{row.phone || '—'}</span>
          </div>
          {row.email && (
            <div className="text-muted-foreground truncate max-w-[150px] text-[11px]">
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'passportNumber',
      header: 'Passport & NID',
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.passportNumber ? (
            <span className="font-bold text-sky-600 dark:text-sky-400 block">
              {row.passportNumber}
            </span>
          ) : (
            <span className="text-muted-foreground italic block">—</span>
          )}
          {row.nidNumber && (
            <div className="text-[10px] text-muted-foreground">
              NID: {row.nidNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'clientType',
      header: 'Client Type',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-bold text-[11px] border border-border">
          {row.clientType || 'Individual'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = row.status || 'Active';
        const isActive = st === 'Active';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {isActive && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {st}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const clientId = row._id || row.did;
        const isActive = (row.status || 'Active') === 'Active';
        const isToggling = togglingId === clientId;
        const isDeleting = deletingId === (row.did || row._id);

        return (
          <div className="flex items-center gap-1.5">
            {/* 360° Profile */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClientDid(row.did);
              }}
              className="h-7 px-2.5 text-xs font-semibold cursor-pointer gap-1 shadow-xs"
              title="View 360° Profile"
            >
              <Eye className="size-3.5 text-primary" />
              <span className="hidden lg:inline">Profile</span>
            </Button>

            {/* Toggle Active/Inactive */}
            <Button
              variant="outline"
              size="sm"
              disabled={isToggling}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row);
              }}
              className={`h-7 px-2 text-xs cursor-pointer gap-1 shadow-xs ${
                isActive
                  ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                  : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              }`}
              title={isActive ? 'Mark Inactive' : 'Mark Active'}
            >
              {isToggling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isActive ? (
                <ToggleRight className="size-3.5" />
              ) : (
                <ToggleLeft className="size-3.5" />
              )}
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClient(row);
              }}
              className="h-7 px-2 text-xs cursor-pointer gap-1 shadow-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              title="Delete Client"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Clients', count: meta.totalCount },
    { id: 'Active', label: 'Active' },
    { id: 'Inactive', label: 'Inactive' },
    { id: 'Individual', label: 'Individual' },
    { id: 'Corporate', label: 'Corporate' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <HeaderTitle
        variant="general"
        icon={Users}
        title="Client Directory & CRM"
        badge={`${meta.totalCount} Registered Clients`}
        subtitle="Centralized database of visa candidates, pilgrimage groups, and corporate representatives with full 360° milestone records."
        actions={
          <>
            <button
              onClick={() => fetchClients()}
              className="p-2.5 bg-card hover:bg-muted text-primary rounded-xl border border-border transition-all cursor-pointer shadow-xs"
              title="Refresh Records"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
              <span>Register New Client</span>
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
                {meta.totalCount}
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
                This Page
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {clients.length}
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
                Active
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {clients.filter((c) => c.status === 'Active' || !c.status).length}{' '}
                <span className="text-xs font-normal text-muted-foreground">clients</span>
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
                Quick Action
              </span>
              <div className="mt-1.5">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="size-3.5" /> Register Client
                </button>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Data Table */}
      <UnifiedDataTable
        title="All Registered Clients"
        subtitle="Full CRM client records with contact info, passports, and 360° profile access"
        columns={columns}
        data={clients}
        loading={loading}
        totalItems={meta.totalCount}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by Client Name, Phone, Passport, NID..."
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        onRefresh={fetchClients}
        exportFileName="monsur-ali-travels-clients.csv"
        emptyMessage="No client records found. Click '+ Register New Client' to create one."
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
}

export default ClientsPage;
