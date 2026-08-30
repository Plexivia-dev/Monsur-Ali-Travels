import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Phone,
  Mail,
  FileCheck,
  MapPin,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Loader2,
  DollarSign,
  Send,
  Download,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { CaseDetailDrawer } from '@/components/workflow/CaseDetailDrawer';

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

// Renders a slide-over 360-degree drawer view of a client's profile, workflow history, documents, and payments
const ClientProfileDrawer = ({ clientDid, isOpen, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'workflow' | 'payments' | 'documents'
  const [selectedCaseDidForDetail, setSelectedCaseDidForDetail] = useState(null);

  // Fetches full 360-degree profile data for the active client
  const fetchClientProfile = useCallback(async () => {
    if (!clientDid) return;
    setLoading(true);
    try {
      // 1. Fetch client base details
      let clientRes;
      try {
        clientRes = await apiClient.get(`/api/v1/client/clients/${clientDid}`);
      } catch {
        clientRes = await apiClient.get(`/api/v1/admin/clients/${clientDid}`);
      }
      const clientData = clientRes.data?.data || clientRes.data?.client || null;
      setClient(clientData);

      // 2. Fetch linked case files
      try {
        const casesRes = await apiClient.get(`/api/v1/client/cases?clientDid=${clientDid}&limit=50`);
        setCases(casesRes.data?.data || casesRes.data?.cases || []);
      } catch (cErr) {
        setCases([]);
      }

      // 3. Fetch linked receipts / payments
      try {
        const receiptsRes = await apiClient.get(`/api/v1/client/receipts?clientDid=${clientDid}&limit=50`);
        setReceipts(receiptsRes.data?.data || []);
      } catch (rErr) {
        setReceipts([]);
      }
    } catch (err) {
      console.error('Failed to load client 360 profile:', err);
      toast.error('Failed to load client details.');
    } finally {
      setLoading(false);
    }
  }, [clientDid]);

  useEffect(() => {
    if (isOpen && clientDid) {
      fetchClientProfile();
    }
  }, [isOpen, clientDid, fetchClientProfile]);

  if (!isOpen) return null;

  // Formats currency numbers into standard BDT representation
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Formats ISO date string into readable local representation
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPackageCost = cases.reduce((acc, c) => acc + (c.packageCost || c.totalAmount || 0), 0);
  const totalPaid = receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalDue = Math.max(0, totalPackageCost - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-background w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-border">
        {/* Header Profile Bar */}
        <div className="p-6 border-b border-border bg-muted/30 flex items-start justify-between gap-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Loading client profile...</span>
            </div>
          ) : client ? (
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                {client.fullName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    {client.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {client.clientType || 'Individual'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    client.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                  }`}>
                    {client.status || 'Active'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5 text-primary" />
                    {client.phone}
                  </span>
                  {client.passportNumber && (
                    <span className="flex items-center gap-1 font-mono">
                      <FileText className="size-3.5 text-sky-500" />
                      Passport: {client.passportNumber}
                    </span>
                  )}
                  <span className="font-mono text-muted-foreground">
                    DID: {client.did?.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-rose-500">Client profile not found.</div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 3 KPI Stats Mini Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/10 border-b border-border text-center">
          <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Invoiced</span>
            <div className="text-base font-black text-foreground mt-0.5">{formatCurrency(totalPackageCost)}</div>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
            <span className="text-[11px] font-bold uppercase text-emerald-600">Total Paid</span>
            <div className="text-base font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border shadow-xs">
            <span className="text-[11px] font-bold uppercase text-rose-600">Due Balance</span>
            <div className="text-base font-black text-rose-600 mt-0.5">{formatCurrency(totalDue)}</div>
          </div>
        </div>

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
            <span>Cases & Overview</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {cases.length}
            </span>
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
            <span>Workflow Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="size-4" />
            <span>Payments & Ledger</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
              {receipts.length}
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
            <span>Documents Vault</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* TAB 1: OVERVIEW & CASE FILES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Details Card */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contact & Identification
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-semibold text-foreground">{client?.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Passport No:</span>
                    <p className="font-mono font-bold text-foreground">{client?.passportNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NID Number:</span>
                    <p className="font-mono font-bold text-foreground">{client?.nidNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registered Date:</span>
                    <p className="font-semibold text-foreground">{formatDate(client?.createdAt)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Present Address:</span>
                    <p className="font-semibold text-foreground">{client?.presentAddress || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Case Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FolderOpen className="size-4 text-primary" />
                    <span>Client Case Files</span>
                  </h3>
                </div>

                {cases.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                    <p className="text-xs">No active case files opened for this client yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cases.map((c) => (
                      <div
                        key={c.did || c._id}
                        onClick={() => {
                          onClose();
                          navigate(`/admin/cases/${c.did || c._id}`);
                        }}
                        className="p-4 rounded-xl border border-border bg-background shadow-xs hover:border-primary/60 hover:shadow-sm transition-all space-y-3 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-primary">
                              {c.caseNumber || c.fileNumber || 'CASE-001'}
                            </span>
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                              {c.destinationCountry} — {c.caseType?.replace('_', ' ')}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                              {c.workflowStatus || c.status || 'Received'}
                            </span>
                            <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                              Open <ArrowUpRight className="size-3.5" />
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-border/60">
                          <div>
                            <span className="text-muted-foreground">Package Fee:</span>
                            <p className="font-bold text-foreground">{formatCurrency(c.packageCost)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Initial Advance:</span>
                            <p className="font-bold text-emerald-600">{formatCurrency(c.initialPaidAmount || 0)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p className="font-medium text-foreground">{formatDate(c.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW TIMELINE */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span>Workflow Processing Steps</span>
              </h3>

              {cases.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                  <p className="text-xs">No workflow tasks assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cases.map((c) => {
                    const tasks = c.workflowTasks || [];
                    return (
                      <div key={c.did || c._id} className="space-y-3">
                        <div
                          onClick={() => setSelectedCaseDidForDetail(c.did || c._id)}
                          className="flex items-center justify-between bg-muted/40 hover:bg-muted/70 px-3.5 py-2 rounded-xl border border-border cursor-pointer transition-colors"
                        >
                          <span className="text-xs font-bold font-mono text-primary">{c.caseNumber}</span>
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                            {c.destinationCountry} <ArrowUpRight className="size-3 text-primary" />
                          </span>
                        </div>

                        {tasks.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground italic">
                            Default initial stage: Passport & Documents In-take.
                          </div>
                        ) : (
                          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                            {tasks.map((task, idx) => {
                              const isApproved = task.status === 'Approved';
                              const isDone = task.status === 'Done';
                              return (
                                <div key={task.did || idx} className="relative flex items-start gap-3">
                                  <div className={`absolute -left-6 size-4 rounded-full border-2 bg-background flex items-center justify-center ${
                                    isApproved ? 'border-emerald-500 text-emerald-500' : isDone ? 'border-blue-500' : 'border-slate-400'
                                  }`}>
                                    <div className={`size-1.5 rounded-full ${
                                      isApproved ? 'bg-emerald-500' : isDone ? 'bg-blue-500' : 'bg-slate-400'
                                    }`} />
                                  </div>
                                  <div className="p-3 rounded-xl bg-background border border-border w-full space-y-1 shadow-xs">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-foreground">{task.title}</h5>
                                      {(() => {
                                        const statusCfg = getTaskStatusConfig(task.status);
                                        return (
                                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                                            {statusCfg.label}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{task.description || 'Workflow operation in progress.'}</p>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-3 pt-1">
                                      <span>Assigned: <strong>{task.assignedToName || task.assignedTo?.name || task.assignedToDid || 'Staff Member'}</strong></span>
                                      <span>Updated: {formatDate(task.updatedAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS & RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Client Money Receipts & Ledger</span>
              </h3>

              {receipts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                  <p className="text-xs">No money receipts found for this client.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Receipt No</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Service / Purpose</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3 text-right">Amount (BDT )</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {receipts.map((r) => (
                        <tr key={r.did || r._id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">
                            {r.receiptNo || r.receiptNumber || 'MR-001'}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {formatDate(r.paymentDate || r.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {r.serviceType || r.purpose || 'Visa Processing Advance'}
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[11px] font-semibold">
                            {r.paymentMethod || 'CASH'}
                          </td>
                          <td className="py-2.5 px-3 font-black text-right text-emerald-600">
                            {formatCurrency(r.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              {r.status || 'Confirmed'}
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

          {/* TAB 4: DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Uploaded Documents</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck className="size-4 text-sky-500" />
                      Passport Scan Copy
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Number: {client?.passportNumber || 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="size-4 text-purple-500" />
                      National ID / NID
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                      {client?.nidNumber ? 'Uploaded' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    NID: {client?.nidNumber || 'Not submitted'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Case Detail & Dossier Drawer */}
      <CaseDetailDrawer
        caseDid={selectedCaseDidForDetail}
        isOpen={Boolean(selectedCaseDidForDetail)}
        onClose={() => setSelectedCaseDidForDetail(null)}
        onRefresh={() => {
          fetchClientProfile();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default ClientProfileDrawer;
