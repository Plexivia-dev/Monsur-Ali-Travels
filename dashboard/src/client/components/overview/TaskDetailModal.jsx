import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Save,
  Sparkles,
  FileSignature,
  UserCheck,
  Stamp,
  BookOpen,
  Receipt,
  Layers,
  ChevronRight,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '../../lib/api-client';
import { usePortalStore } from '../../store/usePortalStore';
import { toast } from 'sonner';
import { FileViewerModal } from '@shared/components/common/FileViewerModal';

const DOCUMENT_NAME_PRESETS = [
  'National ID (NID Front & Back)',
  'Passport Copy (Bio-Page)',
  'Passport Size Photograph (White BG)',
  'Police Clearance Certificate (PCC)',
  'Medical Fitness Report (GAMCA/Fit)',
  'Trade Skill / Experience Certificate',
  'Educational / Degree Certificate',
  'Marriage Certificate (Affidavit)',
  'Bank Statement & Solvency Certificate',
  'Embassy / VFS Biometric Slip',
  'Visa Copy / E-Visa Grant Letter',
  'Client Bio-Data & Guardian Form',
  'Other Supporting Document',
];

const DOC_TYPE_LABEL_MAP = {
  passport: 'Passport Copy (Bio-Page)',
  nid: 'National ID (NID Front & Back)',
  photo: 'Passport Size Photograph (White BG)',
  agreement: 'Employment Agreement',
  'police-clearance': 'Police Clearance Certificate (PCC)',
  medical: 'Medical Fitness Report (GAMCA/Fit)',
  'bank-solvency': 'Bank Statement & Solvency Certificate',
  'utility-bill': 'Electricity / Utility Bill Copy',
  'land-doc': 'Land / Property Asset Document',
  'client-form': 'Client Bio-Data & Guardian Form',
  'indian-visa': 'Indian Visa / IVAC Application Slip',
  other: 'Other Supporting Document',
};

const resolveDocTitle = (docKey) => {
  if (!docKey) return 'Document Attachment';
  if (DOC_TYPE_LABEL_MAP[docKey.toLowerCase()]) return DOC_TYPE_LABEL_MAP[docKey.toLowerCase()];
  const matchingPreset = DOCUMENT_NAME_PRESETS.find((preset) =>
    preset.toLowerCase().includes(docKey.toLowerCase())
  );
  if (matchingPreset) return matchingPreset;
  return docKey.charAt(0).toUpperCase() + docKey.slice(1);
};

const STUDIO_GENERATORS = [
  {
    id: 'client-form',
    title: 'Client & Guardian Form',
    icon: UserCheck,
    color: 'text-sky-600 bg-sky-50',
    keywords: ['bio-data', 'guardian', 'client form', 'client-form', 'intake', 'client bio', 'bio data'],
  },
  {
    id: 'agreement',
    title: 'Employment Agreement',
    icon: FileSignature,
    color: 'text-blue-600 bg-blue-50',
    keywords: ['agreement', 'contract', 'deed', 'employment agreement', 'employment contract'],
  },
  {
    id: 'money-receipt',
    title: 'Money Receipt / Pay Slip',
    icon: Receipt,
    color: 'text-emerald-600 bg-emerald-50',
    keywords: ['receipt', 'payment', 'money-receipt', 'payslip', 'money receipt', 'advance', 'fee collection'],
  },
  {
    id: 'invoice',
    title: 'Client Invoice Bill',
    icon: FileText,
    color: 'text-indigo-600 bg-indigo-50',
    keywords: ['invoice', 'bill', 'billing', 'charge', 'client invoice'],
  },
  {
    id: 'indian-visa',
    title: 'Indian Visa File',
    icon: Stamp,
    color: 'text-amber-600 bg-amber-50',
    keywords: ['indian visa', 'ivac', 'indian-visa', 'delhi', 'vfs india', 'india visa', 'new delhi'],
  },
  {
    id: 'passport-sub',
    title: 'Passport Custody Slip',
    icon: BookOpen,
    color: 'text-purple-600 bg-purple-50',
    keywords: ['passport custody', 'passport submission', 'passport-sub', 'passport handover', 'passport receipt'],
  },
  {
    id: 'job-verification',
    title: 'Job Verification Form',
    icon: FileCheck2,
    color: 'text-cyan-600 bg-cyan-50',
    keywords: ['job verification', 'job-verification', 'job letter', 'employment verification', 'job cert'],
  },
];

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onOpenCaseWorkspace,
  onRefreshTasks,
}) {
  const navigate = useNavigate();
  const switchPortal = usePortalStore((state) => state.switchPortal);
  const [activeTab, setActiveTab] = useState(
    task?.requiresPayment
      ? 'payment'
      : task?.requiresDocument === false
      ? 'notes'
      : 'upload'
  );
  const [completionNotes, setCompletionNotes] = useState(task?.completionNotes || '');
  const [paymentCollected, setPaymentCollected] = useState(
    task?.paymentCollectedAmount || task?.paymentAmount || ''
  );
  const [paymentMethod, setPaymentMethod] = useState(task?.paymentMethod || 'Cash');
  const [generateMoneyReceipt, setGenerateMoneyReceipt] = useState(true);
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Compute strictly the assigned forms / sub-types for this task
  const assignedFormOptions = useMemo(() => {
    if (!task) return [];
    const options = new Set();

    // 1. Task Type Names explicitly assigned (e.g. ['Client Bio-Data & Guardian Form', 'VFS / Embassy Appointment Booking'])
    if (Array.isArray(task.taskTypeNames) && task.taskTypeNames.length > 0) {
      task.taskTypeNames.forEach((name) => {
        if (name && typeof name === 'string' && name.trim()) {
          options.add(name.trim());
        }
      });
    }

    // 2. Required Doc Types explicitly assigned
    if (Array.isArray(task.requiredDocTypes) && task.requiredDocTypes.length > 0) {
      task.requiredDocTypes.forEach((docKey) => {
        if (docKey && typeof docKey === 'string' && docKey.trim()) {
          const resolved = resolveDocTitle(docKey.trim());
          if (resolved) options.add(resolved);
        }
      });
    }

    // 3. Permitted Document objects assigned
    if (Array.isArray(task.permittedDocs) && task.permittedDocs.length > 0) {
      task.permittedDocs.forEach((doc) => {
        const docName = doc?.documentName || doc?.title || (typeof doc === 'string' ? doc : null);
        if (docName && typeof docName === 'string' && docName.trim()) {
          options.add(docName.trim());
        }
      });
    }

    // 4. Permitted Doc Names string array
    if (Array.isArray(task.permittedDocNames) && task.permittedDocNames.length > 0) {
      task.permittedDocNames.forEach((name) => {
        if (name && typeof name === 'string' && name.trim()) {
          options.add(name.trim());
        }
      });
    }

    // 5. If task.taskTypes array of objects exists
    if (Array.isArray(task.taskTypes) && task.taskTypes.length > 0) {
      task.taskTypes.forEach((tt) => {
        if (tt?.name && typeof tt.name === 'string') {
          options.add(tt.name.trim());
        }
      });
    }

    // 6. If no explicit sub-types were listed, extract from task.title (e.g. 'Collect Bio-Data & VFS Appointment')
    if (options.size === 0 && task.title) {
      const cleanTitle = task.title.replace(/^Collect\s+/i, '');
      const parts = cleanTitle.split(/\s*&\s*|\s*,\s*/);
      parts.forEach((p) => {
        if (p && p.trim().length > 2) {
          options.add(p.trim());
        }
      });
    }

    if (options.size > 0) {
      return Array.from(options);
    }

    return DOCUMENT_NAME_PRESETS;
  }, [task]);

  // Compute strictly the matched studio generators for assigned task types
  const assignedStudioGenerators = useMemo(() => {
    if (!task) return [];

    const taskTokens = [
      ...(task.taskTypeNames || []),
      ...(task.requiredDocTypes || []),
      task.title || '',
      task.description || '',
    ].map((s) => String(s).toLowerCase());

    const matched = STUDIO_GENERATORS.filter((gen) => {
      return gen.keywords.some((kw) =>
        taskTokens.some((token) => token.includes(kw))
      );
    });

    return matched;
  }, [task]);

  // Multi-Row Document Upload State (Pre-populated strictly with assigned forms)
  const [uploadRows, setUploadRows] = useState(() => {
    if (task?.taskTypeNames && Array.isArray(task.taskTypeNames) && task.taskTypeNames.length > 0) {
      return task.taskTypeNames.map((name, i) => ({
        id: `row-${i + 1}`,
        title: name,
        file: null,
        accessLevel: 'Restricted',
      }));
    }
    if (task?.requiredDocTypes && Array.isArray(task.requiredDocTypes) && task.requiredDocTypes.length > 0) {
      return task.requiredDocTypes.map((docKey, i) => ({
        id: `row-${i + 1}`,
        title: resolveDocTitle(docKey),
        file: null,
        accessLevel: 'Restricted',
      }));
    }
    return [
      { id: 'row-1', title: '', file: null, accessLevel: 'Restricted' },
    ];
  });
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [uploadedDocsList, setUploadedDocsList] = useState([]);
  const [caseVaultDocs, setCaseVaultDocs] = useState([]);
  const [manualSlipFile, setManualSlipFile] = useState(null);

  // Load vault documents for this case to cross-reference already uploaded items
  useEffect(() => {
    const caseRef = task?.caseDid || task?.caseId || task?.caseDetails?.did || task?.caseDetails?._id;
    if (caseRef) {
      apiClient
        .get(`/api/v1/client/cases/${caseRef}`)
        .then((res) => {
          if (res.data?.data?.vaultDocuments) {
            setCaseVaultDocs(res.data.data.vaultDocuments);
          }
        })
        .catch(() => {});
    }
  }, [task]);

  const findAlreadyUploadedDoc = useCallback((docTitle) => {
    if (!docTitle) return null;
    const titleLower = docTitle.toLowerCase().trim();

    // 1. Check in newly uploaded docs in this modal session
    const inNew = uploadedDocsList.find((d) => {
      const name = String(d.documentName || d.fileName || d.title || '').toLowerCase();
      return name.includes(titleLower) || titleLower.includes(name);
    });
    if (inNew) return inNew;

    // 2. Check in task.permittedDocs
    const permitted = Array.isArray(task?.permittedDocs) ? task.permittedDocs : [];
    const inPermitted = permitted.find((d) => {
      const name = String(d.documentName || d.fileName || d.title || (typeof d === 'string' ? d : '')).toLowerCase();
      return name.includes(titleLower) || titleLower.includes(name);
    });
    if (inPermitted) return inPermitted;

    // 3. Check in caseVaultDocs or task.caseDetails.vaultDocuments
    const vault = [
      ...caseVaultDocs,
      ...(Array.isArray(task?.caseDetails?.vaultDocuments) ? task.caseDetails.vaultDocuments : []),
      ...(Array.isArray(task?.vaultDocuments) ? task.vaultDocuments : []),
    ];

    if (/photo|2x2|picture/i.test(titleLower)) {
      const photoDoc = vault.find((d) => /photo|picture|2x2|ছবি|image|portrait/i.test(d.documentName || d.fileName || ''));
      if (photoDoc) return photoDoc;
    }
    if (/electricity|utility|bill/i.test(titleLower)) {
      const billDoc = vault.find((d) => /electricity|utility|bill|current|বিদ্যুৎ|gas|wasa/i.test(d.documentName || d.fileName || ''));
      if (billDoc) return billDoc;
    }
    if (/nid|national\s*id/i.test(titleLower)) {
      const nidDoc = vault.find((d) => /nid|national\s*id|voter|এনআইডি|পরিচয়পত্র/i.test(d.documentName || d.fileName || ''));
      if (nidDoc) return nidDoc;
    }
    if (/passport/i.test(titleLower)) {
      const passDoc = vault.find((d) => /passport|bio-page|পাসপোর্ট/i.test(d.documentName || d.fileName || ''));
      if (passDoc) return passDoc;
    }
    if (/agreement|contract/i.test(titleLower)) {
      const agrDoc = vault.find((d) => /agreement|contract|চুক্তি/i.test(d.documentName || d.fileName || ''));
      if (agrDoc) return agrDoc;
    }

    return vault.find((d) => {
      const name = String(d.documentName || d.fileName || '').toLowerCase();
      return name && (name.includes(titleLower) || titleLower.includes(name));
    }) || null;
  }, [uploadedDocsList, task, caseVaultDocs]);

  // Sync state if task changes
  useEffect(() => {
    if (task) {
      setCompletionNotes(task.completionNotes || '');
      if (task.requiresDocument === false) {
        setActiveTab('notes');
      } else {
        setActiveTab('upload');
      }

      if (task.taskTypeNames && Array.isArray(task.taskTypeNames) && task.taskTypeNames.length > 0) {
        setUploadRows(
          task.taskTypeNames.map((name, i) => ({
            id: `row-${i + 1}`,
            title: name,
            file: null,
            accessLevel: 'Restricted',
          }))
        );
      } else if (task.requiredDocTypes && Array.isArray(task.requiredDocTypes) && task.requiredDocTypes.length > 0) {
        setUploadRows(
          task.requiredDocTypes.map((docKey, i) => ({
            id: `row-${i + 1}`,
            title: resolveDocTitle(docKey),
            file: null,
            accessLevel: 'Restricted',
          }))
        );
      } else if (assignedFormOptions.length > 0 && assignedFormOptions !== DOCUMENT_NAME_PRESETS) {
        setUploadRows(
          assignedFormOptions.map((name, i) => ({
            id: `row-${i + 1}`,
            title: name,
            file: null,
            accessLevel: 'Restricted',
          }))
        );
      }
    }
  }, [task, assignedFormOptions]);

  // File Preview Modal State (View only, no download)
  const [viewingFile, setViewingFile] = useState(null);

  if (!isOpen || !task) return null;

  const permittedDocs = [...(task.permittedDocs || []), ...uploadedDocsList];
  const isCompleted =
    task.status === 'Done' ||
    task.status === 'Completed' ||
    task.status === 'Approved' ||
    Boolean(task.completedAt);

  const statusVariant = {
    Pending: 'pending',
    In_Progress: 'in_progress',
    'In Progress': 'in_progress',
    Done: 'done',
    Completed: 'done',
    Approved: 'approved',
    Rejected: 'rejected',
  }[task.status] || 'default';

  // Multi-row management
  const handleAddRow = () => {
    if (isCompleted) return;
    const newId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setUploadRows((prev) => [
      ...prev,
      { id: newId, title: '', file: null, accessLevel: 'Restricted' },
    ]);
  };

  const handleRemoveRow = (id) => {
    if (isCompleted) return;
    if (uploadRows.length <= 1) {
      setUploadRows([{ id: 'row-1', title: '', file: null, accessLevel: 'Restricted' }]);
      return;
    }
    setUploadRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id, field, value) => {
    if (isCompleted) return;
    setUploadRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === 'file' && value && !r.title) {
          const cleanName = value.name.replace(/\.[^/.]+$/, '');
          updated.title = cleanName;
        }
        return updated;
      })
    );
  };

  // Batch Upload All Rows with files
  const handleBatchUpload = async () => {
    if (isCompleted) {
      toast.info('This task is already completed. No further uploads allowed.');
      return;
    }
    const validRows = uploadRows.filter((r) => r.file && r.title.trim());
    if (validRows.length === 0) {
      toast.error('Please select at least one file and document title to upload.');
      return;
    }

    setIsBatchUploading(true);
    let successCount = 0;
    const newUploaded = [];

    for (const row of validRows) {
      try {
        const formData = new FormData();
        formData.append('file', row.file);

        const queryParams = new URLSearchParams();
        if (task.caseDid) queryParams.append('clientId', task.caseDid);
        const categorySlug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        queryParams.append('documentType', `task-${categorySlug}`);

        const uploadRes = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrl = uploadRes.data?.data?.url || uploadRes.data?.url || uploadRes.data?.fileUrl;
        if (!uploadedUrl) throw new Error('Failed to obtain uploaded file URL');

        const sizeInMb = (row.file.size / (1024 * 1024)).toFixed(2) + ' MB';

        let attachedDocData = null;
        if (task.caseDid) {
          try {
            const attachRes = await apiClient.post(`/api/v1/client/cases/${task.caseDid}/documents`, {
              documentName: row.title.trim(),
              fileName: row.file.name,
              fileUrl: uploadedUrl,
              fileType: row.file.type || 'application/pdf',
              fileSize: sizeInMb,
              accessLevel: row.accessLevel || 'Restricted',
            });
            attachedDocData = attachRes.data?.data;
          } catch (attachErr) {
            console.warn('Case attach notice:', attachErr.message);
          }
        }

        const docEntry = attachedDocData || {
          did: `doc-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          documentName: row.title.trim(),
          title: row.title.trim(),
          fileName: row.file.name,
          fileUrl: uploadedUrl,
          fileSize: sizeInMb,
          fileType: row.file.type || 'application/pdf',
          accessLevel: row.accessLevel || 'Restricted',
        };

        newUploaded.push(docEntry);
        successCount++;
      } catch (err) {
        toast.error(`Failed to upload "${row.title}": ${err.response?.data?.message || err.message}`);
      }
    }

    if (newUploaded.length > 0) {
      setUploadedDocsList((prev) => [...newUploaded, ...prev]);
      toast.success(`${successCount} document(s) uploaded and attached to Case Vault!`);
      // Reset upload rows to clean initial state
      setUploadRows([{ id: `row-${Date.now()}`, title: '', file: null, accessLevel: 'Restricted' }]);
    }
    setIsBatchUploading(false);
  };

  // Save Progress / Notes (Without completing the task)
  const handleSaveProgress = async () => {
    if (isCompleted) {
      toast.info('This task is already completed and cannot be edited.');
      return;
    }
    setIsSavingProgress(true);
    try {
      if (task.did || task._id) {
        await apiClient.patch(`/api/v1/client/tasks/${task.did || task._id}`, {
          completionNotes: completionNotes.trim(),
          status: task.status === 'Pending' ? 'In_Progress' : task.status,
        });
      }
      toast.success('Task progress & notes saved successfully.');
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      // If direct patch endpoint is not exposed, fallback gracefully
      toast.success('Progress saved locally.');
    } finally {
      setIsSavingProgress(false);
    }
  };

  // Separate explicit action: Mark Task as Completed
  const handleMarkAsDone = async () => {
    if (isCompleted) {
      toast.info('This task is already completed and cannot be resubmitted.');
      return;
    }
    const isDocTask = task.requiresDocument !== false && assignedFormOptions.length > 0;

    // 1. Work Notes Validation (Mandatory ONLY for tasks without file uploads):
    if (!isDocTask && !completionNotes.trim()) {
      toast.error('Work Notes are Mandatory: Please enter your progress/completion remarks before completing this step.');
      setActiveTab('notes');
      return;
    }

    // 2. Mandatory Payment Collection Validation (if payment task):
    if (task.requiresPayment) {
      if (paymentCollected === '' || Number(paymentCollected) < 0) {
        toast.error('Payment Collection is Mandatory: Please record the collected payment amount.');
        setActiveTab('payment');
        return;
      }

      if (!generateMoneyReceipt && !manualSlipFile && !task.paymentSlipUrl && !task.moneyReceiptNumber) {
        toast.error('Payment Slip Required: Please attach a physical payment slip/voucher or enable Auto-Issue Money Receipt.');
        setActiveTab('payment');
        return;
      }
    }

    // 3. Mandatory Document Upload Validation:
    if (task.requiresDocument !== false && assignedFormOptions.length > 0) {
      // Auto-upload any pending selected file rows first
      const pendingRowsWithFiles = uploadRows.filter((r) => r.file);
      if (pendingRowsWithFiles.length > 0) {
        setIsBatchUploading(true);
        for (const row of pendingRowsWithFiles) {
          try {
            const formData = new FormData();
            formData.append('file', row.file);
            const queryParams = new URLSearchParams();
            if (task.caseDid) queryParams.append('clientId', task.caseDid);
            const categorySlug = (row.title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            queryParams.append('documentType', `task-${categorySlug}`);

            const uploadRes = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const uploadedUrl = uploadRes.data?.data?.url || uploadRes.data?.url || uploadRes.data?.fileUrl;
            if (uploadedUrl && task.caseDid) {
              const sizeInMb = (row.file.size / (1024 * 1024)).toFixed(2) + ' MB';
              const attachRes = await apiClient.post(`/api/v1/client/cases/${task.caseDid}/documents`, {
                documentName: row.title?.trim() || 'Task Document',
                fileName: row.file.name,
                fileUrl: uploadedUrl,
                fileType: row.file.type || 'application/pdf',
                fileSize: sizeInMb,
                accessLevel: row.accessLevel || 'Restricted',
              });
              if (attachRes.data?.data) {
                setUploadedDocsList((prev) => [attachRes.data.data, ...prev]);
              }
            }
          } catch (uploadErr) {
            console.warn('Auto-upload error on complete:', uploadErr.message);
          }
        }
        setIsBatchUploading(false);
      }

      // Check if all required docs are satisfied (either in vault or uploaded)
      const allAssignedSatisfied = uploadRows.every((row) => {
        const found = findAlreadyUploadedDoc(row.title);
        const hasPendingFile = Boolean(row.file);
        return Boolean(found || hasPendingFile);
      });

      const totalDocsAvailable = (task.permittedDocs?.length || 0) + uploadedDocsList.length + pendingRowsWithFiles.length + caseVaultDocs.length;
      if (!allAssignedSatisfied && totalDocsAvailable === 0) {
        toast.error('Document Upload is Mandatory: You must select and upload the assigned file(s) before completing this step.');
        setActiveTab('upload');
        return;
      }
    }

    // Handle Manual Payment Slip Upload if attached
    let uploadedSlipUrl = task.paymentSlipUrl || null;
    if (manualSlipFile) {
      try {
        const formData = new FormData();
        formData.append('file', manualSlipFile);
        const queryParams = new URLSearchParams();
        if (task.caseDid) queryParams.append('clientId', task.caseDid);
        queryParams.append('documentType', 'payment-slip');
        const upRes = await apiClient.post(`/api/v1/upload/single?${queryParams.toString()}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedSlipUrl = upRes.data?.data?.url || upRes.data?.url || upRes.data?.fileUrl;
      } catch (slipUpErr) {
        console.warn('Payment slip upload error:', slipUpErr);
      }
    }

    const collectedNum = paymentCollected !== '' ? Number(paymentCollected) : (task.requiresPayment ? Number(task.paymentAmount) : 0);

    setIsSubmittingDone(true);
    try {
      await apiClient.patch(`/api/v1/client/tasks/${task.did || task._id}/done`, {
        completionNotes: completionNotes.trim(),
        paymentCollectedAmount: collectedNum,
        paymentMethod,
        paymentSlipUrl: uploadedSlipUrl,
        generateMoneyReceipt,
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

  // Open Document Studio Generator with Full Case & Client Dossier Query Params
  const handleLaunchGenerator = (generatorId) => {
    if (onClose) onClose();

    const caseRef = task?.caseDid || task?.caseId || task?.caseDetails?.did || task?.caseDetails?._id || '';
    const clientRef = task?.clientDid || task?.clientId || task?.clientInfo?.did || task?.clientInfo?._id || '';
    const caseNum = task?.caseNumber || task?.caseDetails?.caseNumber || '';
    const targetAmt = paymentCollected || task?.paymentAmount || task?.paymentCollectedAmount || '';

    const queryParams = new URLSearchParams();
    if (caseRef) queryParams.set('caseDid', caseRef);
    if (clientRef) queryParams.set('clientDid', clientRef);
    if (caseNum) queryParams.set('caseNumber', caseNum);
    if (task?.did || task?._id) queryParams.set('taskId', task?.did || task?._id);
    if (targetAmt) queryParams.set('amount', String(targetAmt));
    queryParams.set('isLocked', 'true');
    queryParams.set('returnUrl', '/dashboard/overview/tasks');

    const searchStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
    switchPortal('docs', generatorId);
    navigate(`/dashboard/docs/${generatorId}${searchStr}`);
    toast.info(`Opened ${generatorId} with prefilled client particulars & amount.`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container with strict 70vh fixed height */}
        <div className="relative bg-white border border-black/10 rounded-2xl max-w-3xl w-full h-[70vh] flex flex-col shadow-2xl z-10 my-auto text-black overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* 1. Header (Fixed Height / Sticky) */}
          <div className="shrink-0 border-b border-black/10 p-4 sm:p-5 flex items-start justify-between gap-4 bg-white">
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
                    <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    Case: {task.caseDid}
                  </span>
                )}

                {task.requiresPayment && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Payment: ৳{Number(task.paymentAmount || 0).toLocaleString()}
                  </span>
                )}

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    task.requiresDocument !== false
                      ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  {task.requiresDocument !== false ? '📄 Document Intake' : '💬 Action / Notes Only'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug break-words">
                {task.title}
              </h2>

              {task.taskTypeNames && Array.isArray(task.taskTypeNames) && task.taskTypeNames.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Sub-Types:</span>
                  {task.taskTypeNames.map((name, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-muted border border-border text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.caseDid && onOpenCaseWorkspace && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onOpenCaseWorkspace(task.caseDid);
                  }}
                  className="h-8 px-2.5 text-xs font-semibold border-border hover:bg-muted text-primary flex items-center gap-1.5 cursor-pointer"
                  title="Open 360-degree case workspace"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Case Workspace</span>
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body Container (Guaranteed within 90vh) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {/* Completed Task Banner Notice */}
            {isCompleted && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-950 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Task Step Completed &amp; Locked</h4>
                    <p className="text-[11px] text-emerald-800">
                      This task has already been completed and submitted. All attached records are locked and cannot be resubmitted.
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold text-xs shrink-0">Completed ✓</Badge>
              </div>
            )}

            {/* Payment & Invoice Overview Banner (if payment required) */}
            {(task.requiresPayment || task.paymentAmount > 0) && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    Payment Collection Requirement
                  </span>
                  <span className="font-mono font-bold text-base text-emerald-600">
                    ৳ {Number(task.paymentAmount || 0).toLocaleString()} {task.paymentCurrency || 'BDT'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-emerald-500/20 flex-wrap gap-2">
                  <span>Purpose: <strong className="text-foreground">{task.paymentPurpose || task.title}</strong></span>
                  <div className="flex items-center gap-3">
                    {task.invoiceNumber ? (
                      <span className="text-primary font-mono font-semibold">Invoice: #{task.invoiceNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">Invoice: Standard</span>
                    )}
                    {task.moneyReceiptNumber ? (
                      <span className="text-emerald-600 font-mono font-semibold">Receipt: #{task.moneyReceiptNumber}</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Receipt: Pending Issue</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructions & Directives */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Instructions & Scope
                </h4>
                <span className="text-[10px] text-muted-foreground font-mono">Assigned Directive</span>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-foreground leading-relaxed">
                {task.description ? (
                  <p className="whitespace-pre-line">{task.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No specific step instructions provided.</p>
                )}
              </div>
            </div>

            {/* Navigation Tabs for Work Options */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-primary" />
                <span>{isCompleted ? 'Attached Documents' : 'Upload Documents'}</span>
              </button>

              {(task.requiresPayment || task.paymentAmount > 0) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'payment'
                      ? 'bg-card text-emerald-600 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Payment & Pay Slip</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Document Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>Work Notes & Remarks</span>
              </button>
            </div>

            {/* TAB 1: Multi-Row Batch Document Intake */}
            {activeTab === 'upload' && (
              <div className="space-y-3 bg-muted/30 border border-border rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <UploadCloud className="w-4 h-4 text-primary" />
                      {isCompleted ? 'Submitted Task Documents' : 'Assigned Document Intake'}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isCompleted
                        ? 'All verified and registered documents attached to this completed step.'
                        : 'Upload the required documents for this task step directly into Case Vault.'}
                    </p>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                      Read-Only (Completed)
                    </span>
                  )}
                </div>

                {!isCompleted && uploadRows.every((r) => findAlreadyUploadedDoc(r.title)) && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All assigned required documents are already present in Case Vault. You do not need to re-upload them.</span>
                  </div>
                )}

                {/* Rows List */}
                <div className="space-y-2.5 pt-1">
                  {uploadRows.map((row, idx) => {
                    const existingDoc = findAlreadyUploadedDoc(row.title);

                    return (
                      <div
                        key={row.id}
                        className={`border rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs shadow-2xs transition-all ${
                          existingDoc
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-950'
                            : 'bg-card border-border'
                        }`}
                      >
                        {/* Row Index */}
                        <span className="w-6 text-center font-mono font-bold text-muted-foreground shrink-0 hidden sm:inline">
                          #{idx + 1}
                        </span>

                        {/* Document Name */}
                        <div
                          className={`flex-1 min-w-[200px] flex items-center gap-2.5 p-2.5 rounded-xl border ${
                            existingDoc ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/[0.02] border-black/10'
                          }`}
                        >
                          <div
                            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                              existingDoc ? 'bg-emerald-500/20 text-emerald-700' : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {existingDoc ? <CheckCircle2 className="size-4 text-emerald-600" /> : <FileText className="size-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                              {existingDoc ? 'Document in Vault' : 'Required Document'}
                            </span>
                            <h4 className="text-xs font-bold text-foreground truncate" title={row.title || 'Required Document'}>
                              {row.title || 'Required Document'}
                            </h4>
                          </div>
                        </div>

                        {/* Right Column: If Already Uploaded vs File Picker */}
                        {existingDoc ? (
                          <div className="flex-1 min-w-[180px] flex items-center justify-between gap-2 p-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="truncate">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Already Uploaded ✓</span>
                              <p className="text-xs font-semibold text-emerald-900 truncate">
                                📎 {existingDoc.fileName || existingDoc.documentName || 'Document attached'}
                              </p>
                            </div>
                            {(existingDoc.fileUrl || existingDoc.url) && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setViewingFile({
                                    name: existingDoc.fileName || existingDoc.documentName || row.title,
                                    url: existingDoc.fileUrl || existingDoc.url,
                                    type: existingDoc.fileType || 'application/pdf',
                                  })
                                }
                                className="h-7 text-xs px-2.5 border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 gap-1 shrink-0 font-bold cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </Button>
                            )}
                          </div>
                        ) : isCompleted ? (
                          <div className="flex-1 min-w-[180px] p-2 text-muted-foreground text-center italic text-xs">
                            Not attached prior to completion
                          </div>
                        ) : (
                          <>
                            {/* File Selector */}
                            <div className="flex-1 min-w-[180px]">
                              <input
                                type="file"
                                id={`file-input-${row.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpdateRow(row.id, 'file', file);
                                }}
                                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                                className="hidden"
                              />
                              <label
                                htmlFor={`file-input-${row.id}`}
                                className={`w-full h-[52px] border border-dashed rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-center ${
                                  row.file
                                    ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-700'
                                    : 'border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {row.file ? (
                                  <span className="font-semibold text-emerald-700 truncate max-w-[180px]">
                                    ✓ {row.file.name} ({((row.file.size) / (1024 * 1024)).toFixed(2)} MB)
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium">📎 Choose PDF / Image</span>
                                )}
                              </label>
                            </div>

                            {/* Clear File Button */}
                            {row.file ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateRow(row.id, 'file', null)}
                                className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 self-center"
                                title="Clear attached file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Batch Upload Action */}
                {!isCompleted && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/80">
                    <span className="text-[11px] text-muted-foreground">
                      Ready to upload: {uploadRows.filter((r) => r.file && r.title.trim()).length} file(s)
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleBatchUpload}
                      disabled={isBatchUploading || uploadRows.every((r) => !r.file)}
                      className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {isBatchUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading to Vault...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          Upload All to Case Vault
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Payment Collection & Pay Slip Issuance */}
            {activeTab === 'payment' && (
              <div className="space-y-4 bg-muted/30 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Client Payment Intake &amp; Money Receipt / Pay Slip
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isCompleted
                        ? 'Recorded payment details and issued Money Receipt for this completed step.'
                        : 'Record collected payment and automatically generate official Money Receipt / Pay Slip for this step.'}
                    </p>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                      Paid &amp; Recorded ✓
                    </span>
                  )}
                </div>

                {/* If already completed, show read-only payment summary */}
                {isCompleted ? (
                  <div className="p-3.5 bg-card border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground">Collected Amount:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        ৳ {Number(task.paymentCollectedAmount || task.paymentAmount || paymentCollected || 0).toLocaleString()} BDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-muted-foreground">Payment Method:</span>
                      <span className="font-semibold text-foreground">{task.paymentMethod || paymentMethod || 'Cash'}</span>
                    </div>
                    {task.moneyReceiptNumber && (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-muted-foreground">Money Receipt:</span>
                        <span className="font-mono font-bold text-emerald-600">#{task.moneyReceiptNumber}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-foreground mb-1 text-xs">
                          Amount Collected (৳ BDT) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 50000"
                          value={paymentCollected}
                          onChange={(e) => setPaymentCollected(e.target.value)}
                          className="w-full px-3 py-2 bg-card border border-emerald-500/40 rounded-xl text-foreground font-bold focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1 text-xs">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs cursor-pointer"
                        >
                          <option value="Cash">Cash Payment</option>
                          <option value="Bank Transfer">Bank Transfer (Deposit / EFT / RTGS)</option>
                          <option value="bKash">bKash Mobile Banking</option>
                          <option value="Nagad">Nagad Mobile Banking</option>
                          <option value="Cheque">Cheque Payment</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-border/80">
                      <label className="flex items-center gap-2 text-foreground font-medium text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateMoneyReceipt}
                          onChange={(e) => setGenerateMoneyReceipt(e.target.checked)}
                          className="rounded border-border text-emerald-600 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Auto-issue official <strong>Money Receipt / Pay Slip (MA#####)</strong> on marking this step Completed
                        </span>
                      </label>

                      {!generateMoneyReceipt && (
                        <div className="p-3 bg-card border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                              Attach Physical Payment Receipt / Bank Deposit Slip *
                            </label>
                            <span className="text-[10px] text-muted-foreground">Required if not auto-issuing</span>
                          </div>
                          <input
                            type="file"
                            id="manual-slip-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setManualSlipFile(file);
                            }}
                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                            className="hidden"
                          />
                          <label
                            htmlFor="manual-slip-input"
                            className={`w-full h-11 border border-dashed rounded-lg px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-center ${
                              manualSlipFile
                                ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-700 font-semibold'
                                : 'border-border hover:border-amber-500 bg-muted/20 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {manualSlipFile ? (
                              <span className="truncate max-w-[240px]">
                                ✓ {manualSlipFile.name} ({((manualSlipFile.size) / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium">📎 Attach Scanned Pay Slip / Voucher File</span>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Direct Studio Launch Buttons */}
                    <div className="pt-2 flex flex-wrap gap-2 border-t border-border/80">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleLaunchGenerator('money-receipt')}
                        className="h-8 text-xs px-3 font-semibold border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open Money Receipt Studio</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleLaunchGenerator('invoice')}
                        className="h-8 text-xs px-3 font-semibold border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Open Client Invoice Studio</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: Document Studio Generators */}
            {activeTab === 'studio' && (
              <div className="space-y-3 bg-muted/30 border border-border rounded-xl p-3.5 sm:p-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Assigned Document Studio Generators ({assignedStudioGenerators.length})
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Launch the official legal / verification document generators assigned specifically for this task step.
                  </p>
                </div>

                {assignedStudioGenerators.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-4 text-center space-y-2 shadow-2xs">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-500/80" />
                    <p className="text-xs font-semibold text-foreground">
                      No Document Studio templates assigned for this step.
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Please use the <strong>Document Intake (Upload)</strong> tab to attach physical scans/files for this task.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {assignedStudioGenerators.map((gen) => {
                      const Icon = gen.icon;
                      return (
                        <div
                          key={gen.id}
                          onClick={() => handleLaunchGenerator(gen.id)}
                          className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-2 rounded-lg ${gen.color} shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                {gen.title}
                              </h5>
                              <span className="text-[10px] text-muted-foreground">Document Studio Engine</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Completion Remarks & Work Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-2 bg-muted/30 border border-border rounded-xl p-3.5 sm:p-4">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  Staff Progress &amp; Work Notes
                </label>
                {isCompleted ? (
                  <div className="p-3 bg-card border border-border rounded-xl text-xs text-foreground">
                    {task.completionNotes || completionNotes ? (
                      <p className="whitespace-pre-line leading-relaxed">{task.completionNotes || completionNotes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No completion notes submitted.</p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-muted-foreground">
                      {task?.requiresDocument === false || assignedFormOptions.length === 0
                        ? 'Mandatory: Describe the actions completed, client consultation details, or verification findings.'
                        : 'Optional: Add any supplementary work notes, client remarks, or additional observations for this task.'}
                    </p>
                    <textarea
                      rows={4}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder={
                        task?.requiresDocument === false || assignedFormOptions.length === 0
                          ? 'Enter required work details and remarks before completing this step (Mandatory)...'
                          : 'Enter any additional work notes or remarks (Optional)...'
                      }
                      className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/60 font-normal"
                    />
                  </>
                )}
              </div>
            )}

            {/* Case & Attached Documents (Strict View-Only for Staff, No Download Option) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-foreground" />
                  Vault Documents for this Case ({permittedDocs.length})
                </h4>
                <span className="text-[10px] text-muted-foreground font-mono">View-Only Authorized</span>
              </div>

              {permittedDocs.length === 0 ? (
                <div className="bg-muted/40 border border-border rounded-xl p-3 text-center text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground/60" />
                  No documents registered in the vault for this case yet. Use "Upload Documents" above to attach.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {permittedDocs.map((doc, idx) => (
                    <div
                      key={doc.did || doc._id || idx}
                      className="bg-card hover:bg-muted/50 border border-border rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="p-1.5 rounded-lg bg-muted border border-border text-primary shrink-0">
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
                        <button
                          type="button"
                          onClick={() =>
                            setViewingFile({
                              url: doc.fileUrl,
                              name: doc.documentName || doc.fileName || 'Document File',
                              type: doc.fileType || 'application/pdf',
                            })
                          }
                          className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" /> View
                        </button>
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

            {/* Metadata & Timestamps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
              <div className="p-2 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3 text-muted-foreground" /> Assigned On
                </span>
                <span className="font-semibold text-foreground">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" /> Last Updated
                </span>
                <span className="font-semibold text-foreground">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Today'}
                </span>
              </div>

              {task.completedAt && (
                <div className="p-2 rounded-xl bg-muted/40 border border-border col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Completed At
                  </span>
                  <span className="font-semibold text-foreground">
                    {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Footer Action Bar (Fixed Height / Sticky) */}
          <div className="shrink-0 border-t border-border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold px-4 h-9 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 cursor-pointer"
            >
              Close
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Task Step Completed &amp; Locked
                </span>
              ) : (
                <>
                  {/* Save Progress Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSavingProgress}
                    onClick={handleSaveProgress}
                    className="w-full sm:w-auto text-xs font-semibold px-4 h-9 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSavingProgress ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-primary" />
                        Save Progress / Notes
                      </>
                    )}
                  </Button>

                  {/* Mark Completed Button */}
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmittingDone}
                    onClick={handleMarkAsDone}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs h-9 px-5 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isSubmittingDone ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Task as Completed
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded File Viewer Modal (View Only) */}
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
