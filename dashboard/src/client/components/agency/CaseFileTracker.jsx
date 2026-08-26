import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Filter, RefreshCw, Loader2, X, Send,
  CheckCircle2, Clock, AlertCircle, ChevronRight, FileText,
  ArrowRightLeft, User, History, Bell, MessageSquare,
  Stamp, Globe2, ShieldCheck, ClipboardList, ArrowRight,
  ChevronDown, ChevronUp, Phone, Save, Eye, FolderOpen,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { PageTitle } from '@shared/components/layout/PageTitle';

// ─── Workflow Status Config ──────────────────────────────────────────────────
const WORKFLOW_STATUSES = [
  { value: 'Received',              label: 'Received',                color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',        dot: 'bg-slate-400' },
  { value: 'Handed Over',           label: 'Handed Over',             color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',         dot: 'bg-amber-400' },
  { value: 'Online Submitted',      label: 'Online Submitted',        color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',            dot: 'bg-blue-400' },
  { value: 'Approved',              label: 'Approved ✓',              color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',   dot: 'bg-emerald-400' },
  { value: 'Rejected',              label: 'Rejected ✗',              color: 'bg-red-500/15 text-red-400 border-red-500/30',              dot: 'bg-red-400' },
  { value: 'Interview Scheduled',   label: 'Interview Scheduled',     color: 'bg-violet-500/15 text-violet-400 border-violet-500/30',     dot: 'bg-violet-400' },
  { value: 'Indian Visa Prep',      label: 'Indian Visa Prep',        color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',              dot: 'bg-sky-400' },
  { value: 'Indian Visa Submitted', label: 'Indian Visa Submitted',   color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',     dot: 'bg-indigo-400' },
  { value: 'Indian Visa Approved',  label: 'Indian Visa Approved ✓',  color: 'bg-teal-500/15 text-teal-400 border-teal-500/30',           dot: 'bg-teal-400' },
  { value: 'Indian Visa Rejected',  label: 'Indian Visa Rejected ✗',  color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',           dot: 'bg-rose-400' },
  { value: 'PCC Applied',           label: 'PCC Applied',             color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',     dot: 'bg-orange-400' },
  { value: 'PCC Ready',             label: 'PCC Ready ✓',             color: 'bg-lime-500/15 text-lime-400 border-lime-500/30',           dot: 'bg-lime-400' },
  { value: 'Submitted to VFS',      label: 'Submitted to Global VFS', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',           dot: 'bg-cyan-400' },
  { value: 'Visa Completed',        label: 'Visa Completed ✓',        color: 'bg-green-500/15 text-green-400 border-green-500/30',        dot: 'bg-green-400' },
  { value: 'On Hold',               label: 'On Hold',                 color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',           dot: 'bg-zinc-400' },
  { value: 'Delivered',             label: 'Delivered & Closed',      color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',     dot: 'bg-purple-400' },
];

function getStatusConfig(status) {
  return WORKFLOW_STATUSES.find(s => s.value === status) || {
    value: status, label: status,
    color: 'bg-muted/40 text-muted-foreground border-border',
    dot: 'bg-muted-foreground'
  };
}

function StatusBadge({ status, size = 'sm' }) {
  const cfg = getStatusConfig(status);
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-semibold ${padding} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return <span>{days}d ago</span>;
  if (hrs > 0) return <span>{hrs}h ago</span>;
  if (mins > 0) return <span>{mins}m ago</span>;
  return <span>Just now</span>;
}

// ─── Status History Timeline ─────────────────────────────────────────────────
function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        No status history yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {[...history].reverse().map((entry, idx) => {
          const cfg = getStatusConfig(entry.status);
          return (
            <div key={idx} className="relative flex items-start gap-3 pl-8">
              <div className={`absolute left-0 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${cfg.dot}`} />
              <div className="flex-1 min-w-0 bg-muted/30 border border-border rounded-xl p-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <StatusBadge status={entry.status} />
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {entry.date ? new Date(entry.date).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                  </span>
                </div>
                {entry.remarks && (
                  <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">{entry.remarks}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  Updated by: <span className="font-medium text-foreground">{entry.updatedBy?.name || 'System'}</span>
                  {entry.assignedTo && (
                    <> → Assigned to: <span className="font-medium text-sky-400">{entry.assignedTo?.name || 'Staff'}</span></>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Workflow Update Modal ────────────────────────────────────────────────────
function WorkflowUpdateModal({ caseDoc, users, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState(caseDoc.workflowStatus || 'Received');
  const [remarks, setRemarks]     = useState('');
  const [assignedTo, setAssignedTo] = useState(caseDoc.assignedTo?._id || caseDoc.assignedTo || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await apiClient.patch(`/api/v1/client/cases/${caseDoc._id}/workflow`, {
        workflowStatus: newStatus,
        assignedTo: assignedTo || undefined,
        remarks
      });
      toast.success(`Status updated to "${newStatus}"`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-sky-400" />
              Update Workflow Status
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Case: <span className="font-mono text-sky-400">{caseDoc.caseNumber}</span> — {caseDoc.applicantName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current → New */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Current</p>
            <StatusBadge status={caseDoc.workflowStatus || 'Received'} size="md" />
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">New Status</p>
            <StatusBadge status={newStatus} size="md" />
          </div>
        </div>

        {/* New Status Selector */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select New Status *</label>
          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
            {WORKFLOW_STATUSES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setNewStatus(s.value)}
                className={`text-left px-2.5 py-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  newStatus === s.value
                    ? `${s.color} ring-2 ring-offset-1 ring-offset-card ring-current`
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hand off to */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hand Off To (Optional)</label>
          <select
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">— Keep current assignee —</option>
            {(users || []).map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Remarks / Notes</label>
          <textarea
            rows={2}
            placeholder="e.g. Handed over to Ikram for online submission..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs border border-border text-muted-foreground rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Update Status
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Case Detail Side Panel ───────────────────────────────────────────────────
function CaseDetailPanel({ caseDoc, users, onClose, onRefresh }) {
  const [showHistory, setShowHistory] = useState(true);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Panel Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-sky-400 font-bold">{caseDoc.caseNumber}</span>
              <StatusBadge status={caseDoc.workflowStatus || 'Received'} />
            </div>
            <h2 className="text-base font-bold text-foreground">{caseDoc.applicantName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3" /> {caseDoc.phone || '—'}
              <span className="text-border">•</span>
              <Globe2 className="w-3 h-3" /> {caseDoc.caseType?.toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Passport No.', value: caseDoc.passportNumber || '—', mono: true },
              { label: 'Case Type', value: (caseDoc.caseType || '—').toUpperCase() },
              { label: 'Assigned To', value: caseDoc.assignedTo?.name || 'Unassigned' },
              { label: 'Created', value: caseDoc.createdAt ? new Date(caseDoc.createdAt).toLocaleDateString('en-BD') : '—' },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-muted/30 border border-border rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-xs font-bold text-foreground truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Payment Ledger */}
          {caseDoc.paymentLedger && (
            <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Payment Ledger
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Advance (Step 1)', val: caseDoc.paymentLedger.step1_advance },
                  { label: 'Offer (Step 2)', val: caseDoc.paymentLedger.step2_offerApproval },
                  { label: 'Delivery (Step 3)', val: caseDoc.paymentLedger.step3_delivery },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center bg-card border border-border rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="font-bold text-foreground">BDT {(val || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-emerald-400">BDT {(caseDoc.paymentLedger.totalPaidAmount || 0).toLocaleString()}</span>
              </div>
              {caseDoc.paymentLedger.dueAmount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Remaining Due</span>
                  <span className="font-bold text-red-400">BDT {(caseDoc.paymentLedger.dueAmount || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Remarks */}
          {caseDoc.remarks && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Remarks</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{caseDoc.remarks}</p>
            </div>
          )}

          {/* Status History Timeline */}
          <div>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Status History ({(caseDoc.statusHistory || []).length} entries)
              </span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showHistory && <StatusTimeline history={caseDoc.statusHistory} />}
          </div>
        </div>

        {/* Action Footer */}
        <div className="shrink-0 border-t border-border p-4 flex items-center gap-2">
          <button
            onClick={() => setUpdateModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Update Status / Handoff
          </button>
        </div>
      </div>

      {updateModalOpen && (
        <WorkflowUpdateModal
          caseDoc={caseDoc}
          users={users}
          onClose={() => setUpdateModalOpen(false)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// ─── New Case Form Modal ──────────────────────────────────────────────────────
function NewCaseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    applicantName: '',
    phone: '',
    passportNumber: '',
    nidNumber: '',
    caseType: 'indian-visa',
    remarks: '',
    'paymentLedger.totalAgreedAmount': '',
    'paymentLedger.step1_advance': '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.applicantName || !form.caseType) {
      toast.error('Applicant name and case type are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        applicantName: form.applicantName,
        phone: form.phone,
        passportNumber: form.passportNumber,
        nidNumber: form.nidNumber,
        caseType: form.caseType,
        remarks: form.remarks,
        paymentLedger: {
          totalAgreedAmount: Number(form['paymentLedger.totalAgreedAmount']) || 0,
          step1_advance: Number(form['paymentLedger.step1_advance']) || 0,
        }
      };
      const res = await apiClient.post('/api/v1/client/cases', payload);
      toast.success(`Case ${res.data?.data?.caseNumber || ''} created!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create case.');
    } finally {
      setSubmitting(false);
    }
  };

  const CASE_TYPES = [
    { value: 'indian-visa', label: 'Indian Visa' },
    { value: 'greece', label: 'Greece Work Permit' },
    { value: 'n-macedonia', label: 'N. Macedonia Work Permit' },
    { value: 'passport', label: 'Passport Service' },
    { value: 'pcc', label: 'Police Clearance (PCC)' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" /> New Case File
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Applicant Full Name *</label>
            <input required value={form.applicantName} onChange={e => set('applicantName', e.target.value)}
              placeholder="e.g. Md. Rahim Uddin"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Phone Number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+880..."
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground" />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Passport No.</label>
              <input value={form.passportNumber} onChange={e => set('passportNumber', e.target.value.toUpperCase())} placeholder="A09812345"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">NID Number</label>
              <input value={form.nidNumber} onChange={e => set('nidNumber', e.target.value)} placeholder="NID / Birth Reg."
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground" />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Case Type *</label>
              <select value={form.caseType} onChange={e => set('caseType', e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground">
                {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Total Agreed Amount (BDT )</label>
              <input type="number" value={form['paymentLedger.totalAgreedAmount']} onChange={e => set('paymentLedger.totalAgreedAmount', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground" />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Advance Received (BDT )</label>
              <input type="number" value={form['paymentLedger.step1_advance']} onChange={e => set('paymentLedger.step1_advance', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Remarks</label>
            <textarea rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Any notes..."
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground resize-none" />
          </div>
        </div>

        <div className="border-t border-border pt-3 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 border border-border text-muted-foreground text-xs rounded-lg hover:bg-muted">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow cursor-pointer disabled:opacity-50">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create Case File
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CaseFileTracker() {
  const [cases, setCases]           = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/client/cases?limit=200&sortBy=updatedAt&sortOrder=desc');
      const data = res.data?.data || res.data?.cases || res.data || [];
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load case files.');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/users?limit=50');
      const data = res.data?.data || res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  }, []);

  useEffect(() => {
    fetchCases();
    fetchUsers();
  }, [fetchCases, fetchUsers]);

  const handleRefresh = useCallback(() => {
    fetchCases();
    // Also update selected case from fresh data
    if (selectedCase) {
      setSelectedCase(prev => cases.find(c => c._id === prev._id) || prev);
    }
  }, [fetchCases, selectedCase, cases]);

  const caseTypes = useMemo(() => {
    const types = [...new Set(cases.map(c => c.caseType).filter(Boolean))];
    return types;
  }, [cases]);

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (c.applicantName || '').toLowerCase().includes(q) ||
        (c.passportNumber || '').toLowerCase().includes(q) ||
        (c.caseNumber || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q);
      const matchStatus = statusFilter === 'all' || c.workflowStatus === statusFilter;
      const matchType = typeFilter === 'all' || c.caseType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [cases, search, statusFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = cases.length;
    const active = cases.filter(c => !['Delivered', 'Visa Completed'].includes(c.workflowStatus)).length;
    const completed = cases.filter(c => ['Delivered', 'Visa Completed'].includes(c.workflowStatus)).length;
    const due = cases.filter(c => (c.paymentLedger?.dueAmount || 0) > 0).length;
    return { total, active, completed, due };
  }, [cases]);

  return (
    <div className="space-y-5">
      {/* ── Header Banner ── */}
      <PageTitle
        title="Case File Workflow Tracker"
        description="Track visa, work permit, and passport files through every stage — from receipt to handoff, approval, and final delivery. Full history and notification trail maintained."
        icon={FolderOpen}
        actions={
          <>
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-sky-400 rounded-xl border border-sky-500/20 transition-all cursor-pointer shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Case File
            </button>
          </>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Cases', value: stats.total, color: 'text-foreground', sub: 'All time' },
          { label: 'Active', value: stats.active, color: 'text-sky-400', sub: 'In progress' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-400', sub: 'Delivered/Closed' },
          { label: 'Has Due', value: stats.due, color: 'text-red-400', sub: 'Payment pending' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, passport, case no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none">
            <option value="all">All Statuses</option>
            {WORKFLOW_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none">
            <option value="all">All Types</option>
            {caseTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Case List ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          <p className="text-xs text-muted-foreground">Loading case files...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-16 text-center space-y-2">
          <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-bold text-foreground">No cases found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
            <span>Applicant</span>
            <span>Status</span>
            <span className="hidden md:block">Case Type</span>
            <span className="hidden md:block">Due (BDT )</span>
            <span>Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/50">
            {filtered.map(c => (
              <div
                key={c._id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group"
              >
                {/* Applicant */}
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-sky-400 transition-colors truncate">{c.applicantName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{c.caseNumber}</span>
                    {c.passportNumber && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{c.passportNumber}</span>
                      </>
                    )}
                  </div>
                  {c.phone && <p className="text-[10px] text-muted-foreground mt-0.5">{c.phone}</p>}
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <StatusBadge status={c.workflowStatus || 'Received'} />
                  {c.statusHistory?.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Updated <TimeAgo dateStr={c.statusHistory[c.statusHistory.length - 1]?.date} />
                    </p>
                  )}
                </div>

                {/* Case Type */}
                <div className="hidden md:block">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-muted/50 border border-border px-2 py-0.5 rounded">
                    {(c.caseType || '—').toUpperCase()}
                  </span>
                </div>

                {/* Due Amount */}
                <div className="hidden md:block text-right">
                  {(c.paymentLedger?.dueAmount || 0) > 0 ? (
                    <span className="text-xs font-bold text-red-400">BDT {(c.paymentLedger.dueAmount).toLocaleString()}</span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">Paid ✓</span>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedCase(c)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                    title="View & Update"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Side Panel ── */}
      {selectedCase && (
        <CaseDetailPanel
          caseDoc={selectedCase}
          users={users}
          onClose={() => setSelectedCase(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* ── New Case Modal ── */}
      {newModalOpen && (
        <NewCaseModal onClose={() => setNewModalOpen(false)} onSuccess={handleRefresh} />
      )}
    </div>
  );
}
