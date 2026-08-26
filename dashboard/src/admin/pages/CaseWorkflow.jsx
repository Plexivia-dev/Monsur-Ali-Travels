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

const STAGES = [
  {
    id: 'ENTRY',
    title: '1. File Intake',
    titleBn: 'ফাইল এন্ট্রি ও যাচাই',
    stageName: 'File Intake',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    headerBg: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    accentColor: 'text-slate-600 dark:text-slate-400',
    stepNumber: 1,
    icon: FolderOpen,
  },
  {
    id: 'PROCESSING',
    title: '2. Document Processing',
    titleBn: 'ডকুমেন্ট প্রসেসিং ও পোর্টাল',
    stageName: 'Processing',
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    headerBg: 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60',
    accentColor: 'text-sky-600 dark:text-sky-400',
    stepNumber: 2,
    icon: Layers,
  },
  {
    id: 'APPROVED_OFFER_LETTER',
    title: '3. Offer Approved',
    titleBn: 'অফার লেটার প্রাপ্ত',
    stageName: 'Offer Approved',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    headerBg: 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    stepNumber: 3,
    icon: Award,
  },
  {
    id: 'SUBMITTED_EMBASSY_BSF',
    title: '4. Embassy / VFS',
    titleBn: 'এমব্যাসি ও বায়োমেট্রিক',
    stageName: 'Embassy / VFS',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60',
    accentColor: 'text-amber-600 dark:text-amber-400',
    stepNumber: 4,
    icon: UserCheck,
  },
  {
    id: 'COMPLETED_DELIVERED',
    title: '5. Visa Delivered',
    titleBn: 'ভিসা ডেলিভার্ড ও ফ্লাইট',
    stageName: 'Delivered',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
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
      color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      icon: <Stamp className="size-3 mr-1" />,
    };
  }
  if (dest.includes('greece')) {
    return {
      label: 'Greece',
      color: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('saudi')) {
    return {
      label: 'Saudi Arabia',
      color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('croatia')) {
    return {
      label: 'Croatia',
      color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('macedonia')) {
    return {
      label: 'N. Macedonia',
      color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('qatar')) {
    return {
      label: 'Qatar',
      color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      icon: <Globe2 className="size-3 mr-1" />,
    };
  }
  if (dest.includes('dubai') || dest.includes('uae')) {
    return {
      label: 'Dubai / UAE',
      color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
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
    return { label: 'File Intake', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300' };
  }
  if (st === 'PROCESSING') {
    return { label: 'Processing', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300' };
  }
  if (st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED') {
    return { label: 'Offer Approved', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300' };
  }
  if (st === 'SUBMITTED_EMBASSY_BSF' || st === 'VISA_SUBMITTED') {
    return { label: 'Embassy / VFS', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300' };
  }
  if (st === 'COMPLETED_DELIVERED' || st === 'COMPLETED') {
    return { label: 'Visa Delivered', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300' };
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
      const officer = c.assignedOfficer || c.assignedTo?.name || 'Unassigned';
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
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-sky-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-black shadow-inner">
                <FolderOpen className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Case Files & Overseas Pipeline
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-sky-100/70 max-w-2xl leading-relaxed">
              5-Column card grid and column views. Track client stages, passport files, assigned officers, and open full 360° dossiers instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer gap-2"
            >
              <Plus className="size-4" />
              <span>New Client Case</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="h-10 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Download className="size-4" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchCases}
              className="h-10 w-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl cursor-pointer"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 4 Pipeline Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] text-sky-200/70 uppercase font-bold block">Total Active Cases</span>
            <span className="text-lg font-black text-white mt-0.5 block">{totalCases} Files</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] text-sky-200/70 uppercase font-bold block">In Document Processing</span>
            <span className="text-lg font-black text-sky-400 mt-0.5 block">{inProcessing} Files</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] text-sky-200/70 uppercase font-bold block">Embassy & VFS Stage</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">{inEmbassy} Files</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] text-sky-200/70 uppercase font-bold block">Delivered & Closed</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{delivered} Files</span>
          </div>
        </div>
      </div>

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
              <option value="all">All Destinations (সকল দেশ ও ভিসা)</option>
              <option value="greece">Greece (গ্রীস)</option>
              <option value="indian_visa">Indian Visa (শুধুমাত্র ইন্ডিয়ান ভিসা)</option>
              <option value="saudi">Saudi Arabia (সৌদি আরব)</option>
              <option value="macedonia">N. Macedonia (ম্যাসিডোনিয়া)</option>
              <option value="croatia">Croatia (ক্রোয়েশিয়া)</option>
              <option value="qatar">Qatar (কাতার)</option>
              <option value="dubai">Dubai / UAE (দুবাই)</option>
            </select>
          </div>

          {/* Grid vs Column View Switcher */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-card text-primary shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>5-Col Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('column')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'column'
                  ? 'bg-card text-primary shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="size-3.5" />
              <span>Column / Table View</span>
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
            const officerName = c.assignedOfficer || c.assignedTo?.name || 'Unassigned';
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
                <div className="pt-2.5 mt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1 truncate">
                    <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">{lastUpdated}</span>
                  </div>
                  <Maximize2 className="size-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
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
                  const officerName = c.assignedOfficer || c.assignedTo?.name || 'Unassigned';
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
                            <div className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[11px]">
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
