import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Eye,
  Calendar,
  FolderOpen,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function TaskDetailModal({ task, isOpen, onClose, onMarkDone }) {
  if (!isOpen || !task) return null;

  const permittedDocs = task.permittedDocs || [];
  const statusVariant = {
    Pending: 'pending',
    In_Progress: 'in_progress',
    'In Progress': 'in_progress',
    Done: 'done',
    Approved: 'approved',
    Rejected: 'rejected',
  }[task.status] || 'default';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl z-10 my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4 gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-foreground border border-border">
                Step {task.stepNumber || 1}
              </span>
              <Badge variant={statusVariant} className="font-semibold text-xs capitalize">
                {task.status?.replace('_', ' ')}
              </Badge>
              {task.caseDid && (
                <span className="text-xs font-mono text-foreground flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-border">
                  <FolderOpen className="w-3 h-3 text-muted-foreground" />
                  Case: {task.caseDid}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground leading-snug break-words">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Description & Instructions */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Instructions & Scope
          </h4>
          <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3.5 text-xs text-foreground leading-relaxed">
            {task.description ? (
              <p className="whitespace-pre-line">{task.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No detailed instructions specified for this step.</p>
            )}
          </div>
        </div>

        {/* Permitted Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-foreground" />
              Permitted Documents ({permittedDocs.length})
            </h4>
            <span className="text-[11px] text-muted-foreground">Authorized for your role</span>
          </div>

          {permittedDocs.length === 0 ? (
            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3 text-center text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground/60" />
              No restricted documents attached to this task.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {permittedDocs.map((doc, idx) => (
                <div
                  key={doc.did || doc._id || idx}
                  className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-border rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 border border-border text-foreground shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {doc.documentName || doc.title || 'Document File'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {doc.fileName || doc.did || 'Verified Record'}
                      </p>
                    </div>
                  </div>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-border">
                      Attached
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Notes / Remarks (if completed) */}
        {task.completionNotes && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Completion Remarks
            </h4>
            <div className="bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3 text-xs text-foreground">
              <p className="whitespace-pre-line">{task.completionNotes}</p>
            </div>
          </div>
        )}

        {/* Metadata & Timestamps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border text-xs">
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" /> Assigned On
            </span>
            <span className="font-semibold text-foreground">
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-muted-foreground" /> Status Updated
            </span>
            <span className="font-semibold text-foreground">
              {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Today'}
            </span>
          </div>

          {task.completedAt && (
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mb-0.5">
                <CheckCircle2 className="w-3 h-3" /> Completed At
              </span>
              <span className="font-semibold text-foreground">
                {new Date(task.completedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold px-4 h-9 border-border hover:bg-black/5 dark:hover:bg-white/10 text-foreground"
          >
            Close
          </Button>

          {task.status !== 'Done' && task.status !== 'Approved' && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                if (onMarkDone) onMarkDone(task);
              }}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
