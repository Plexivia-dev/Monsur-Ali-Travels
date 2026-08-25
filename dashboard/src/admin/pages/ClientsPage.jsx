import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import CreateClientModal from '@/components/clients/CreateClientModal';
import ClientProfileDrawer from '@/components/clients/ClientProfileDrawer';

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

  // Formats currency numbers into standard BDT representation
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Formats ISO date string into readable local representation
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handles search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white uppercase tracking-wider">
              Client CRM
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {pagination.totalCount} Total Registered Clients
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1.5 flex items-center gap-2.5">
            <Users className="size-7 text-primary" />
            <span>Clients Directory</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Central single source of truth for client records, visa files, workflows, and ledgers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchClients}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border border-input bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Client List"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <UserPlus className="size-4" />
            <span>+ New Client</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Clients
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

      {/* Filter Bar */}
      <div className="bg-background rounded-2xl border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Passport, DID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-input bg-muted/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={clientTypeFilter}
              onChange={(e) => {
                setClientTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-input bg-background font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Client Types</option>
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
              <option value="VIP">VIP</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients DataTable */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Loading clients directory...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <Users className="size-12 mx-auto opacity-30" />
              <p className="text-base font-semibold">No client records found.</p>
              <p className="text-xs text-muted-foreground">
                Click "+ New Client" to register a new client and case workflow.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground cursor-pointer shadow-xs"
              >
                <UserPlus className="size-3.5" /> Register Client
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">Client Name & DID</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Passport & NID</th>
                    <th className="py-3.5 px-4">Client Type</th>
                    <th className="py-3.5 px-4">Active Files</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client) => {
                    const casesCount = (client.clientCases?.length || 0) + (client.applications?.length || 0);
                    return (
                      <tr
                        key={client.did || client._id}
                        onClick={() => setSelectedClientDid(client.did)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {client.fullName?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <span className="font-bold text-foreground hover:text-primary transition-colors">
                                {client.fullName}
                              </span>
                              <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                                {client.did?.slice(0, 16)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            <Phone className="size-3 text-primary" />
                            {client.phone}
                          </div>
                          {client.email && (
                            <div className="text-muted-foreground truncate max-w-[150px] mt-0.5">
                              {client.email}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          {client.passportNumber ? (
                            <span className="font-bold text-sky-600 dark:text-sky-400">
                              {client.passportNumber}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                          {client.nidNumber && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              NID: {client.nidNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-muted text-muted-foreground border border-border">
                            {client.clientType || 'Individual'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                            {casesCount} Files
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              client.status === 'Active' || !client.status
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {client.status || 'Active'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {formatDate(client.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClientDid(client.did);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>View 360°</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalCount} Total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
