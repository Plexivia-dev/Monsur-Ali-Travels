import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Users,
  Trash2,
  Eye,
  X,
  Plus,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ChevronRight,
  Edit,
  User,
  Receipt,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { usePortal } from '../../context/PortalContext';
import { MoneyReceiptModal } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ClientDataTable({ activeSubmodule }) {
  const { t } = useTranslation();
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    skip: 0,
    totalCount: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [profileItem, setProfileItem] = useState(null);
  const [selectedCaseIdForWorkspace, setSelectedCaseIdForWorkspace] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(
    activeSubmodule === 'clients-add' || activeSubmodule === 'add-client'
  );
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    phone: '',
    passportNumber: '',
    email: '',
    presentAddress: '',
    clientType: 'Individual',
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeSubmodule === 'clients-add' || activeSubmodule === 'add-client') {
      setIsCreateClientOpen(true);
    } else {
      setIsCreateClientOpen(false);
    }
  }, [activeSubmodule]);

  const fetchData = async (
    page = 1,
    limit = pagination.limit,
    searchQuery = search,
    statusVal = statusFilter,
    typeVal = typeFilter
  ) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusVal !== 'all' ? statusVal : undefined,
        clientType: typeVal !== 'all' ? typeVal : undefined,
      };

      const res = await apiClient.get('/api/v1/client/clients', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, statusFilter, typeFilter);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/client/clients/${deleteTarget.id}`);
      toast.success(t('clients.deleteSuccess', 'Client profile deleted successfully.'));
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, statusFilter, typeFilter);
    } catch (err) {
      console.error('Failed to delete client:', err);
      toast.error(t('clients.deleteError', 'Failed to delete client.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateClientSubmit = async (e) => {
    e.preventDefault();
    if (!newClientForm.fullName.trim() || !newClientForm.phone.trim()) {
      toast.error('Client Full Name and Phone Number are required.');
      return;
    }

    try {
      setIsCreatingClient(true);
      const res = await apiClient.post('/api/v1/client/clients', newClientForm);
      if (res.data?.success || res.data?.status === 'success') {
        toast.success(`Client ${newClientForm.fullName} registered successfully!`);
        setIsCreateClientOpen(false);
        setNewClientForm({
          fullName: '',
          phone: '',
          passportNumber: '',
          email: '',
          presentAddress: '',
          clientType: 'Individual',
        });
        fetchData(1);
      }
    } catch (err) {
      console.error('Failed to create client:', err);
      toast.error(err.response?.data?.message || 'Failed to register client.');
    } finally {
      setIsCreatingClient(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      Lead: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      Inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      Blacklisted: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      Archived: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    return map[status] || map.Active;
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            {t('clients.title', 'Client Profiles & Accounts')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('clients.subtitle', 'Central client profiles, contact directory, service history, and live financial payment ledgers.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateClientOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('clients.addClient', 'Add New Client')}</span>
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
            placeholder={t('clients.searchPlaceholder', 'Search by name, phone, passport, NID...')}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{t('clients.statusFilter', 'All Statuses')}</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{t('clients.typeFilter', 'All Types')}</option>
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
            <option value="Agent_Referred">Agent Referred</option>
            <option value="VIP">VIP</option>
          </select>

          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search, statusFilter, typeFilter)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{t('clients.code', 'Client Code')}</th>
                <th className="p-3">{t('clients.name', 'Name')}</th>
                <th className="p-3">{t('clients.phone', 'Phone')}</th>
                <th className="p-3">{t('clients.passportNid', 'Passport / NID')}</th>
                <th className="p-3 text-center">{t('clients.services', 'Services')}</th>
                <th className="p-3 text-right">{t('clients.due', 'Due (BDT )')}</th>
                <th className="p-3 text-center">{t('clients.status', 'Status')}</th>
                <th className="p-3 text-right">{t('clients.action', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>{t('clients.loading', 'Loading data...')}</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground font-medium">
                    {t('common.noData', 'No data found')}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const totalServices =
                    (item.applications?.length || 0) +
                    (item.visaSubmissions?.length || 0) +
                    (item.passportSubmissions?.length || 0) +
                    (item.clientCases?.length || 0) +
                    (item.agreements?.length || 0) +
                    (item.invoices?.length || 0);

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-center font-mono text-muted-foreground">
                        {pagination.skip + idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-600">
                        {item.clientCode || '—'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-foreground">{item.fullName || '—'}</div>
                        {item.fatherName && (
                          <div className="text-[10px] text-muted-foreground">
                            {t('clients.fatherPrefix', 'Father')}: {item.fatherName}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-foreground">
                        {item.phone || '—'}
                      </td>
                      <td className="p-3">
                        {item.passportNumber && (
                          <div className="font-mono font-medium text-foreground">
                            {item.passportNumber}
                          </div>
                        )}
                        {item.nidNumber && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            NID: {item.nidNumber}
                          </div>
                        )}
                        {!item.passportNumber && !item.nidNumber && '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block min-w-[24px] px-2 py-0.5 rounded text-[10px] font-bold ${
                            totalServices > 0
                              ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {totalServices}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {item.totalDueAmount > 0 ? (
                          <span className="text-rose-500">
                            {Number(item.totalDueAmount).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptModalData({
                                clientName: item.fullName,
                                clientPhone: item.phone,
                                passportNumber: item.passportNumber,
                                clientId: item._id,
                              })
                            }
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer"
                            title="Issue Money Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileItem(item)}
                            className="p-1.5 rounded hover:bg-sky-500/10 text-sky-600 transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, clientCode: item.clientCode })}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete"
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
          onPageChange={(p) => fetchData(p, pagination.limit, search, statusFilter, typeFilter)}
          onLimitChange={(l) => fetchData(1, l, search, statusFilter, typeFilter)}
        />
      </div>

      {/* Client Profile Modal */}
      {profileItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white text-zinc-900 border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full h-[70vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-black/10 bg-black/[0.02] flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Client Profile — {profileItem.clientCode}
                </h3>
                <p className="text-[11px] text-zinc-500">{profileItem.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileItem(null)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBlock label="Full Name" value={profileItem.fullName} />
                <InfoBlock label="Client Code" value={profileItem.clientCode} mono />
                <InfoBlock label="Phone" value={profileItem.phone} mono icon={<Phone className="w-3 h-3" />} />
                <InfoBlock label="Email" value={profileItem.email} icon={<Mail className="w-3 h-3" />} />
                <InfoBlock label="Passport No" value={profileItem.passportNumber} mono icon={<CreditCard className="w-3 h-3" />} />
                <InfoBlock label="NID No" value={profileItem.nidNumber} mono />
                <InfoBlock label="Father's Name" value={profileItem.fatherName} />
                <InfoBlock label="Mother's Name" value={profileItem.motherName} />
                <InfoBlock label="Date of Birth" value={profileItem.birthDate} />
                <InfoBlock label="Gender" value={profileItem.gender} />
                <InfoBlock label="Blood Group" value={profileItem.bloodGroup} />
                <InfoBlock label="Marital Status" value={profileItem.maritalStatus} />
              </div>

              {/* Address */}
              {(profileItem.presentAddress || profileItem.permanentAddress) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="Present Address" value={profileItem.presentAddress} />
                    <InfoBlock label="Permanent Address" value={profileItem.permanentAddress} />
                    <InfoBlock label="District" value={profileItem.district} />
                    <InfoBlock label="Police Station / Upazila" value={profileItem.policeStation} />
                  </div>
                </div>
              )}

              {/* Guardian */}
              {profileItem.guardian?.name && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Guardian Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="Name" value={profileItem.guardian.name} />
                    <InfoBlock label="Relationship" value={profileItem.guardian.relationship} />
                    <InfoBlock label="Phone" value={profileItem.guardian.phone} mono />
                    <InfoBlock label="NID" value={profileItem.guardian.nidNumber} mono />
                  </div>
                </div>
              )}

              {/* Financial Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Financial Ledger</h4>
                <div className="grid grid-cols-3 gap-3">
                  <LedgerCard label="Total Invoiced" value={profileItem.totalBilledAmount} color="sky" />
                  <LedgerCard label="Total Paid" value={profileItem.totalPaidAmount} color="emerald" />
                  <LedgerCard label="Total Due" value={profileItem.totalDueAmount} color="rose" />
                </div>
              </div>

              {/* Linked Services Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Service History</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <ServiceBadge label="Applications" count={profileItem.applications?.length || 0} />
                  <ServiceBadge label="Visa Applications" count={profileItem.visaSubmissions?.length || 0} />
                  <ServiceBadge label="Passports" count={profileItem.passportSubmissions?.length || 0} />
                  <ServiceBadge label="Case Files" count={profileItem.clientCases?.length || 0} />
                  <ServiceBadge label="Agreements" count={profileItem.agreements?.length || 0} />
                  <ServiceBadge label="Invoices" count={profileItem.invoices?.length || 0} />
                </div>
              </div>

              {/* Actions inside Profile View */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCaseIdForWorkspace(profileItem.did || profileItem._id);
                    setProfileItem(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Client Case Files & Dossiers</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReceiptModalData({
                      clientName: profileItem.fullName,
                      clientPhone: profileItem.phone,
                      passportNumber: profileItem.passportNumber,
                      clientId: profileItem._id,
                    });
                    setProfileItem(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Issue Payment Token / Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Workspace Drawer */}
      <CaseWorkspaceDrawer
        caseId={selectedCaseIdForWorkspace}
        isOpen={Boolean(selectedCaseIdForWorkspace)}
        onClose={() => setSelectedCaseIdForWorkspace(null)}
        onRefresh={() => fetchData(pagination.page)}
      />

      {/* Money Receipt Modal */}
      <MoneyReceiptModal
        isOpen={Boolean(receiptModalData)}
        onClose={() => setReceiptModalData(null)}
        initialData={receiptModalData || {}}
        onCreated={() => {
          fetchData(pagination.page);
        }}
      />

      {/* Add New Client Modal */}
      {isCreateClientOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white text-zinc-900 border border-black/10 rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-black/10 bg-black/[0.02] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                New Client Registration
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateClientOpen(false)}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClientSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md Ikramul Hasan"
                    value={newClientForm.fullName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-xs text-zinc-900 focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-xs font-mono text-zinc-900 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A01234567"
                      value={newClientForm.passportNumber}
                      onChange={(e) => setNewClientForm({ ...newClientForm, passportNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-xs font-mono uppercase text-zinc-900 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-xs text-zinc-900 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jagannathpur, Sunamganj"
                    value={newClientForm.presentAddress}
                    onChange={(e) => setNewClientForm({ ...newClientForm, presentAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/10 rounded-xl text-xs text-zinc-900 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="px-6 py-3.5 flex items-center justify-end gap-2.5 border-t border-black/10 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateClientOpen(false)}
                  className="px-4 h-9 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="px-5 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isCreatingClient ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Alert Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this?"
        description={`Client code "${deleteTarget?.clientCode || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Helper Components

function InfoBlock({ label, value, mono = false, icon = null }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`text-xs text-foreground font-medium ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function LedgerCard({ label, value = 0, color = 'sky' }) {
  const colorMap = {
    sky: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };
  return (
    <div className={`p-3 rounded-lg border text-center ${colorMap[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-sm font-bold font-mono mt-0.5">
        BDT  {Number(value || 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function ServiceBadge({ label, count = 0 }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
          count > 0 ? 'bg-sky-500/10 text-sky-600' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </div>
  );
}

export default ClientDataTable;

