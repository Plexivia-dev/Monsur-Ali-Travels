import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Plus,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Calendar,
  Building2,
  Globe2,
  MessageSquare,
  UploadCloud,
  Eye,
  Check,
  Receipt,
  FileCheck,
  History,
  Info,
  Edit3,
  ChevronDown,
  Briefcase,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuthStore';
import { StepAssignModal } from '@/components/workflow/StepAssignModal';
import { AddPaymentModal } from '@/components/workflow/AddPaymentModal';
import { PageTitle } from '@shared/components/layout/PageTitle';

const PIPELINE_STAGES = [
  { id: 'ENTRY', title: '1. File Intake', color: 'bg-slate-100 text-slate-800' },
  { id: 'PROCESSING', title: '2. Document Processing', color: 'bg-blue-100 text-blue-800' },
  { id: 'APPROVED_OFFER_LETTER', title: '3. Offer Approved', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'SUBMITTED_EMBASSY_BSF', title: '4. Embassy / VFS Submitted', color: 'bg-amber-100 text-amber-800' },
  { id: 'COMPLETED_DELIVERED', title: '5. Completed & Delivered', color: 'bg-emerald-100 text-emerald-800' },
];

const formatCleanLabel = (str, fallback = '—') => {
  if (!str) return fallback;
  return String(str)
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activity' | 'tasks' | 'payments' | 'documents' | 'communication'

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    applicantName: '',
    phone: '',
    passportNumber: '',
    nidNumber: '',
    caseType: 'general',
    destinationCountry: '',
    tradeSkill: '',
    totalAgreedAmount: 0,
    status: 'ENTRY',
    remarks: '',
  });

  const [uploadDocForm, setUploadDocForm] = useState({
    documentName: 'Passport Scan Copy',
    fileName: '',
    fileUrl: '',
    fileSize: '1.5 MB',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Internal Message
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchCaseDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Try admin full-details endpoint
      let loadedData = null;
      try {
        const res = await apiClient.get(`/api/v1/admin/cases/${id}/full-details`);
        if ((res.data?.status === 'success' || res.data?.success) && res.data.data) {
          loadedData = res.data.data;
        }
      } catch (adminErr) {
        // Fallback to client endpoint
      }

      // 2. Try client cases endpoint if not yet loaded
      if (!loadedData) {
        try {
          const altRes = await apiClient.get(`/api/v1/client/cases/${id}`);
          if ((altRes.data?.status === 'success' || altRes.data?.success) && altRes.data.data) {
            loadedData = altRes.data.data;
          }
        } catch (clientErr) {
          // Continue
        }
      }

      if (loadedData) {
        setCaseData(loadedData);
      } else {
        toast.error('Failed to load case file details.');
        setCaseData(null);
      }
    } catch (err) {
      toast.error('Failed to load case file details.');
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCaseDetails();
  }, [fetchCaseDetails]);

  const handleStageChange = async (newStatus) => {
    try {
      await apiClient.patch(`/api/v1/client/cases/${caseData.did || caseData._id}/workflow`, {
        status: newStatus,
        remarks: `Stage updated to ${newStatus} by ${user?.name || 'Admin'}`,
      });
      toast.success(`Case stage updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchCaseDetails();
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  const handleApproveTask = async (taskDid) => {
    try {
      await apiClient.patch(`/api/v1/admin/cases/tasks/${taskDid}/approve`);
      toast.success('Task approved and next step unlocked!');
      fetchCaseDetails();
    } catch (err) {
      toast.error('Failed to approve task.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const res = await apiClient.post(`/api/v1/client/cases/${caseData.did || caseData._id}/messages`, {
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    
    // Auto populate file metadata immediately
    setUploadDocForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: sizeInMb,
      fileUrl: '',
    }));

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiClient.post('/api/v1/upload/single?folder=documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url || res.data?.data?.fullUrl || res.data?.url || '';
      if (uploadedUrl) {
        setUploadDocForm((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: sizeInMb,
          fileUrl: uploadedUrl,
        }));
        toast.success('File uploaded and linked successfully!');
      } else {
        throw new Error('No file URL returned from upload');
      }
    } catch (err) {
      // Fallback: Read as Data URL so user workflow is never blocked
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadDocForm((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: sizeInMb,
          fileUrl: event.target?.result || '',
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!caseData) return;
    setEditForm({
      applicantName: caseData.applicantName || caseData.clientInfo?.fullName || '',
      phone: caseData.phone || caseData.clientInfo?.phone || '',
      passportNumber: caseData.passportNumber || caseData.clientInfo?.passportNumber || '',
      nidNumber: caseData.nidNumber || caseData.clientInfo?.nidNumber || '',
      caseType: caseData.caseType || 'general',
      destinationCountry: caseData.destinationCountry || '',
      tradeSkill: caseData.tradeSkill || '',
      totalAgreedAmount: caseData.paymentLedger?.totalAgreedAmount || caseData.packageCost || 0,
      status: caseData.status || 'ENTRY',
      remarks: caseData.remarks || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCaseEdit = async (e) => {
    e.preventDefault();
    if (!editForm.applicantName.trim()) {
      return toast.error('Applicant full name is required');
    }
    setSavingEdit(true);
    try {
      const payload = {
        ...editForm,
        paymentLedger: {
          ...caseData?.paymentLedger,
          totalAgreedAmount: Number(editForm.totalAgreedAmount) || 0,
        },
      };
      const res = await apiClient.put(`/api/v1/client/cases/${caseData.did || caseData._id}`, payload);
      if (res.data?.success || res.data?.status === 'success') {
        toast.success('Case file details updated successfully!');
        setIsEditModalOpen(false);
        fetchCaseDetails();
      } else {
        throw new Error(res.data?.message || 'Failed to update case file');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update case file');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadDocForm.documentName || !uploadDocForm.fileUrl) {
      toast.error('Please select a file or provide a document URL.');
      return;
    }
    setUploadingDoc(true);
    try {
      const res = await apiClient.post(`/api/v1/client/cases/${caseData.did || caseData._id}/documents`, {
        documentName: uploadDocForm.documentName,
        fileName: uploadDocForm.fileName || uploadDocForm.documentName,
        fileUrl: uploadDocForm.fileUrl,
        fileSize: uploadDocForm.fileSize || '1.2 MB',
        accessLevel: 'Restricted',
      });
      if (res.data?.success || res.data?.status === 'success') {
        toast.success('Document uploaded to case vault!');
        setIsUploadModalOpen(false);
        setUploadDocForm({
          documentName: 'Passport Scan Copy',
          fileName: '',
          fileUrl: '',
          fileSize: '1.5 MB',
        });
        fetchCaseDetails();
      } else {
        throw new Error(res.data?.message || 'Failed to upload document');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Dedicated Case File Workspace...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Case File Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested case file could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/admin/cases')}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs"
        >
          Back to Case Workflow
        </button>
      </div>
    );
  }

  const ledger = caseData.paymentLedger || {};
  const totalAgreed = ledger.totalAgreedAmount || caseData.packageCost || 0;
  const totalPaid = ledger.totalPaidAmount || caseData.initialPaidAmount || 0;
  const totalDue = ledger.dueAmount !== undefined ? ledger.dueAmount : Math.max(0, totalAgreed - totalPaid);
  const paidPercent = totalAgreed > 0 ? Math.min(100, Math.round((totalPaid / totalAgreed) * 100)) : 0;

  // Build Comprehensive Chronological Activity History
  const activityTimeline = [];

  // 1. Creation event
  if (caseData.createdAt) {
    activityTimeline.push({
      type: 'CREATE',
      title: 'Case File Initiated & Registered',
      description: `File created by ${caseData.createdByName || caseData.createdBy?.name || 'Staff'}`,
      user: caseData.createdByName || caseData.createdBy?.name || 'Staff Member',
      role: caseData.createdBy?.role || 'Staff',
      timestamp: caseData.createdAt,
      icon: FolderOpen,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    });
  }

  // 2. Status transitions
  (caseData.statusHistory || []).forEach((sh) => {
    activityTimeline.push({
      type: 'STATUS',
      title: `Stage Updated: ${sh.status}`,
      description: sh.remarks || `Status transitioned to ${sh.status}`,
      user: sh.updatedByName || 'Admin / Staff',
      role: 'Staff',
      timestamp: sh.date || sh.createdAt,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    });
  });

  // 3. Workflow tasks
  (caseData.workflowTasks || []).forEach((t) => {
    activityTimeline.push({
      type: 'TASK',
      title: `Task Step ${t.stepNumber || 1}: ${t.title}`,
      description: `Assigned to ${t.assignedToName || t.assignedToDid || 'Staff'} • Status: ${t.status}`,
      user: t.assignedToName || 'Staff',
      role: 'Staff',
      timestamp: t.createdAt,
      icon: Layers,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    });
  });

  // 4. Money receipts
  (caseData.financialReceipts || []).forEach((r) => {
    activityTimeline.push({
      type: 'PAYMENT',
      title: `Money Receipt Issued: BDT ${Number(r.amount || 0).toLocaleString('en-IN')}`,
      description: `Receipt #${r.receiptNumber || 'MR-001'} (${r.paymentMethod || 'Cash'}) received from ${r.clientName || caseData.applicantName}`,
      user: r.receivedByName || r.createdBy || 'Accountant',
      role: 'Accounts',
      timestamp: r.paymentDate || r.createdAt,
      icon: Receipt,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    });
  });

  // 5. Document uploads
  (caseData.vaultDocuments || []).forEach((d) => {
    activityTimeline.push({
      type: 'DOCUMENT',
      title: `Document Uploaded: ${d.documentName || d.name}`,
      description: `${d.fileName || 'file.pdf'} (${d.fileSize || '1.2 MB'}) uploaded to verified vault`,
      user: d.uploadedByName || 'Staff Member',
      role: 'Staff',
      timestamp: d.createdAt,
      icon: FileCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    });
  });

  // 6. Internal messages
  (caseData.internalMessages || []).forEach((m) => {
    activityTimeline.push({
      type: 'MESSAGE',
      title: `Team Note from ${m.senderName}`,
      description: m.message,
      user: m.senderName,
      role: m.senderRole || 'Staff',
      timestamp: m.createdAt,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    });
  });

  // Sort timeline descending
  activityTimeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Dynamic PageTitle Header */}
      <PageTitle
        title={caseData.applicantName || caseData.clientInfo?.fullName || 'Applicant File'}
        subtitle={`Case File #${caseData.caseNumber || 'CASE-FILE'} • Destination: ${caseData.destinationCountry || caseData.caseType?.toUpperCase() || 'Overseas'} • Trade: ${caseData.tradeSkill || 'General Worker'}`}
        icon={FolderOpen}
        badge={caseData.workflowStatus || caseData.status || 'ACTIVE'}
        actions={
          <>
            <button
              onClick={fetchCaseDetails}
              className="p-2 rounded-xl border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-white transition cursor-pointer"
              title="Refresh Case File"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Case File</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Assign Step Task</span>
            </button>
          </>
        }
      />

      {/* Case Identity & Creator Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {caseData.applicantName || caseData.clientInfo?.fullName}
              </h2>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Globe2 className="w-3 h-3" />
                <span>{formatCleanLabel(caseData.destinationCountry || caseData.caseType, 'General')}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Briefcase className="w-3 h-3" />
                <span>{formatCleanLabel(caseData.tradeSkill, 'General Worker')}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-foreground">{caseData.phone || caseData.clientInfo?.phone || '—'}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-muted-foreground">Passport:</span>
                <span className="font-mono font-semibold text-foreground">
                  {caseData.passportNumber || caseData.clientInfo?.passportNumber || '—'}
                </span>
              </div>

              {(caseData.nidNumber || caseData.clientInfo?.nidNumber) && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-muted-foreground">NID:</span>
                  <span className="font-mono font-medium text-foreground">
                    {caseData.nidNumber || caseData.clientInfo?.nidNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Case Stage / Status Switcher */}
          <div className="flex flex-col gap-1.5 bg-card border-2 border-primary/20 hover:border-primary/40 rounded-2xl p-3 shadow-xs shrink-0 self-start lg:self-center min-w-[260px] transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Workflow Stage</span>
              </div>
              {caseData.workflowStatus && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {formatCleanLabel(caseData.workflowStatus)}
                </span>
              )}
            </div>

            <div className="relative mt-0.5">
              <select
                value={caseData.status || 'ENTRY'}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 text-xs font-bold rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-2xs transition-all"
                title="Click to change case status"
              >
                {PIPELINE_STAGES.map((st) => (
                  <option key={st.id} value={st.id} className="bg-popover text-popover-foreground py-1 font-medium">
                    {st.title} {st.id === caseData.status ? '✓ (Current)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-primary">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <span>⚡</span>
              <span>Select option above to change status</span>
            </span>
          </div>
        </div>

        {/* Creator Audit Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-muted/20 px-4 py-2 rounded-xl border border-border/60">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>
              Created By:{' '}
              <strong className="text-foreground font-semibold">
                {caseData.createdByName || caseData.createdBy?.name || 'Staff Member'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>
              Registered Date:{' '}
              <strong className="text-foreground font-semibold">
                {new Date(caseData.createdAt || Date.now()).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>
              Last Updated:{' '}
              <strong className="text-foreground font-semibold">
                {new Date(caseData.updatedAt || Date.now()).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Financial & Pipeline Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Agreed Package</span>
          <div className="text-xl font-black text-foreground">BDT {Number(totalAgreed).toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-muted-foreground">Total agreed client contract</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-600">Total Collected Payment</span>
            <span className="text-[11px] font-bold text-emerald-600">{paidPercent}%</span>
          </div>
          <div className="text-xl font-black text-emerald-600">BDT {Number(totalPaid).toLocaleString('en-IN')}</div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPercent}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-rose-600">Total Due Balance</span>
          <div className="text-xl font-black text-rose-600">BDT {Number(totalDue).toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-rose-500 font-medium">Pending collection balance</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-primary">Operational Tasks Progress</span>
          <div className="text-xl font-black text-foreground">
            {(caseData.workflowTasks || []).filter((t) => t.status === 'Approved' || t.status === 'Done').length} /{' '}
            {(caseData.workflowTasks || []).length || 5} Steps
          </div>
          <span className="text-[10px] text-muted-foreground">Active step execution</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-card border border-border rounded-2xl p-1 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'File Overview', icon: FolderOpen },
          { id: 'activity', label: 'Activity History', icon: History, count: activityTimeline.length },
          { id: 'tasks', label: 'Workflow Tasks', icon: Layers, count: (caseData.workflowTasks || []).length },
          { id: 'payments', label: 'Payments & Receipts', icon: CreditCard, count: (caseData.financialReceipts || []).length },
          { id: 'documents', label: 'Document Vault', icon: FileText, count: (caseData.vaultDocuments || []).length },
          { id: 'communication', label: 'Team Collaboration & Notes', icon: MessageSquare, count: (caseData.internalMessages || []).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-primary-foreground/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="space-y-6">
        {/* TAB 1: FILE & CLIENT OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bio Details */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Client & Passport Particulars
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Applicant Full Name</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.applicantName || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.phone || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Passport Number</span>
                  <p className="font-mono font-bold text-sky-600 mt-0.5">{caseData.passportNumber || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">National ID (NID)</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{caseData.nidNumber || caseData.clientInfo?.nidNumber || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Destination Country</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.destinationCountry || caseData.caseType?.toUpperCase()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Trade / Skill Category</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.tradeSkill || 'General Worker'}</p>
                </div>
              </div>
            </div>

            {/* 3-Stage Milestone Payment Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                3-Step Milestone Payment Schedule & Settlement
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">1. File Entry & Submission Advance</span>
                    <span className="text-[11px] text-muted-foreground">Initial file processing intake</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      BDT {Number(ledger.step1_advance || caseData.initialPaidAmount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">Paid ✓</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">2. Offer Letter / Work Permit Approval Milestone</span>
                    <span className="text-[11px] text-muted-foreground">Due upon official work permit approval</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      BDT {Number(ledger.step2_offerApproval || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">Due on Approval</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">3. Visa & Passport Final Settlement upon Delivery</span>
                    <span className="text-[11px] text-muted-foreground">Final settlement before flight delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      BDT {Number(ledger.step3_delivery || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600">Upon Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Document Intake Checklist */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-600" />
                Physical Document Intake Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { key: 'photo2x2', label: '2x2 Size Photo (White Background)' },
                  { key: 'electricityBill', label: 'Utility / Electricity Bill Copy' },
                  { key: 'nidCopy', label: 'National ID (NID) Copy' },
                  { key: 'landDocuments', label: 'Land Property Documents' },
                  { key: 'followUpCallRequired', label: 'Pending Document Follow-up Reminder' },
                ].map((item) => {
                  const isChecked = caseData.checklist?.[item.key];
                  return (
                    <div
                      key={item.key}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'bg-muted/30 border-border text-muted-foreground'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isChecked ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isChecked ? 'Received ✓' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPREHENSIVE ACTIVITY & AUDIT TIMELINE */}
        {activeTab === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Comprehensive Activity History & Audit Trail</h3>
                <p className="text-xs text-muted-foreground">
                  Timestamped audit trail of all staff actions, stage updates, payments, and document uploads.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                Total Events: {activityTimeline.length}
              </span>
            </div>

            {activityTimeline.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                <History className="w-8 h-8 mx-auto opacity-40" />
                <p>No activity records logged yet for this case file.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activityTimeline.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`size-6 rounded-full flex items-center justify-center border shrink-0 -ml-6 shadow-2xs ${item.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>

                      <div className="bg-muted/20 border border-border p-4 rounded-xl flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-foreground">{item.title}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {new Date(item.timestamp).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        <div className="pt-1 text-[10px] text-muted-foreground flex items-center gap-2">
                          <span>Performed By:</span>
                          <strong className="text-foreground">{item.user}</strong>
                          <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase font-semibold">
                            {item.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WORKFLOW TASKS & STAFF ASSIGNMENT */}
        {activeTab === 'tasks' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Workflow Steps & Operational Tasks</h3>
                <p className="text-xs text-muted-foreground">
                  Task allocation, assigned staff members, and live milestone progress.
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign New Step</span>
              </button>
            </div>

            {(caseData.workflowTasks || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <Layers className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">No workflow tasks assigned yet.</p>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  + Create First Task Step
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.workflowTasks.map((t, idx) => (
                  <div
                    key={t.did || t._id || idx}
                    className="bg-muted/20 border border-border p-4 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary uppercase">
                          Step {t.stepNumber || idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">{t.title}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Done'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                      <span>
                        Assigned Staff:{' '}
                        <strong className="text-foreground">{t.assignedToName || t.assignedToDid || 'Staff'}</strong>
                      </span>
                      {t.status === 'Done' && (
                        <button
                          onClick={() => handleApproveTask(t.did || t._id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs"
                        >
                          Approve Step ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENT STATEMENT & MONEY RECEIPTS */}
        {activeTab === 'payments' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Payment Statements & Money Receipts</h3>
                <p className="text-xs text-muted-foreground">
                  All issued payment receipts, transaction tokens, and ledger entries for this case file.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Money Receipt</span>
              </button>
            </div>

            {(caseData.financialReceipts || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <Receipt className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">No money receipts issued yet for this case.</p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  + Create Money Receipt
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Receipt No</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Payment Method</th>
                      <th className="px-4 py-3 font-semibold">Amount (BDT)</th>
                      <th className="px-4 py-3 font-semibold">Issuing Staff</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {caseData.financialReceipts.map((r, idx) => (
                      <tr key={r.did || r._id || idx} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-primary">
                          {r.receiptNumber || `MR-00${idx + 1}`}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(r.paymentDate || r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold">{r.paymentMethod || 'Cash'}</td>
                        <td className="px-4 py-3 font-black text-emerald-600">
                          BDT {Number(r.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {r.receivedByName || r.createdBy || 'Accountant'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toast.success(`Printing receipt ${r.receiptNumber}...`)}
                            className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-bold cursor-pointer"
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOCUMENT VAULT & UPLOADER AUDIT */}
        {activeTab === 'documents' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Verified Document Vault & Uploader Audit</h3>
                <p className="text-xs text-muted-foreground">
                  Verified repository of case scans and attachments with audit trail of staff uploaders.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Upload New File</span>
              </button>
            </div>

            {(caseData.vaultDocuments || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <FileText className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">No documents uploaded to this vault yet.</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  + Upload First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {caseData.vaultDocuments.map((doc, idx) => (
                  <div
                    key={doc.did || doc._id || idx}
                    className="bg-muted/20 border border-border p-4 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-foreground truncate">{doc.documentName || doc.name}</h5>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {doc.fileName || 'file.pdf'} • {doc.fileSize || '1.2 MB'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border text-muted-foreground">
                      <span>
                        Uploaded By: <strong className="text-foreground">{doc.uploadedByName || 'Staff Member'}</strong>
                      </span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-bold flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TEAM CHAT & NOTES */}
        {activeTab === 'communication' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">Team Collaboration & Internal Notes</h3>
              <p className="text-xs text-muted-foreground">
                Internal team discussions, staff notes, and operational logs for this case file.
              </p>
            </div>

            {/* Messages Feed */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(caseData.internalMessages || []).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                  <p className="font-semibold">No internal notes posted yet.</p>
                </div>
              ) : (
                caseData.internalMessages.map((msg, idx) => (
                  <div
                    key={msg.did || idx}
                    className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5"
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
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(msg.createdAt || Date.now()).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
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

            {/* Send Note Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Write an internal operational note or message for this case file..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
              >
                {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Note</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Step Assign Modal */}
      {isAssignModalOpen && (
        <StepAssignModal
          isOpen={isAssignModalOpen}
          caseDoc={caseData}
          onClose={() => setIsAssignModalOpen(false)}
          caseDid={caseData?.did || caseData?._id}
          caseNumber={caseData?.caseNumber}
          onSuccess={fetchCaseDetails}
        />
      )}

      {/* Payment Receive Modal */}
      {isPaymentModalOpen && (
        <AddPaymentModal
          isOpen={isPaymentModalOpen}
          caseDoc={caseData}
          onClose={() => setIsPaymentModalOpen(false)}
          caseDid={caseData?.did || caseData?._id}
          caseNumber={caseData?.caseNumber}
          applicantName={caseData?.applicantName}
          dueAmount={totalDue}
          onSuccess={fetchCaseDetails}
        />
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadDocument}
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary" />
                Attach File to Document Vault
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Document Category *</label>
                <select
                  value={uploadDocForm.documentName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none"
                >
                  <option value="Passport Scan Copy">Passport Scan Copy</option>
                  <option value="Photo (35x45mm / 2x2 White BG)">Photo (35x45mm / 2x2 White BG)</option>
                  <option value="Police Clearance Certificate (PCC)">Police Clearance Certificate (PCC)</option>
                  <option value="National ID Card (NID)">National ID Card (NID)</option>
                  <option value="Medical Examination Report">Medical Examination Report</option>
                  <option value="Work Permit / Offer Letter">Work Permit / Offer Letter</option>
                  <option value="Visa Sticker / Approval Dossier">Visa Sticker / Approval Dossier</option>
                  <option value="Embassy / VFS Submission Slip">Embassy / VFS Submission Slip</option>
                  <option value="Bank Statement / Solvency">Bank Statement / Solvency</option>
                  <option value="Other Document">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                  <span>Choose Local File *</span>
                  {uploadingFile && (
                    <span className="flex items-center gap-1 text-[11px] text-primary font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  disabled={uploadingFile}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                  <span>File Name / Label</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-normal">Auto-generated</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated from chosen file"
                  value={uploadDocForm.fileName}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 bg-muted/70 border border-border rounded-xl text-muted-foreground font-medium cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                  <span>File URL / Cloud Storage Link</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-normal">Auto-generated</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated upon file selection"
                  value={uploadDocForm.fileUrl ? (uploadDocForm.fileUrl.startsWith('data:') ? `[Embedded File: ${uploadDocForm.fileName}]` : uploadDocForm.fileUrl) : ''}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 bg-muted/70 border border-border rounded-xl text-muted-foreground font-medium cursor-not-allowed select-none font-mono text-[11px] truncate"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingDoc || uploadingFile || !uploadDocForm.fileUrl}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-all"
              >
                {uploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{uploadingDoc ? 'Saving...' : 'Save to Vault'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Case File Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveCaseEdit}
            className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Edit Case File #{caseData.caseNumber || 'CASE-FILE'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.applicantName}
                  onChange={(e) => setEditForm({ ...editForm, applicantName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Passport Number</label>
                <input
                  type="text"
                  value={editForm.passportNumber}
                  onChange={(e) => setEditForm({ ...editForm, passportNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">National ID (NID)</label>
                <input
                  type="text"
                  value={editForm.nidNumber}
                  onChange={(e) => setEditForm({ ...editForm, nidNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Destination Country</label>
                <input
                  type="text"
                  value={editForm.destinationCountry}
                  onChange={(e) => setEditForm({ ...editForm, destinationCountry: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Trade / Skill Category</label>
                <input
                  type="text"
                  value={editForm.tradeSkill}
                  onChange={(e) => setEditForm({ ...editForm, tradeSkill: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Total Agreed Package Bill (BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.totalAgreedAmount}
                  onChange={(e) => setEditForm({ ...editForm, totalAgreedAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Current Processing Stage</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                >
                  {PIPELINE_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-foreground mb-1">Remarks & Operational Notes</label>
                <textarea
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Case notes, sponsor particulars, or timeline updates..."
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
