import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  CreditCard,
  Layers,
  LayoutGrid,
  List,
  Globe2,
  Phone,
  Receipt,
  Download,
  Calendar,
  Building2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  UserCheck,
  Award,
  Plane,
  Stamp,
  User,
  ExternalLink,
  X,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { StepAssignModal } from '../components/workflow/StepAssignModal';
import { AddPaymentModal } from '../components/workflow/AddPaymentModal';
import { CaseDetailDrawer } from '../components/workflow/CaseDetailDrawer';
import { useAuth } from '../store/useAuthStore';
import CreateClientModal from '@/components/clients/CreateClientModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@shared/components/layout/PageTitle';

const STAGES = [
  {
    id: 'ENTRY',
    title: '1. File Intake',
    titleBn: '',
    stageName: 'File Intake',
    badgeColor: 'bg-black/[0.04] text-black border-black/15',
    headerBg: 'bg-black/[0.02] border-black/10',
    accentColor: 'text-black/70',
    stepNumber: 1,
    icon: FolderOpen,
  },
  {
    id: 'PROCESSING',
    title: '2. Document Processing',
    titleBn: '',
    stageName: 'Processing',
    badgeColor: 'bg-sky-500/10 text-sky-700 border-sky-300',
    headerBg: 'bg-sky-50/50 border-sky-200',
    accentColor: 'text-sky-600',
    stepNumber: 2,
    icon: Layers,
  },
  {
    id: 'APPROVED_OFFER_LETTER',
    title: '3. Offer Approved',
    titleBn: '',
    stageName: 'Offer Approved',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
    headerBg: 'bg-indigo-50/50 border-indigo-200',
    accentColor: 'text-indigo-600',
    stepNumber: 3,
    icon: Award,
  },
  {
    id: 'SUBMITTED_EMBASSY_BSF',
    title: '4. Embassy / VFS',
    titleBn: '',
    stageName: 'Embassy / VFS',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300',
    headerBg: 'bg-amber-50/50 border-amber-200',
    accentColor: 'text-amber-600',
    stepNumber: 4,
    icon: UserCheck,
  },
  {
    id: 'COMPLETED_DELIVERED',
    title: '5. Visa Delivered',
    titleBn: '',
    stageName: 'Delivered',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    headerBg: 'bg-emerald-50/50 border-emerald-200',
    accentColor: 'text-emerald-600',
    stepNumber: 5,
    icon: Plane,
  },
];

// Helper: Formats Destination Chip
function getDestinationChip(c) {
  const dest = (c.destinationCountry || c.caseType || '').toLowerCase();
  const service = (c.serviceType || c.tradeSkill || '').toLowerCase();

  if (dest.includes('india') || service.includes('indian visa') || c.caseType === 'INDIAN_VISA') {
    return {
      label: 'Indian Visa',
      color: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      icon: <Stamp className="size-3 mr-1" />,
    };
  }
  if (dest.includes('greece')) {
    return {
      label: 'Greece',
      color: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('saudi')) {
    return {
      label: 'Saudi Arabia',
      color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('croatia')) {
    return {
      label: 'Croatia',
      color: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('macedonia')) {
    return {
      label: 'N. Macedonia',
      color: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('qatar')) {
    return {
      label: 'Qatar',
      color: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('dubai') || dest.includes('uae')) {
    return {
      label: 'Dubai / UAE',
      color: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }

  return {
    label: c.destinationCountry || c.caseType || 'Other Country',
    color: 'bg-muted text-foreground border-border',
    icon: <Globe2 className="size-3 mr-1" />,
  };
}

// Helper: Formats Stage Badge
function getStageBadge(stKey) {
  const st = String(stKey || 'ENTRY').toUpperCase();
  if (st === 'ENTRY' || st === 'NEW') {
    return { label: 'File Intake', color: 'bg-black/[0.04] text-black border-black/15' };
  }
  if (st === 'PROCESSING') {
    return { label: 'Processing', color: 'bg-sky-500/10 text-sky-700 border-sky-300' };
  }
  if (st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED') {
    return { label: 'Offer Approved', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-300' };
  }
  if (st === 'SUBMITTED_EMBASSY_BSF' || st === 'VISA_SUBMITTED') {
    return { label: 'Embassy / VFS', color: 'bg-amber-500/10 text-amber-700 border-amber-300' };
  }
  if (st === 'COMPLETED_DELIVERED' || st === 'COMPLETED') {
    return { label: 'Visa Delivered', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' };
  }
  return { label: stKey || 'Active', color: 'bg-muted text-muted-foreground border-border' };
}

// Helper: Formats Date and Time
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CaseWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'column'

  // Fullscreen Drawer / Modal State
  const [selectedCaseDidForFullscreen, setSelectedCaseDidForFullscreen] = useState(null);

  // Modals
  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/cases?limit=250&sortBy=updatedAt&sortOrder=desc');
      const data = res.data?.data || res.data?.cases || res.data || [];
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load workflow cases.');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleStageChange = async (caseId, newStatus) => {
    try {
      await apiClient.patch(`/api/v1/client/cases/${caseId}/workflow`, {
        status: newStatus,
        remarks: `Stage updated to ${newStatus} by Admin`,
      });
      toast.success(`Case stage advanced to ${newStatus.replace(/_/g, ' ')}`);
      fetchCases();
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  const handleTriggerIndianVisa = async (c) => {
    try {
      const caseDid = c.did || c._id;
      const res = await apiClient.post(`/api/v1/admin/cases/${caseDid}/indian-visa-subpipeline`);
      toast.success(res.data?.message || 'Indian Visa Sub-Pipeline activated!');
      fetchCases();
      if (res.data?.data?.documentStudioUrl) {
        navigate(res.data.data.documentStudioUrl);
      }
    } catch (err) {
      console.error('Indian visa trigger error:', err);
      toast.error(err.response?.data?.message || 'Failed to activate Indian Visa sub-pipeline.');
    }
  };

  // Filter Cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (c.applicantName || c.clientName || '').toLowerCase().includes(q) ||
        (c.passportNumber || '').toLowerCase().includes(q) ||
        (c.caseNumber || c.fileNumber || '').toLowerCase().includes(q) ||
        (c.phone || c.clientPhone || '').toLowerCase().includes(q);

      const dest = (c.destinationCountry || c.caseType || '').toLowerCase();
      const service = (c.serviceType || c.tradeSkill || '').toLowerCase();
      let matchesDest = true;

      if (destinationFilter === 'indian_visa') {
        matchesDest = dest.includes('india') || service.includes('indian visa') || c.caseType === 'INDIAN_VISA';
      } else if (destinationFilter !== 'all') {
        matchesDest = dest.includes(destinationFilter.toLowerCase());
      }

      // Stage Filter
      let matchesStage = true;
      if (activeStageFilter !== 'all') {
        const st = String(c.workflowStatus || c.status || 'ENTRY').toUpperCase();
        if (activeStageFilter === 'ENTRY') matchesStage = st === 'ENTRY' || st === 'NEW';
        else if (activeStageFilter === 'PROCESSING') matchesStage = st === 'PROCESSING';
        else if (activeStageFilter === 'APPROVED_OFFER_LETTER') matchesStage = st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED';
        else if (activeStageFilter === 'SUBMITTED_EMBASSY_BSF') matchesStage = st === 'SUBMITTED_EMBASSY_BSF' || st === 'VISA_SUBMITTED';
        else if (activeStageFilter === 'COMPLETED_DELIVERED') matchesStage = st === 'COMPLETED_DELIVERED' || st === 'COMPLETED';
      }

      return matchesSearch && matchesDest && matchesStage;
    });
  }, [cases, search, destinationFilter, activeStageFilter]);

  // KPIs
  const totalCases = cases.length;
  const inProcessing = cases.filter((c) => c.status === 'PROCESSING' || c.status === 'APPROVED_OFFER_LETTER').length;
  const inEmbassy = cases.filter((c) => c.status === 'SUBMITTED_EMBASSY_BSF').length;
  const delivered = cases.filter((c) => c.status === 'COMPLETED_DELIVERED').length;

  const handleExportCsv = () => {
    if (filteredCases.length === 0) {
      toast.error('No cases to export');
      return;
    }
    const headers = ['Case Number', 'Client Name', 'Phone', 'Passport', 'Country / Visa Type', 'Stage', 'Assigned To', 'Last Updated'];
    const rows = [headers.join(',')];

    for (const c of filteredCases) {
      const chip = getDestinationChip(c);
      const st = getStageBadge(c.workflowStatus || c.status);
      const officer = c.assignedToName || c.assignedTo?.name || c.assignedOfficer || c.workflowTasks?.[c.workflowTasks?.length - 1]?.assignedToName || 'Unassigned';
      const updated = formatDateTime(c.updatedAt || c.createdAt);

      rows.push([
        `"${c.caseNumber || c.fileNumber || ''}"`,
        `"${c.applicantName || c.clientName || ''}"`,
        `"${c.phone || c.clientPhone || ''}"`,
        `"${c.passportNumber || ''}"`,
        `"${chip.label}"`,
        `"${st.label}"`,
        `"${officer}"`,
        `"${updated}"`,
      ].join(','));
    }

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-workflow-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Cases CSV exported successfully!');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Banner Control Center */}
      <PageTitle
        title="Case Files & Overseas Pipeline"
        subtitle="5-Column card grid and column views. Track client stages, passport files, assigned officers, and open full 360° dossiers instantly."
        icon={FolderOpen}
        actions={
          <>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs transition shadow-lg cursor-pointer gap-2"
            >
              <Plus className="size-4" />
              <span>New Client File</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="h-10 px-3 bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Download className="size-4" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchCases}
              className="h-10 w-10 bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl cursor-pointer"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </>
        }
      />

      {/* Filter & View Switcher Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by client name, passport number, case ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            {/* Country / Visa Type Filter Dropdown */}
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Destinations</option>
              <option value="greece">Greece</option>
              <option value="indian_visa">Indian Visa Only</option>
              <option value="saudi">Saudi Arabia</option>
              <option value="macedonia">North Macedonia</option>
              <option value="croatia">Croatia</option>
              <option value="qatar">Qatar</option>
              <option value="dubai">Dubai / UAE</option>
            </select>
          </div>

          {/* Grid vs Column View Switcher */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="5-Col Grid View"
              aria-label="5-Col Grid View"
              className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-card text-primary shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('column')}
              title="Column / Table View"
              aria-label="Column / Table View"
              className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-center ${
                viewMode === 'column'
                  ? 'bg-card text-primary shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Stage Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setActiveStageFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeStageFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            All Stages ({cases.length})
          </button>

          {STAGES.map((s) => {
            const count = cases.filter((c) => {
              const st = String(c.workflowStatus || c.status || 'ENTRY').toUpperCase();
              if (s.id === 'ENTRY') return st === 'ENTRY' || st === 'NEW';
              if (s.id === 'PROCESSING') return st === 'PROCESSING';
              if (s.id === 'APPROVED_OFFER_LETTER') return st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED';
              if (s.id === 'SUBMITTED_EMBASSY_BSF') return st === 'SUBMITTED_EMBASSY_BSF' || st === 'VISA_SUBMITTED';
              if (s.id === 'COMPLETED_DELIVERED') return st === 'COMPLETED_DELIVERED' || st === 'COMPLETED';
              return false;
            }).length;

            const isActive = activeStageFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStageFilter(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span>{s.stageName}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3 bg-card border border-border rounded-3xl">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading Pipeline Cards...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-3xl flex flex-col items-center justify-center gap-2">
          <FolderOpen className="size-10 text-muted-foreground/40" />
          <span className="text-sm font-bold text-foreground">No case files match current filter</span>
          <span className="text-xs text-muted-foreground">Try clearing search filters or add a new client file.</span>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── 5 COLUMNS IN A ROW: CARD GRID VIEW ───────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCases.map((c) => {
            const caseId = c.did || c._id;
            const chip = getDestinationChip(c);
            const stage = getStageBadge(c.workflowStatus || c.status);
            const clientName = c.applicantName || c.clientName || 'Unnamed Client';
            const officerName = c.assignedToName || c.assignedTo?.name || c.assignedOfficer || c.workflowTasks?.[c.workflowTasks?.length - 1]?.assignedToName || 'Unassigned';
            const lastUpdated = formatDateTime(c.updatedAt || c.createdAt);

            return (
              <div
                key={caseId}
                onClick={() => navigate(`/admin/cases/${caseId}`)}
                className="bg-card border border-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-primary/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 select-none relative overflow-hidden"
              >
                {/* Top Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-2.5">
                  {/* Row 1: Chip (Country / Indian Visa) */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${chip.color}`}
                    >
                      {chip.icon}
                      <span className="truncate max-w-[120px]">{chip.label}</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground font-bold truncate max-w-[70px]">
                      {c.caseNumber || c.fileNumber || ''}
                    </span>
                  </div>

                  {/* Row 2: Client Name */}
                  <div className="pt-0.5">
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                      Client name:
                    </span>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1 mt-0.5">
                      {clientName}
                    </h3>
                  </div>

                  {/* GAP & Middle Details: Assigned To & Stage */}
                  <div className="pt-2 border-t border-border/60 space-y-2 text-xs">
                    {/* Assigned to: <Avatar> Name */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                        Assigned to :
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/20">
                          {officerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-foreground truncate max-w-[90px]">
                          {officerName}
                        </span>
                      </div>
                    </div>

                    {/* Stage: <Stage name> */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                        Stage:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[110px] ${stage.color}`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GAP & Footer: <last updated> Date and time */}
                <div className="pt-2.5 mt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground gap-2">
                  <div className="flex items-center gap-1 truncate">
                    <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(c.destinationCountry?.toLowerCase().includes('greece') ||
                      c.destinationCountry?.toLowerCase().includes('macedonia') ||
                      c.destinationCountry?.toLowerCase().includes('romania') ||
                      c.status === 'APPROVED_OFFER_LETTER') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerIndianVisa(c);
                        }}
                        title="1-Click Indian Visa Sub-Pipeline"
                        className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-700 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition"
                      >
                        🇮🇳 Indian Visa
                      </button>
                    )}
                    <Maximize2 className="size-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── COLUMN / TABLE VIEW ─────────────────────────────────────────────── */
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/40 uppercase text-muted-foreground border-b border-border text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Destination / Type</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Current Stage</th>
                  <th className="px-4 py-3">Contact & Passport</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((c) => {
                  const caseId = c.did || c._id;
                  const chip = getDestinationChip(c);
                  const stage = getStageBadge(c.workflowStatus || c.status);
                  const clientName = c.applicantName || c.clientName || 'Unnamed Client';
                  const officerName = c.assignedToName || c.assignedTo?.name || c.assignedOfficer || c.workflowTasks?.[c.workflowTasks?.length - 1]?.assignedToName || 'Unassigned';
                  const lastUpdated = formatDateTime(c.updatedAt || c.createdAt);

                  return (
                    <tr
                      key={caseId}
                      onClick={() => navigate(`/admin/cases/${caseId}`)}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      {/* Destination / Chip */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${chip.color}`}
                        >
                          {chip.icon}
                          <span>{chip.label}</span>
                        </span>
                      </td>

                      {/* Client Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors text-xs">
                            {clientName}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {c.caseNumber || c.fileNumber || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned to */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/20">
                            {officerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-foreground">{officerName}</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stage.color}`}
                        >
                          {stage.label}
                        </span>
                      </td>

                      {/* Contact & Passport */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          {c.phone && <div className="text-[11px] text-muted-foreground">{c.phone}</div>}
                          {c.passportNumber && (
                            <div className="font-mono font-bold text-sky-600 text-[11px]">
                              {c.passportNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground/70" />
                          {lastUpdated}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(c.destinationCountry?.toLowerCase().includes('greece') ||
                            c.destinationCountry?.toLowerCase().includes('macedonia') ||
                            c.destinationCountry?.toLowerCase().includes('romania') ||
                            c.status === 'APPROVED_OFFER_LETTER') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTriggerIndianVisa(c);
                              }}
                              className="h-7 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-700 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition"
                            >
                              🇮🇳 Indian Visa
                            </button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/cases/${caseId}`);
                            }}
                            className="h-7 px-2.5 text-xs font-semibold cursor-pointer gap-1"
                          >
                            <Eye className="size-3 text-primary" />
                            <span>View File</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fullscreen 360° Case Dossier Drawer */}
      <CaseDetailDrawer
        caseDid={selectedCaseDidForFullscreen}
        isOpen={Boolean(selectedCaseDidForFullscreen)}
        onClose={() => setSelectedCaseDidForFullscreen(null)}
        onRefresh={fetchCases}
      />

      {/* Step Assign Modal */}
      {assignModalOpen && selectedCaseForAction && (
        <StepAssignModal
          caseDoc={selectedCaseForAction}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedCaseForAction(null);
          }}
          onSuccess={fetchCases}
        />
      )}

      {/* Add Payment / Money Receipt Modal */}
      {paymentModalOpen && selectedCaseForAction && (
        <AddPaymentModal
          caseDoc={selectedCaseForAction}
          caseDid={selectedCaseForAction.did || selectedCaseForAction._id}
          caseNumber={selectedCaseForAction.caseNumber || selectedCaseForAction.fileNumber}
          applicantName={selectedCaseForAction.applicantName || selectedCaseForAction.clientName}
          dueAmount={selectedCaseForAction.paymentLedger?.dueAmount || 0}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedCaseForAction(null);
          }}
          onSuccess={fetchCases}
        />
      )}

      {/* New Client & Case Creation Modal */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCases}
      />
    </div>
  );
}
