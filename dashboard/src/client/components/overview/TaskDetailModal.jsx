import React, { useState, useRef } from 'react';
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
  UploadCloud,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Download,
  FilePlus2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';
import { FileViewerModal } from '@shared/components/common/FileViewerModal';

const DOCUMENT_NAME_PRESETS = [
  'Passport Copy (Bio-Page)',
  'National ID (NID Front & Back)',
  'Passport Size Photograph',
  'Police Clearance Certificate (PCC)',
  'Medical Fitness Report (GAMCA/Fit)',
  'Trade Skill / Experience Certificate',
  'Educational / Degree Certificate',
  'Marriage Certificate (Affidavit)',
  'Bank Statement & Solvency Certificate',
  'Embassy / VFS Biometric Slip',
  'Visa Copy / E-Visa Grant Letter',
  'Other Supporting Document',
];

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onMarkDone,
  onOpenCaseWorkspace,
  onRefreshTasks,
}) {
  const [completionNotes, setCompletionNotes] = useState(task?.completionNotes || '');
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  // Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [accessLevel, setAccessLevel] = useState('Restricted');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocsList, setUploadedDocsList] = useState([]);
  const fileInputRef = useRef(null);

  // File Preview Modal State
  const [viewingFile, setViewingFile] = useState(null);

  if (!isOpen || !task) return null;

  const permittedDocs = [...(task.permittedDocs || []), ...uploadedDocsList];
  const isCompleted = task.status === 'Done' || task.status === 'Approved';

  const statusVariant = {
    Pending: 'pending',
    In_Progress: 'in_progress',
    'In Progress': 'in_progress',
    Done: 'done',
    Approved: 'approved',
    Rejected: 'rejected',
  }[task.status] || 'default';

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }

    setSelectedFile(file);
    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setDocTitle(cleanName);
    }
  };

  // Upload Document to Server Storage & Attach to Case Vault
  const handleUploadDocument = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!docTitle.trim()) {
      toast.error('Please enter a document title.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const queryParams = new URLSearchParams();
      if (task.caseDid) queryParams.append('clientId', task.caseDid);
      const categorySlug = docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      queryParams.append('documentType', `task-${categorySlug}`);

      const uploadRes = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = uploadRes.data?.data?.url || uploadRes.data?.url || uploadRes.data?.fileUrl;
      if (!uploadedUrl) {
        throw new Error(uploadRes.data?.message || 'File upload failed');
      }

      const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';

      let attachedDocData = null;
      if (task.caseDid) {
        try {
          const attachRes = await apiClient.post(`/api/v1/client/cases/${task.caseDid}/documents`, {
            documentName: docTitle.trim(),
            fileName: selectedFile.name,
            fileUrl: uploadedUrl,
            fileType: selectedFile.type,
            fileSize: sizeInMb,
            accessLevel: accessLevel,
          });
          attachedDocData = attachRes.data?.data;
        } catch (attachErr) {
          console.warn('Case attach notice:', attachErr.message);
        }
      }

      const newDocEntry = attachedDocData || {
        did: `doc-local-${Date.now()}`,
        documentName: docTitle.trim(),
        title: docTitle.trim(),
        fileName: selectedFile.name,
        fileUrl: uploadedUrl,
        fileSize: sizeInMb,
        fileType: selectedFile.type,
        accessLevel: accessLevel,
      };

      setUploadedDocsList((prev) => [newDocEntry, ...prev]);
      toast.success(`Document "${docTitle}" uploaded and attached to case vault!`);

      setSelectedFile(null);
      setDocTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Task as Done
  const handleMarkAsDone = async () => {
    setIsSubmittingDone(true);
    try {
      await apiClient.patch(`/api/v1/client/tasks/${task.did || task._id}/done`, {
        completionNotes: completionNotes.trim() || 'Task completed with attached documents.',
      });

      toast.success(`Task "${task.title}" marked as Completed!`);
      if (onRefreshTasks) onRefreshTasks();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setIsSubmittingDone(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
        <div className="fixed inset-0" onClick={onClose} />
        
        <div className="relative bg-card border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl z-10 my-8 animate-in zoom-in-95 duration-150 text-foreground">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-4 gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                  Step {task.stepNumber || 1}
                </span>
                
                <Badge variant={statusVariant} className="font-semibold text-xs capitalize">
                  {task.status?.replace('_', ' ')}
                </Badge>

                {task.caseDid && (
                  <span className="text-xs font-mono text-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border">
                    <FolderOpen className="w-3 h-3 text-muted-foreground" />
                    Case: {task.caseDid}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug break-words">
                {task.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {task.caseDid && onOpenCaseWorkspace && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onOpenCaseWorkspace(task.caseDid);
                  }}
                  className="h-8 px-2.5 text-xs font-semibold border-border hover:bg-muted text-primary flex items-center gap-1.5"
                  title="Open 360-degree case workspace"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Case Workspace</span>
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instructions & Scope */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Instructions & Directives
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">From Management</span>
            </div>
            <div className="bg-muted/50 border border-border rounded-xl p-3.5 text-xs text-foreground leading-relaxed">
              {task.description ? (
                <p className="whitespace-pre-line">{task.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No detailed instructions specified for this step.</p>
              )}
            </div>
          </div>

          {/* Active Work Area: Direct Document Upload for this Task / Case */}
          <div className="space-y-3 bg-muted/30 border border-border rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <UploadCloud className="w-4 h-4 text-primary" />
                Upload Required Documents
              </h4>
              <span className="text-[11px] text-muted-foreground">Attached directly to Case Vault</span>
            </div>

            {/* Document Title & Preset Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Document Title *
                </label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Passport Bio-Data Scan"
                  className="h-8 text-xs bg-background border-border"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Choose from Preset
                </label>
                <select
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Select a common document type...</option>
                  {DOCUMENT_NAME_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Dropzone / Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                className="hidden"
                id="task-file-upload-input"
              />

              <label
                htmlFor="task-file-upload-input"
                className="flex-1 w-full border border-dashed border-border hover:border-primary/60 bg-background/80 hover:bg-background rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-muted-foreground hover:text-foreground"
              >
                <UploadCloud className="w-4 h-4 text-primary shrink-0" />
                {selectedFile ? (
                  <span className="font-semibold text-foreground truncate max-w-[260px]">
                    {selectedFile.name} ({((selectedFile.size) / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                ) : (
                  <span>Choose PDF / Image file (Max 15MB)</span>
                )}
              </label>

              <Button
                type="button"
                size="sm"
                onClick={handleUploadDocument}
                disabled={!selectedFile || isUploading}
                className="w-full sm:w-auto h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Upload & Attach
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Permitted & Attached Documents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-foreground" />
                Attached Case Documents ({permittedDocs.length})
              </h4>
              <span className="text-[11px] text-muted-foreground">Authorized for your role</span>
            </div>

            {permittedDocs.length === 0 ? (
              <div className="bg-muted/40 border border-border rounded-xl p-3 text-center text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground/60" />
                No documents attached to this step yet. Upload above to add.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {permittedDocs.map((doc, idx) => (
                  <div
                    key={doc.did || doc._id || idx}
                    className="bg-muted/40 hover:bg-muted/70 border border-border rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-1.5 rounded-lg bg-background border border-border text-primary shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {doc.documentName || doc.title || 'Document File'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {doc.fileName || doc.did || 'Verified Record'} • {doc.fileSize || 'Attached'}
                        </p>
                      </div>
                    </div>

                    {doc.fileUrl ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingFile({
                              url: doc.fileUrl,
                              name: doc.documentName || doc.fileName || 'Document File',
                              type: doc.fileType || 'application/pdf',
                            })
                          }
                          className="px-2.5 py-1 bg-background hover:bg-muted border border-border text-foreground rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" /> View
                        </button>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        Attached
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completion Remarks / Work Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Staff Completion Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              disabled={isCompleted}
              placeholder="Describe work completed, verification details, or token numbers..."
              className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Metadata & Timestamps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-muted-foreground" /> Assigned On
              </span>
              <span className="font-semibold text-foreground">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" /> Status Updated
              </span>
              <span className="font-semibold text-foreground">
                {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Today'}
              </span>
            </div>

            {task.completedAt && (
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Completed At
                </span>
                <span className="font-semibold text-foreground">
                  {new Date(task.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold px-4 h-9 border-border hover:bg-muted text-foreground"
            >
              Close
            </Button>

            {!isCompleted && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmittingDone}
                  onClick={handleMarkAsDone}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs h-9 px-5 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSubmittingDone ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit & Mark as Completed
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded File Viewer Modal */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}

export default TaskDetailModal;
