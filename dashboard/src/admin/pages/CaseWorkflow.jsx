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
  Table as TableIcon,
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
  Sparkles,
  Plane,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { StepAssignModal } from '../components/workflow/StepAssignModal';
import { AddPaymentModal } from '../components/workflow/AddPaymentModal';
import { useAuth } from '../store/useAuthStore';
import CreateClientModal from '@/components/clients/CreateClientModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STAGES = [
  {
    id: 'ENTRY',
    title: '1. File Intake & Verification',
    titleBn: 'ফাইল এন্ট্রি ও যাচাই',
    description: 'Initial client intake, passport verification, and document onboarding',
    badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    headerBg: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    accentColor: 'text-slate-600 dark:text-slate-400',
    stepNumber: 1,
    icon: FolderOpen,
  },
  {
    id: 'PROCESSING',
    title: '2. Document Processing & Portal Submission',
    titleBn: 'ডকুমেন্ট প্রসেসিং ও পোর্টাল সাবমিশন',
    description: 'Official government portal application, translation & lawyer vetting',
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    headerBg: 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60',
    accentColor: 'text-sky-600 dark:text-sky-400',
    stepNumber: 2,
    icon: Layers,
  },
  {
    id: 'APPROVED_OFFER_LETTER',
    title: '3. Approved Offer Letter & Work Permit',
    titleBn: 'অফার লেটার ও ওয়ার্ক পারমিট প্রাপ্ত',
    description: 'Government work permit approved, ready for embassy/consulate scheduling',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    headerBg: 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    stepNumber: 3,
    icon: Award,
  },
  {
    id: 'SUBMITTED_EMBASSY_BSF',
    title: '4. Embassy & VFS Biometrics',
    titleBn: 'এমব্যাসি ও বায়োমেট্রিক জমা',
    description: 'VFS Global/Embassy biometrics, PCC verification & visa interview',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60',
    accentColor: 'text-amber-600 dark:text-amber-400',
    stepNumber: 4,
    icon: UserCheck,
  },
  {
    id: 'COMPLETED_DELIVERED',
    title: '5. Completed & Visa Delivered',
    titleBn: 'ভিসা ডেলিভার্ড ও ফ্লাইট প্রস্তুত',
    description: 'Visa issued and stamped, final settlement complete, and flight ready',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    stepNumber: 5,
    icon: Plane,
  },
];

export default function CaseWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [collapsedStages, setCollapsedStages] = useState({});

  // Modals
  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/cases?limit=200&sortBy=updatedAt&sortOrder=desc');
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

  const toggleStageCollapse = (stageId) => {
    setCollapsedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

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

  // Filter Cases based on Search & Destination
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (c.applicantName || c.clientName || '').toLowerCase().includes(q) ||
        (c.passportNumber || '').toLowerCase().includes(q) ||
        (c.caseNumber || c.fileNumber || '').toLowerCase().includes(q) ||
        (c.phone || c.clientPhone || '').toLowerCase().includes(q);

      const matchesDest =
        destinationFilter === 'all' ||
        (c.destinationCountry || c.caseType || '').toLowerCase().includes(destinationFilter.toLowerCase());

      return matchesSearch && matchesDest;
    });
  }, [cases, search, destinationFilter]);

  // Group filtered cases into the 5 stages
  const groupedCases = useMemo(() => {
    const groups = {};
    for (const stage of STAGES) {
      groups[stage.id] = [];
    }
    groups.OTHER = [];

    for (const c of filteredCases) {
      const st = String(c.workflowStatus || c.status || 'ENTRY').toUpperCase();
      if (st === 'ENTRY' || st === 'NEW') {
        groups.ENTRY.push(c);
      } else if (st === 'PROCESSING') {
        groups.PROCESSING.push(c);
      } else if (st === 'APPROVED_OFFER_LETTER' || st === 'FLIGHT_BOOKED') {
        groups.APPROVED_OFFER_LETTER.push(c);
      } else if (st === 'SUBMITTED_EMBASSY_BSF' || st === 'VISA_SUBMITTED') {
        groups.SUBMITTED_EMBASSY_BSF.push(c);
      } else if (st === 'COMPLETED_DELIVERED' || st === 'COMPLETED') {
        groups.COMPLETED_DELIVERED.push(c);
      } else {
        groups.OTHER.push(c);
      }
    }
    return groups;
  }, [filteredCases]);

  // Calculate Aggregate KPIs
  const totalCases = cases.length;
  const inProcessing = cases.filter((c) => c.status === 'PROCESSING' || c.status === 'APPROVED_OFFER_LETTER').length;
  const inEmbassy = cases.filter((c) => c.status === 'SUBMITTED_EMBASSY_BSF').length;
  const delivered = cases.filter((c) => c.status === 'COMPLETED_DELIVERED').length;

  const handleExportAllCasesCsv = () => {
    if (cases.length === 0) {
      toast.error('No case files to export');
      return;
    }

    const headers = [
      'Case Number',
      'Date',
      'Applicant Name',
      'Phone',
      'Passport Number',
      'Destination Country',
      'Trade Skill',
      'Stage',
      'Package Amount',
      'Paid Amount',
      'Due Amount',
    ];

    const rows = [headers.join(',')];

    for (const c of cases) {
      const ledger = c.paymentLedger || {};
      const totalAgreed = ledger.totalAgreedAmount || c.packageCost || 0;
      const totalPaid = ledger.totalPaidAmount || c.initialPaidAmount || 0;
      const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);

      rows.push(
        [
          `"${c.caseNumber || c.fileNumber || ''}"`,
          `"${c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : ''}"`,
          `"${c.applicantName || c.clientName || ''}"`,
          `"${c.phone || c.clientPhone || ''}"`,
          `"${c.passportNumber || ''}"`,
          `"${c.destinationCountry || ''}"`,
          `"${c.tradeSkill || ''}"`,
          `"${c.workflowStatus || c.status || 'ENTRY'}"`,
          totalAgreed,
          totalPaid,
          totalDue,
        ].join(',')
      );
    }

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-workflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Case Workflow CSV exported successfully!');
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
                Case Files & Workflow Directory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-sky-100/70 max-w-2xl leading-relaxed">
              Stage-grouped operational table. Manage overseas visa processing, milestone tracking, client ledgers, and official dossier files.
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
              onClick={handleExportAllCasesCsv}
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

      {/* Filter Toolbar & Stage Tabs */}
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

            {/* Destination Country Filter */}
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Destinations (সকল দেশ)</option>
              <option value="saudi">Saudi Arabia (সৌদি)</option>
              <option value="greece">Greece (গ্রীস)</option>
              <option value="macedonia">N. Macedonia (ম্যাসিডোনিয়া)</option>
              <option value="croatia">Croatia (ক্রোয়েশিয়া)</option>
              <option value="qatar">Qatar (কাতার)</option>
              <option value="dubai">Dubai / UAE (দুবাই)</option>
            </select>
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
            All Stages ({filteredCases.length})
          </button>

          {STAGES.map((s) => {
            const count = groupedCases[s.id]?.length || 0;
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
                <span>{s.title.split(' ')[1]}</span>
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

      {/* Main Grouped Stage Tables */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3 bg-card border border-border rounded-3xl">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading Workflow Groups...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {STAGES.filter((s) => activeStageFilter === 'all' || activeStageFilter === s.id).map((stage) => {
            const stageCases = groupedCases[stage.id] || [];
            const isCollapsed = Boolean(collapsedStages[stage.id]);
            const StageIcon = stage.icon;

            const totalStageAgreed = stageCases.reduce(
              (acc, c) => acc + (c.paymentLedger?.totalAgreedAmount || c.packageCost || 0),
              0
            );
            const totalStagePaid = stageCases.reduce(
              (acc, c) => acc + (c.paymentLedger?.totalPaidAmount || c.initialPaidAmount || 0),
              0
            );

            return (
              <div
                key={stage.id}
                className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Stage Header Banner with Toggle */}
                <div
                  onClick={() => toggleStageCollapse(stage.id)}
                  className={`px-5 py-4 border-b border-border flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${stage.headerBg} hover:opacity-95`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-card border border-border text-foreground shrink-0 shadow-xs">
                      <StageIcon className={`size-5 ${stage.accentColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-black text-foreground tracking-tight">{stage.title}</h2>
                        <span className="text-xs text-muted-foreground font-semibold">({stage.titleBn})</span>
                        <Badge variant="outline" className={`font-bold text-[11px] ${stage.badgeColor}`}>
                          {stageCases.length} Files
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Stage Volume</span>
                      <span className="text-xs font-black text-foreground font-mono">
                        ৳{Number(totalStageAgreed).toLocaleString('en-BD')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
                    >
                      {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Stage Table Content */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    {stageCases.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                        <FolderOpen className="size-7 text-muted-foreground/40" />
                        <span className="text-xs font-semibold">No active case files in this stage</span>
                        <span className="text-[11px] text-muted-foreground/80">
                          New cases or advanced files will appear here automatically.
                        </span>
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-muted/40 uppercase text-muted-foreground border-b border-border text-[11px] font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3">File No & Date</th>
                            <th className="px-4 py-3">Applicant Details</th>
                            <th className="px-4 py-3">Destination & Trade</th>
                            <th className="px-4 py-3">Pipeline Step</th>
                            <th className="px-4 py-3">Assigned Officer</th>
                            <th className="px-4 py-3">Financial Ledger</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {stageCases.map((c) => {
                            const caseId = c.did || c._id;
                            const ledger = c.paymentLedger || {};
                            const totalAgreed = ledger.totalAgreedAmount || c.packageCost || 0;
                            const totalPaid = ledger.totalPaidAmount || c.initialPaidAmount || 0;
                            const totalDue =
                              ledger.dueAmount !== undefined
                                ? ledger.dueAmount
                                : Math.max(0, totalAgreed - totalPaid);

                            const applicant = c.applicantName || c.clientName || 'Applicant';
                            const passport = c.passportNumber || '—';
                            const phone = c.phone || c.clientPhone || '';
                            const destination = c.destinationCountry || c.caseType?.toUpperCase() || 'Saudi Arabia';
                            const skill = c.tradeSkill || 'General Worker';
                            const officer = c.assignedOfficer || c.assignedTo?.name || 'Unassigned';

                            return (
                              <tr
                                key={caseId}
                                className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                onClick={() => navigate(`/admin/cases/${caseId}`)}
                              >
                                {/* File No & Date */}
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col">
                                    <span className="font-mono font-bold text-primary text-xs">
                                      {c.caseNumber || c.fileNumber || 'CASE-001'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {c.createdAt
                                        ? new Date(c.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })
                                        : '—'}
                                    </span>
                                  </div>
                                </td>

                                {/* Applicant Details */}
                                <td className="px-4 py-3.5">
                                  <div>
                                    <span className="font-bold text-foreground hover:text-primary transition-colors text-xs block">
                                      {applicant}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                      {phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="size-2.5" />
                                          {phone}
                                        </span>
                                      )}
                                      {passport !== '—' && (
                                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                                          ({passport})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Destination & Trade */}
                                <td className="px-4 py-3.5">
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-foreground border border-border">
                                      {destination}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground block truncate max-w-[130px]">
                                      {skill}
                                    </span>
                                  </div>
                                </td>

                                {/* Pipeline Step Progress */}
                                <td className="px-4 py-3.5">
                                  <div className="space-y-1.5 min-w-[110px]">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-bold text-foreground">
                                        Step {stage.stepNumber} of 5
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
                                      {[1, 2, 3, 4, 5].map((step) => (
                                        <div
                                          key={step}
                                          className={`rounded-full ${
                                            step <= stage.stepNumber
                                              ? 'bg-emerald-500'
                                              : 'bg-muted-foreground/20'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </td>

                                {/* Assigned Officer */}
                                <td className="px-4 py-3.5">
                                  <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                                    <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                      {officer.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="truncate max-w-[100px]">{officer}</span>
                                  </span>
                                </td>

                                {/* Financial Ledger */}
                                <td className="px-4 py-3.5">
                                  <div className="space-y-0.5 font-mono text-xs">
                                    <div className="font-bold text-foreground">
                                      ৳{Number(totalAgreed).toLocaleString('en-BD')}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px]">
                                      <span className="text-emerald-600 font-semibold">
                                        Pd: ৳{Number(totalPaid).toLocaleString('en-BD')}
                                      </span>
                                      {totalDue > 0 && (
                                        <span className="text-rose-600 font-semibold">
                                          Due: ৳{Number(totalDue).toLocaleString('en-BD')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Action Buttons */}
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {stage.stepNumber < 5 && (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                          const nextStageId = STAGES[stage.stepNumber]?.id;
                                          if (nextStageId) {
                                            handleStageChange(caseId, nextStageId);
                                          }
                                        }}
                                        className="h-7 px-2 text-[11px] font-bold cursor-pointer gap-1"
                                        title="Advance to Next Stage"
                                      >
                                        <span>Advance</span>
                                        <ArrowRight className="size-3" />
                                      </Button>
                                    )}

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedCaseForAction(c);
                                        setPaymentModalOpen(true);
                                      }}
                                      className="h-7 px-2 text-[11px] font-semibold cursor-pointer gap-1"
                                      title="Record Payment"
                                    >
                                      <Receipt className="size-3 text-emerald-600" />
                                      <span className="hidden sm:inline">Pay</span>
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/admin/cases/${caseId}`)}
                                      className="h-7 px-2 text-[11px] font-semibold cursor-pointer gap-1"
                                      title="View 360° Case Dossier"
                                    >
                                      <Eye className="size-3 text-primary" />
                                      <span className="hidden sm:inline">Dossier</span>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
