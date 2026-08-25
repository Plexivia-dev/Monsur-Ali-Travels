import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Globe2,
  Building2,
  Handshake,
  FolderOpen,
  FilePlus2,
  User,
  Briefcase,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  X,
  Download,
  Upload,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { CaseFileCreationModal } from './CaseFileCreationModal';
import { CaseWorkspaceDrawer } from './CaseWorkspaceDrawer';

export function CandidateCaseFiles() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const [caseRes, candRes] = await Promise.allSettled([
        apiClient.get('/api/v1/client/cases?limit=100'),
        apiClient.get('/api/v1/client/candidates'),
      ]);

      const rawCases = caseRes.status === 'fulfilled' ? (caseRes.value.data?.data || caseRes.value.data?.cases || []) : [];
      const rawCandidates = candRes.status === 'fulfilled' ? (candRes.value.data?.data || candRes.value.data || []) : [];

      const normalized = (Array.isArray(rawCases) ? rawCases : []).map(c => ({
        _id: c.did || c._id,
        did: c.did,
        fileNumber: c.caseNumber || c.fileNumber || 'CASE-001',
        candidateName: c.applicantName || c.clientInfo?.fullName || 'Applicant',
        candidatePhone: c.phone || '—',
        passportNumber: c.passportNumber || '—',
        destinationCountry: c.destinationCountry || c.caseType?.toUpperCase() || 'Overseas',
        tradeSkill: c.tradeSkill || c.caseType?.replace('_', ' ') || 'General',
        status: c.workflowStatus || c.status || 'ENTRY',
        steps: [
          { id: 1, title: 'Intake & Passport Entry', status: 'completed' },
          { id: 2, title: 'Lawyer / Embassy Processing', status: c.status === 'ENTRY' ? 'in_progress' : 'completed' },
          { id: 3, title: 'Offer Letter & Work Permit', status: c.status === 'APPROVED_OFFER_LETTER' || c.status === 'SUBMITTED_EMBASSY_BSF' || c.status === 'COMPLETED_DELIVERED' ? 'completed' : 'pending' },
          { id: 4, title: 'Indian Visa & PCC Preparation', status: c.status === 'SUBMITTED_EMBASSY_BSF' || c.status === 'COMPLETED_DELIVERED' ? 'completed' : 'pending' },
          { id: 5, title: 'VFS Submission & Delivery', status: c.status === 'COMPLETED_DELIVERED' ? 'completed' : 'pending' },
        ],
        createdAt: c.createdAt,
      }));

      const existingDids = new Set(normalized.map(c => c._id));
      const normalizedCandidates = (Array.isArray(rawCandidates) ? rawCandidates : []).filter(c => !existingDids.has(c._id || c.did)).map(c => ({
        _id: c._id || c.did,
        did: c.did,
        fileNumber: c.fileNumber || 'CAND-001',
        candidateName: c.candidateName || 'Candidate',
        candidatePhone: c.candidatePhone || '—',
        passportNumber: c.passportNumber || '—',
        destinationCountry: c.destinationCountry || 'Overseas',
        tradeSkill: c.tradeSkill || 'General Worker',
        status: c.status || 'ENTRY',
        steps: c.steps || [
          { id: 1, title: 'Document Collection', status: 'completed' },
          { id: 2, title: 'Verification', status: 'in_progress' },
          { id: 3, title: 'Submission', status: 'pending' },
          { id: 4, title: 'Visa Stamping', status: 'pending' },
          { id: 5, title: 'Flight Delivery', status: 'pending' },
        ],
        createdAt: c.createdAt,
      }));

      setCases([...normalized, ...normalizedCandidates]);
    } catch (err) {
      console.error('Failed to load candidate case files:', err);
      toast.error('Failed to load candidates from server.');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCases = useMemo(() => {
    const safeCases = Array.isArray(cases) ? cases : [];
    return safeCases.filter((c) => {
      if (!c) return false;
      const matchesSearch =
        (c.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.fileNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.passportNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tradeSkill || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.destinationCountry || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWorkflow = workflowFilter === 'all' || c.workflowType === workflowFilter;
      return matchesSearch && matchesWorkflow;
    });
  }, [cases, searchQuery, workflowFilter]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newForm.candidateName || !newForm.passportNumber) {
      toast.error('Candidate Name and Passport Number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/api/v1/client/candidates', newForm);
      if (response && response.data) {
        const createdCase = response.data?.data || response.data;
        toast.success(`Case File ${createdCase.fileNumber || 'New'} created in database!`);
        setCases((prev) => [createdCase, ...(Array.isArray(prev) ? prev : [])]);
        setIsNewModalOpen(false);
        setNewForm({
          candidateName: '',
          candidatePhone: '',
          candidateEmail: '',
          passportNumber: '',
          passportExpiry: '',
          tradeSkill: 'Heavy Equipment Operator',
          destinationCountry: 'Saudi Arabia',
          destinationCity: 'Riyadh',
          workflowType: 'destination_partner',
          casePriority: 'normal'
        });
      }
    } catch (err) {
      console.error('Create candidate error:', err);
      toast.error(err.response?.data?.message || 'Failed to create candidate case file.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-200/70">Candidate & Agent Workflow</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-sky-400" />
              Candidate Case Files & Agent Pipeline
            </h1>
            <p className="text-xs text-sky-100/80 max-w-2xl leading-relaxed">
              Track 5-stage deployment pipelines for overseas manpower candidates, manage destination agency allocations, local sub-agencies, and live MongoDB document verification vaults.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCandidates}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-sky-400 rounded-xl border border-sky-500/20 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Candidate File
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidate name, passport, trade skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setWorkflowFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${workflowFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            All Channels ({cases.length})
          </button>
          <button
            onClick={() => setWorkflowFilter('destination_partner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${workflowFilter === 'destination_partner' ? 'bg-sky-500/20 text-sky-500 border border-sky-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            Destination Partner
          </button>
          <button
            onClick={() => setWorkflowFilter('direct_client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${workflowFilter === 'direct_client' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            Direct Corporate
          </button>
          <button
            onClick={() => setWorkflowFilter('outsourced_local')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${workflowFilter === 'outsourced_local' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            Local Sub-Agency
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Fetching Candidate Case Files from Database...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Candidate Case Files Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No candidates matched your search criteria or filter. Create a new case file to get started.
          </p>
        </div>
      ) : (
        /* Case File Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => (
            <div
              key={c._id || c.fileNumber}
              onClick={() => setSelectedCase(c)}
              className="bg-card border border-border hover:border-sky-500/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              {/* Header: File Ref & Workflow Tag */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-500">{c.fileNumber}</span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-sky-500 transition-colors flex items-center gap-1.5">
                    {c.candidateName}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.workflowType === 'destination_partner' ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' :
                    c.workflowType === 'direct_client' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                  }`}>
                  {(c.workflowType || 'destination_partner').replace('_', ' ')}
                </span>
              </div>

              {/* Candidate Key Information */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/40 p-2 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block font-medium">Trade Skill</span>
                  <span className="font-semibold text-foreground truncate block">{c.tradeSkill}</span>
                </div>
                <div className="bg-muted/40 p-2 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block font-medium">Destination</span>
                  <span className="font-semibold text-foreground truncate block">{c.destinationCountry}</span>
                </div>
                <div className="bg-muted/40 p-2 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block font-medium">Passport No.</span>
                  <span className="font-mono font-semibold text-foreground truncate block">{c.passportNumber}</span>
                </div>
                <div className="bg-muted/40 p-2 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block font-medium">Deployment Target</span>
                  <span className="font-semibold text-foreground truncate block">{c.expectedDeploymentDate || '2026-10-01'}</span>
                </div>
              </div>

              {/* Pipeline Stage Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">Current Stage:</span>
                  <span className="font-bold text-sky-500">Stage {c.currentStepId || 1} of 5</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
                  {(c.steps || []).map((st) => (
                    <div
                      key={st.id}
                      className={`h-full flex-1 border-r border-background ${st.status === 'completed' ? 'bg-emerald-500' :
                          st.status === 'in_progress' ? 'bg-sky-500 animate-pulse' :
                            'bg-muted-foreground/20'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer Action CTA */}
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                <span className="text-[10px]">DB Ref: {c._id ? c._id.substring(0, 8) + '...' : c.fileNumber}</span>
                <span className="text-sky-500 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Dossier <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Case Workspace Drawer (Tasks, Documents, Notes, Pipeline) */}
      <CaseWorkspaceDrawer
        caseId={selectedCase?._id || selectedCase?.did}
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        onRefresh={fetchCandidates}
      />

      {/* New 5-Step Case File Creation Stepper Modal */}
      <CaseFileCreationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCandidates}
      />
    </div>
  );
}

export default CandidateCaseFiles;
