import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  FolderOpen,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Plus,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  Globe2,
  Calendar,
  DollarSign,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { StepAssignModal } from './StepAssignModal';
import { AddPaymentModal } from './AddPaymentModal';

const WORKFLOW_STATUS_OPTIONS = [
  'ENTRY',
  'PROCESSING',
  'APPROVED_OFFER_LETTER',
  'SUBMITTED_EMBASSY_BSF',
  'COMPLETED_DELIVERED',
  'REJECTED',
  'ON_HOLD',
];

const getTaskStatusConfig = (status) => {
  const normStatus = (status || '').trim().toLowerCase();

  if (normStatus === 'approved' || normStatus === 'completed' || normStatus === 'complete') {
    return {
      label: 'Approved ✓',
      badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/10 font-bold',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    };
  }
  if (normStatus === 'done' || normStatus === 'submitted') {
    return {
      label: 'Done',
      badgeClass: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/40 shadow-xs shadow-blue-500/10 font-bold',
      dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    };
  }
  if (normStatus === 'in progress' || normStatus === 'processing' || normStatus === 'in_progress') {
    return {
      label: 'In Progress',
      badgeClass: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/40 shadow-xs shadow-sky-500/10 font-bold',
      dotClass: 'bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]',
    };
  }
  if (normStatus === 'rejected' || normStatus === 'cancelled' || normStatus === 'failed') {
    return {
      label: 'Rejected ✗',
      badgeClass: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40 shadow-xs shadow-rose-500/10 font-bold',
      dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    };
  }

  // Default / Pending - Vibrant Amber Gold
  return {
    label: 'Pending',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/10 font-bold',
    dotClass: 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  };
};

export function CaseDetailDrawer({ caseDid, isOpen, onClose, onRefresh }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'workflow' | 'financials' | 'documents'
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [approvingTaskId, setApprovingTaskId] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!caseDid) return;
    setLoading(true);
    try {
      // 1. Try fetching full details endpoint
      const res = await apiClient.get(`/api/v1/admin/cases/${caseDid}/full-details`);
      if (res.data?.status === 'success' && res.data.data) {
        setCaseData(res.data.data);
      } else {
        // Fallback to client cases endpoint
        const fallbackRes = await apiClient.get(`/api/v1/client/cases/${caseDid}`);
        setCaseData(fallbackRes.data?.data || null);
      }
    } catch (err) {
      try {
        const fallbackRes = await apiClient.get(`/api/v1/client/cases/${caseDid}`);
        setCaseData(fallbackRes.data?.data || null);
      } catch (fErr) {
        toast.error('Failed to load case file details.');
        setCaseData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [caseDid]);

  useEffect(() => {
    if (isOpen && caseDid) {
      fetchDetails();
    }
  }, [isOpen, caseDid, fetchDetails]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await apiClient.patch(`/api/v1/client/cases/${caseDid}/workflow`, {
        status: newStatus,
        remarks: `Status updated to ${newStatus}`,
      });
      toast.success(`Workflow status updated to ${newStatus}`);
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApproveTask = async (taskDid) => {
    setApprovingTaskId(taskDid);
    try {
      await apiClient.patch(`/api/v1/admin/cases/tasks/${taskDid}/approve`, {
        approvalNotes: 'Approved by Administrator',
      });
      toast.success('Task step approved!');
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve task.');
    } finally {
      setApprovingTaskId(null);
    }
  };

  const getChecklistItemStatus = (key, data) => {
    if (!data) return { isComplete: false, isUploaded: false, isManuallyChecked: false, matchedDoc: null };
    const isManuallyChecked = Boolean(data.checklist?.[key]);
    const vaultDocs = Array.isArray(data.vaultDocuments) ? data.vaultDocuments : [];
    const clientAttachments = data.clientInfo?.attachments || data.attachments || {};
    let isUploaded = false;
    let matchedDoc = null;

    if (key === 'photo2x2') {
      if (clientAttachments.photo) {
        isUploaded = true;
        matchedDoc = { name: 'Applicant 2x2 Photo', url: clientAttachments.photo };
      } else {
        const found = vaultDocs.find((d) =>
          /photo|picture|2x2|ছবি|image|portrait/i.test(d.documentName || d.fileName || '')
        );
        if (found) {
          isUploaded = true;
          matchedDoc = { name: found.documentName || found.fileName, url: found.fileUrl };
        }
      }
    } else if (key === 'electricityBill') {
      const found = vaultDocs.find((d) =>
        /electricity|utility|bill|current|বিদ্যুৎ|gas|electric|wasa/i.test(d.documentName || d.fileName || '')
      );
      if (found) {
        isUploaded = true;
        matchedDoc = { name: found.documentName || found.fileName, url: found.fileUrl };
      } else {
        const otherDocs = Array.isArray(clientAttachments.otherDocuments) ? clientAttachments.otherDocuments : [];
        const foundOther = otherDocs.find((d) => /bill|utility|electricity|gas|wasa/i.test(d.name || ''));
        if (foundOther) {
          isUploaded = true;
          matchedDoc = { name: foundOther.name, url: foundOther.fileUrl };
        }
      }
    } else if (key === 'nidCopy') {
      if (clientAttachments.nidScan) {
        isUploaded = true;
        matchedDoc = { name: 'National ID (NID) Scan', url: clientAttachments.nidScan };
      } else {
        const found = vaultDocs.find((d) =>
          /nid|national\s*id|voter|এনআইডি|পরিচয়পত্র|identity\s*card/i.test(d.documentName || d.fileName || '')
        );
        if (found) {
          isUploaded = true;
          matchedDoc = { name: found.documentName || found.fileName, url: found.fileUrl };
        }
      }
    } else if (key === 'landDocuments') {
      const found = vaultDocs.find((d) =>
        /land|property|দলিল|খতিয়ান|khatian|porcha|deed|jamabandi|mutation|namjari/i.test(d.documentName || d.fileName || '')
      );
      if (found) {
        isUploaded = true;
        matchedDoc = { name: found.documentName || found.fileName, url: found.fileUrl };
      } else {
        const otherDocs = Array.isArray(clientAttachments.otherDocuments) ? clientAttachments.otherDocuments : [];
        const foundOther = otherDocs.find((d) => /land|property|deed/i.test(d.name || ''));
        if (foundOther) {
          isUploaded = true;
          matchedDoc = { name: foundOther.name, url: foundOther.fileUrl };
        }
      }
    }

    const isComplete = isManuallyChecked || isUploaded;
    return {
      isComplete,
      isUploaded,
      isManuallyChecked,
      matchedDoc,
    };
  };

  const handleToggleChecklist = async (key) => {
    if (!caseData) return;
    const currentVal = Boolean(caseData.checklist?.[key]);
    const newVal = !currentVal;

    setCaseData((prev) => ({
      ...prev,
      checklist: {
        ...(prev?.checklist || {}),
        [key]: newVal,
      },
    }));

    try {
      const caseId = caseData.did || caseData._id;
      const res = await apiClient.put(`/api/v1/client/cases/${caseId}`, {
        checklist: {
          [key]: newVal,
        },
      });
      if (res.data?.success || res.data?.status === 'success') {
        toast.success(`Checklist updated: ${newVal ? 'Received / Checked' : 'Pending'}`);
        if (onRefresh) onRefresh();
      } else {
        throw new Error(res.data?.message || 'Failed to update checklist');
      }
    } catch (err) {
      toast.error('Failed to update checklist status.');
      fetchDetails();
    }
  };

  const ledger = caseData?.paymentLedger || {};
  const totalAgreed = ledger.totalAgreedAmount || caseData?.packageCost || 0;
  const totalPaid = ledger.totalPaidAmount || caseData?.initialPaidAmount || 0;
  const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-background w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-border">
        {/* Top Header */}
        <div className="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Loading file details...</span>
            </div>
          ) : caseData ? (
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                <FolderOpen className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {caseData.caseNumber || 'CASE-FILE'}
                  </span>
                  <h2 className="text-lg font-black text-foreground tracking-tight truncate">
                    {caseData.applicantName || caseData.clientInfo?.fullName || 'Case Dossier'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1 font-medium">
                  {caseData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3 text-primary" />
                      {caseData.phone}
                    </span>
                  )}
                  {caseData.passportNumber && (
                    <span className="flex items-center gap-1 font-mono text-sky-600 dark:text-sky-400">
                      <FileText className="size-3" />
                      Passport: {caseData.passportNumber}
                    </span>
                  )}
                  <span className="font-semibold text-foreground">
                    Destination: <strong>{caseData.destinationCountry || caseData.caseType?.toUpperCase()}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-rose-500">Case file not found.</div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Status Bar & Quick Actions */}
        {caseData && (
          <div className="px-6 py-3 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Current Stage:</span>
              <select
                value={caseData.status || 'ENTRY'}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1 text-xs font-bold rounded-lg border border-input bg-background text-foreground focus:outline-none cursor-pointer"
              >
                {WORKFLOW_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {updatingStatus && <Loader2 className="size-3.5 animate-spin text-primary" />}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <CreditCard className="size-3.5" />
                <span>+ Add Payment</span>
              </button>

              <button
                onClick={() => setAssignModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Assign Step</span>
              </button>
            </div>
          </div>
        )}

        {/* 3 KPI Summary Cards */}
        {caseData && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/10 border-b border-border text-center">
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Agreed Package</span>
              <div className="text-base font-black text-foreground mt-0.5">{formatCurrency(totalAgreed)}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Total Paid</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-rose-600">Total Due</span>
              <div className="text-base font-black text-rose-600 mt-0.5">{formatCurrency(totalDue)}</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-border bg-background">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen className="size-4" />
            <span>File Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-4" />
            <span>Workflow Steps</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {(caseData?.workflowTasks || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'financials'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="size-4" />
            <span>Payment Ledger</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {(caseData?.financialReceipts || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-4" />
            <span>Checklist & Vault</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Loading case details...</p>
            </div>
          ) : !caseData ? (
            <div className="text-center p-8 text-muted-foreground text-xs">No case data available.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Applicant Details */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Applicant & Service Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Applicant Name:</span>
                        <p className="font-semibold text-foreground">{caseData.applicantName || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone Number:</span>
                        <p className="font-semibold text-foreground">{caseData.phone || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passport Number:</span>
                        <p className="font-mono font-bold text-sky-600">{caseData.passportNumber || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Destination:</span>
                        <p className="font-bold text-foreground">
                          {caseData.destinationCountry || caseData.caseType?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Workflow Stage:</span>
                        <p className="font-semibold text-primary">{caseData.workflowStatus || caseData.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created Date:</span>
                        <p className="font-medium text-foreground">{formatDate(caseData.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3-Stage Milestone Visual Progress */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      3-Stage Milestone Payment Schedule
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">1. Advance</span>
                          <span className="text-[10px] font-bold text-emerald-600">Intake</span>
                        </div>
                        <p className="text-sm font-black text-foreground">
                          {formatCurrency(ledger.step1_advance || caseData.initialPaidAmount || 0)}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">2. Offer Approval</span>
                          <span className="text-[10px] font-bold text-sky-600">Work Permit</span>
                        </div>
                        <p className="text-sm font-black text-foreground">
                          {formatCurrency(ledger.step2_offerApproval || 0)}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">3. Final Delivery</span>
                          <span className="text-[10px] font-bold text-purple-600">Visa Issue</span>
                        </div>
                        <p className="text-sm font-black text-foreground">
                          {formatCurrency(ledger.step3_delivery || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remarks / Notes */}
                  {caseData.remarks && (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Internal Case Notes
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">{caseData.remarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WORKFLOW STEPS & TASKS */}
              {activeTab === 'workflow' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      <span>Assigned Workflow Step Tasks</span>
                    </h3>
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Assign Next Step</span>
                    </button>
                  </div>

                  {(caseData.workflowTasks || []).length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
                      <Clock className="size-8 mx-auto opacity-40 text-muted-foreground" />
                      <p className="text-xs font-medium">No workflow step tasks assigned to staff yet.</p>
                      <button
                        onClick={() => setAssignModalOpen(true)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        + Assign First Task Step to Staff
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {caseData.workflowTasks.map((t, idx) => {
                        const isApproved = t.status === 'Approved';
                        const isDone = t.status === 'Done';
                        return (
                          <div
                            key={t.did || t._id || idx}
                            className="p-4 rounded-xl border border-border bg-background shadow-xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                  Step {t.stepNumber || idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-foreground mt-0.5">{t.title}</h4>
                              </div>
                              {(() => {
                                const statusCfg = getTaskStatusConfig(t.status);
                                return (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                                    {statusCfg.label}
                                  </span>
                                );
                              })()}
                            </div>

                            {t.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                            )}

                            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60">
                              <span className="text-muted-foreground">
                                Assigned to: <strong>{t.assignedToName || t.assignedTo?.name || t.assignedToDid || 'Staff Member'}</strong>
                              </span>
                              {!isApproved && (
                                <button
                                  onClick={() => handleApproveTask(t.did || t._id)}
                                  disabled={approvingTaskId === (t.did || t._id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  {approvingTaskId === (t.did || t._id) ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Check className="size-3" />
                                  )}
                                  <span>Approve Step ✓</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FINANCIALS & MONEY RECEIPTS */}
              {activeTab === 'financials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="size-4 text-primary" />
                      <span>Financial Receipts & Ledger</span>
                    </h3>
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>

                  {(caseData.financialReceipts || []).length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                      <p className="text-xs">No money receipts recorded for this case file yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3">Receipt No</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Purpose / Notes</th>
                            <th className="py-2.5 px-3 text-right">Amount (BDT )</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {caseData.financialReceipts.map((r) => (
                            <tr key={r.did || r._id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-primary">
                                {r.receiptNo || r.receiptNumber || 'MR-001'}
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                              <td className="py-2.5 px-3 font-medium text-foreground">{r.notes || r.purpose || 'Payment'}</td>
                              <td className="py-2.5 px-3 font-black text-right text-emerald-600">
                                {formatCurrency(r.amount)}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                  Confirmed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CHECKLIST & DOCUMENTS VAULT */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span>Physical Document Intake Checklist</span>
                    </h3>
                    <span className="text-[10px] text-muted-foreground">Click checkbox to update status</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'photo2x2', label: 'Photo 2x2 (White Background)' },
                      { key: 'electricityBill', label: 'Electricity / Utility Bill' },
                      { key: 'nidCopy', label: 'National ID (NID) Copy' },
                      { key: 'landDocuments', label: 'Land Record / Property Papers' },
                      { key: 'followUpCallRequired', label: 'Pending Paper Follow-up Call' },
                    ].map((item) => {
                      const status = getChecklistItemStatus(item.key, caseData);
                      const isChecked = status.isComplete;
                      return (
                        <div
                          key={item.key}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-xs transition-all ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs ring-1 ring-emerald-500/20'
                              : 'bg-muted/30 border-border text-muted-foreground hover:border-border/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleChecklist(item.key)}
                                className="size-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-border cursor-pointer accent-emerald-600"
                              />
                              <span className={`truncate ${isChecked ? 'text-emerald-950 dark:text-emerald-100 font-bold' : ''}`}>
                                {item.label}
                              </span>
                            </label>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                isChecked ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-muted text-muted-foreground border border-border/50'
                              }`}
                            >
                              {status.isUploaded ? 'Uploaded ✓' : isChecked ? 'Received ✓' : 'Pending'}
                            </span>
                          </div>

                          {status.matchedDoc?.url && (
                            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[10px]">
                              <span className="text-emerald-700 dark:text-emerald-300 truncate max-w-[180px]">
                                📎 {status.matchedDoc.name}
                              </span>
                              <a
                                href={status.matchedDoc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100 underline cursor-pointer"
                              >
                                View File ↗
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign Step Modal */}
      {assignModalOpen && (
        <StepAssignModal
          caseDoc={caseData}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={() => {
            fetchDetails();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Add Payment Modal */}
      {paymentModalOpen && (
        <AddPaymentModal
          caseDoc={caseData}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            fetchDetails();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

export default CaseDetailDrawer;
