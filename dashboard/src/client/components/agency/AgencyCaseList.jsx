import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  FileText,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  Globe2,
  Phone,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plane,
  Stamp,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CaseFileCreationModal } from './CaseFileCreationModal';
import { CaseWorkspaceDrawer } from './CaseWorkspaceDrawer';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

const STAGE_FILTERS = [
  { id: 'all', label: 'All Files' },
  { id: 'ENTRY', label: '1. File Intake' },
  { id: 'PROCESSING', label: '2. Processing' },
  { id: 'SUBMISSION', label: '3. Submission' },
  { id: 'STAMPED', label: '4. Stamped' },
  { id: 'COMPLETED', label: '5. Completed' },
];

export function AgencyCaseList({ autoOpenCreate = false }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(autoOpenCreate));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
        status: stageFilter !== 'all' ? stageFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/client/cases', { params });
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCases(list);
    } catch (err) {
      console.error('Failed to load agency cases:', err);
      toast.error('Unable to fetch case files from server.');
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = search.toLowerCase().trim();
      const applicant = String(c.applicantName || c.clientInfo?.fullName || c.clientInfo?.name || '').toLowerCase();
      const caseNum = String(c.caseNumber || c.fileNumber || c.trackingNumber || c.did || '').toLowerCase();
      const phone = String(c.phone || c.clientInfo?.phone || '').toLowerCase();
      const passport = String(c.passportNumber || c.clientInfo?.passportNumber || '').toLowerCase();
      const country = String(c.destinationCountry || c.country || '').toLowerCase();

      const matchesSearch =
        !q ||
        applicant.includes(q) ||
        caseNum.includes(q) ||
        phone.includes(q) ||
        passport.includes(q) ||
        country.includes(q);

      const currentStage = String(c.currentStage || c.status || 'ENTRY').toUpperCase();
      const matchesStage =
        stageFilter === 'all' ||
        currentStage === stageFilter.toUpperCase() ||
        (stageFilter === 'PROCESSING' && (currentStage === 'PROCESSING' || currentStage === 'IN_PROGRESS')) ||
        (stageFilter === 'ENTRY' && (currentStage === 'ENTRY' || currentStage === 'PENDING'));

      return matchesSearch && matchesStage;
    });
  }, [cases, search, stageFilter]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let total = cases.length;
    let inProgress = 0;
    let stamped = 0;
    let totalDues = 0;

    cases.forEach((c) => {
      const st = String(c.currentStage || c.status || '').toUpperCase();
      if (st === 'PROCESSING' || st === 'IN_PROGRESS' || st === 'SUBMISSION' || st === 'ENTRY') {
        inProgress++;
      }
      if (st === 'STAMPED' || st === 'VISA_STAMPED' || st === 'COMPLETED') {
        stamped++;
      }
      const due = Number(c.financials?.dueAmount ?? c.dueAmount ?? 0);
      if (!isNaN(due) && due > 0) {
        totalDues += due;
      }
    });

    return { total, inProgress, stamped, totalDues };
  }, [cases]);

  const handleDeleteCase = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/client/cases/${deleteTarget.did || deleteTarget._id || deleteTarget.id}`);
      toast.success('Case File removed successfully.');
      setDeleteTarget(null);
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete case file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStageBadge = (stage) => {
    const s = String(stage || 'ENTRY').toUpperCase();
    if (s === 'ENTRY' || s === 'PENDING') {
      return <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-black border border-black/15 font-bold text-[10px]">1. File Intake</span>;
    }
    if (s === 'PROCESSING' || s === 'IN_PROGRESS') {
      return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">2. Processing</span>;
    }
    if (s === 'SUBMISSION') {
      return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">3. Submission</span>;
    }
    if (s === 'STAMPED' || s === 'VISA_STAMPED') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">4. Stamped ✓</span>;
    }
    if (s === 'COMPLETED') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">5. Completed ✓</span>;
    }
    if (s === 'REJECTED') {
      return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 font-bold text-[10px]">Rejected</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-black font-semibold text-[10px]">{stage || 'Entry'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black/10 p-5 sm:p-6 rounded-2xl shadow-xs text-black">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-black/[0.04] border border-black/15 flex items-center justify-center shrink-0 text-black">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
                Client Case Files &amp; Dossiers
              </h1>
              <p className="text-xs text-black/60 font-medium mt-0.5">
                Centralized visa workflow pipelines, candidate dossiers, vault documents, and stage progress.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white hover:bg-black/90 font-bold text-xs shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>+ New Case File / Intake</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCases}
            disabled={isLoading}
            className="border-black/15 text-black hover:bg-black/5 font-semibold text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Data'}</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Total Active Files</span>
            <div className="p-2 rounded-xl bg-black/[0.04] text-black">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-black">{metrics.total}</p>
          <span className="text-[11px] text-black/50">Registered visa &amp; travel cases</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">In Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-blue-700">{metrics.inProgress}</p>
          <span className="text-[11px] text-blue-800/60">Under processing &amp; submission</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Visas Stamped</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Stamp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700">{metrics.stamped}</p>
          <span className="text-[11px] text-emerald-800/60">Approved &amp; completed dossiers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-red-700">
            ৳ {Number(metrics.totalDues || 0).toLocaleString('en-BD')}
          </p>
          <span className="text-[11px] text-red-800/60">Total pending client balances</span>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-black/10 p-3.5 sm:p-4 rounded-2xl shadow-2xs">
        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl border border-black/10 text-xs w-full sm:w-auto overflow-x-auto">
          {STAGE_FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStageFilter(tab.id);
                setPage(1);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                stageFilter === tab.id
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/50" />
          <input
            type="text"
            placeholder="Search by file #, applicant, passport, country..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-black/15 rounded-xl text-black placeholder:text-black/40 focus:ring-2 focus:ring-black/10 outline-none font-medium"
          />
        </div>
      </div>

      {/* 4. Cases Table */}
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-black/[0.02] text-black/70 font-bold uppercase tracking-wider text-[11px] border-b border-black/10 select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">File Number</th>
                <th className="py-3.5 px-4 font-semibold">Applicant Details</th>
                <th className="py-3.5 px-4 font-semibold">Destination &amp; Visa</th>
                <th className="py-3.5 px-4 font-semibold">Stage Status</th>
                <th className="py-3.5 px-4 font-semibold">Financials</th>
                <th className="py-3.5 px-4 font-semibold">Vault Docs</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-black/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-black/60" />
                      <span className="text-xs font-semibold text-black">Loading case files...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-black/60">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="size-12 rounded-full bg-black/[0.04] flex items-center justify-center text-black/50 mb-1">
                        <FolderOpen className="size-6 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-bold text-black">No case files found</span>
                      <p className="text-xs text-black/60">No case dossiers match your search or stage criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((caseItem) => {
                  const caseId = caseItem.did || caseItem._id || caseItem.id;
                  const fileNum = caseItem.caseNumber || caseItem.fileNumber || caseItem.trackingNumber || caseId;
                  const applicantName = caseItem.applicantName || caseItem.clientInfo?.fullName || caseItem.clientInfo?.name || 'Unnamed Applicant';
                  const phone = caseItem.phone || caseItem.clientInfo?.phone || '';
                  const passport = caseItem.passportNumber || caseItem.clientInfo?.passportNumber || '—';
                  const country = caseItem.destinationCountry || caseItem.country || 'Global';
                  const caseType = caseItem.caseType || caseItem.serviceType || 'Visa Processing';
                  const vaultCount = caseItem.vaultDocuments?.length || (caseItem.checklist ? Object.values(caseItem.checklist).filter(Boolean).length : 0);
                  const agreedAmount = Number(caseItem.financials?.agreedAmount ?? caseItem.totalBilledAmount ?? 0);
                  const paidAmount = Number(caseItem.financials?.paidAmount ?? caseItem.totalPaidAmount ?? 0);
                  const dueAmount = Number(caseItem.financials?.dueAmount ?? caseItem.dueAmount ?? Math.max(0, agreedAmount - paidAmount));

                  return (
                    <tr
                      key={caseId}
                      className="hover:bg-black/[0.01] transition-colors group cursor-pointer"
                      onClick={() => setSelectedCaseId(caseId)}
                    >
                      {/* File Number */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-black block tracking-tight">{fileNum}</span>
                        <span className="text-[10px] text-black/50">
                          {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('en-GB') : '—'}
                        </span>
                      </td>

                      {/* Applicant Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-black">{applicantName}</div>
                        <div className="flex items-center gap-2 text-[10px] text-black/60 font-mono mt-0.5">
                          {phone && <span>{phone}</span>}
                          {passport && passport !== '—' && <span>• Pass: {passport}</span>}
                        </div>
                      </td>

                      {/* Destination & Visa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-black">
                          <Globe2 className="w-3.5 h-3.5 text-black/50" />
                          <span>{country}</span>
                        </div>
                        <span className="text-[10px] text-black/60 block">{caseType}</span>
                      </td>

                      {/* Stage Status */}
                      <td className="py-3 px-4">
                        {getStageBadge(caseItem.currentStage || caseItem.status)}
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-4 font-mono">
                        {agreedAmount > 0 ? (
                          <div>
                            <span className="text-emerald-800 font-bold block">
                              Paid: ৳ {paidAmount.toLocaleString('en-BD')}
                            </span>
                            {dueAmount > 0 ? (
                              <span className="text-red-700 font-bold text-[10px]">
                                Due: ৳ {dueAmount.toLocaleString('en-BD')}
                              </span>
                            ) : (
                              <span className="text-emerald-700 text-[10px] font-semibold">Settled ✓</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-black/40 text-[10px] italic">No ledger</span>
                        )}
                      </td>

                      {/* Vault Docs */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.04] border border-black/10 text-[10px] font-bold text-black/80">
                          <FileText className="w-3 h-3 text-black/50" />
                          {vaultCount} doc(s)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCaseId(caseId)}
                            className="h-7 px-2.5 text-xs font-bold border-black/15 text-black hover:bg-black/5 gap-1 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            <span>Workspace</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteTarget(caseItem)}
                            className="h-7 px-2 text-xs font-semibold border-red-500/30 text-red-600 hover:bg-red-500/10 cursor-pointer"
                            title="Delete Case File"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-black/10 flex items-center justify-between text-xs bg-black/[0.01]">
            <span className="text-black/60 font-medium">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredCases.length)} of {filteredCases.length} files
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs border-black/15 text-black hover:bg-black/5"
              >
                Previous
              </Button>
              <span className="px-2 font-mono font-bold text-black">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 text-xs border-black/15 text-black hover:bg-black/5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Case File Creation Modal */}
      <CaseFileCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCaseCreated={() => {
          setIsCreateModalOpen(false);
          fetchCases();
        }}
      />

      {/* Case Workspace Drawer */}
      <CaseWorkspaceDrawer
        caseId={selectedCaseId}
        isOpen={Boolean(selectedCaseId)}
        onClose={() => setSelectedCaseId(null)}
        onRefresh={fetchCases}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCase}
        title="Delete Case File"
        description={`Are you sure you want to delete Case File "${deleteTarget?.applicantName || deleteTarget?.caseNumber}"? All linked records and dossiers will be permanently deleted.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default AgencyCaseList;
