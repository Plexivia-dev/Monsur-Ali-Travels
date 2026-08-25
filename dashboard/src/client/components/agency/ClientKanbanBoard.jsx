import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe2,
  Briefcase,
  FolderOpen,
  Eye,
  FileText,
  X,
  Download,
  CreditCard,
  Send,
  Plus,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { CaseFileCreationModal } from './CaseFileCreationModal';
import { CaseWorkspaceDrawer } from './CaseWorkspaceDrawer';

const KANBAN_STAGES = [
  { id: 'ENTRY', title: 'New Entry (এন্ট্রি)', color: 'bg-slate-100/70 border-slate-300' },
  { id: 'PROCESSING', title: 'Processing (প্রসেসিং)', color: 'bg-sky-50/70 border-sky-200' },
  { id: 'VISA_SUBMITTED', title: 'Visa Submitted (এমবাসি/ভিএফএস)', color: 'bg-amber-50/70 border-amber-200' },
  { id: 'FLIGHT_BOOKED', title: 'Visa Issued / Ready (রেডি)', color: 'bg-purple-50/70 border-purple-200' },
  { id: 'COMPLETED', title: 'Completed & Delivered (ডেলিভার্ড)', color: 'bg-emerald-50/70 border-emerald-200' }
];

export function ClientKanbanBoard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // Fetch both client and case files
      const [candRes, caseRes] = await Promise.allSettled([
        apiClient.get('/api/v1/client/clients'),
        apiClient.get('/api/v1/client/cases?limit=100')
      ]);

      const clients = candRes.status === 'fulfilled' ? (candRes.value.data?.data || candRes.value.data || []) : [];
      const rawCases = caseRes.status === 'fulfilled' ? (caseRes.value.data?.data || caseRes.value.data?.cases || caseRes.value.data || []) : [];

      // Normalize cases into unified board cards
      const normalizedCases = (Array.isArray(rawCases) ? rawCases : []).map(c => ({
        _id: c.did || c._id,
        did: c.did,
        fileNumber: c.caseNumber || c.fileNumber || 'CASE-001',
        clientName: c.applicantName || c.clientInfo?.fullName || 'Applicant',
        clientPhone: c.phone || c.clientInfo?.phone || '—',
        passportNumber: c.passportNumber || c.clientInfo?.passportNumber || '—',
        destinationCountry: c.destinationCountry || c.caseType?.toUpperCase() || 'Overseas',
        tradeSkill: c.tradeSkill || c.caseType?.replace('_', ' ') || 'General',
        status: c.status === 'APPROVED_OFFER_LETTER' ? 'PROCESSING' :
                c.status === 'SUBMITTED_EMBASSY_BSF' ? 'VISA_SUBMITTED' :
                c.status === 'COMPLETED_DELIVERED' ? 'COMPLETED' :
                c.status || 'ENTRY',
        workflowStatus: c.workflowStatus || c.status,
        totalAgreedAmount: c.paymentLedger?.totalAgreedAmount || c.packageCost || 0,
        advanceAmount: c.paymentLedger?.totalPaidAmount || c.initialPaidAmount || 0,
        dueAmount: c.paymentLedger?.dueAmount || 0,
        createdAt: c.createdAt,
        rawCase: c
      }));

      // Combine unique records
      const existingDids = new Set(normalizedCases.map(c => c._id));
      const normalizedClients = (Array.isArray(clients) ? clients : []).filter(c => !existingDids.has(c._id || c.did)).map(c => ({
        _id: c._id || c.did,
        did: c.did,
        fileNumber: c.fileNumber || 'CAND-001',
        clientName: c.clientName || 'Client',
        clientPhone: c.clientPhone || '—',
        passportNumber: c.passportNumber || '—',
        destinationCountry: c.destinationCountry || 'Overseas',
        tradeSkill: c.tradeSkill || 'General Worker',
        status: c.status || 'ENTRY',
        workflowStatus: c.status,
        totalAgreedAmount: c.totalAgreedAmount || 0,
        advanceAmount: c.advanceAmount || 0,
        dueAmount: c.dueAmount || 0,
        createdAt: c.createdAt,
        rawCase: c
      }));

      setCases([...normalizedCases, ...normalizedClients]);
    } catch (err) {
      toast.error('Failed to load cases for board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const columns = useMemo(() => {
    const cols = {
      ENTRY: [],
      PROCESSING: [],
      VISA_SUBMITTED: [],
      FLIGHT_BOOKED: [],
      COMPLETED: []
    };
    cases.forEach(c => {
      let st = c.status || 'ENTRY';
      if (!cols[st]) st = 'ENTRY'; 
      cols[st].push(c);
    });
    return cols;
  }, [cases]);

  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDrop = async (e, destStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const cardId = draggedCardId || e.dataTransfer.getData('text/plain');
    if (!cardId) return;

    const targetCase = cases.find(c => c._id === cardId || c.did === cardId);
    if (!targetCase || targetCase.status === destStatus) return;

    const updatedCases = cases.map(c => {
      if (c._id === cardId || c.did === cardId) {
        return { ...c, status: destStatus };
      }
      return c;
    });

    setCases(updatedCases);

    try {
      const backendStatus = 
        destStatus === 'ENTRY' ? 'ENTRY' :
        destStatus === 'PROCESSING' ? 'PROCESSING' :
        destStatus === 'VISA_SUBMITTED' ? 'SUBMITTED_EMBASSY_BSF' :
        destStatus === 'FLIGHT_BOOKED' ? 'APPROVED_OFFER_LETTER' :
        'COMPLETED_DELIVERED';

      await apiClient.patch(`/api/v1/client/cases/${cardId}/workflow`, {
        status: backendStatus,
        remarks: `Moved to ${destStatus}`
      }).catch(async () => {
        await apiClient.patch(`/api/v1/client/clients/${cardId}/status`, {
          status: destStatus
        });
      });

      toast.success(`File status moved to ${destStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error('Failed to update status. Reverting.');
      fetchCases();
    } finally {
      setDraggedCardId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sky-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading Pipeline Board...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-5 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-sky-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-400" />
            Client & Case Pipeline Board
          </h2>
          <p className="text-xs text-sky-100/70 mt-1">
            Drag and drop client case files across processing stages. Click any card to open the full dossier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCases}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-sky-500/20 transition-all cursor-pointer"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Client / Case File</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex items-start gap-4 h-[calc(100vh-270px)] pb-4 overflow-x-auto">
        {KANBAN_STAGES.map((stage) => (
          <div
            key={stage.id}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`flex-shrink-0 w-80 h-full flex flex-col rounded-xl border ${stage.color} overflow-hidden shadow-sm bg-background/50 backdrop-blur-xs transition-colors ${
              dragOverStage === stage.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-inherit bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-between items-center">
              <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">{stage.title}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {columns[stage.id].length}
              </span>
            </div>

            {/* Droppable Card List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {columns[stage.id].map((c) => (
                <div
                  key={c._id || c.did || c.fileNumber}
                  draggable
                  onDragStart={(e) => handleDragStart(e, c._id || c.did || c.fileNumber)}
                  onClick={() => setSelectedCase(c)}
                  className="bg-card p-4 rounded-xl border border-border shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {c.fileNumber || 'CASE-000'}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                    {c.clientName}
                  </h4>
                  
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
                    <Globe2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-foreground truncate">{c.destinationCountry || 'Unassigned'}</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{c.clientPhone || 'N/A'}</span>
                  </div>

                  {/* Card Footer: Trade Skill + Open Dossier Link */}
                  <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                      {c.tradeSkill || 'Labor'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(c);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Case Workspace Drawer (Staff Tasks, Document Vault, Team Messages) */}
      <CaseWorkspaceDrawer
        caseId={selectedCase?._id || selectedCase?.did}
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        onRefresh={fetchCases}
      />

      {/* New Case File Creation Modal */}
      <CaseFileCreationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCases}
      />
    </div>
  );
}

export default ClientKanbanBoard;
