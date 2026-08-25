import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, Plus, Search, Filter, RefreshCw, Loader2,
  CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Send,
  User, History, FileText, ChevronRight, Eye, Check, X,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { StepAssignModal } from '../components/workflow/StepAssignModal';
import { AddPaymentModal } from '../components/workflow/AddPaymentModal';
import { useAuth } from '../store/useAuthStore';
import CreateClientModal from '@/components/clients/CreateClientModal';

// Renders the Client Files & Workflow Step board for Admin Dashboard
const CaseWorkflow = () => {
  const { user } = useAuth();
  const isAccountant = user?.subRole?.toLowerCase() === 'accountant' || user?.subRole?.toLowerCase() === 'accounts';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [approvingTaskId, setApprovingTaskId] = useState(null);

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

  const handleApproveStep = async (taskDid) => {
    setApprovingTaskId(taskDid);
    try {
      await apiClient.patch(`/api/v1/admin/cases/tasks/${taskDid}/approve`, {
        approvalNotes: 'Approved by Admin',
      });
      toast.success('Step approved successfully!');
      fetchCases();
      if (selectedCase) {
        // Refresh selected case details
        const res = await apiClient.get(`/api/v1/admin/cases/${selectedCase.did || selectedCase._id}/full-details`);
        if (res.data?.data) setSelectedCase(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve step.');
    } finally {
      setApprovingTaskId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (c.applicantName || '').toLowerCase().includes(q) ||
      (c.passportNumber || '').toLowerCase().includes(q) ||
      (c.caseNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-sky-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-sky-400" />
              Client Files
            </h1>
            <p className="text-xs text-sky-100/70 max-w-xl">
              Manage client files, workflow steps, document access permissions, and case lifecycles.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Client / File</span>
            </button>

            <button
              onClick={fetchCases}
              className="p-2.5 bg-white hover:bg-gray-50 text-sky-600 rounded-xl border border-gray-200 transition-all cursor-pointer shadow-sm"
              title="Refresh Cases"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-gray-200 shadow-md rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cases by name, passport, case no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{filteredCases.length} Active Cases</span>
      </div>

      {/* Case Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading workflow board...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => (
            <div
              key={c.did || c._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-sky-400">{c.caseNumber}</span>
                    <h3 className="text-sm font-bold text-foreground leading-tight mt-0.5">{c.applicantName}</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">
                    {c.caseType?.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">Passport: <span className="font-mono font-bold text-foreground">{c.passportNumber || '—'}</span></p>
                  <p className="text-muted-foreground">Workflow: <span className="font-semibold text-sky-400">{c.workflowStatus || 'Received'}</span></p>
                </div>

                {/* Workflow Tasks Preview */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Task Steps</p>
                  {(c.workflowTasks || []).length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">No task steps assigned yet.</p>
                  ) : (
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {c.workflowTasks.map((t) => (
                        <div key={t.did || t._id} className="bg-muted/40 p-2 rounded-lg text-[11px] flex items-center justify-between">
                          <span className="truncate font-medium">{t.title}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            t.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            t.status === 'Done' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                {isAccountant ? (
                  c.status === 'ENTRY' || !c.paymentLedger?.totalPaidAmount ? (
                    <button
                      onClick={() => {
                        setSelectedCase(c);
                        setPaymentModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Add Payment
                    </button>
                  ) : (
                    <span className="flex-1 text-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                      Payment Received ✓
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCase(c);
                      setAssignModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Assign Step
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step Assign Modal */}
      {assignModalOpen && selectedCase && (
        <StepAssignModal
          caseDoc={selectedCase}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedCase(null);
          }}
          onSuccess={fetchCases}
        />
      )}

      {/* Add Payment Modal */}
      {paymentModalOpen && selectedCase && (
        <AddPaymentModal
          caseDoc={selectedCase}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedCase(null);
          }}
          onSuccess={fetchCases}
        />
      )}

      {/* Create New Client & File Modal */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchCases()}
      />
    </div>
  );
};

export default CaseWorkflow;
