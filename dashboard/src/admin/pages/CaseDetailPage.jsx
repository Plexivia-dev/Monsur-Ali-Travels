import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  X,
  Trash2,
  UserCheck,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuthStore';
import { StepAssignModal } from '@/components/workflow/StepAssignModal';
import { AddPaymentModal } from '@/components/workflow/AddPaymentModal';
import { PageTitle } from '@shared/components/layout/PageTitle';
import { FileViewerModal } from '@shared/components/common/FileViewerModal';

const DOCUMENT_STUDIO_TEMPLATES = [
  {
    id: 'agreement',
    title: 'Employment & Service Agreement',
    subtitle: 'Official 4-page job contract & appointment agreement with terms',
    category: 'Legal & Contract',
    badge: 'Contract',
    icon: FileText,
  },
  {
    id: 'client-form',
    title: 'Customer & Guardian Application Form',
    subtitle: 'Master bio, emergency guardian particulars & fee schedule',
    category: 'Intake & Bio',
    badge: 'Master Intake',
    icon: User,
  },
  {
    id: 'indian-visa',
    title: 'Indian Visa & BSF Application',
    subtitle: 'High Commission submission application & port particulars',
    category: 'Visa & Immigration',
    badge: 'Visa Form',
    icon: Globe2,
  },
  {
    id: 'passport-sub',
    title: 'Passport Intake & Submission Memo',
    subtitle: 'Physical passport receipt, tracking ID & custody memo',
    category: 'Passport & Custody',
    badge: 'Custody Memo',
    icon: FileCheck,
  },
  {
    id: 'job-verification',
    title: 'Job Verification & Work Permit Letter',
    subtitle: 'Ministry & employer verification letter and deployment terms',
    category: 'Employment',
    badge: 'Verification',
    icon: Building2,
  },
  {
    id: 'idcard',
    title: 'Client / Trainee Identity Card',
    subtitle: 'Dual-sided PVC plastic identity badge with photo & QR code',
    category: 'Identity & Cards',
    badge: 'PVC ID Card',
    icon: UserCheck,
  },
  {
    id: 'money-receipt',
    title: 'Official Money Receipt',
    subtitle: 'Formal 3-copy accounts payment receipt with verification stamp',
    category: 'Financials',
    badge: 'Receipt',
    icon: Receipt,
  },
  {
    id: 'cash-voucher',
    title: 'Office Debit & Cash Voucher',
    subtitle: 'Internal cash disbursement and expense voucher',
    category: 'Financials',
    badge: 'Voucher',
    icon: CreditCard,
  },
  {
    id: 'experience-certificate',
    title: 'Trade Experience Certificate',
    subtitle: 'Official certified proof of trade & employment experience',
    category: 'Certifications',
    badge: 'Certificate',
    icon: ShieldCheck,
  },
  {
    id: 'character-certificate',
    title: 'Character Clearance Certificate',
    subtitle: 'Local administration & municipal character verification letter',
    category: 'Certifications',
    badge: 'Clearance',
    icon: CheckCircle2,
  },
  {
    id: 'marriage-certificate',
    title: 'Marriage Affidavit Certificate',
    subtitle: 'Official spousal affidavit for overseas dependency processing',
    category: 'Legal & Affidavit',
    badge: 'Affidavit',
    icon: FileText,
  },
];

const PIPELINE_STAGES = [
  { id: 'ENTRY', title: '1. File Intake', color: 'bg-slate-100 text-slate-800' },
  { id: 'PROCESSING', title: '2. Document Processing', color: 'bg-blue-100 text-blue-800' },
  { id: 'APPROVED_OFFER_LETTER', title: '3. Offer Approved', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'SUBMITTED_EMBASSY_BSF', title: '4. Embassy / VFS Submitted', color: 'bg-amber-100 text-amber-800' },
  { id: 'COMPLETED_DELIVERED', title: '5. Completed & Delivered', color: 'bg-emerald-100 text-emerald-800' },
];

export const getTaskStatusConfig = (status) => {
  switch (status) {
    case 'Approved':
      return {
        label: 'Approved ✓',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      };
    case 'Done':
      return {
        label: 'Done',
        badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
      };
    case 'In Progress':
    case 'Processing':
      return {
        label: 'In Progress',
        badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
        dotClass: 'bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]',
      };
    case 'Rejected':
      return {
        label: 'Rejected ✗',
        badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
      };
    case 'Pending':
    default:
      return {
        label: 'Pending',
        badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]',
      };
  }
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuth((state) => state.user);

  const initialTab = searchParams.get('tab') || 'overview';
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'activity' | 'tasks' | 'payments' | 'documents' | 'communication'

  // Synchronize tab from URL if present
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('agreement');
  const [previewFile, setPreviewFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Rename document inline
  const [renamingDocDid, setRenamingDocDid] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);


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
    fileSize: '',
    file: null,
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

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

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    setUploadDocForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: sizeInMb,
      file: file,
      fileUrl: '',
    }));
  };

  const handleRemoveSelectedFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadDocForm((prev) => ({
      ...prev,
      fileName: '',
      fileUrl: '',
      fileSize: '',
      file: null,
    }));
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

  const handleRenameDocument = async (doc) => {
    if (!renameValue.trim() || renameValue.trim() === doc.documentName) {
      setRenamingDocDid(null);
      setRenameValue('');
      return;
    }
    setSavingRename(true);
    try {
      const docId = doc.did || doc._id;
      const caseId = caseData.did || caseData._id;
      const res = await apiClient.patch(
        `/api/v1/client/cases/${caseId}/documents/${docId}/rename`,
        { documentName: renameValue.trim() }
      );
      if (res.data?.success || res.data?.status === 'success') {
        toast.success('Document renamed successfully!');
        setRenamingDocDid(null);
        setRenameValue('');
        fetchCaseDetails();
      } else {
        throw new Error(res.data?.message || 'Rename failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to rename document.');
    } finally {
      setSavingRename(false);
    }
  };

  const handleUploadDocument = async (e) => {

    e.preventDefault();
    if (!uploadDocForm.documentName || (!uploadDocForm.file && !uploadDocForm.fileUrl)) {
      toast.error('Please choose a file to upload.');
      return;
    }
    setUploadingDoc(true);
    try {
      let finalFileUrl = uploadDocForm.fileUrl;
      let finalFileName = uploadDocForm.fileName;
      let finalFileSize = uploadDocForm.fileSize;

      // 1. Upload physical file to server/R2 storage endpoint first
      if (uploadDocForm.file) {
        const formData = new FormData();
        formData.append('file', uploadDocForm.file);

        const clientId = caseData?.clientDid || caseData?.clientId || caseData?.clientInfo?.did || caseData?.clientInfo?._id || '';
        const docCategorySlug = (uploadDocForm.documentName || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const queryParams = new URLSearchParams();
        if (clientId) queryParams.append('clientId', clientId);
        queryParams.append('documentType', `cases-${docCategorySlug}`);

        const uploadRes = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.success && uploadRes.data?.data) {
          finalFileUrl = uploadRes.data.data.url || uploadRes.data.data.fullUrl;
          finalFileName = uploadRes.data.data.originalName || uploadRes.data.data.name || finalFileName;
          if (uploadRes.data.data.size) {
            finalFileSize = `${(uploadRes.data.data.size / (1024 * 1024)).toFixed(2)} MB`;
          }
        } else {
          throw new Error(uploadRes.data?.message || 'Failed to upload physical file to server');
        }
      }

      if (!finalFileUrl) {
        throw new Error('Failed to resolve uploaded file URL');
      }

      // 2. Attach document metadata to the case vault
      const res = await apiClient.post(`/api/v1/client/cases/${caseData.did || caseData._id}/documents`, {
        documentName: uploadDocForm.documentName,
        fileName: finalFileName || `${uploadDocForm.documentName}.pdf`,
        fileUrl: finalFileUrl,
        fileSize: finalFileSize || '1.2 MB',
        accessLevel: 'Restricted',
      });

      if (res.data?.success || res.data?.status === 'success') {
        toast.success('Document uploaded and saved to case vault!');
        setIsUploadModalOpen(false);
        setUploadDocForm({
          documentName: 'Passport Scan Copy',
          fileName: '',
          fileUrl: '',
          fileSize: '',
          file: null,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    const taskAssignee = t.assignedToName || t.assignedTo?.name || t.assignedToDid || 'Staff';
    activityTimeline.push({
      type: 'TASK',
      title: `Task Step ${t.stepNumber || 1}: ${t.title}`,
      description: `Assigned to ${taskAssignee} • Status: ${t.status}`,
      user: taskAssignee,
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

  const workflowTasks = caseData.workflowTasks || [];
  const pendingOrActiveTask = workflowTasks.find((t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Processing');
  const latestTask = workflowTasks[workflowTasks.length - 1];
  const activeTask = pendingOrActiveTask || latestTask;
  const isLatestTaskDone = !pendingOrActiveTask && latestTask?.status === 'Done';
  const activeHandlerName = pendingOrActiveTask ? (pendingOrActiveTask.assignedToName || pendingOrActiveTask.assignedTo?.name || caseData.assignedToName || caseData.assignedTo?.name || caseData.assignedOfficer) : null;
  const activeTaskStatusCfg = activeTask ? getTaskStatusConfig(activeTask.status) : null;

  const client = caseData.clientInfo || caseData.clientId || {};
  const clientDid = client.did || caseData.clientDid;
  const clientCode = client.clientCode || (clientDid ? `CLNT-${clientDid.slice(0, 8)}` : '—');
  const clientName = client.fullName || caseData.applicantName || 'Unnamed Client';
  const clientPhone = client.phone || caseData.phone || '—';
  const clientAltPhone = client.altPhone || '';
  const clientEmail = client.email || '';
  const passportNo = caseData.passportNumber || client.passportNumber || '—';
  const passportExpiry = client.passportExpiryDate || caseData.passportExpiryDate || '';
  const nidNo = client.nidNumber || caseData.nidNumber || '—';
  const birthDate = client.birthDate || '';
  const gender = client.gender || 'Male';
  const bloodGroup = client.bloodGroup || '';
  const maritalStatus = client.maritalStatus || '';
  const presentAddress = client.presentAddress || client.address || '';
  const permanentAddress = client.permanentAddress || '';
  const district = client.district || '';
  const policeStation = client.policeStation || '';
  const fatherName = client.fatherName || '';
  const motherName = client.motherName || '';
  const guardian = client.guardian || {};

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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-black text-foreground">
                {caseData.applicantName || caseData.clientInfo?.fullName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Destination: {caseData.destinationCountry || caseData.caseType?.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Trade: {caseData.tradeSkill || 'General Worker'}
              </span>
            </div>

            {/* Active Handler & Current Task Status Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Handler Pill */}
              {isLatestTaskDone ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">Step {latestTask.stepNumber || 1} Done by {latestTask.assignedToName || 'Staff'}</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase ml-1">
                    Ready for Next Step
                  </span>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="ml-1 px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 cursor-pointer text-[10px]"
                  >
                    + Assign Step {(latestTask.stepNumber || 1) + 1}
                  </button>
                </div>
              ) : activeHandlerName ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border">
                  <UserCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="text-muted-foreground font-medium">Currently Handling:</span>
                  <strong className="text-foreground font-bold">{activeHandlerName}</strong>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border">
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  <span className="text-muted-foreground font-medium">Assigned Staff:</span>
                  <span className="text-muted-foreground">Unassigned</span>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
                  >
                    (+ Assign Step)
                  </button>
                </div>
              )}

              {/* Task Status Pill */}
              {activeTask ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border">
                  <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${activeTaskStatusCfg.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTaskStatusCfg.dotClass}`} />
                    {activeTask.status || 'Pending'}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Unassigned
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                {caseData.phone || caseData.clientInfo?.phone || '—'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-sky-600 dark:text-sky-400 font-semibold">
                <FileText className="w-3.5 h-3.5" />
                Passport: {caseData.passportNumber || caseData.clientInfo?.passportNumber || '—'}
              </span>
              {caseData.clientInfo?.nidNumber && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  NID: {caseData.clientInfo.nidNumber}
                </span>
              )}
            </div>
          </div>

          {/* Current Processing Stage Dropdown */}
          <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">Processing Stage</span>
              <span className="text-xs font-black text-primary block">{caseData.workflowStatus || caseData.status}</span>
            </div>
            <select
              value={caseData.status || 'ENTRY'}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-input bg-background text-foreground focus:outline-none cursor-pointer"
            >
              {PIPELINE_STAGES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Creator Audit Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-muted/20 px-4 py-2.5 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 text-primary" />
            <span>
              Created By:{' '}
              <strong className="text-foreground font-bold">
                {caseData.createdByName || caseData.createdBy?.name || 'Staff Member'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserCheck className="w-4 h-4 text-sky-500" />
            <span>
              Assigned Staff:{' '}
              <strong className="text-foreground font-bold">
                {activeHandlerName || 'Unassigned'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              Registered Date:{' '}
              <strong className="text-foreground font-bold">
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
            <Clock className="w-4 h-4 text-primary" />
            <span>
              Last Updated:{' '}
              <strong className="text-foreground font-bold">
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
            {/* Client Particulars & Master Bio Dossier */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Client & Passport Particulars
                  </h3>
                </div>
                {clientDid && (
                  <button
                    onClick={() => navigate(`/admin/clients/${clientDid}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <span>View 360° Profile</span>
                    <ArrowUpRight className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. Client Full Name */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Client / Applicant Name</span>
                  <p className="font-bold text-foreground mt-0.5 truncate">{clientName}</p>
                </div>

                {/* 2. Client Code */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Client Code / ID</span>
                  <p className="font-mono font-bold text-primary mt-0.5">{clientCode}</p>
                </div>

                {/* 3. Primary Phone */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Phone</span>
                  <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <Phone className="size-3 text-primary shrink-0" />
                    <span>{clientPhone}</span>
                  </p>
                </div>

                {/* 4. Passport Number */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Passport Number</span>
                  <p className="font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5">{passportNo}</p>
                  {passportExpiry && (
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Exp: {passportExpiry}</span>
                  )}
                </div>

                {/* 5. National ID (NID) */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">National ID (NID)</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{nidNo}</p>
                </div>

                {/* 6. Email Address */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Email Address</span>
                  <p className="font-medium text-foreground mt-0.5 truncate">{clientEmail || '—'}</p>
                </div>

                {/* 7. Destination Country */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Destination Country</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.destinationCountry || caseData.caseType?.toUpperCase() || '—'}</p>
                </div>

                {/* 8. Trade / Skill */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Trade / Skill Category</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.tradeSkill || 'General Worker'}</p>
                </div>

                {/* 9. Case Number */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Case File Number</span>
                  <p className="font-mono font-bold text-primary mt-0.5">{caseData.caseNumber || '—'}</p>
                </div>

                {/* 10. Date of Birth & Gender */}
                {(birthDate || gender) && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Birth Date & Gender</span>
                    <p className="font-medium text-foreground mt-0.5">
                      {birthDate ? birthDate : '—'} • {gender}{bloodGroup ? ` (${bloodGroup})` : ''}
                    </p>
                  </div>
                )}

                {/* 11. Parents Info */}
                {(fatherName || motherName) && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Parents Information</span>
                    <p className="font-medium text-foreground mt-0.5 truncate">
                      {fatherName ? `F: ${fatherName}` : ''}{motherName ? ` • M: ${motherName}` : ''}
                    </p>
                  </div>
                )}

                {/* 12. Address */}
                {(presentAddress || permanentAddress || district) && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border sm:col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Address / Location</span>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span>
                        {presentAddress || permanentAddress || ''} {district ? `(${policeStation ? policeStation + ', ' : ''}${district})` : ''}
                      </span>
                    </p>
                  </div>
                )}

                {/* 13. Guardian Info */}
                {guardian?.name && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border sm:col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Guardian</span>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5 truncate">
                      <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{guardian.name}</strong> ({guardian.relationship || 'Guardian'}) {guardian.phone ? `• 📞 ${guardian.phone}` : ''}
                      </span>
                    </p>
                  </div>
                )}
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

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                      <span>
                        Assigned Staff:{' '}
                        <strong className="text-foreground">{t.assignedToName || t.assignedTo?.name || t.assignedToDid || 'Unassigned'}</strong>
                      </span>
                      {t.status === 'Done' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveTask(t.did || t._id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs"
                          >
                            Approve Step ✓
                          </button>
                          <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs"
                          >
                            + Assign Next Step
                          </button>
                        </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Verified Document Vault & Uploader Audit</h3>
                <p className="text-xs text-muted-foreground">
                  Verified repository of case scans and attachments with audit trail of staff uploaders.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDocModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-500" />
                  <span>+ Add New Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Upload New File</span>
                </button>
              </div>
            </div>

            {(caseData.vaultDocuments || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-3 border border-dashed border-border rounded-2xl">
                <FileText className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold text-foreground">No documents in this vault yet.</p>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Generate official documents in Document Studio with auto-filled client data or upload scanned attachments.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateDocModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Generate Official Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>+ Upload File Scan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {caseData.vaultDocuments.map((doc, idx) => {
                  const docKey = doc.did || doc._id || idx;
                  const isRenaming = renamingDocDid === docKey;
                  return (
                    <div
                      key={docKey}
                      className="bg-muted/20 border border-border p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameDocument(doc);
                                    if (e.key === 'Escape') { setRenamingDocDid(null); setRenameValue(''); }
                                  }}
                                  autoFocus
                                  className="flex-1 min-w-0 px-2 py-1 text-xs bg-background border border-primary rounded-lg focus:outline-none font-semibold text-foreground"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameDocument(doc)}
                                  disabled={savingRename}
                                  className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer shrink-0"
                                  title="Save rename"
                                >
                                  {savingRename ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setRenamingDocDid(null); setRenameValue(''); }}
                                  className="p-1 text-muted-foreground hover:bg-muted rounded cursor-pointer shrink-0"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 group">
                                <h5 className="font-bold text-xs text-foreground truncate">{doc.documentName || doc.name}</h5>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingDocDid(docKey);
                                    setRenameValue(doc.documentName || doc.name || '');
                                  }}
                                  className="p-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition cursor-pointer shrink-0"
                                  title="Rename document"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
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
                          By: <strong className="text-foreground">{doc.uploadedByName || 'Staff'}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(doc)}
                            className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-0.5"
                              title="Download file"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-0.5"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary" />
                Attach File to Document Vault
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  handleRemoveSelectedFile();
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">Document Category *</label>
                <select
                  value={uploadDocForm.documentName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
                <label className="block font-semibold text-muted-foreground mb-1.5">Document File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                />

                {!uploadDocForm.fileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground text-xs">
                      Click to choose file from device
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PDF, JPG, PNG, DOCX (Max: 10 MB)
                    </p>
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs truncate">
                          {uploadDocForm.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {uploadDocForm.fileSize || 'Selected'} • <span className="text-emerald-600 font-bold">Ready</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveSelectedFile}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove selected file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  handleRemoveSelectedFile();
                }}
                className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingDoc || (!uploadDocForm.file && !uploadDocForm.fileUrl)}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer hover:bg-primary/90 transition-all"
              >
                {uploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{uploadingDoc ? 'Uploading...' : 'Save to Vault'}</span>
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

      {/* MODAL: CREATE DOCUMENT STUDIO TEMPLATE SELECTOR */}
      {isCreateDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Create Official Case Document</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select a document template to generate. Client particulars will be automatically pre-filled and locked.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateDocModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Autofill Preview & Lock Notice */}
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" />
                    Auto-Filling From Case Dossier
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    🔒 Client Bio Locked
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                    <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Client Name</span>
                    <strong className="text-foreground truncate block">{clientName}</strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                    <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Phone</span>
                    <strong className="text-foreground truncate block">{clientPhone}</strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                    <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Passport</span>
                    <strong className="text-sky-600 truncate block font-mono">{passportNo}</strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                    <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Destination</span>
                    <strong className="text-foreground truncate block">{caseData?.destinationCountry || caseData?.caseType?.toUpperCase() || 'Overseas'}</strong>
                  </div>
                </div>
              </div>

              {/* Template Dropdown Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground">Select Document Template:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
                >
                  {DOCUMENT_STUDIO_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.title} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visual Template Cards Selection Grid */}
              <div className="space-y-1.5">
                <label className="block font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Available Studio Templates:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {DOCUMENT_STUDIO_TEMPLATES.map((tmpl) => {
                    const Icon = tmpl.icon;
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                            : 'bg-background hover:bg-muted/40 border-border'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-foreground truncate">{tmpl.title}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">{tmpl.badge}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tmpl.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setIsCreateDocModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCreateDocModalOpen(false);
                  const returnUrl = `/admin/cases/${caseData?.did || caseData?.caseNumber || id}?tab=documents`;
                  navigate(
                    `/admin/docs/${selectedTemplateId}?clientDid=${clientDid || ''}&caseDid=${caseData?.did || caseData?._id || id}&caseNumber=${encodeURIComponent(caseData?.caseNumber || '')}&returnUrl=${encodeURIComponent(returnUrl)}`
                  );
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
              >
                <span>Proceed to Document Studio</span>
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE VIEWER MODAL */}
      <FileViewerModal
        isOpen={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
