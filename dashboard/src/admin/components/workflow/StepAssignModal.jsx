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
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 -mx-6 -mt-6 p-6 bg-linear-to-r from-zinc-950 via-slate-950 to-black">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-400">Case: {resolvedCaseNumber}</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <Send className="w-4 h-4 text-sky-400" />
              Assign New Workflow Step
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500/80 shadow-xs transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-4 text-xs pt-1">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Step Title / Task Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Online Submission at Greece Embassy Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Assign To Staff Member *</label>
            <select
              required
              value={assignedToDid}
              onChange={(e) => setAssignedToDid(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="" className="bg-zinc-950 text-zinc-400">— Select Staff Member —</option>
              {users.map((u) => (
                <option key={u.did || u._id} value={u.did || u._id} className="bg-zinc-950 text-zinc-100">
                  {u.name} ({u.role}) — {u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Task Instructions / Description</label>
            <textarea
              rows={2}
              placeholder="Detailed instructions for the staff..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Document Access Restrictions (allowedDocumentDids) */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Permitted Documents ({selectedDocDids.length} selected)
              </label>
              <span className="text-[10px] text-zinc-400">Select documents staff can view</span>
            </div>

            {vaultDocs.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic">No document vault files uploaded for this client yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {vaultDocs.map((doc) => {
                  const docDid = doc.did || doc._id;
                  const isChecked = selectedDocDids.includes(docDid);
                  return (
                    <div
                      key={docDid}
                      onClick={() => toggleDocSelect(docDid)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
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
                        className="rounded border-zinc-700 text-sky-500 focus:ring-sky-400 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4 -mx-6 -mb-6 p-4 bg-zinc-950 flex items-center justify-end gap-2.5 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-300 border border-rose-500/40 hover:border-rose-500/80 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Assign Task Step</span>
          </button>
        </div>
      </form>
    </div>
  );
}
