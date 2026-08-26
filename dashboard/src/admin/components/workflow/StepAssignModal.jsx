import React, { useState, useEffect } from 'react';
import { X, Send, User, Lock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';

export function StepAssignModal({ isOpen = true, caseDoc = {}, caseDid, caseNumber, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToDid, setAssignedToDid] = useState('');
  const [selectedDocDids, setSelectedDocDids] = useState([]);
  const [users, setUsers] = useState([]);
  const [vaultDocs, setVaultDocs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resolvedCaseDid = caseDoc?.did || caseDoc?._id || caseDid;
  const resolvedCaseNumber = caseDoc?.caseNumber || caseDoc?.fileNumber || caseNumber || 'CASE-FILE';

  useEffect(() => {
    if (!isOpen) return;

    // Fetch users for assignment
    apiClient.get('/api/v1/admin/users?limit=100').then((res) => {
      const data = res.data?.data || res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    }).catch(() => setUsers([]));

    // Vault docs
    if (caseDoc?.clientDid) {
      apiClient.get(`/api/v1/client/docs?clientDid=${caseDoc.clientDid}`).then((res) => {
        const docs = res.data?.data || res.data || [];
        setVaultDocs(Array.isArray(docs) ? docs : []);
      }).catch(() => setVaultDocs([]));
    }
  }, [isOpen, caseDoc]);

  if (!isOpen) return null;

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

    setSubmitting(true);
    try {
      await apiClient.post('/api/v1/admin/cases/assign-step', {
        caseDid: resolvedCaseDid,
        title,
        description,
        assignedToDid,
        allowedDocumentDids: selectedDocDids,
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
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-400">Case: {resolvedCaseNumber}</span>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mt-0.5">
              <Send className="w-4 h-4 text-sky-400" />
              Assign New Workflow Step
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Step Title / Task Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Online Submission at Greece Embassy Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Assign To Staff Member *</label>
            <select
              required
              value={assignedToDid}
              onChange={(e) => setAssignedToDid(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="">— Select Staff Member —</option>
              {users.map((u) => (
                <option key={u.did || u._id} value={u.did || u._id}>
                  {u.name} ({u.role}) — {u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Task Instructions / Description</label>
            <textarea
              rows={2}
              placeholder="Detailed instructions for the staff..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none resize-none"
            />
          </div>

          {/* Document Access Restrictions (allowedDocumentDids) */}
          <div className="space-y-2 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Permitted Documents ({selectedDocDids.length} selected)
              </label>
              <span className="text-[10px] text-muted-foreground">Select documents staff can view</span>
            </div>

            {vaultDocs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No document vault files uploaded for this client yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {vaultDocs.map((doc) => {
                  const docDid = doc.did || doc._id;
                  const isChecked = selectedDocDids.includes(docDid);
                  return (
                    <div
                      key={docDid}
                      onClick={() => toggleDocSelect(docDid)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 font-semibold'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{doc.documentName || doc.fileName}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-border text-sky-500 focus:ring-sky-400"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-3 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Assign Task Step
          </button>
        </div>
      </form>
    </div>
  );
}
