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
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuthStore';
import { StepAssignModal } from '@/components/workflow/StepAssignModal';
import { AddPaymentModal } from '@/components/workflow/AddPaymentModal';

const PIPELINE_STAGES = [
  { id: 'ENTRY', title: '1. New Entry (ফাইল এন্ট্রি)', color: 'bg-slate-100 text-slate-800' },
  { id: 'PROCESSING', title: '2. Processing (ডকুমেন্ট প্রসেসিং)', color: 'bg-blue-100 text-blue-800' },
  { id: 'APPROVED_OFFER_LETTER', title: '3. Offer Approved (অফার লেটার)', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'SUBMITTED_EMBASSY_BSF', title: '4. Embassy/VFS Submitted (সাবমিটেড)', color: 'bg-amber-100 text-amber-800' },
  { id: 'COMPLETED_DELIVERED', title: '5. Completed & Delivered (ডেলিভার্ড)', color: 'bg-emerald-100 text-emerald-800' },
];

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
  const [uploadDocForm, setUploadDocForm] = useState({
    documentName: 'Passport Scan Copy',
    fileName: '',
    fileUrl: '',
    fileSize: '1.5 MB',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Internal Message
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchCaseDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/admin/cases/${id}/full-details`);
      if (res.data?.status === 'success' && res.data.data) {
        setCaseData(res.data.data);
      } else {
        // Fallback to client endpoint
        const altRes = await apiClient.get(`/api/v1/client/cases/${id}`);
        if (altRes.data?.data) {
          setCaseData(altRes.data.data);
        }
      }
    } catch (err) {
      toast.error('Failed to load case file details.');
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

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadDocForm.documentName || !uploadDocForm.fileUrl) {
      toast.error('Document title and file URL are required.');
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
      if (res.data?.success) {
        toast.success('Document uploaded to case vault!');
        setIsUploadModalOpen(false);
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
      title: `Money Receipt Issued: ৳${Number(r.amount || 0).toLocaleString('en-IN')}`,
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
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cases')}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cases</span>
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              {caseData.caseNumber || 'CASE-FILE'}
            </span>
            <h1 className="text-lg font-black text-foreground tracking-tight">
              {caseData.applicantName || caseData.clientInfo?.fullName || 'Applicant File'}
            </h1>
          </div>
        </div>

        {/* Top Header Direct Action CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchCaseDetails}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>পেমেন্ট গ্রহণ / রিসিট</span>
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>টাস্ক স্টেপ অ্যাসাইন</span>
          </button>
        </div>
      </div>

      {/* Case Identity & Creator Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-black text-foreground">
                {caseData.applicantName || caseData.clientInfo?.fullName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Destination: {caseData.destinationCountry || caseData.caseType?.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Trade: {caseData.tradeSkill || 'General Worker'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                {caseData.phone || caseData.clientInfo?.phone || '—'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-sky-600 font-semibold">
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
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">বর্তমান স্টেজ (Stage)</span>
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
              ফাইল ক্রিয়েটর (Created by):{' '}
              <strong className="text-foreground font-bold">
                {caseData.createdByName || caseData.createdBy?.name || 'Staff Member'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              রেজিস্ট্রেশন তারিখ:{' '}
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
              সর্বশেষ আপডেট:{' '}
              <strong className="text-foreground font-bold">
                {new Date(caseData.updatedAt || Date.now()).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Financial & Pipeline Snapshot Cards (No "লেজার" jargon!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-muted-foreground">চুক্তিকৃত মোট প্যাকেজ</span>
          <div className="text-xl font-black text-foreground">৳{Number(totalAgreed).toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-muted-foreground">Total agreed client contract</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-600">মোট সংগৃহীত পেমেন্ট</span>
            <span className="text-[11px] font-bold text-emerald-600">{paidPercent}%</span>
          </div>
          <div className="text-xl font-black text-emerald-600">৳{Number(totalPaid).toLocaleString('en-IN')}</div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPercent}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-rose-600">কোম্পানির মোট বকেয়া পাওনা</span>
          <div className="text-xl font-black text-rose-600">৳{Number(totalDue).toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-rose-500 font-medium">Pending collection balance</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-primary">অপারেশনাল টাস্ক অগ্রগতি</span>
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
          { id: 'overview', label: 'ফাইল ও ক্লায়েন্ট বিবরণী (Overview)', icon: FolderOpen },
          { id: 'activity', label: 'সম্পূর্ণ অ্যাক্টিভিটি হিস্ট্রি ও লগ (Activity Log)', icon: History, count: activityTimeline.length },
          { id: 'tasks', label: 'ওয়ার্কফ্লো ও স্টাফ টাস্ক (Tasks)', icon: Layers, count: (caseData.workflowTasks || []).length },
          { id: 'payments', label: 'পেমেন্ট ও মানি রিসিট স্টেটমেন্ট (Payments)', icon: CreditCard, count: (caseData.financialReceipts || []).length },
          { id: 'documents', label: 'ডকুমেন্ট ভল্ট ও আপলোডকারী অডিট (Docs)', icon: FileText, count: (caseData.vaultDocuments || []).length },
          { id: 'communication', label: 'টিম কোলাবোরেশন ও মেসেজ (Chat & Notes)', icon: MessageSquare, count: (caseData.internalMessages || []).length },
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
                ক্লায়েন্ট ও পাসপোর্ট পরিচিতি
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">আবেদনকারীর পুরো নাম</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.applicantName || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">মোবাইল নম্বর</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.phone || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">পাসপোর্ট নম্বর</span>
                  <p className="font-mono font-bold text-sky-600 mt-0.5">{caseData.passportNumber || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">এনআইডি নম্বর (NID)</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{caseData.nidNumber || caseData.clientInfo?.nidNumber || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">গন্তব্য দেশ</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.destinationCountry || caseData.caseType?.toUpperCase()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[10px]">কাজের ধরন (Skill)</span>
                  <p className="font-bold text-foreground mt-0.5">{caseData.tradeSkill || 'General Worker'}</p>
                </div>
              </div>
            </div>

            {/* 3-Stage Milestone Payment Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                ৩-ধাপের পেমেন্ট সময়সূচী ও অবস্থা
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">১. ফাইল এন্ট্রি ও সাবমিশন অ্যাডভান্স</span>
                    <span className="text-[11px] text-muted-foreground">Initial file processing intake</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      ৳{Number(ledger.step1_advance || caseData.initialPaidAmount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">পরিশোধিত ✓</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">২. অফার লেটার / পারমিট অ্যাপ্রুভাল পেমেন্ট</span>
                    <span className="text-[11px] text-muted-foreground">Due upon official work permit approval</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      ৳{Number(ledger.step2_offerApproval || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">অ্যাপ্রুভালে প্রদেয়</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">৩. ভিসা ও পাসপোর্ট ডেলিভারি ফাইনাল পেমেন্ট</span>
                    <span className="text-[11px] text-muted-foreground">Final settlement before flight delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground block">
                      ৳{Number(ledger.step3_delivery || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600">ডেলিভারির সময়</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Document Intake Checklist */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-600" />
                ফিজিক্যাল ডকুমেন্ট চেকলিস্ট (Physical Document Intake)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { key: 'photo2x2', label: 'ছবি ২x২ সাইজ (সাদা ব্যাকগ্রাউন্ড)' },
                  { key: 'electricityBill', label: 'কারেন্ট / বিদ্যুৎ বিলের কপি' },
                  { key: 'nidCopy', label: 'জাতীয় পরিচয়পত্র (NID) কপি' },
                  { key: 'landDocuments', label: 'জমির দলিল / সম্পদ প্রমাণপত্র' },
                  { key: 'followUpCallRequired', label: 'পেন্ডিং পেপারের ফলো-আপ রিমাইন্ডার' },
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
                        {isChecked ? 'জমা পাওয়া গেছে ✓' : 'পেন্ডিং'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPREHENSIVE ACTIVITY & AUDIT TIMELINE (কে কী করেছে) */}
        {activeTab === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">সম্পূর্ণ অ্যাক্টিভিটি হিস্ট্রি ও অডিট ট্রেইল</h3>
                <p className="text-xs text-muted-foreground">
                  কে কখন এই ফাইলে কি কাজ করেছে, স্ট্যাটাস পরিবর্তন করেছে, পেমেন্ট নিয়েছে বা ফাইল আপলোড করেছে।
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
                          <span>সম্পাদনকারী:</span>
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
                <h3 className="text-base font-bold text-foreground">ওয়ার্কফ্লো স্টেপ ও অপারেশনাল টাস্ক</h3>
                <p className="text-xs text-muted-foreground">
                  কোন স্টাফ মেম্বারকে কোন স্টেপ অ্যাসাইন করা হয়েছে এবং বর্তমান অগ্রগতি।
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন স্টেপ অ্যাসাইন করুন</span>
              </button>
            </div>

            {(caseData.workflowTasks || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <Layers className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">এখনো কোনো ওয়ার্কফ্লো টাস্ক অ্যাসাইন করা হয়নি।</p>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  + প্রথম টাস্ক স্টেপ তৈরি করুন
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
                        অ্যাসাইন করা স্টাফ:{' '}
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
                <h3 className="text-base font-bold text-foreground">পেমেন্ট স্টেটমেন্ট ও মানি রিসিট তালিকা</h3>
                <p className="text-xs text-muted-foreground">
                  এই কেস ফাইলের সকল ইস্যুকৃত মানি রিসিট ও পেমেন্ট রেকর্ড।
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন মানি রিসিট ইস্যু করুন</span>
              </button>
            </div>

            {(caseData.financialReceipts || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <Receipt className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">এখনো কোনো মানি রিসিট ইস্যু করা হয়নি।</p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  + মানি রিসিট তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">রিসিট নং</th>
                      <th className="px-4 py-3 font-semibold">তারিখ</th>
                      <th className="px-4 py-3 font-semibold">পেমেন্ট মেথড</th>
                      <th className="px-4 py-3 font-semibold">টাকার পরিমাণ</th>
                      <th className="px-4 py-3 font-semibold">ইস্যুকারী স্টাফ</th>
                      <th className="px-4 py-3 font-semibold text-right">অ্যাকশন</th>
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
                          ৳{Number(r.amount || 0).toLocaleString('en-IN')}
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
                <h3 className="text-base font-bold text-foreground">ভেরিফাইড ডকুমেন্ট ভল্ট ও আপলোডকারী অডিট</h3>
                <p className="text-xs text-muted-foreground">
                  কে কোন ফাইল আপলোড করেছে তা আপলোডকারীর নাম ও তারিখসহ সংরক্ষিত।
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ নতুন ফাইল আপলোড</span>
              </button>
            </div>

            {(caseData.vaultDocuments || []).length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                <FileText className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-semibold">ভল্টে এখনো কোনো ডকুমেন্ট আপলোড করা হয়নি।</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  + প্রথম ডকুমেন্ট আপলোড করুন
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
                        আপলোডকারী: <strong className="text-foreground">{doc.uploadedByName || 'Staff Member'}</strong>
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
              <h3 className="text-base font-bold text-foreground">টিম কোলাবোরেশন ও ইন-ফাইল মেসেজ</h3>
              <p className="text-xs text-muted-foreground">
                এই কেস ফাইল নিয়ে স্টাফ ও ম্যানেজমেন্টের সরাসরি মেসেজ ও কাজের নোট।
              </p>
            </div>

            {/* Messages Feed */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(caseData.internalMessages || []).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-2 border border-dashed border-border rounded-2xl">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                  <p className="font-semibold">এখনো কোনো ইন-ফাইল মেসেজ বা নোট দেওয়া হয়নি।</p>
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
                placeholder="এই ফাইলের জন্য কাজের নোট বা মেসেজ লিখুন..."
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
      <StepAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        caseDid={caseData.did || caseData._id}
        onSuccess={fetchCaseDetails}
      />

      {/* Payment Receive Modal */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        caseDid={caseData.did || caseData._id}
        caseNumber={caseData.caseNumber}
        applicantName={caseData.applicantName}
        dueAmount={totalDue}
        onSuccess={fetchCaseDetails}
      />

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
                ডকুমেন্ট ভল্টে ফাইল যুক্ত করুন
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
                <label className="block font-semibold text-muted-foreground mb-1">ডকুমেন্টের ধরন *</label>
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
                <label className="block font-semibold text-muted-foreground mb-1">ফাইলের নাম / লেবেল</label>
                <input
                  type="text"
                  placeholder="e.g. passport_scan_chanda.pdf"
                  value={uploadDocForm.fileName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, fileName: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">ফাইলের লিঙ্ক / ক্লাউড স্টোরেজ URL *</label>
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
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingDoc}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {uploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>Save to Vault</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
