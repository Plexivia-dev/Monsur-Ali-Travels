import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Lock,
  FileText,
  Loader2,
  Layers,
  CheckSquare,
  Square,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { Button } from '@/components/ui/button';

export function StepAssignModal({ isOpen = true, caseDoc = {}, caseDid, caseNumber, onClose, onSuccess }) {
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskTypeDids, setSelectedTaskTypeDids] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToDid, setAssignedToDid] = useState('');
  const [selectedDocDids, setSelectedDocDids] = useState([]);
  const [requiresDocument, setRequiresDocument] = useState(true);
  const [requiredDocTypes, setRequiredDocTypes] = useState([]);

  const [users, setUsers] = useState([]);
  const [vaultDocs, setVaultDocs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);

  const resolvedCaseDid = caseDoc?.did || caseDoc?._id || caseDid;
  const resolvedCaseNumber = caseDoc?.caseNumber || caseDoc?.fileNumber || caseNumber || 'CASE-FILE';

  useEffect(() => {
    if (!isOpen) return;

    // Fetch Task Types
    setLoadingTaskTypes(true);
    apiClient
      .get('/api/v1/task-types')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setTaskTypes(Array.isArray(data) ? data : []);
      })
      .catch(() => setTaskTypes([]))
      .finally(() => setLoadingTaskTypes(false));

    // Fetch users for assignment
    apiClient
      .get('/api/v1/admin/users?limit=100')
      .then((res) => {
        const data = res.data?.data || res.data?.users || res.data || [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]));

    // Fetch client vault docs for permissioning
    if (caseDoc?.clientDid) {
      apiClient
        .get(`/api/v1/client/docs?clientDid=${caseDoc.clientDid}`)
        .then((res) => {
          const docs = res.data?.data || res.data || [];
          setVaultDocs(Array.isArray(docs) ? docs : []);
        })
        .catch(() => setVaultDocs([]));
    }
  }, [isOpen, caseDoc]);

  if (!isOpen) return null;

  const handleToggleTaskType = (tt) => {
    const isSelected = selectedTaskTypeDids.includes(tt.did);
    const nextSelectedDids = isSelected
      ? selectedTaskTypeDids.filter((id) => id !== tt.did)
      : [...selectedTaskTypeDids, tt.did];

    setSelectedTaskTypeDids(nextSelectedDids);

    const selectedObjs = taskTypes.filter((t) => nextSelectedDids.includes(t.did));

    // Calculate whether any selected task type requires document
    const anyDocRequired = selectedObjs.some((t) => t.requiresDocument !== false);
    setRequiresDocument(anyDocRequired);

    // Collect all required document preset keys
    const docTypes = selectedObjs
      .map((t) => t.defaultDocumentType || (t.requiresDocument ? 'other' : null))
      .filter(Boolean);
    setRequiredDocTypes(Array.from(new Set(docTypes)));

    // Auto-generate title if empty or only contains previous names
    if (selectedObjs.length > 0) {
      const names = selectedObjs.map((t) => t.name);
      if (names.length === 1) {
        setTitle(names[0]);
      } else {
        setTitle(`Collect ${names.join(' & ')}`);
      }
    }
  };

  const toggleDocSelect = (docDid) => {
    setSelectedDocDids((prev) =>
      prev.includes(docDid) ? prev.filter((d) => d !== docDid) : [...prev, docDid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !assignedToDid) {
      toast.error('Task title and assigned user are required.');
      return;
    }

    const selectedObjs = taskTypes.filter((t) => selectedTaskTypeDids.includes(t.did));
    const taskTypeNames = selectedObjs.map((t) => t.name);

    setSubmitting(true);
    try {
      await apiClient.post('/api/v1/admin/cases/assign-step', {
        caseDid: resolvedCaseDid,
        title,
        description,
        assignedToDid,
        allowedDocumentDids: selectedDocDids,
        taskTypeDids: selectedTaskTypeDids,
        taskTypeNames,
        requiresDocument,
        requiredDocTypes,
        stepNumber: (caseDoc?.workflowTasks || []).length + 1,
      });

      toast.success(`Task step "${title}" assigned to staff!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign step.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-card border border-border text-foreground rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl z-10 my-auto animate-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border p-4 sm:p-5 flex items-center justify-between bg-muted/40">
          <div>
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
              Case: {resolvedCaseNumber} • Step {(caseDoc?.workflowTasks || []).length + 1}
            </span>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mt-0.5">
              <Layers className="w-5 h-5 text-primary" />
              Assign Case Workflow Step
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Section 1: Task Type & Document Presets Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Select Task Sub-Type & Required Documents
              </label>
              <span className="text-[10px] text-muted-foreground">
                {selectedTaskTypeDids.length} selected
              </span>
            </div>

            {loadingTaskTypes ? (
              <div className="p-4 text-center text-muted-foreground bg-muted/20 border border-border rounded-xl flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading available task types...</span>
              </div>
            ) : taskTypes.length === 0 ? (
              <div className="p-3 bg-muted/20 border border-border rounded-xl text-muted-foreground text-center">
                No task types found. You can add custom task types in Agency Settings.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {taskTypes.map((tt) => {
                  const isChecked = selectedTaskTypeDids.includes(tt.did);
                  return (
                    <div
                      key={tt.did || tt._id}
                      onClick={() => handleToggleTaskType(tt)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/10 border-primary text-foreground font-bold shadow-2xs'
                          : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <div className="truncate">
                          <p className="truncate font-semibold">{tt.name}</p>
                          <p className="text-[10px] text-muted-foreground font-normal">
                            {tt.requiresDocument ? '📄 Requires Document Upload' : '💬 Mandatory Work Notes Only'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 uppercase">
                        {tt.category?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Step Title & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-muted-foreground mb-1">
                Step Title / Task Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Upload Passport & NID Copy, Embassy Portal Verification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-muted-foreground mb-1">
                Assign To Staff Member *
              </label>
              <select
                required
                value={assignedToDid}
                onChange={(e) => setAssignedToDid(e.target.value)}
                className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="" className="bg-card text-muted-foreground">
                  — Select Staff Member —
                </option>
                {users.map((u) => (
                  <option key={u.did || u._id} value={u.did || u._id} className="bg-card text-foreground">
                    {u.name} ({u.role}) — {u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Task Behavior Status */}
          <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {requiresDocument ? (
                <UploadCloud className="w-4 h-4 text-sky-500 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <p className="font-bold text-foreground">
                  {requiresDocument ? 'Document Upload Enforced' : 'Work Notes & Remarks Mandatory'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {requiresDocument
                    ? 'Staff will upload required files. Remarks will be optional.'
                    : 'No documents required. Staff must provide completion notes.'}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                requiresDocument
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              {requiresDocument ? 'File Intake' : 'Action Step'}
            </span>
          </div>

          {/* Section 4: Task Instructions */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Instructions & Scope for Staff
            </label>
            <textarea
              rows={2}
              placeholder="Provide specific guidelines or notes for the staff..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Section 5: Permitted Documents (Restricted Access) */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-foreground" />
                Permitted Vault Documents ({selectedDocDids.length} selected)
              </label>
              <span className="text-[10px] text-muted-foreground">Authorize staff viewing</span>
            </div>

            {vaultDocs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic bg-muted/20 p-2.5 rounded-xl border border-border">
                No existing files in this client's document vault.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {vaultDocs.map((doc) => {
                  const docDid = doc.did || doc._id;
                  const isChecked = selectedDocDids.includes(docDid);
                  return (
                    <div
                      key={docDid}
                      onClick={() => toggleDocSelect(docDid)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/10 border-primary text-foreground font-semibold'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{doc.documentName || doc.fileName}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-border accent-primary cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4 sm:p-5 flex items-center justify-end gap-2 text-xs bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Assign Task Step
          </Button>
        </div>
      </form>
    </div>
  );
}

export default StepAssignModal;
