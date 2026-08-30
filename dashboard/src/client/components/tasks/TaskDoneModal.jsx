import React, { useState } from 'react';
import { X, CheckCircle2, FileText, Loader2, Lock, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { Button } from '@/components/ui/button';

export function TaskDoneModal({ task, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.patch(`/api/v1/client/tasks/${task.did || task._id}/done`, {
        completionNotes: notes,
      });
      toast.success(`Task "${task.title}" marked as Done!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setSubmitting(false);
    }
  };

  const permittedDocs = task.permittedDocs || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-card border border-border rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl z-10 my-8 animate-in zoom-in-95 duration-150 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
              Step {task.stepNumber || 1} • {task.status?.replace('_', ' ')}
            </span>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              {task.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {task.description && (
          <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-foreground">
            <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Instructions & Scope
            </p>
            <p className="whitespace-pre-line leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Permitted Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-foreground" />
              Permitted Documents ({permittedDocs.length})
            </label>
            <span className="text-[10px] text-muted-foreground">Authorized for your role</span>
          </div>

          {permittedDocs.length === 0 ? (
            <div className="bg-muted/30 border border-border rounded-xl p-3 text-center text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground/60" />
              No restricted documents attached to this task.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {permittedDocs.map((doc, idx) => (
                <div
                  key={doc.did || doc._id || idx}
                  className="bg-muted/40 border border-border rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-foreground truncate">{doc.documentName || doc.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{doc.fileName || doc.did}</p>
                    </div>
                  </div>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-background hover:bg-muted border border-border text-foreground rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3 h-3" /> View
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Remarks */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">
            Completion Remarks / Notes *
          </label>
          <textarea
            required
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what work was completed for this step..."
            className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="border-t border-border pt-3 flex items-center justify-end gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Submit & Mark as Done
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TaskDoneModal;
