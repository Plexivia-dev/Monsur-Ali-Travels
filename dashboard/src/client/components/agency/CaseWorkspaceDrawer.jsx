import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Trash2,
  Lock,
  FilePlus2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { usePortalStore } from '../../store/usePortalStore';
import { FileViewerModal } from '@shared/components/common/FileViewerModal';

const PIPELINE_STAGES = [
  { id: 'ENTRY', title: 'New Entry' },
  { id: 'PROCESSING', title: 'Processing' },
  { id: 'APPROVED_OFFER_LETTER', title: 'Offer Letter Approved' },
  { id: 'SUBMITTED_EMBASSY_BSF', title: 'Embassy / VFS Submitted' },
  { id: 'COMPLETED_DELIVERED', title: 'Completed & Delivered' },
];

const ALL_STUDIO_GENERATORS = [
  {
    id: 'money-receipt',
    label: 'Money Receipt Voucher',
    category: 'Billing & Accounts',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'accountant', 'frontdesk', 'clientmanager'],
    description: 'Official client payment receipt voucher with dual-copy cut line.',
  },
  {
    id: 'cash-voucher',
    label: 'Cash Money Voucher',
    category: 'Billing & Accounts',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'accountant'],
    description: 'Internal cash expense and debit payment voucher.',
  },
  {
    id: 'invoice',
    label: 'Client Invoice',
    category: 'Billing & Accounts',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'accountant'],
    description: 'Itemized client billing statement and tax invoice.',
  },
  {
    id: 'payroll',
    label: 'Salary Slip',
    category: 'Billing & Accounts',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'accountant'],
    description: 'Monthly employee payroll payment voucher.',
  },
  {
    id: 'agreement',
    label: 'Employment Agreement',
    category: 'Contracts & Legal',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'lawyer', 'clientmanager'],
    description: 'Official overseas employment agreement contract with guarantor.',
  },
  {
    id: 'client-form',
    label: 'Client & Guardian Form',
    category: 'Client Forms',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'frontdesk', 'representative', 'clientmanager'],
    description: 'Complete client bio-data & guardian guarantor declaration form.',
  },
  {
    id: 'indian-visa',
    label: 'Indian Visa Submission Slip',
    category: 'Embassy & Visa',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'visa_processor', 'frontdesk'],
    description: 'IVAC / Indian visa application docket and appointment slip.',
  },
  {
    id: 'passport-sub',
    label: 'Passport Submission Slip',
    category: 'Embassy & Visa',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'visa_processor', 'frontdesk'],
    description: 'Official passport intake receipt slip with barcode.',
  },
  {
    id: 'experience-certificate',
    label: 'Experience Certificate',
    category: 'Certificates',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'lawyer', 'clientmanager'],
    description: 'Work experience & trade skill authentication certificate.',
  },
  {
    id: 'marriage-certificate',
    label: 'Marriage Certificate',
    category: 'Certificates',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'lawyer', 'clientmanager'],
    description: 'Official English translation & affidavit certificate of marriage.',
  },
  {
    id: 'character-certificate',
    label: 'Character Certificate',
    category: 'Certificates',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'lawyer', 'clientmanager'],
    description: 'Character testimonial and police verification certificate.',
  },
  {
    id: 'job-verification',
    label: 'Job Verification Form',
    category: 'Embassy & Visa',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'visa_processor', 'clientmanager'],
    description: 'Foreign employer and embassy job verification questionnaire.',
  },
  {
    id: 'idcard',
    label: 'Employee ID Card',
    category: 'Identity',
    roles: ['admin', 'owner', 'superadmin', 'manager', 'frontdesk'],
    description: 'Standard agency staff and worker identification card.',
  },
];

const getTaskStatusConfig = (status) => {
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
        dotClass: 'bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(148,165,233,0.5)]',
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

export function CaseWorkspaceDrawer({ caseId, isOpen, onClose, onRefresh }) {
  const navigate = useNavigate();
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const user = useAuthStore((state) => state.user);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'documents' | 'communication'

  // Internal message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Document Generator Modal state
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');

  // File Preview Modal state
  const [previewFile, setPreviewFile] = useState(null);

  // Document upload form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    documentName: 'Passport Scan Copy',
    fileName: '',
    fileUrl: '',
    fileSize: '',
    file: null,
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Task execution
  const [completingTaskId, setCompletingTaskId] = useState(null);

  // Filter permitted studio generators for currently logged-in staff role
  const userRole = String(user?.role || '').toLowerCase();
  const userSubRole = String(user?.subRole || user?.sub_role || user?.designation || '').toLowerCase();

  const permittedStudioGenerators = ALL_STUDIO_GENERATORS.filter((gen) => {
    if (['admin', 'owner', 'superadmin', 'manager'].includes(userRole)) return true;
    return gen.roles.includes(userRole) || gen.roles.includes(userSubRole);
  });

  const handleProceedToStudio = (generatorId) => {
    if (!generatorId || !caseData) return;
    setShowCreateDocModal(false);
    if (onClose) onClose();

    const currentPath = window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(currentPath);
    const clientDid = caseData.clientDid || caseData.clientId || '';
    const caseDid = caseData.did || caseData._id || '';
    const caseNumber = encodeURIComponent(caseData.caseNumber || '');
    const applicantName = encodeURIComponent(caseData.applicantName || '');
    const passportNumber = encodeURIComponent(caseData.passportNumber || '');
    const phone = encodeURIComponent(caseData.phone || '');
    const nidNumber = encodeURIComponent(caseData.nidNumber || '');

    switchPortal('docs', generatorId);
    navigate(
      `/dashboard/docs/${generatorId}?caseDid=${caseDid}&clientDid=${clientDid}&caseNumber=${caseNumber}&applicantName=${applicantName}&passportNumber=${passportNumber}&phone=${phone}&nidNumber=${nidNumber}&returnUrl=${returnUrl}`
    );
  };

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

        const clientId = caseData?.clientDid || caseData?.clientId || '';
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

      const res = await apiClient.post(`/api/v1/client/cases/${caseId}/documents`, {
        documentName: uploadDocForm.documentName,
        fileName: finalFileName || `${uploadDocForm.documentName}.pdf`,
        fileUrl: finalFileUrl,
        fileSize: finalFileSize || '1.2 MB',
        accessLevel: 'Restricted',
      });
      if (res.data?.success) {
        toast.success('Document uploaded and saved to case vault!');
        setShowUploadModal(false);
        setUploadDocForm({
          documentName: 'Passport Scan Copy',
          fileName: '',
          fileUrl: '',
          fileSize: '',
          file: null,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchCaseDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document.');
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
              <div className="text-base font-black text-foreground mt-0.5">BDT {Number(totalAgreed).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Paid Amount</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">BDT {Number(totalPaid).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
              <span className="text-[11px] font-bold uppercase text-rose-600">Due Balance</span>
              <div className="text-base font-black text-rose-600 mt-0.5">BDT {Number(totalDue).toLocaleString('en-IN')}</div>
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
            <span>Staff Tasks & Assignments</span>
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
            <span>Document Uploads & Scans</span>
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
            <span>Internal Notes & Team Chat</span>
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
                          BDT {Number(ledger.step1_advance || caseData.initialPaidAmount || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <span className="text-sky-600 text-[10px] uppercase font-bold">2. Offer Letter Approval</span>
                        <p className="text-sm font-black text-foreground mt-0.5">
                          BDT {Number(ledger.step2_offerApproval || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border">
                        <span className="text-purple-600 text-[10px] uppercase font-bold">3. Visa Delivery Final</span>
                        <p className="text-sm font-black text-foreground mt-0.5">
                          BDT {Number(ledger.step3_delivery || 0).toLocaleString('en-IN')}
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

              {/* TAB 2: STAFF TASKS */}
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

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                              <div className="text-muted-foreground">
                                <span>Assigned Staff: </span>
                                <strong className="text-foreground">{t.assignedToName || t.assignedTo?.name || t.assignedToDid || 'Staff Member'}</strong>
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
                                  <span>Mark as Completed</span>
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

              {/* TAB 3: DOCUMENTS VAULT */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Verified Document Vault</h3>
                      <p className="text-xs text-muted-foreground">See all uploaded files and generate case documents in Studio.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocId(permittedStudioGenerators[0]?.id || 'agreement');
                          setShowCreateDocModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <FilePlus2 className="size-3.5 text-sky-600 dark:text-sky-400" />
                        <span>+ Generate Document</span>
                      </button>

                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>+ Upload Document</span>
                      </button>
                    </div>
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
                      {caseData.vaultDocuments.map((doc, idx) => {
                        const isAdminOrManager = ['admin', 'owner', 'superadmin', 'manager'].includes(
                          String(user?.role || '').toLowerCase()
                        );
                        const isOwnUpload = Boolean(
                          (doc.uploadedByDid && (doc.uploadedByDid === user?.did || doc.uploadedByDid === user?.id || doc.uploadedByDid === user?._id)) ||
                          (doc.uploadedByName && user?.name && doc.uploadedByName.trim().toLowerCase() === user?.name.trim().toLowerCase()) ||
                          (doc.uploadedBy && user?.name && doc.uploadedBy.trim().toLowerCase() === user?.name.trim().toLowerCase())
                        );
                        const canViewDoc = isAdminOrManager || isOwnUpload;

                        return (
                          <div
                            key={doc.did || doc._id || idx}
                            className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                              canViewDoc
                                ? 'border-border bg-card shadow-xs'
                                : 'border-border/60 bg-muted/20 opacity-90'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`size-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                                    canViewDoc ? 'bg-sky-500/10 text-sky-600' : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {canViewDoc ? (
                                    <FileText className="size-4" />
                                  ) : (
                                    <Lock className="size-4 text-amber-600 dark:text-amber-400" />
                                  )}
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

                              {canViewDoc ? (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                    isOwnUpload
                                      ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  }`}
                                >
                                  {isOwnUpload ? 'My Upload ✓' : 'Verified'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                  <Lock className="size-2.5" />
                                  Restricted
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border text-muted-foreground">
                              <span>
                                Uploaded by: <strong className="text-foreground">{doc.uploadedByName || 'Staff Member'}</strong>
                              </span>

                              {canViewDoc ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile(doc)}
                                    className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="size-3" />
                                    <span>View</span>
                                  </button>
                                  {doc.fileUrl && (
                                    <a
                                      href={doc.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground hover:text-foreground font-bold flex items-center gap-0.5"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink className="size-3" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span
                                  className="text-[10px] text-muted-foreground/70 italic font-medium flex items-center gap-1 select-none"
                                  title="Access Restricted: You can only view documents uploaded by yourself."
                                >
                                  <Lock className="size-3 text-amber-600/70 shrink-0" />
                                  <span>Uploader Only</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INTERNAL TEAM CHAT & NOTES */}
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
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="size-4 text-primary" />
                Upload Document to Case Vault
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  handleRemoveSelectedFile();
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">Document Category / Name *</label>
                <select
                  value={uploadDocForm.documentName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Passport Scan Copy">Passport Scan Copy</option>
                  <option value="Photo 2x2">Photo 2x2 White BG</option>
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
                  setShowUploadModal(false);
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
                {uploadingDoc ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                <span>{uploadingDoc ? 'Uploading...' : 'Save to Vault'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generate Case Document Modal */}
      {showCreateDocModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FilePlus2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Generate Case Document in Studio</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select a document to generate for <strong>{caseData?.applicantName}</strong> ({caseData?.caseNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateDocModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">
                  Select Document Template *
                </label>
                <select
                  value={selectedDocId || permittedStudioGenerators[0]?.id}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl text-foreground font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {permittedStudioGenerators.map((gen) => (
                    <option key={gen.id} value={gen.id}>
                      {gen.label} — ({gen.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Document Info Card */}
              {(() => {
                const activeDoc =
                  permittedStudioGenerators.find((g) => g.id === (selectedDocId || permittedStudioGenerators[0]?.id)) ||
                  permittedStudioGenerators[0];
                if (!activeDoc) return null;
                return (
                  <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{activeDoc.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {activeDoc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{activeDoc.description}</p>
                  </div>
                );
              })()}

              {/* Autofill Audit Notice */}
              <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Client particulars (<strong className="text-foreground">{caseData?.applicantName}</strong>, Passport:{' '}
                  <strong className="text-foreground font-mono">{caseData?.passportNumber || 'N/A'}</strong>, Phone:{' '}
                  <strong className="text-foreground">{caseData?.phone || 'N/A'}</strong>) will be <strong>auto-filled and locked</strong>.
                  After saving in Document Studio, you will automatically return to this Case File.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setShowCreateDocModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProceedToStudio(selectedDocId || permittedStudioGenerators[0]?.id)}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Open in Document Studio</span>
                <ChevronRight className="size-3.5" />
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

export default CaseWorkspaceDrawer;
