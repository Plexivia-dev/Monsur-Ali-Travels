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
  CreditCard,
  Receipt,
  DollarSign,
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

  // Payment & Invoicing State
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('BDT');
  const [paymentPurpose, setPaymentPurpose] = useState('');
  const [sendInvoiceToClient, setSendInvoiceToClient] = useState(true);
  const [requirePaySlip, setRequirePaySlip] = useState(true);

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
          setVaultDocs((prev) => [...prev, ...(Array.isArray(docs) ? docs : [])]);
        })
        .catch(() => {});
    }

    if (resolvedCaseDid) {
      apiClient
        .get(`/api/v1/admin/cases/${resolvedCaseDid}/full-details`)
        .then((res) => {
          if (res.data?.data?.vaultDocuments) {
            setVaultDocs((prev) => [...prev, ...res.data.data.vaultDocuments]);
          }
        })
        .catch(() => {
          apiClient.get(`/api/v1/client/cases/${resolvedCaseDid}`).then((altRes) => {
            if (altRes.data?.data?.vaultDocuments) {
              setVaultDocs((prev) => [...prev, ...altRes.data.data.vaultDocuments]);
            }
          }).catch(() => {});
        });
    }
  }, [isOpen, caseDoc, resolvedCaseDid]);

  if (!isOpen) return null;

  const isDocAlreadySubmitted = (tt) => {
    if (!tt) return false;
    const name = String(tt.name || tt.title || '').toLowerCase();
    const defaultDocType = String(tt.defaultDocumentType || '').toLowerCase();

    // 1. Check in all vault documents
    const allDocs = [
      ...(Array.isArray(vaultDocs) ? vaultDocs : []),
      ...(Array.isArray(caseDoc?.vaultDocuments) ? caseDoc.vaultDocuments : []),
      ...(Array.isArray(caseDoc?.documents) ? caseDoc.documents : []),
    ];

    // 2. Check in client attachments
    const clientAttachments = caseDoc?.clientInfo?.attachments || caseDoc?.attachments || {};

    if (/photo|picture|2x2|portrait/i.test(name) || defaultDocType === 'photo') {
      if (clientAttachments.photo) return true;
      if (allDocs.some((d) => /photo|picture|2x2|ছবি|image|portrait/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/passport|পাসপোর্ট/i.test(name) || defaultDocType === 'passport') {
      if (clientAttachments.passportScan || (caseDoc?.passportNumber && clientAttachments.passportScan)) return true;
      if (allDocs.some((d) => /passport|bio-page|পাসপোর্ট/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/nid|national\s*id|voter|এনআইডি|পরিচয়পত্র/i.test(name) || defaultDocType === 'nid') {
      if (clientAttachments.nidScan) return true;
      if (allDocs.some((d) => /nid|national\s*id|voter|এনআইডি|পরিচয়পত্র|identity/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/electricity|utility|bill|current|বিদ্যুৎ|gas|wasa/i.test(name) || defaultDocType === 'utility-bill') {
      if (allDocs.some((d) => /electricity|utility|bill|current|বিদ্যুৎ|gas|electric|wasa/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/land|property|দলিল|খতিয়ান|khatian|porcha|deed/i.test(name) || defaultDocType === 'land-doc') {
      if (allDocs.some((d) => /land|property|দলিল|খতিয়ান|khatian|porcha|deed|mutation/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/agreement|contract|চুক্তি/i.test(name) || defaultDocType === 'agreement') {
      if (allDocs.some((d) => /agreement|contract|চুক্তি/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/police|pcc|clearance/i.test(name) || defaultDocType === 'police-clearance') {
      if (allDocs.some((d) => /police|pcc|clearance/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/medical|gamca|fit/i.test(name) || defaultDocType === 'medical') {
      if (allDocs.some((d) => /medical|gamca|fit|health/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    if (/bank|solvency|statement/i.test(name) || defaultDocType === 'bank-solvency') {
      if (allDocs.some((d) => /bank|solvency|statement/i.test(d.documentName || d.fileName || d.name || ''))) return true;
    }

    // 3. Check previously completed workflow tasks in this case
    const tasks = Array.isArray(caseDoc?.workflowTasks) ? caseDoc.workflowTasks : [];
    const completedWithThis = tasks.some((t) => {
      const isCompleted = t.status === 'Done' || t.status === 'Approved';
      if (!isCompleted) return false;
      const typeNames = Array.isArray(t.taskTypeNames) ? t.taskTypeNames : [];
      const typeDids = Array.isArray(t.taskTypeDids) ? t.taskTypeDids : [];
      return typeDids.includes(tt.did) || typeNames.some((tn) => tn.toLowerCase() === name);
    });
    if (completedWithThis) return true;

    // 4. Direct title matching
    return allDocs.some((d) => {
      const docTitle = String(d.documentName || d.fileName || d.name || '').toLowerCase();
      return docTitle && (docTitle.includes(name) || name.includes(docTitle));
    });
  };

  const handleToggleTaskType = (tt) => {
    if (isDocAlreadySubmitted(tt)) {
      toast.info(`"${tt.name}" is already submitted in Case Vault.`);
      return;
    }

    const isSelected = selectedTaskTypeDids.includes(tt.did);
    const nextSelectedDids = isSelected
      ? selectedTaskTypeDids.filter((id) => id !== tt.did)
      : [...selectedTaskTypeDids, tt.did];

    setSelectedTaskTypeDids(nextSelectedDids);

    const selectedObjs = taskTypes.filter((t) => nextSelectedDids.includes(t.did));

    // Calculate whether any selected task type requires document
    const anyDocRequired = selectedObjs.some((t) => t.requiresDocument !== false);
    setRequiresDocument(anyDocRequired);

    // Auto-detect financial / payment category
    const hasFinancialTask = selectedObjs.some((t) => t.category === 'FINANCIAL');
    if (hasFinancialTask) {
      setRequiresPayment(true);
    }

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
        if (!paymentPurpose) setPaymentPurpose(names[0]);
      } else {
        setTitle(`Collect ${names.join(' & ')}`);
        if (!paymentPurpose) setPaymentPurpose(`Payment for ${names.join(' & ')}`);
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
        requiresPayment,
        paymentAmount: requiresPayment ? Number(paymentAmount) || 0 : 0,
        paymentCurrency,
        paymentPurpose: paymentPurpose || title,
        sendInvoiceToClient: requiresPayment && sendInvoiceToClient,
        requirePaySlip: requiresPayment && requirePaySlip,
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
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-black/10 text-black rounded-2xl max-w-xl w-full h-[70vh] flex flex-col shadow-2xl z-10 my-auto animate-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-black/10 p-4 sm:p-5 flex items-center justify-between bg-black/[0.02]">
          <div>
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
              Case: {resolvedCaseNumber} • Step {(caseDoc?.workflowTasks || []).length + 1}
            </span>
            <h3 className="text-base font-bold text-black flex items-center gap-2 mt-0.5">
              <Layers className="w-5 h-5 text-primary" />
              Assign Case Workflow Step
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
            title="Close"
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
                  const isAlreadySubmitted = isDocAlreadySubmitted(tt);

                  return (
                    <div
                      key={tt.did || tt._id}
                      onClick={() => handleToggleTaskType(tt)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isAlreadySubmitted
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-950 cursor-not-allowed opacity-80'
                          : isChecked
                          ? 'bg-primary/10 border-primary text-foreground font-bold shadow-2xs cursor-pointer'
                          : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer'
                      }`}
                      title={isAlreadySubmitted ? 'Already submitted in Case Vault' : ''}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAlreadySubmitted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <div className="truncate">
                          <p className={`truncate font-semibold ${isAlreadySubmitted ? 'text-emerald-950 font-bold' : ''}`}>
                            {tt.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-normal">
                            {isAlreadySubmitted
                              ? '✓ Document already present in Case Vault'
                              : tt.requiresDocument
                              ? '📄 Requires Document Upload'
                              : '💬 Mandatory Work Notes Only'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAlreadySubmitted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 uppercase">
                            Already Submitted ✓
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {tt.category?.replace(/_/g, ' ')}
                        </span>
                      </div>
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
                  ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
            >
              {requiresDocument ? 'File Intake' : 'Action Step'}
            </span>
          </div>

          {/* Section 4: Payment Intake, Client Invoicing & Pay Slip */}
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <label
                onClick={() => setRequiresPayment(!requiresPayment)}
                className="font-bold text-emerald-800 flex items-center gap-2 cursor-pointer select-none"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Require Client Payment / Service Fee Intake</span>
              </label>
              <input
                type="checkbox"
                checked={requiresPayment}
                onChange={(e) => setRequiresPayment(e.target.checked)}
                className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 h-4 w-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {requiresPayment && (
              <div className="space-y-3 pt-2 border-t border-emerald-500/20 text-xs animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Payment Amount (৳ BDT) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required={requiresPayment}
                      placeholder="e.g. 50000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-card border border-emerald-500/40 rounded-xl text-foreground font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Payment Purpose / Installment Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Booking Deposit / Embassy Fee"
                      value={paymentPurpose}
                      onChange={(e) => setPaymentPurpose(e.target.value)}
                      className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-foreground font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendInvoiceToClient}
                      onChange={(e) => setSendInvoiceToClient(e.target.checked)}
                      className="rounded border-border text-primary h-3.5 w-3.5 accent-primary cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      Auto-generate official <strong>Client Invoice (I-#####)</strong> and link to case
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-foreground font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirePaySlip}
                      onChange={(e) => setRequirePaySlip(e.target.checked)}
                      className="rounded border-border text-emerald-600 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Require staff to issue <strong>Money Receipt / Pay Slip (MA#####)</strong> on collection
                    </span>
                  </label>
                </div>
              </div>
            )}
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
        <div className="shrink-0 border-t border-black/10 p-4 sm:p-5 flex items-center justify-end gap-2 text-xs bg-black/[0.02]">
          <Button
            type="button"
            variant="cancel"
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
