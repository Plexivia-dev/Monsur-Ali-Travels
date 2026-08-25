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
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  Globe2,
  Calendar,
  DollarSign,
  Plus,
  MessageSquare,
  UploadCloud,
  FileCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';

const PIPELINE_STAGES = [
  { id: 'ENTRY', title: 'New Entry (এন্ট্রি)' },
  { id: 'PROCESSING', title: 'Processing (প্রসেসিং)' },
  { id: 'APPROVED_OFFER_LETTER', title: 'Offer Approved (অফার লেটার)' },
  { id: 'SUBMITTED_EMBASSY_BSF', title: 'Embassy/VFS Submitted (সাবমিটেড)' },
  { id: 'COMPLETED_DELIVERED', title: 'Completed & Delivered (ডেলিভার্ড)' },
];

export function CaseWorkspaceDrawer({ caseId, isOpen, onClose, onRefresh }) {
  const user = useAuthStore((state) => state.user);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'documents' | 'communication'

  // Internal message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Document upload form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    documentName: 'Passport Scan Copy',
    fileName: '',
    fileUrl: '',
    fileSize: '1.5 MB',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Task execution
  const [completingTaskId, setCompletingTaskId] = useState(null);

  const fetchCaseDetails = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/client/cases/${caseId}`);
      if (res.data?.success && res.data.data) {
        setCaseData(res.data.data);
      } else {
        // Try fallback
        const altRes = await apiClient.get(`/api/v1/client/clients/${caseId}`).catch(() => null);
        if (altRes?.data?.data) {
          const raw = altRes.data.data;
          setCaseData({
            did: raw.did || raw._id,
            caseNumber: raw.fileNumber || 'CASE-001',
            applicantName: raw.clientName,
            phone: raw.clientPhone,
            passportNumber: raw.passportNumber,
            destinationCountry: raw.destinationCountry,
            tradeSkill: raw.tradeSkill,
            status: raw.status || 'ENTRY',
            workflowStatus: raw.status,
            paymentLedger: {
              totalAgreedAmount: raw.totalAgreedAmount || 0,
              step1_advance: raw.advanceAmount || 0,
              dueAmount: raw.dueAmount || 0,
              totalPaidAmount: raw.advanceAmount || 0,
            },
            workflowTasks: [],
            vaultDocuments: raw.documents || [],
            internalMessages: [],
            createdAt: raw.createdAt,
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load case workspace details.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetails();
    }
  }, [isOpen, caseId, fetchCaseDetails]);

  if (!isOpen) return null;

  const handleStageChange = async (newStatus) => {
    try {
      await apiClient.patch(`/api/v1/client/cases/${caseId}/workflow`, {
        status: newStatus,
        remarks: `Staff moved status to ${newStatus}`,
      });
      toast.success(`Case stage updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchCaseDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const res = await apiClient.post(`/api/v1/client/cases/${caseId}/messages`, {
        message: newMessage.trim(),
      });
      if (res.data?.success) {
        toast.success('Message posted to case thread!');
        setNewMessage('');
        fetchCaseDetails();
      }
    } catch (err) {
      toast.error('Failed to post message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadDocForm.documentName || !uploadDocForm.fileUrl) {
      toast.error('Document title and file link are required.');
      return;
    }
    setUploadingDoc(true);
    try {
      const res = await apiClient.post(`/api/v1/client/cases/${caseId}/documents`, {
        documentName: uploadDocForm.documentName,
        fileName: uploadDocForm.fileName || uploadDocForm.documentName,
        fileUrl: uploadDocForm.fileUrl,
        fileSize: uploadDocForm.fileSize || '1.2 MB',
        accessLevel: 'Restricted',
      });
      if (res.data?.success) {
        toast.success('Document saved to case vault!');
        setShowUploadModal(false);
        setUploadDocForm({
          documentName: 'Passport Scan Copy',
          fileName: '',
          fileUrl: '',
          fileSize: '1.5 MB',
        });
        fetchCaseDetails();
      }
    } catch (err) {
      toast.error('Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCompleteTask = async (taskDid) => {
    setCompletingTaskId(taskDid);
    try {
      await apiClient.patch(`/api/v1/client/cases/tasks/${taskDid}/complete`, {
        remarks: 'Completed by staff in agency workspace',
      });
      toast.success('Task marked as Done!');
      fetchCaseDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to complete task.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const ledger = caseData?.paymentLedger || {};
  const totalAgreed = ledger.totalAgreedAmount || caseData?.packageCost || 0;
  const totalPaid = ledger.totalPaidAmount || caseData?.initialPaidAmount || 0;
  const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-4xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-border">
        {/* Header Bar */}
        <div className="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Opening Case Workspace...</span>
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
                    {caseData.applicantName || caseData.clientInfo?.fullName || 'Client Case File'}
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

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCaseDetails}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              title="Refresh File Data"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Stage Status Selector Bar */}
        {caseData && (
          <div className="px-6 py-3 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Processing Stage:</span>
              <select
                value={caseData.status || 'ENTRY'}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-input bg-background text-foreground focus:outline-none cursor-pointer"
              >
                {PIPELINE_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-all cursor-pointer"
              >
                <UploadCloud className="size-4" />
                <span>+ Upload File</span>
              </button>
              <button
                onClick={() => setActiveTab('communication')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 font-bold rounded-xl transition-all cursor-pointer"
              >
                <MessageSquare className="size-4" />
                <span>Message Team</span>
              </button>
            </div>
          </div>
        )}

        {/* 3 Accounting Snapshot KPIs */}
        {caseData && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/10 border-b border-border text-center">
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Package</span>
              <div className="text-base font-black text-foreground mt-0.5">৳{Number(totalAgreed).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Paid Amount</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">৳{Number(totalPaid).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-rose-600">Due Balance</span>
              <div className="text-base font-black text-rose-600 mt-0.5">৳{Number(totalDue).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
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
            <span>Overview & Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-4" />
            <span>Staff Tasks (কে কী কাজ করছে)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {(caseData?.workflowTasks || []).length}
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
            <span>Uploaded Files (কে কোন ফাইল আপলোড করেছে)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {(caseData?.vaultDocuments || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('communication')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'communication'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="size-4" />
            <span>Team Chat & Notes (মেসেজ)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/10 text-sky-600 font-bold">
              {(caseData?.internalMessages || []).length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Loading workspace...</p>
            </div>
          ) : !caseData ? (
            <div className="text-center p-8 text-muted-foreground text-xs">No case data found.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & PIPELINE */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Client & Case Specification
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Full Name:</span>
                        <p className="font-semibold text-foreground">{caseData.applicantName || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone Number:</span>
                        <p className="font-semibold text-foreground">{caseData.phone || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passport:</span>
                        <p className="font-mono font-bold text-sky-600">{caseData.passportNumber || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Destination:</span>
                        <p className="font-bold text-foreground">{caseData.destinationCountry || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trade Skill:</span>
                        <p className="font-semibold text-foreground">{caseData.tradeSkill || 'General'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Stage:</span>
                        <p className="font-bold text-primary">{caseData.workflowStatus || caseData.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3-Stage Milestone Payment */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      3-Stage Milestone Payment Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">1. Advance (Intake)</span>
                        <p className="text-sm font-black text-foreground mt-0.5">
                          ৳{Number(ledger.step1_advance || caseData.initialPaidAmount || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <span className="text-sky-600 text-[10px] uppercase font-bold">2. Offer Letter Approval</span>
                        <p className="text-sm font-black text-foreground mt-0.5">
                          ৳{Number(ledger.step2_offerApproval || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <span className="text-purple-600 text-[10px] uppercase font-bold">3. Visa Delivery Final</span>
                        <p className="text-sm font-black text-foreground mt-0.5">
                          ৳{Number(ledger.step3_delivery || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Documents Intake Checklist */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Physical Document Intake Checklist
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        { key: 'photo2x2', label: 'Photo 2x2 (White Background)' },
                        { key: 'electricityBill', label: 'Electricity / Utility Bill' },
                        { key: 'nidCopy', label: 'National ID (NID) Copy' },
                        { key: 'landDocuments', label: 'Land Record / Property Papers' },
                        { key: 'followUpCallRequired', label: 'Follow-up Call Required' },
                      ].map((item) => {
                        const isChecked = caseData.checklist?.[item.key];
                        return (
                          <div
                            key={item.key}
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-semibold'
                                : 'bg-muted/30 border-border text-muted-foreground'
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isChecked ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'
                            }`}>
                              {isChecked ? 'Received ✓' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STAFF TASKS (কে কী কাজ করছে) */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Assigned Operational Tasks</h3>
                      <p className="text-xs text-muted-foreground">Track which staff member is executing each step.</p>
                    </div>
                  </div>

                  {(caseData.workflowTasks || []).length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-1">
                      <Clock className="size-8 mx-auto opacity-40 text-muted-foreground mb-1" />
                      <p className="text-xs font-semibold">No operational tasks assigned to staff yet.</p>
                      <p className="text-[11px]">Tasks assigned by Admin/Manager will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {caseData.workflowTasks.map((t, idx) => {
                        const isDone = t.status === 'Done';
                        const isApproved = t.status === 'Approved';
                        return (
                          <div
                            key={t.did || t._id || idx}
                            className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                                  Step {t.stepNumber || idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-foreground mt-0.5">{t.title}</h4>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isDone
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>

                            {t.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                              <div className="text-muted-foreground">
                                <span>Assigned Staff: </span>
                                <strong className="text-foreground">{t.assignedToName || t.assignedToDid || 'Staff Member'}</strong>
                              </div>

                              {!isDone && !isApproved && (
                                <button
                                  onClick={() => handleCompleteTask(t.did || t._id)}
                                  disabled={completingTaskId === (t.did || t._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  {completingTaskId === (t.did || t._id) ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="size-3.5" />
                                  )}
                                  <span>Mark as Done (কাজ সম্পন্ন)</span>
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

              {/* TAB 3: DOCUMENTS VAULT (কে কোন ফাইল আপলোড করেছে) */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Verified Document Vault</h3>
                      <p className="text-xs text-muted-foreground">See all uploaded files and who uploaded them.</p>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>+ Upload Document</span>
                    </button>
                  </div>

                  {(caseData.vaultDocuments || []).length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
                      <FileText className="size-8 mx-auto opacity-40 text-muted-foreground" />
                      <p className="text-xs font-semibold">No documents uploaded to this file vault yet.</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        + Upload First Document
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {caseData.vaultDocuments.map((doc, idx) => (
                        <div
                          key={doc.did || doc._id || idx}
                          className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold shrink-0">
                                <FileText className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-foreground truncate">
                                  {doc.documentName || doc.name || 'Document'}
                                </h5>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {doc.fileName || 'file.pdf'} • {doc.fileSize || '1.2 MB'}
                                </p>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                              Verified
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border text-muted-foreground">
                            <span>
                              Uploaded by: <strong className="text-foreground">{doc.uploadedByName || 'Staff Member'}</strong>
                            </span>
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-bold flex items-center gap-0.5"
                              >
                                View <ExternalLink className="size-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INTERNAL TEAM CHAT & NOTES (টিম মেসেজ ও নোটস) */}
              {activeTab === 'communication' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Case Collaboration & Internal Messages</h3>
                      <p className="text-xs text-muted-foreground">Leave quick status updates or notes for team members.</p>
                    </div>
                  </div>

                  {/* Message Thread Feed */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {(caseData.internalMessages || []).length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-1">
                        <MessageSquare className="size-8 mx-auto opacity-40 text-muted-foreground mb-1" />
                        <p className="text-xs font-semibold">No messages in this case thread yet.</p>
                        <p className="text-[11px]">Send the first update or client follow-up note below.</p>
                      </div>
                    ) : (
                      caseData.internalMessages.map((msg, idx) => (
                        <div
                          key={msg.did || idx}
                          className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                                {msg.senderName?.charAt(0) || 'S'}
                              </div>
                              <span className="font-bold text-xs text-foreground">{msg.senderName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold uppercase">
                                {msg.senderRole || 'Staff'}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt || Date.now()).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed pl-8">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Composer */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-border space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a message or internal note for this case file..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !newMessage.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {sendingMsg ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadDocument}
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="size-4 text-primary" />
                Upload Document to Case Vault
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Document Category / Name *</label>
                <select
                  value={uploadDocForm.documentName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none"
                >
                  <option value="Passport Scan Copy">Passport Scan Copy (পাসপোর্ট স্ক্যান)</option>
                  <option value="Photo 2x2">Photo 2x2 White BG (ছবি)</option>
                  <option value="Police Clearance Certificate (PCC)">Police Clearance (PCC)</option>
                  <option value="National ID (NID)">National ID Card (NID)</option>
                  <option value="Electricity / Utility Bill">Electricity / Utility Bill</option>
                  <option value="Work Permit / Offer Letter">Work Permit / Offer Letter</option>
                  <option value="Indian Visa Stamp Copy">Indian Visa Stamp Copy</option>
                  <option value="Medical Certificate">Medical Fitness Report</option>
                  <option value="Other Document">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">File Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. passport_scan_john.pdf"
                  value={uploadDocForm.fileName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, fileName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">File URL / Cloud Storage Link *</label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /uploads/docs/..."
                  value={uploadDocForm.fileUrl}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingDoc}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {uploadingDoc ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                <span>Save to Vault</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CaseWorkspaceDrawer;
