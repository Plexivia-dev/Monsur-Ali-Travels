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
  Clock,
  Stamp,
  Globe2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CaseFileCreationModal } from './CaseFileCreationModal';
import { CaseWorkspaceDrawer } from './CaseWorkspaceDrawer';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

const STAGE_FILTERS = [
  { id: 'all', label: 'All Files (সব ফাইল)' },
  { id: 'INTAKE', label: '1. File Intake' },
  { id: 'UNDER_PROCESS', label: '2. Under Process' },
  { id: 'OFFER_LETTER', label: '3. Offer Letter' },
  { id: 'COMPLETED', label: '4. Completed' },
];

// Helper: Extracts Candidate Triad Identity
function getCandidateTriad(c) {
  const photoUrl =
    c.attachments?.photo ||
    c.clientInfo?.attachments?.photo ||
    c.photo ||
    c.clientInfo?.photo ||
    c.vaultDocuments?.find((d) =>
      /photo|picture|2x2|ছবি|image|portrait/i.test(d.documentName || d.fileName || '')
    )?.fileUrl ||
    null;

  const passportScanUrl =
    c.attachments?.passport ||
    c.clientInfo?.attachments?.passport ||
    c.passportScan ||
    c.vaultDocuments?.find((d) =>
      /passport|পাসপোর্ট/i.test(d.documentName || d.fileName || '')
    )?.fileUrl ||
    null;

  const clientName = c.applicantName || c.clientInfo?.fullName || c.clientInfo?.name || 'Unnamed Client';
  const fatherName = c.fatherName || c.extraData?.fatherName || c.clientInfo?.fatherName || '';
  const district =
    c.district ||
    c.clientInfo?.district ||
    c.presentAddress ||
    c.extraData?.presentAddress ||
    c.clientInfo?.presentAddress ||
    '';

  const passportNumber = (c.passportNumber || c.clientInfo?.passportNumber || '').toUpperCase().trim();

  const initials = (clientName || 'C')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return {
    photoUrl,
    passportScanUrl,
    clientName,
    fatherName,
    district,
    passportNumber,
    initials,
  };
}

// Helper: 1-Click Hover Passport Chip with Popover Preview
function PassportChipPopover({ passportNumber, passportScanUrl }) {
  if (!passportNumber && !passportScanUrl) {
    return <span className="font-mono text-[10px] text-black/40 font-semibold">No Passport</span>;
  }

  return (
    <div className="relative group/passport inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (passportScanUrl) {
            window.open(passportScanUrl, '_blank', 'noopener,noreferrer');
          } else {
            toast.info(`Passport: ${passportNumber}`);
          }
        }}
        className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] border border-black/15 text-black flex items-center gap-1 cursor-pointer transition select-none"
        title={passportScanUrl ? '1-Click to view passport scan' : 'Candidate Passport'}
      >
        <span>🛂</span>
        <span>{passportNumber || 'VIEW SCAN'}</span>
      </button>

      {/* 1-Click Hover Quick-Peek Floating Popover */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/passport:flex flex-col w-56 p-2.5 bg-white border border-black/10 rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black/60">Passport Quick Peek</span>
          <span className="font-mono text-[10px] font-bold text-primary">{passportNumber || '—'}</span>
        </div>
        {passportScanUrl ? (
          <div className="rounded-lg overflow-hidden border border-black/10 bg-black/[0.02] max-h-32 flex items-center justify-center">
            {passportScanUrl.toLowerCase().endsWith('.pdf') ? (
              <div className="p-3 text-center">
                <FileText className="size-6 text-primary mx-auto mb-1" />
                <span className="text-[10px] text-black/60 font-semibold">PDF Bio-Page Attached</span>
              </div>
            ) : (
              <img src={passportScanUrl} alt="Passport Scan" className="w-full h-auto max-h-32 object-contain" />
            )}
          </div>
        ) : (
          <p className="text-[10px] text-black/50 italic py-1">No scan attached yet</p>
        )}
        <span className="text-[9px] text-black/40 mt-1 text-center font-medium">Click chip to view full document</span>
      </div>
    </div>
  );
}

export function AgencyCaseList({ autoOpenCreate = false }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [pipelineView, setPipelineView] = useState('all'); // 'all' | 'overseas' | 'indian_visa'
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
        limit: 250,
        search: search.trim() || undefined,
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
  }, [search]);

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

      // Stage Filter (Canonical & legacy alias support)
      const currentStage = String(c.status || c.currentStage || 'INTAKE').toUpperCase();
      let matchesStage = stageFilter === 'all';
      if (!matchesStage) {
        if (stageFilter === 'INTAKE') {
          matchesStage = currentStage === 'ENTRY' || currentStage === 'INTAKE' || currentStage === 'PENDING' || currentStage === 'NEW';
        } else if (stageFilter === 'UNDER_PROCESS') {
          matchesStage = currentStage === 'UNDER_PROCESS' || currentStage === 'PROCESSING' || currentStage === 'IN_PROGRESS';
        } else if (stageFilter === 'OFFER_LETTER') {
          matchesStage = currentStage === 'OFFER_LETTER' || currentStage === 'APPROVED_OFFER_LETTER' || currentStage === 'FLIGHT_BOOKED';
        } else if (stageFilter === 'COMPLETED') {
          matchesStage = currentStage === 'COMPLETED' || currentStage === 'COMPLETED_DELIVERED' || currentStage === 'STAMPED' || currentStage === 'VISA_STAMPED';
        } else {
          matchesStage = currentStage === stageFilter.toUpperCase();
        }
      }

      // Pipeline Switcher: Overseas Cases vs Indian Visa Processing
      const dest = String(c.destinationCountry || c.country || c.caseType || '').toLowerCase();
      const service = String(c.serviceType || c.tradeSkill || '').toLowerCase();
      const isIndianVisa = dest.includes('india') || service.includes('indian visa') || c.caseType === 'INDIAN_VISA';

      let matchesPipeline = true;
      if (pipelineView === 'indian_visa') {
        matchesPipeline = isIndianVisa;
      } else if (pipelineView === 'overseas') {
        matchesPipeline = !isIndianVisa;
      }

      return matchesSearch && matchesStage && matchesPipeline;
    });
  }, [cases, search, stageFilter, pipelineView]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let total = cases.length;
    let intake = 0;
    let underProcess = 0;
    let offerLetter = 0;
    let completed = 0;
    let totalDues = 0;

    cases.forEach((c) => {
      const st = String(c.status || c.currentStage || '').toUpperCase();
      if (st === 'ENTRY' || st === 'INTAKE' || st === 'PENDING' || st === 'NEW') {
        intake++;
      } else if (st === 'UNDER_PROCESS' || st === 'PROCESSING' || st === 'IN_PROGRESS') {
        underProcess++;
      } else if (st === 'OFFER_LETTER' || st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED') {
        offerLetter++;
      } else if (st === 'COMPLETED' || st === 'COMPLETED_DELIVERED' || st === 'STAMPED' || st === 'VISA_STAMPED') {
        completed++;
      }
      const due = Number(c.financials?.dueAmount ?? c.dueAmount ?? 0);
      if (!isNaN(due) && due > 0) {
        totalDues += due;
      }
    });

    return { total, intake, underProcess, offerLetter, completed, totalDues };
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
    const s = String(stage || 'INTAKE').toUpperCase();
    if (s === 'INTAKE' || s === 'ENTRY' || s === 'PENDING' || s === 'NEW') {
      return <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-black border border-black/15 font-bold text-[10px]">1. File Intake</span>;
    }
    if (s === 'UNDER_PROCESS' || s === 'PROCESSING' || s === 'IN_PROGRESS') {
      return <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-800 border border-sky-300 font-bold text-[10px]">2. Under Process</span>;
    }
    if (s === 'OFFER_LETTER' || s === 'APPROVED_OFFER_LETTER' || s === 'FLIGHT_BOOKED') {
      return <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-800 border border-indigo-300 font-bold text-[10px]">3. Offer Letter</span>;
    }
    if (s === 'COMPLETED' || s === 'COMPLETED_DELIVERED' || s === 'STAMPED' || s === 'VISA_STAMPED') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">4. Completed ✓</span>;
    }
    if (s === 'REJECTED') {
      return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 font-bold text-[10px]">Rejected</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-black font-semibold text-[10px]">{stage || 'Intake'}</span>;
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

      {/* 2. KPI Summary Cards (4 Canonical Stages + Total Active) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Total Active</span>
            <div className="p-2 rounded-xl bg-black/[0.04] text-black">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-black">{metrics.total}</p>
          <span className="text-[11px] text-black/50">Registered dossiers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/70 uppercase tracking-wider">1. Intake</span>
            <div className="p-2 rounded-xl bg-black/[0.04] text-black">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-black">{metrics.intake}</p>
          <span className="text-[11px] text-black/50">Passports &amp; bio intake</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">2. Under Process</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-sky-700">{metrics.underProcess}</p>
          <span className="text-[11px] text-sky-800/60">Ministry &amp; lawyer</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">3. Offer Letter</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Stamp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-indigo-700">{metrics.offerLetter}</p>
          <span className="text-[11px] text-indigo-800/60">5-page work permit dossier</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">4. Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Stamp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700">{metrics.completed}</p>
          <span className="text-[11px] text-emerald-800/60">Visa delivered &amp; settled</span>
        </div>
      </div>

      {/* 3. Filter, Pipeline Switcher & Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white border border-black/10 p-3.5 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* View Switcher: [ 🌐 Overseas Cases ] | [ 🇮🇳 Indian Visa Processing ] */}
          <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-xl border border-black/10 text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setPipelineView('overseas');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pipelineView === 'overseas'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <Globe2 className="size-3.5" />
              <span>🌐 Overseas Cases</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPipelineView('indian_visa');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pipelineView === 'indian_visa'
                  ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30 shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <Stamp className="size-3.5 text-amber-600" />
              <span>🇮🇳 Indian Visa Processing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPipelineView('all');
                setPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                pipelineView === 'all'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              All
            </button>
          </div>

          {/* Stage Filter Tabs */}
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl border border-black/10 text-xs overflow-x-auto">
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
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80 shrink-0">
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

      {/* 4. Cases Table with Triad Identity */}
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-black/[0.02] text-black/70 font-bold uppercase tracking-wider text-[11px] border-b border-black/10 select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">File Number</th>
                <th className="py-3.5 px-4 font-semibold">Candidate Triad Identity</th>
                <th className="py-3.5 px-4 font-semibold">Passport &amp; Contact</th>
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
                  <td colSpan={8} className="py-12 text-center text-black/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-black/60" />
                      <span className="text-xs font-semibold text-black">Loading case files...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-black/60">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="size-12 rounded-full bg-black/[0.04] flex items-center justify-center text-black/50 mb-1">
                        <FolderOpen className="size-6 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-bold text-black">No case files found</span>
                      <p className="text-xs text-black/60">No case dossiers match your search, view or stage criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((caseItem) => {
                  const caseId = caseItem.did || caseItem._id || caseItem.id;
                  const fileNum = caseItem.caseNumber || caseItem.fileNumber || caseItem.trackingNumber || caseId;
                  const triad = getCandidateTriad(caseItem);
                  const phone = caseItem.phone || caseItem.clientInfo?.phone || '';
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

                      {/* Triad Identity: Photo Avatar + Candidate Name + S/O Father + District */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-black/10 bg-black/[0.04] flex items-center justify-center font-bold text-xs text-black shadow-2xs">
                            {triad.photoUrl ? (
                              <img
                                src={triad.photoUrl}
                                alt={triad.clientName}
                                className="size-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{triad.initials}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-black text-xs truncate">
                              {triad.clientName}
                            </span>
                            <span className="text-[11px] text-black/60 truncate">
                              {triad.fatherName ? `S/O: ${triad.fatherName}` : 'S/O: —'}
                              {triad.district ? ` • ${triad.district}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Monospace Passport Chip with 1-Click Hover Popover Quick-Peek & Phone */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <PassportChipPopover
                            passportNumber={triad.passportNumber}
                            passportScanUrl={triad.passportScanUrl}
                          />
                          {phone && <div className="text-[10px] font-mono text-black/60">{phone}</div>}
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
                        {getStageBadge(caseItem.status || caseItem.currentStage)}
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
