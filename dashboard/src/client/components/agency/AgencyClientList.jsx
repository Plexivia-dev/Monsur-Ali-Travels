import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Users,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Plus,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { CaseFileCreationModal } from './CaseFileCreationModal';

export function AgencyClientList({ autoOpenCreate = false }) {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(autoOpenCreate));
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/client/clients', {
        params: { page, limit: 100, search: search.trim() || undefined }
      });
      const clientList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setClients(clientList);
    } catch (err) {
      console.error('Failed to load agency clients:', err);
      toast.error('Unable to fetch client records from server.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const name = String(c.name || c.fullName || '').toLowerCase();
      const code = String(c.clientCode || c.id || c._id || '').toLowerCase();
      const phone = String(c.phone || '').toLowerCase();
      const email = String(c.email || '').toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        phone.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        String(c.status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xs text-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Client Directory
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Comprehensive roster of registered agency clients and candidate dossiers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-xs font-bold rounded-xl text-primary-foreground transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>+ New Case / Intake</span>
          </button>
          <button
            type="button"
            onClick={fetchClients}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted/80 border border-border text-xs font-semibold rounded-xl text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Data'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 sm:p-4 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client name, code, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Client Code</th>
                <th className="py-3.5 px-4 font-semibold">Full Name</th>
                <th className="py-3.5 px-4 font-semibold">Contact</th>
                <th className="py-3.5 px-4 font-semibold">Passport / NID</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-foreground">Loading client records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
                        <Users className="size-6 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-bold text-foreground">No client records found</span>
                      <p className="text-xs text-muted-foreground">No records match your query or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const clientCode = client.clientCode || client.code || `CL-${String(client._id || client.id || '').slice(-6).toUpperCase()}`;
                  const fullName = client.name || client.fullName || 'Unnamed Client';
                  const phone = client.phone || client.mobile || '—';
                  const email = client.email || '—';
                  const docId = client.passportNo || client.passportNumber || client.nidNo || client.nid || '—';
                  const status = client.status || 'Active';
                  const isActive = String(status).toLowerCase() === 'active';

                  return (
                    <tr
                      key={client._id || client.id || clientCode}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {clientCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {fullName}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-foreground font-medium">{phone}</div>
                        {email !== '—' && <div className="text-[11px] text-muted-foreground font-mono">{email}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {docId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted border-border text-muted-foreground'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                            }`}
                          />
                          <span>{status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(client)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="size-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredClients.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredClients.length)} to{' '}
              {Math.min(page * pageSize, filteredClients.length)} of {filteredClients.length} clients
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-card hover:bg-muted disabled:opacity-40 border border-border rounded-md text-foreground font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-card hover:bg-muted disabled:opacity-40 border border-border rounded-md text-foreground font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal (Strict Read-Only) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-black">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.02]">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Client Profile Overview
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Verified agency records (Read-Only)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-1">
                  <div className="text-base font-bold text-foreground">
                    {selectedClient.name || selectedClient.fullName || 'Client'}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Code: {selectedClient.clientCode || selectedClient.code || selectedClient._id || selectedClient.id}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted border border-border text-foreground">
                  {selectedClient.status || 'Active'}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {selectedClient.phone || selectedClient.mobile || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {selectedClient.email || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-muted-foreground" />
                    <span>Passport / NID</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-foreground">
                    {selectedClient.passportNo || selectedClient.passportNumber || selectedClient.nidNo || selectedClient.nid || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>Address / Location</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {selectedClient.address?.full || selectedClient.address || selectedClient.district || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Guardian / Remarks info if available */}
              {(selectedClient.guardianName || selectedClient.guardianPhone || selectedClient.remarks || selectedClient.notes) && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Additional Candidate Details
                  </div>
                  {selectedClient.guardianName && (
                    <div className="text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground">Guardian Name:</span> {selectedClient.guardianName}
                    </div>
                  )}
                  {selectedClient.guardianPhone && (
                    <div className="text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground">Guardian Phone:</span> {selectedClient.guardianPhone}
                    </div>
                  )}
                  {(selectedClient.remarks || selectedClient.notes) && (
                    <div className="text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground">Remarks:</span> {selectedClient.remarks || selectedClient.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5-Step Case Creation Modal */}
      <CaseFileCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchClients();
        }}
      />
    </div>
  );
}

export default AgencyClientList;
