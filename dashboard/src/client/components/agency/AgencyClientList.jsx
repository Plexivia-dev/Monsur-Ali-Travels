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
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function AgencyClientList() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/clients');
      const payload = response.data;
      const clientList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <Users className="size-5 text-zinc-100" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Client Directory
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                Comprehensive roster of registered agency clients (Read-Only Access)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchClients}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Data'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by client name, code, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer font-medium"
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800 select-none">
              <tr>
                <th className="py-3 px-4">Client Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Passport / NID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-zinc-400" />
                      <span className="text-xs font-semibold">Loading client records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-zinc-600 stroke-[1.5]" />
                      <span className="text-sm font-semibold text-zinc-400">No client records found</span>
                      <p className="text-xs text-zinc-600">No records match your query or filter criteria.</p>
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

                  return (
                    <tr
                      key={client._id || client.id || clientCode}
                      className="hover:bg-zinc-900/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {clientCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {fullName}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-zinc-300 font-medium">{phone}</div>
                        {email !== '—' && <div className="text-[11px] text-zinc-500">{email}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {docId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-200">
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(client)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                        >
                          <Eye className="size-3.5 text-zinc-300" />
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredClients.length)} to{' '}
              {Math.min(page * pageSize, filteredClients.length)} of {filteredClients.length} clients
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 rounded-md text-white font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold text-white">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 rounded-md text-white font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal (Strict Read-Only) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <Users className="size-4 text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">
                    Client Profile Overview
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Verified agency records (Read-Only)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">
                    {selectedClient.name || selectedClient.fullName || 'Client'}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    Code: {selectedClient.clientCode || selectedClient.code || selectedClient._id || selectedClient.id}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-white">
                  {selectedClient.status || 'Active'}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-zinc-400" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedClient.phone || selectedClient.mobile || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-zinc-400" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedClient.email || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-zinc-400" />
                    <span>Passport / NID</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-zinc-200">
                    {selectedClient.passportNo || selectedClient.passportNumber || selectedClient.nidNo || selectedClient.nid || 'Not specified'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-zinc-400" />
                    <span>Address / Location</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedClient.address?.full || selectedClient.address || selectedClient.district || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Guardian / Remarks info if available */}
              {(selectedClient.guardianName || selectedClient.guardianPhone || selectedClient.remarks || selectedClient.notes) && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Additional Candidate Details
                  </div>
                  {selectedClient.guardianName && (
                    <div className="text-xs text-zinc-300">
                      <span className="font-semibold text-zinc-400">Guardian Name:</span> {selectedClient.guardianName}
                    </div>
                  )}
                  {selectedClient.guardianPhone && (
                    <div className="text-xs text-zinc-300">
                      <span className="font-semibold text-zinc-400">Guardian Phone:</span> {selectedClient.guardianPhone}
                    </div>
                  )}
                  {(selectedClient.remarks || selectedClient.notes) && (
                    <div className="text-xs text-zinc-300">
                      <span className="font-semibold text-zinc-400">Remarks:</span> {selectedClient.remarks || selectedClient.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyClientList;
