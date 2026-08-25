import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRightLeft,
  Send,
  User,
  History,
  FileText,
  ChevronRight,
  Eye,
  Check,
  X,
  CreditCard,
  Layers,
  Kanban,
  Table as TableIcon,
  Globe2,
  Phone,
  Receipt,
  Download,
  Calendar,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { StepAssignModal } from '../components/workflow/StepAssignModal';
import { AddPaymentModal } from '../components/workflow/AddPaymentModal';
import { useAuth } from '../store/useAuthStore';
import CreateClientModal from '@/components/clients/CreateClientModal';

const PIPELINE_COLUMNS = [
  {
    id: 'ENTRY',
    title: '1. File Intake (ফাইল এন্ট্রি)',
    description: 'Initial client registration & document verification',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    headerBg: 'bg-slate-500/10 border-slate-200 dark:border-slate-800',
  },
  {
    id: 'PROCESSING',
    title: '2. Processing (ডকুমেন্ট প্রসেসিং)',
    description: 'Lawyer handoff & official portal submission',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
    headerBg: 'bg-sky-500/10 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'APPROVED_OFFER_LETTER',
    title: '3. Offer Approved (অফার লেটার প্রাপ্ত)',
    description: 'Government permit issued, prepare for Indian visa',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
    headerBg: 'bg-indigo-500/10 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'SUBMITTED_EMBASSY_BSF',
    title: '4. Embassy/VFS (এমব্যাসি ও ভিসা)',
    description: 'Delhi embassy biometrics, PCC & visa interview',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    headerBg: 'bg-amber-500/10 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'COMPLETED_DELIVERED',
    title: '5. Completed & Delivered (ভিসা ডেলিভার্ড)',
    description: 'Visa stamped, final payment settled & flight ready',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    headerBg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
  },
];

export default function CaseWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAccountant = user?.subRole?.toLowerCase() === 'accountant' || user?.subRole?.toLowerCase() === 'accounts';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modals
  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Drag-and-drop state
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/cases?limit=100&sortBy=updatedAt&sortOrder=desc');
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
        remarks: `Stage changed to ${newStatus} by Admin`,
      });
      toast.success(`Case stage updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchCases();
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  const handleDragStart = (e, caseId) => {
    setDraggedCardId(caseId);
    e.dataTransfer.setData('text/plain', caseId);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const caseId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!caseId) return;

    // Optimistic UI Update
    setCases((prev) =>
      prev.map((c) => (c.did === caseId || c._id === caseId ? { ...c, status: targetStage } : c))
    );

    await handleStageChange(caseId, targetStage);
    setDraggedCardId(null);
  };

  const filteredCases = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (c.applicantName || '').toLowerCase().includes(q) ||
      (c.passportNumber || '').toLowerCase().includes(q) ||
      (c.caseNumber || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q);

    const matchesDest =
      destinationFilter === 'all' ||
      (c.destinationCountry || c.caseType || '').toLowerCase().includes(destinationFilter.toLowerCase());

    return matchesSearch && matchesDest;
  });

  // Calculate Aggregate KPIs
  const totalCases = cases.length;
  const inProcessing = cases.filter((c) => c.status === 'PROCESSING' || c.status === 'APPROVED_OFFER_LETTER').length;
  const inEmbassy = cases.filter((c) => c.status === 'SUBMITTED_EMBASSY_BSF').length;
  const delivered = cases.filter((c) => c.status === 'COMPLETED_DELIVERED').length;
  const totalAgreedVolume = cases.reduce((acc, c) => acc + (c.paymentLedger?.totalAgreedAmount || c.packageCost || 0), 0);
  const totalCollectedVolume = cases.reduce((acc, c) => acc + (c.paymentLedger?.totalPaidAmount || c.initialPaidAmount || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
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
                Case Workflow & Pipeline Board
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-sky-100/70 max-w-2xl leading-relaxed">
              Master overseas visa pipeline management. Track candidate stages, assign operational tasks, approve completions, and monitor milestone payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer hover:scale-102 active:scale-98"
            >
              <Plus className="size-4" />
              <span>New Client Case Entry</span>
            </button>

            <button
              onClick={fetchCases}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl transition cursor-pointer"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Pipeline Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <span className="text-[10px] text-sky-200/70 uppercase font-bold block">Total Active Files</span>
            <span className="text-lg font-black text-white mt-0.5 block">{totalCases} Cases</span>
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
      <div className="bg-card border border-border p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by client name, passport number, or case ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">All Destinations (সকল দেশ)</option>
            <option value="greece">Greece (গ্রীস)</option>
            <option value="macedonia">N. Macedonia (ম্যাসিডোনিয়া)</option>
            <option value="saudi">Saudi Arabia (সৌদি)</option>
            <option value="croatia">Croatia (ক্রোয়েশিয়া)</option>
          </select>
        </div>

        {/* View Switcher (Kanban vs Table) */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'kanban' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Kanban className="size-3.5" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TableIcon className="size-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading Pipeline Board...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
          {PIPELINE_COLUMNS.map((col) => {
            const columnCases = filteredCases.filter((c) => {
              const status = c.status || 'ENTRY';
              if (col.id === 'ENTRY') return status === 'ENTRY' || status === 'New';
              if (col.id === 'PROCESSING') return status === 'PROCESSING';
              if (col.id === 'APPROVED_OFFER_LETTER') return status === 'APPROVED_OFFER_LETTER' || status === 'FLIGHT_BOOKED';
              if (col.id === 'SUBMITTED_EMBASSY_BSF') return status === 'SUBMITTED_EMBASSY_BSF' || status === 'VISA_SUBMITTED';
              if (col.id === 'COMPLETED_DELIVERED') return status === 'COMPLETED_DELIVERED' || status === 'COMPLETED';
              return false;
            });

            const isDropTarget = dragOverStage === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-card/60 border rounded-2xl flex flex-col min-h-[580px] max-h-[82vh] transition-all ${
                  isDropTarget
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-border'
                }`}
              >
                {/* Column Header */}
                <div className={`p-4 border-b rounded-t-2xl flex items-start justify-between gap-2 ${col.headerBg}`}>
                  <div>
                    <h3 className="text-xs font-black text-foreground tracking-tight">{col.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{col.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${col.badgeColor}`}>
                    {columnCases.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto pr-1.5">
                  {columnCases.length === 0 ? (
                    <div className="h-40 border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center text-center p-4 text-muted-foreground/60">
                      <FolderOpen className="size-6 mb-1 opacity-40" />
                      <span className="text-[11px] font-semibold">No cases in this stage</span>
                      <span className="text-[9px]">Drag cards here to advance</span>
                    </div>
                  ) : (
                    columnCases.map((c) => {
                      const caseId = c.did || c._id;
                      const ledger = c.paymentLedger || {};
                      const totalAgreed = ledger.totalAgreedAmount || c.packageCost || 0;
                      const totalPaid = ledger.totalPaidAmount || c.initialPaidAmount || 0;
                      const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);

                      return (
                        <div
                          key={caseId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, caseId)}
                          onClick={() => navigate(`/admin/cases/${caseId}`)}
                          className="bg-card border border-border p-4 rounded-xl shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none space-y-3"
                        >
                          {/* Card Top: Case Number & Date */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {c.caseNumber || 'CASE-001'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          {/* Candidate Name & Destination */}
                          <div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                              {c.applicantName || c.clientInfo?.fullName || 'Applicant'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold text-[10px]">
                                {c.destinationCountry || c.caseType?.toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium text-[10px]">
                                {c.tradeSkill || 'General Worker'}
                              </span>
                            </div>
                          </div>

                          {/* Passport & Contact Details */}
                          <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                            {c.passportNumber && (
                              <div className="flex items-center gap-1.5 font-mono text-sky-600 dark:text-sky-400 font-bold">
                                <FileText className="size-3" />
                                <span>{c.passportNumber}</span>
                              </div>
                            )}
                            {c.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="size-3" />
                                <span>{c.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* 5-Step Mini Pipeline Progress */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                              <span>Pipeline Step:</span>
                              <span className="text-primary font-bold">
                                {col.id === 'ENTRY'
                                  ? 'Step 1/5'
                                  : col.id === 'PROCESSING'
                                  ? 'Step 2/5'
                                  : col.id === 'APPROVED_OFFER_LETTER'
                                  ? 'Step 3/5'
                                  : col.id === 'SUBMITTED_EMBASSY_BSF'
                                  ? 'Step 4/5'
                                  : 'Step 5/5'}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
                              <div className="bg-emerald-500 rounded-full" />
                              <div
                                className={`rounded-full ${
                                  col.id !== 'ENTRY' ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                                }`}
                              />
                              <div
                                className={`rounded-full ${
                                  col.id === 'APPROVED_OFFER_LETTER' ||
                                  col.id === 'SUBMITTED_EMBASSY_BSF' ||
                                  col.id === 'COMPLETED_DELIVERED'
                                    ? 'bg-emerald-500'
                                    : 'bg-muted-foreground/20'
                                }`}
                              />
                              <div
                                className={`rounded-full ${
                                  col.id === 'SUBMITTED_EMBASSY_BSF' || col.id === 'COMPLETED_DELIVERED'
                                    ? 'bg-emerald-500'
                                    : 'bg-muted-foreground/20'
                                }`}
                              />
                              <div
                                className={`rounded-full ${
                                  col.id === 'COMPLETED_DELIVERED' ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Financial Snapshot Pill */}
                          <div className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-[10px]">
                            <div>
                              <span className="text-muted-foreground block text-[9px]">পরিশোধ</span>
                              <span className="font-bold text-emerald-600">৳{Number(totalPaid).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-muted-foreground block text-[9px]">বকেয়া</span>
                              <span className="font-bold text-rose-600">৳{Number(totalDue).toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Card Action CTAs */}
                          <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/cases/${caseId}`);
                              }}
                              className="flex-1 py-1.5 px-2 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <Eye className="size-3" />
                              <span>ডজিয়ার দেখুন</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCaseForAction(c);
                                setAssignModalOpen(true);
                              }}
                              className="py-1.5 px-2 bg-muted hover:bg-muted/80 text-foreground text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Assign Step"
                            >
                              <Layers className="size-3" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCaseForAction(c);
                                setPaymentModalOpen(true);
                              }}
                              className="py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Record Payment"
                            >
                              <Receipt className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase text-muted-foreground border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-4">কেস আইডি</th>
                  <th className="px-5 py-4">আবেদনকারীর নাম</th>
                  <th className="px-5 py-4">পাসপোর্ট নম্বর</th>
                  <th className="px-5 py-4">গন্তব্য ও স্কিল</th>
                  <th className="px-5 py-4">বর্তমান স্টেজ</th>
                  <th className="px-5 py-4">মোট বিল</th>
                  <th className="px-5 py-4">জমা ও বকেয়া</th>
                  <th className="px-5 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((c) => {
                  const caseId = c.did || c._id;
                  const ledger = c.paymentLedger || {};
                  const totalAgreed = ledger.totalAgreedAmount || c.packageCost || 0;
                  const totalPaid = ledger.totalPaidAmount || c.initialPaidAmount || 0;
                  const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);

                  return (
                    <tr
                      key={caseId}
                      onClick={() => navigate(`/admin/cases/${caseId}`)}
                      className="hover:bg-muted/30 transition cursor-pointer"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-primary">
                        {c.caseNumber || 'CASE-001'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{c.applicantName || 'Applicant'}</div>
                        <div className="text-[11px] text-muted-foreground">{c.phone || '—'}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {c.passportNumber || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground">{c.destinationCountry || c.caseType?.toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground block">{c.tradeSkill || 'General Worker'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {c.workflowStatus || c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-foreground">
                        ৳{Number(totalAgreed).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-emerald-600">জমা: ৳{Number(totalPaid).toLocaleString('en-IN')}</div>
                        <div className="font-bold text-rose-600 text-[11px]">বকেয়া: ৳{Number(totalDue).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/cases/${caseId}`);
                          }}
                          className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/90 transition cursor-pointer shadow-xs"
                        >
                          ডজিয়ার দেখুন
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
          caseNumber={selectedCaseForAction.caseNumber}
          applicantName={selectedCaseForAction.applicantName}
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
