import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  RefreshCw,
  Edit3,
  Plus,
  Trash2,
  UserCheck,
  Shield,
  Briefcase,
  Share2,
  Eye,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';

const getTaskStatusConfig = (status) => {
  const normStatus = (status || '').trim().toLowerCase();

  if (normStatus === 'approved' || normStatus === 'completed' || normStatus === 'complete') {
    return {
      label: 'Approved ✓',
      badgeClass: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/40 shadow-xs shadow-emerald-500/10 font-bold',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    };
  }
  if (normStatus === 'done' || normStatus === 'submitted') {
    return {
      label: 'Done',
      badgeClass: 'bg-blue-500/15 text-blue-800 border-blue-500/40 shadow-xs shadow-blue-500/10 font-bold',
      dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    };
  }
  if (normStatus === 'in progress' || normStatus === 'processing' || normStatus === 'in_progress') {
    return {
      label: 'In Progress',
      badgeClass: 'bg-sky-500/15 text-sky-800 border-sky-500/40 shadow-xs shadow-sky-500/10 font-bold',
      dotClass: 'bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]',
    };
  }
  if (normStatus === 'rejected' || normStatus === 'cancelled' || normStatus === 'failed') {
    return {
      label: 'Rejected ✗',
      badgeClass: 'bg-rose-500/15 text-rose-800 border-rose-500/40 shadow-xs shadow-rose-500/10 font-bold',
      dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    };
  }

  // Default / Pending - Vibrant Amber Gold
  return {
    label: 'Pending',
    badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-500/40 shadow-xs shadow-amber-500/10 font-bold',
    dotClass: 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  };
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cases' | 'workflow' | 'payments' | 'documents'

  // Fetches full 360-degree profile data for the active client
  const fetchClientProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch client base details
      let clientRes;
      try {
        clientRes = await apiClient.get(`/api/v1/client/clients/${id}`);
      } catch {
        clientRes = await apiClient.get(`/api/v1/admin/clients/${id}`);
      }
      const clientData = clientRes.data?.data || clientRes.data?.client || clientRes.data;
      setClient(clientData);

      const clientDid = clientData?.did || id;

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
  }, [id]);

  useEffect(() => {
    fetchClientProfile();
  }, [fetchClientProfile]);

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
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPackageCost = cases.reduce((acc, c) => acc + (c.packageCost || c.totalAmount || 0), 0);
  const totalPaid = receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalDue = Math.max(0, totalPackageCost - totalPaid);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm font-semibold">Loading 360° Client Profile...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-fit mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Client Profile Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested client record does not exist or may have been removed.
        </p>
        <Button onClick={() => navigate('/admin/clients')} variant="outline" size="sm" className="cursor-pointer">
          <ArrowLeft className="size-4 mr-1.5" /> Back to Client Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Main Profile Header Banner */}
      <HeaderTitle
        variant="general"
        icon={User}
        title={client.fullName || 'Unnamed Client'}
        badge={client.clientType || 'Individual'}
        subtitle={`Client Code: ${client.clientCode || 'MAT-CLNT'} • Registered: ${formatDate(client.createdAt)} • DID: ${client.did || id}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                (client.status || 'Active') === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-black/[0.04] text-black/70 border-black/15'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              {client.status || 'Active'}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchClientProfile}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Invoiced Packages
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {formatCurrency(totalPackageCost)}
              </div>
              <span className="text-[11px] text-muted-foreground">{cases.length} Total Case Files</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <FolderOpen className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Total Amount Paid
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {formatCurrency(totalPaid)}
              </div>
              <span className="text-[11px] text-muted-foreground">{receipts.length} Payment Receipts</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <CreditCard className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Outstanding Balance
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {formatCurrency(totalDue)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {totalDue > 0 ? 'Pending Collection' : 'Fully Settled'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <DollarSign className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border bg-background overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="size-4" />
          <span>Bio & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cases'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FolderOpen className="size-4" />
          <span>Case Files</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-bold">
            {cases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="size-4" />
          <span>Documents Vault</span>
        </button>
      </div>

      {/* Tab 1: Bio & Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Bio Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <User className="size-4" />
                  <span>Personal & Identification Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Full Name</span>
                    <span className="font-bold text-foreground text-sm mt-0.5 block">{client.fullName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                    <span className="font-bold text-foreground text-sm mt-0.5 flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      {client.phone}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Email Address</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{client.email || '—'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Passport Number</span>
                    <span className="font-mono font-bold text-primary text-sm mt-0.5 block">
                      {client.passportNumber || '—'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">National ID (NID)</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">
                      {client.nidNumber || '—'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Client Type / Classification</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {client.clientType || 'Individual'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Present Address</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {client.presentAddress || '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian & Family Information */}
            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Guardian & Emergency Relations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Guardian Full Name</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {client.guardian?.name || '—'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Relationship</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {client.guardian?.relationship || '—'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Guardian Phone</span>
                    <span className="font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      {client.guardian?.phone || '—'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block text-[11px]">Guardian NID</span>
                    <span className="font-mono font-semibold text-foreground mt-0.5 block">
                      {client.guardian?.nidNumber || '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Side Panel */}
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Case Files Quick Status
                </h3>

                {cases.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                    No active case files yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cases.map((c) => (
                      <div
                        key={c.did || c._id}
                        onClick={() => navigate(`/admin/cases/${c.did || c._id}`)}
                        className="p-3.5 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group bg-muted/20"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-primary">
                            {c.caseNumber || c.fileNumber || 'CASE'}
                          </span>
                          <span className="text-[11px] font-bold text-primary flex items-center gap-0.5 group-hover:underline">
                            View <ArrowUpRight className="size-3" />
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-1">
                          {c.destinationCountry} — {c.caseType?.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">
                          <span>Status: {c.workflowStatus || c.status || 'Active'}</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(c.packageCost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Case Files */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="size-4 text-primary" />
              <span>Registered Case Files ({cases.length})</span>
            </h3>
          </div>

          {cases.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
              <FolderOpen className="size-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs font-semibold">No case files found for this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div
                  key={c.did || c._id}
                  onClick={() => navigate(`/admin/cases/${c.did || c._id}`)}
                  className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/60 hover:shadow-md transition-all space-y-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary">
                        {c.caseNumber || c.fileNumber || 'CASE-001'}
                      </span>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                        {c.destinationCountry} — {c.caseType?.replace(/_/g, ' ')}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {c.workflowStatus || c.status || 'In Progress'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-border/60">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Package Fee</span>
                      <p className="font-bold text-foreground mt-0.5">{formatCurrency(c.packageCost)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Advance Paid</span>
                      <p className="font-bold text-emerald-600 mt-0.5">{formatCurrency(c.initialPaidAmount || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Opened Date</span>
                      <p className="font-medium text-foreground mt-0.5">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Workflow Timeline */}
      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <span>Workflow Progression Timeline</span>
          </h3>

          {cases.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="text-xs">No active workflow tasks assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cases.map((c) => {
                const tasks = c.workflowTasks || [];
                return (
                  <div key={c.did || c._id} className="space-y-3 p-5 rounded-2xl border border-border bg-card">
                    <div
                      onClick={() => navigate(`/admin/cases/${c.did || c._id}`)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-primary">{c.caseNumber}</span>
                        <span className="text-xs font-bold text-foreground">{c.destinationCountry}</span>
                      </div>
                      <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                        Open File <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-xl">
                        Initial stage active: Documentation & Embassy Processing.
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                        {tasks.map((task, idx) => {
                          const isApproved = task.status === 'Approved';
                          const isDone = task.status === 'Done';
                          return (
                            <div key={task.did || idx} className="relative flex items-start gap-3">
                              <div
                                className={`absolute -left-6 size-4 rounded-full border-2 bg-background flex items-center justify-center ${
                                  isApproved
                                    ? 'border-emerald-500 text-emerald-500'
                                    : isDone
                                    ? 'border-blue-500'
                                    : 'border-black/30'
                                }`}
                              >
                                <div
                                  className={`size-1.5 rounded-full ${
                                    isApproved ? 'bg-emerald-500' : isDone ? 'bg-blue-500' : 'bg-black/40'
                                  }`}
                                />
                              </div>
                              <div className="p-3.5 rounded-xl bg-muted/30 border border-border w-full space-y-1">
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
                                <p className="text-[11px] text-muted-foreground">
                                  {task.description || 'Workflow operation in progress.'}
                                </p>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-3 pt-1">
                                  <span>
                                    Assigned: <strong>{task.assignedToName || task.assignedTo?.name || task.assignedToDid || 'Staff'}</strong>
                                  </span>
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

      {/* Tab 4: Payments & Ledger */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <span>Client Money Receipts & Ledger ({receipts.length})</span>
          </h3>

          {receipts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="text-xs font-semibold">No money receipts recorded for this client yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] border-b border-border font-bold">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Service / Purpose</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount (BDT)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receipts.map((r) => (
                    <tr key={r.did || r._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {r.receiptNo || r.receiptNumber || 'MR-001'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">
                        {formatDate(r.paymentDate || r.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {r.serviceType || r.purpose || 'Visa Processing Advance'}
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px] font-semibold text-muted-foreground">
                        {r.paymentMethod || 'CASH'}
                      </td>
                      <td className="py-3 px-4 font-black text-right text-emerald-600">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
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

      {/* Tab 5: Documents Vault (Unified 360° Dossier Explorer) */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Client 360° Unified Document Dossier</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Central archive of all uploaded scans, legal contracts, guardian affidavits, and official visa files.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const clientDid = client?.did || id;
                navigate(`/admin/docs/client-form?clientDid=${clientDid}&returnUrl=${encodeURIComponent(`/admin/clients/${id}?tab=documents`)}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Generate Studio Document</span>
            </button>
          </div>

          {/* Unified Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 1. Passport Scan Record */}
            <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="size-4 text-sky-500" />
                  Passport Scan Copy
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${client.attachments?.passportScan || client.passportNumber ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                  {client.attachments?.passportScan || client.passportNumber ? 'Active' : 'Pending'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Number: <strong className="text-foreground">{client.passportNumber || 'N/A'}</strong>
              </p>
              {client.attachments?.passportScan && (
                <a
                  href={client.attachments.passportScan}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  <span>View Passport Scan</span>
                </a>
              )}
            </div>

            {/* 2. National ID (NID) Scan Record */}
            <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-purple-500" />
                  National ID (NID)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    client.nidNumber
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {client.nidNumber ? 'Verified' : 'Not submitted'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                NID: <strong className="text-foreground">{client.nidNumber || 'N/A'}</strong>
              </p>
              {client.attachments?.nidScan && (
                <a
                  href={client.attachments.nidScan}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  <span>View NID Scan</span>
                </a>
              )}
            </div>

            {/* 3. Generated Vault Documents List */}
            {(client.vaultDocuments || []).map((doc, idx) => (
              <div key={doc.did || doc._id || idx} className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{doc.documentName || 'Official Document'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 font-bold border border-sky-500/20 shrink-0">
                    Vault PDF
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Uploaded by: {doc.uploadedByName || 'System Engine'}
                </p>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    <span>View / Print Document</span>
                  </a>
                )}
              </div>
            ))}

            {/* 4. Generated Agreements List */}
            {(client.agreements || []).map((agr, idx) => (
              <div key={agr.did || agr._id || idx} className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                    <FileText className="size-4 text-amber-500 shrink-0" />
                    <span className="truncate">Employment Agreement</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 font-bold border border-amber-500/20 shrink-0">
                    Legal Contract
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground truncate">
                  ID: {agr.agreementId || 'AGR'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/docs/agreement?clientDid=${client.did}&returnUrl=${encodeURIComponent(`/admin/clients/${id}?tab=documents`)}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Eye className="size-3" />
                  <span>Open in Document Studio</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
