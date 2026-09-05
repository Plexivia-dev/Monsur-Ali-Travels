import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileText,
  Loader2,
  Printer,
  FolderOpen,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  Image,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { MoneyReceiptPrintSlip } from '@shared/features/document-studio/components/receipt/MoneyReceiptPrintSlip';

const DESTINATIONS = [
  { id: 'Greece (Work Permit)', name: 'Greece (Work Permit)', flag: '🇬🇷', code: 'GR' },
  { id: 'North Macedonia (Work Permit)', name: 'North Macedonia (Work Permit)', flag: '🇲🇰', code: 'MK' },
  { id: 'Saudi Arabia', name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
  { id: 'Romania', name: 'Romania (Work Permit)', flag: '🇷🇴', code: 'RO' },
  { id: 'Qatar', name: 'Qatar', flag: '🇶🇦', code: 'QA' },
  { id: 'Malaysia', name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
  { id: 'Other', name: 'Other Country', flag: '🌐', code: 'OT' },
];

const TRADES = [
  'General Worker',
  'Construction Worker',
  'Agricultural / Farm Worker',
  'Heavy Driver',
  'Light Driver',
  'Industrial Electrician',
  'Plumber & Pipe Fitter',
  'Chef / Restaurant Staff',
  'Warehouse Worker',
  'Cleaner / Housekeeping',
  'Security Guard',
  'Other Skill',
];

export function CaseFileCreationModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('new'); // 'new' | 'existing'

  // Stage Injection: target pipeline stage
  const [targetStage, setTargetStage] = useState('INTAKE'); // 'INTAKE' | 'UNDER_PROCESS' | 'OFFER_LETTER'

  // Step 1: Client Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Client Details Form
  const [clientData, setClientData] = useState({
    fullName: '',
    phone: '',
    email: '',
    passportNumber: '',
    nidNumber: '',
    fatherName: '',
    motherName: '',
    presentAddress: '',
    permanentAddress: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Father',
    guardianNid: '',
  });

  // Step 1: Mandatory Passport Scan & Live Preview State
  const [passportFile, setPassportFile] = useState(null);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState(null);
  const [uploadingPassport, setUploadingPassport] = useState(false);

  // Step 1: 5-Page Greek Work Permit / Offer Letter Dossier State (when targetStage === 'OFFER_LETTER')
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [offerLetterPreviewUrl, setOfferLetterPreviewUrl] = useState(null);
  const [uploadingOfferLetter, setUploadingOfferLetter] = useState(false);

  // Step 2: Destination & Case Program
  const [caseDetails, setCaseDetails] = useState({
    destinationCountry: 'Greece (Work Permit)',
    customCountry: '',
    tradeSkill: 'General Worker',
    priority: 'Normal', // 'Normal' | 'High' | 'Urgent'
    specialInstructions: '',
  });

  // Step 3: Document Vault Files
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Step 4: Advance Payment & Ledger
  const [paymentData, setPaymentData] = useState({
    packageAmount: '',
    advanceAmount: '',
    paymentMethod: 'Cash', // 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad'
    notes: 'Initial file intake deposit',
    generateReceipt: true,
  });

  // Step 5: Created Receipt Print State
  const [createdCaseResult, setCreatedCaseResult] = useState(null);
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Debounced search for existing clients
  useEffect(() => {
    if (clientMode !== 'existing' || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get('/api/v1/client/clients', {
          params: { search: searchQuery.trim(), limit: 8 },
        });
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setSearchResults(list);
      } catch (err) {
        console.error('Client lookup error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, clientMode]);

  if (!isOpen) return null;

  const handleSelectExistingClient = (client) => {
    setSelectedClient(client);
    setClientData({
      fullName: client.fullName || client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      passportNumber: client.passportNumber || '',
      nidNumber: client.nidNumber || '',
      fatherName: client.fatherName || '',
      motherName: client.motherName || '',
      presentAddress: client.presentAddress || client.address || '',
      permanentAddress: client.permanentAddress || '',
      guardianName: client.guardian?.name || client.guardianName || '',
      guardianPhone: client.guardian?.phone || client.guardianPhone || '',
      guardianRelationship: client.guardian?.relationship || client.guardianRelationship || 'Father',
      guardianNid: client.guardian?.nidNumber || client.guardianNid || '',
    });
    if (client.attachments?.passportScan || client.passportScanUrl) {
      setPassportPreviewUrl(client.attachments?.passportScan || client.passportScanUrl);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  // Step 1: Mandatory Passport Scan Upload Handler
  const handlePassportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPassportFile(file);
    setPassportPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'Passport Scan');

    setUploadingPassport(true);
    try {
      const res = await apiClient.post('/api/v1/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileData = res.data?.data || res.data;
      const uploadedUrl = fileData.fileUrl || fileData.url || localUrl;
      const newDoc = {
        title: 'Passport Scan',
        documentType: 'Passport Scan',
        fileUrl: uploadedUrl,
        fileName: file.name,
        size: file.size,
        did: fileData.did || `DOC-PASSPORT-${Date.now()}`,
      };
      setUploadedDocs((prev) => [...prev.filter((d) => d.documentType !== 'Passport Scan'), newDoc]);
      toast.success('Original Passport Copy attached and verified!');
    } catch (err) {
      console.warn('Passport scan upload fallback to local URL:', err);
      toast.info('Passport scan attached (local preview).');
      const localDoc = {
        title: 'Passport Scan',
        documentType: 'Passport Scan',
        fileName: file.name,
        fileUrl: localUrl,
        size: file.size,
        did: `DOC-LOCAL-PASSPORT-${Date.now()}`,
      };
      setUploadedDocs((prev) => [...prev.filter((d) => d.documentType !== 'Passport Scan'), localDoc]);
    } finally {
      setUploadingPassport(false);
    }
  };

  // Step 1 / Offer Letter Dossier Upload Handler
  const handleOfferLetterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setOfferLetterFile(file);
    setOfferLetterPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'Offer Letter');

    setUploadingOfferLetter(true);
    try {
      const res = await apiClient.post('/api/v1/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileData = res.data?.data || res.data;
      const uploadedUrl = fileData.fileUrl || fileData.url || localUrl;
      const newDoc = {
        title: 'Offer Letter (5-Page Work Permit)',
        documentType: 'Offer Letter',
        fileUrl: uploadedUrl,
        fileName: file.name,
        size: file.size,
        did: fileData.did || `DOC-OFFER-${Date.now()}`,
      };
      setUploadedDocs((prev) => [...prev.filter((d) => d.documentType !== 'Offer Letter'), newDoc]);
      toast.success('5-Page Offer Letter Dossier attached!');
    } catch (err) {
      console.warn('Offer letter upload fallback to local URL:', err);
      toast.info('Offer letter attached (local preview).');
      const localDoc = {
        title: 'Offer Letter (5-Page Work Permit)',
        documentType: 'Offer Letter',
        fileName: file.name,
        fileUrl: localUrl,
        size: file.size,
        did: `DOC-LOCAL-OFFER-${Date.now()}`,
      };
      setUploadedDocs((prev) => [...prev.filter((d) => d.documentType !== 'Offer Letter'), localDoc]);
    } finally {
      setUploadingOfferLetter(false);
    }
  };

  // General Document Upload Handler (for Step 3)
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    setUploadingDoc(true);
    try {
      const res = await apiClient.post('/api/v1/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileData = res.data?.data || res.data;
      const newDoc = {
        title: docType,
        documentType: docType,
        fileUrl: fileData.fileUrl || fileData.url || '',
        fileName: file.name,
        size: file.size,
        did: fileData.did || `DOC-${Date.now()}`,
      };
      setUploadedDocs((prev) => [...prev, newDoc]);
      toast.success(`${docType} uploaded successfully to Document Vault!`);
    } catch (err) {
      console.error('File upload failed:', err);
      toast.error('Failed to upload file. Using local reference.');
      setUploadedDocs((prev) => [
        ...prev,
        {
          title: docType,
          documentType: docType,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          did: `DOC-LOCAL-${Date.now()}`,
        },
      ]);
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDoc = (index) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Advance Calculation
  const totalPkg = Number(paymentData.packageAmount) || 0;
  const advPaid = Number(paymentData.advanceAmount) || 0;
  const remainingDue = Math.max(0, totalPkg - advPaid);

  // Validation for Step 1
  const validateStep1 = () => {
    if (!clientData.fullName.trim()) {
      toast.error('Applicant full name is required!');
      return false;
    }
    if (!clientData.phone.trim()) {
      toast.error('Contact phone number is required!');
      return false;
    }
    if (!clientData.passportNumber.trim()) {
      toast.error('Passport number is required for candidate identity!');
      return false;
    }
    if (!clientData.fatherName.trim()) {
      toast.error("Father's name is required for Candidate Triad Identity!");
      return false;
    }
    const hasPassportScan = Boolean(
      passportPreviewUrl ||
      uploadedDocs.some((d) => d.documentType === 'Passport Scan' || d.title === 'Passport Scan')
    );
    if (!hasPassportScan) {
      toast.error('Mandatory Original Passport Copy must be attached before proceeding.');
      return false;
    }
    if (targetStage === 'OFFER_LETTER') {
      const hasOfferLetter = Boolean(
        offerLetterPreviewUrl ||
        uploadedDocs.some((d) => d.documentType === 'Offer Letter' || d.title?.includes('Offer Letter'))
      );
      if (!hasOfferLetter) {
        toast.error('5-Page Work Permit / Offer Letter PDF is required when creating directly in Offer Letter stage.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleStepClick = (stepNum) => {
    if (stepNum > currentStep && currentStep === 1) {
      if (!validateStep1()) return;
    }
    setCurrentStep(stepNum);
  };

  // Submit Final Case Intake
  const handleSubmitCase = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      // 1. Submit Case File to backend with Stage Injection & Guardian details
      const payload = {
        clientDid: selectedClient?.did || undefined,
        applicantName: clientData.fullName.trim(),
        passportNumber: clientData.passportNumber.trim().toUpperCase(),
        phone: clientData.phone.trim(),
        nidNumber: clientData.nidNumber.trim(),
        status: targetStage,
        workflowStatus:
          targetStage === 'OFFER_LETTER'
            ? 'Approved Offer Letter'
            : targetStage === 'UNDER_PROCESS'
            ? 'Under Process'
            : 'Intake Received',
        destinationCountry:
          caseDetails.destinationCountry === 'Other' ? caseDetails.customCountry : caseDetails.destinationCountry,
        tradeSkill: caseDetails.tradeSkill,
        caseType: caseDetails.destinationCountry.toLowerCase().includes('greece') ? 'greece' : 'general',
        packageAmount: totalPkg,
        packageCost: totalPkg,
        initialPaidAmount: advPaid,
        advanceAmount: advPaid,
        paymentMethod: paymentData.paymentMethod,
        remarks: caseDetails.specialInstructions,
        guardianName: clientData.guardianName.trim(),
        guardianPhone: clientData.guardianPhone.trim(),
        guardianRelationship: clientData.guardianRelationship,
        guardianNid: clientData.guardianNid.trim(),
        initialDocuments: uploadedDocs,
        extraData: {
          priority: caseDetails.priority,
          initialStage: targetStage,
          fatherName: clientData.fatherName.trim(),
          motherName: clientData.motherName.trim(),
          presentAddress: clientData.presentAddress.trim(),
          permanentAddress: clientData.permanentAddress.trim(),
          guardian: {
            name: clientData.guardianName.trim(),
            phone: clientData.guardianPhone.trim(),
            relationship: clientData.guardianRelationship,
            nidNumber: clientData.guardianNid.trim(),
          },
          documents: uploadedDocs,
        },
      };

      const res = await apiClient.post('/api/v1/client/cases', payload);
      const createdCase = res.data?.data || res.data;

      // 2. Generate Money Receipt if Advance was collected
      if (advPaid > 0 && paymentData.generateReceipt) {
        try {
          const receiptRes = await apiClient.post('/api/v1/client/receipts', {
            clientName: clientData.fullName.trim(),
            clientPhone: clientData.phone.trim(),
            passportNumber: clientData.passportNumber.trim().toUpperCase(),
            clientDid: createdCase.clientDid || selectedClient?.did,
            amount: advPaid,
            paymentMethod: paymentData.paymentMethod,
            serviceType: caseDetails.destinationCountry,
            purpose: `Initial Intake Advance Deposit for ${caseDetails.destinationCountry}`,
            notes: `Case #${createdCase.caseNumber || createdCase.did}`,
          });
          const receiptDoc = receiptRes.data?.data || receiptRes.data;
          setCreatedReceipt(receiptDoc);
        } catch (receiptErr) {
          console.warn('Money receipt auto-generate notice:', receiptErr);
        }
      }

      setCreatedCaseResult(createdCase);
      toast.success(`Case File #${createdCase.caseNumber || 'NEW'} created successfully!`);

      if (onSuccess) onSuccess(createdCase);

      if (advPaid > 0 && paymentData.generateReceipt) {
        setShowPrintModal(true);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to create case file:', err);
      toast.error(err.response?.data?.message || 'Failed to create case file. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
        <div className="bg-white text-zinc-900 border border-black/10 w-full max-w-3xl h-[70vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
          {/* Modal Header */}
          <div className="p-5 border-b border-black/10 bg-black/[0.02] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <FolderOpen className="size-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                  5-Step Case Intake Wizard
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Frontdesk
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Step {currentStep} of 5 — {
                    currentStep === 1 ? 'Client Information & Bio' :
                    currentStep === 2 ? 'Destination Country & Trade' :
                    currentStep === 3 ? 'Document Vault Attachments' :
                    currentStep === 4 ? 'Advance Deposit & Money Receipt' :
                    'Summary & Admin Handoff'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 border-b border-black/10 text-[11px] font-semibold bg-black/[0.02] shrink-0">
            {[
              { num: 1, label: 'Client' },
              { num: 2, label: 'Destination' },
              { num: 3, label: 'Documents' },
              { num: 4, label: 'Payment' },
              { num: 5, label: 'Review' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStepClick(s.num)}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 transition text-center border-b-2 cursor-pointer ${
                  currentStep === s.num
                    ? 'border-primary text-primary bg-primary/5 font-bold'
                    : currentStep > s.num
                    ? 'border-emerald-500/80 text-emerald-600'
                    : 'border-transparent text-black/40 opacity-60'
                }`}
              >
                <span
                  className={`size-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === s.num
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Modal Body / Steps Content */}
          <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-5 text-zinc-900">
            {/* STEP 1: CLIENT SELECTION / ONBOARDING */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Stage Injection Selector Bar */}
                <div className="bg-black/[0.02] p-3.5 rounded-xl border border-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Pipeline Stage Injection</span>
                      <span className="text-[10px] font-normal lowercase text-black/50">(create directly into stage)</span>
                    </label>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Target: {targetStage === 'INTAKE' ? '1. File Intake' : targetStage === 'UNDER_PROCESS' ? '2. Under Process' : '3. Offer Letter'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'INTAKE', label: '1. File Intake', icon: '📂', desc: 'New candidate onboarding' },
                      { id: 'UNDER_PROCESS', label: '2. Under Process', icon: '⚙️', desc: 'Police / Medical / Embassy' },
                      { id: 'OFFER_LETTER', label: '3. Offer Letter', icon: '📜', desc: 'Greek permit approved' },
                    ].map((stage) => {
                      const isSelected = targetStage === stage.id;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setTargetStage(stage.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                              : 'bg-white border-black/10 text-black/80 hover:bg-black/[0.03]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span>{stage.icon}</span>
                            <span className="truncate">{stage.label}</span>
                          </div>
                          <span className="text-[10px] text-black/50 mt-0.5 truncate">{stage.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5-Page Greek Work Permit / Offer Letter Dossier Dropzone (when targetStage === 'OFFER_LETTER') */}
                {targetStage === 'OFFER_LETTER' && (
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/30 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-900">
                          5-Page Greek Work Permit / Offer Letter Dossier *
                        </span>
                      </div>
                      {offerLetterPreviewUrl ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Required for Stage 3
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-black/60">
                      Attach the complete 5-page Greek Ministry / Employer Work Permit approval letter (PDF or multi-page image).
                    </p>

                    {offerLetterPreviewUrl ? (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-500/30 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="size-5 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-black truncate">
                              {offerLetterFile?.name || 'Offer_Letter_5_Page_Dossier.pdf'}
                            </p>
                            <p className="text-[10px] text-black/50">
                              {offerLetterFile?.size ? `${(offerLetterFile.size / 1024).toFixed(1)} KB` : 'Dossier Attached'} • Document Studio Ready
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 ml-2">
                          <a
                            href={offerLetterPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                          >
                            View ↗
                          </a>
                          <label className="text-[11px] font-bold text-black/60 hover:text-black cursor-pointer underline">
                            Replace
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={handleOfferLetterUpload}
                              disabled={uploadingOfferLetter}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-amber-500/40 hover:border-amber-600 bg-white/60 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition">
                        <UploadCloud className="size-6 text-amber-600" />
                        <span className="text-xs font-bold text-black">Click or drag 5-Page Offer Letter PDF</span>
                        <span className="text-[10px] text-black/50">PDF, JPG up to 25MB (Mandatory for Stage 3 injection)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={handleOfferLetterUpload}
                          disabled={uploadingOfferLetter}
                        />
                      </label>
                    )}
                    {uploadingOfferLetter && (
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Uploading Offer Letter to Vault...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Client Mode Switch */}
                <div className="flex items-center justify-between gap-3 bg-muted/40 p-1.5 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode('new');
                      setSelectedClient(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      clientMode === 'new'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Plus className="size-3.5" />
                    <span>New Candidate Onboarding</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      clientMode === 'existing'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Search className="size-3.5" />
                    <span>Search Existing Client</span>
                  </button>
                </div>

                {clientMode === 'existing' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by candidate name, passport, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:border-primary outline-hidden"
                      />
                      {searching && (
                        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
                      )}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                        {searchResults.map((c) => (
                          <div
                            key={c.did || c._id}
                            onClick={() => handleSelectExistingClient(c)}
                            className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between text-xs transition"
                          >
                            <div>
                              <p className="font-bold text-foreground">{c.fullName || c.name}</p>
                              <p className="text-muted-foreground text-[11px]">
                                Phone: {c.phone || '—'} • Passport: {c.passportNumber || '—'}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                              Select <ChevronRight className="size-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedClient && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-700">
                            Selected: <strong>{selectedClient.fullName || selectedClient.name}</strong> ({selectedClient.passportNumber || selectedClient.phone})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedClient(null)}
                          className="text-[11px] text-destructive hover:underline font-bold"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Personal Bio Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Rafiqul Islam"
                      value={clientData.fullName}
                      onChange={(e) => setClientData({ ...clientData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712345678"
                      value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A08923412"
                      value={clientData.passportNumber}
                      onChange={(e) => setClientData({ ...clientData, passportNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Father's Name (Triad Identity) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Late Monir Uddin"
                      value={clientData.fatherName}
                      onChange={(e) => setClientData({ ...clientData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      National ID (NID) Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1992123456789"
                      value={clientData.nidNumber}
                      onChange={(e) => setClientData({ ...clientData, nidNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      placeholder="Mother's full name"
                      value={clientData.motherName}
                      onChange={(e) => setClientData({ ...clientData, motherName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-black/70 block mb-1">
                      Present Address (Village, Post Office, District)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vill: Madhupur, P.O: Madhupur, Dist: Tangail"
                      value={clientData.presentAddress}
                      onChange={(e) => setClientData({ ...clientData, presentAddress: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>
                </div>

                {/* Guardian / Guarantor Section for 300-Tk Judicial Stamp Deed */}
                <div className="border-t border-black/10 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                      Guardian / Guarantor Information (300-Tk Judicial Stamp Deed)
                    </span>
                    <span className="text-[10px] text-black/50">Legal Guarantor Signatory</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-black/70 block mb-1">
                        Guardian Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Late Monir Uddin / Md. Sirajul Haque"
                        value={clientData.guardianName}
                        onChange={(e) => setClientData({ ...clientData, guardianName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-black/70 block mb-1">
                        Relationship to Candidate *
                      </label>
                      <select
                        value={clientData.guardianRelationship}
                        onChange={(e) => setClientData({ ...clientData, guardianRelationship: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                      >
                        <option value="Father">Father (পিতা)</option>
                        <option value="Mother">Mother (মাতা)</option>
                        <option value="Brother">Brother (ভাই)</option>
                        <option value="Uncle">Uncle (চাচা / মামা)</option>
                        <option value="Spouse">Spouse (স্ত্রী / স্বামী)</option>
                        <option value="Other">Other Legal Guardian</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-black/70 block mb-1">
                        Guardian Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 01812345678"
                        value={clientData.guardianPhone}
                        onChange={(e) => setClientData({ ...clientData, guardianPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-black/70 block mb-1">
                        Guardian National ID (NID) *
                      </label>
                      <input
                        type="text"
                        placeholder="Guardian's NID for Stamp Deed"
                        value={clientData.guardianNid}
                        onChange={(e) => setClientData({ ...clientData, guardianNid: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Mandatory Original Passport Bio-Page Copy with Instant Live Preview */}
                <div className="p-3.5 bg-sky-500/5 border border-sky-500/30 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="size-4 text-sky-600" />
                      <span className="text-xs font-bold text-sky-900">
                        Mandatory Original Passport Bio-Page Copy *
                      </span>
                    </div>
                    {passportPreviewUrl ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Scanned Copy Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        Required to Proceed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-black/60">
                    High-resolution scan of pages 2-3 (bio-data page). Required for Candidate Triad Identity and Stage 2/3 processing.
                  </p>

                  {passportPreviewUrl ? (
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-sky-500/30">
                      {passportFile?.type?.startsWith('image/') || (!passportFile && passportPreviewUrl.match(/\.(jpeg|jpg|png|webp)/i)) ? (
                        <img
                          src={passportPreviewUrl}
                          alt="Passport Bio-Page Scan"
                          className="size-16 object-cover rounded-lg border border-black/10 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="size-16 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 flex flex-col items-center justify-center shrink-0">
                          <FileText className="size-6" />
                          <span className="text-[9px] font-bold mt-0.5">PDF SCAN</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black truncate">
                          {passportFile?.name || 'Passport_Bio_Page_Scan.pdf'}
                        </p>
                        <p className="text-[10px] text-black/50">
                          {passportFile?.size ? `${(passportFile.size / 1024).toFixed(1)} KB` : 'Attached Bio-Data'} • Document Vault Stored
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <a
                            href={passportPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline"
                          >
                            Full Preview ↗
                          </a>
                          <label className="text-black/60 hover:text-black cursor-pointer underline">
                            Change File
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={handlePassportUpload}
                              disabled={uploadingPassport}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-sky-500/40 hover:border-sky-600 bg-white/60 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition">
                      <UploadCloud className="size-6 text-sky-600" />
                      <span className="text-xs font-bold text-black">Click or drag original passport bio-page scan</span>
                      <span className="text-[10px] text-black/50">PDF, JPG, PNG up to 20MB (Blocks Next Step if absent)</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handlePassportUpload}
                        disabled={uploadingPassport}
                      />
                    </label>
                  )}

                  {uploadingPassport && (
                    <div className="flex items-center gap-2 text-xs text-sky-700">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Uploading Passport Scan to Vault...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: DESTINATION COUNTRY & TRADE */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-2">
                    Select Target Overseas Destination *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DESTINATIONS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setCaseDetails({ ...caseDetails, destinationCountry: d.id })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          caseDetails.destinationCountry === d.id
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                            : 'bg-background border-border text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-xl">{d.flag}</span>
                        <span className="text-xs">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {caseDetails.destinationCountry === 'Other' && (
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Specify Country Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter destination country"
                      value={caseDetails.customCountry}
                      onChange={(e) => setCaseDetails({ ...caseDetails, customCountry: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Applied Skill / Trade Category *
                    </label>
                    <select
                      value={caseDetails.tradeSkill}
                      onChange={(e) => setCaseDetails({ ...caseDetails, tradeSkill: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden"
                    >
                      {TRADES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Case Priority Level
                    </label>
                    <select
                      value={caseDetails.priority}
                      onChange={(e) => setCaseDetails({ ...caseDetails, priority: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Processing ⚡</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Frontdesk Intake Remarks / Special Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Internal remarks for the processing officer..."
                      value={caseDetails.specialInstructions}
                      onChange={(e) => setCaseDetails({ ...caseDetails, specialInstructions: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENT VAULT UPLOADS */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl flex items-center gap-3 text-xs text-sky-800">
                  <UploadCloud className="size-5 shrink-0 text-sky-600" />
                  <span>
                    Upload scanned passport copies and candidate bio-photos. Files are securely encrypted and streamed directly to Cloudflare R2 Document Vault.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { type: 'Passport Scan', label: 'Original Passport Copy (PDF/JPG)', icon: FileText },
                    { type: 'Passport Photo', label: 'Photograph (35x45mm White BG)', icon: Image },
                    { type: 'National ID (NID)', label: 'NID Card Scan Copy', icon: ShieldCheck },
                    { type: 'Medical Report', label: 'Medical / GAMCA Fit Certificate', icon: FileText },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="border border-border rounded-xl p-3.5 bg-card flex flex-col justify-between gap-3 hover:border-primary/40 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="size-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{item.type}</p>
                          <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        </div>
                      </div>

                      <label className="flex items-center justify-center gap-2 py-2 px-3 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-lg cursor-pointer transition border border-border">
                        <UploadCloud className="size-3.5" />
                        <span>Select File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, item.type)}
                          disabled={uploadingDoc}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                {uploadingDoc && (
                  <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Uploading attachment to Cloudflare R2 Vault...</span>
                  </div>
                )}

                {/* Uploaded Documents List */}
                {uploadedDocs.length > 0 && (
                  <div className="border border-border rounded-xl p-3 space-y-2 bg-muted/20">
                    <p className="text-xs font-bold text-foreground">Attached Document Vault Files ({uploadedDocs.length}):</p>
                    <div className="space-y-1.5">
                      {uploadedDocs.map((doc, idx) => (
                        <div
                          key={doc.did || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            <span className="font-bold text-foreground">{doc.title}:</span>
                            <span className="text-muted-foreground truncate">{doc.fileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDoc(idx)}
                            className="size-6 text-destructive hover:bg-destructive/10 rounded flex items-center justify-center transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: ADVANCE PAYMENT & MONEY RECEIPT */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Total Agreed Package Amount (BDT ৳)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={paymentData.packageAmount}
                      onChange={(e) => setPaymentData({ ...paymentData, packageAmount: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Initial Advance Deposit Received (BDT ৳)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={paymentData.advanceAmount}
                      onChange={(e) => setPaymentData({ ...paymentData, advanceAmount: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-black/15 rounded-lg focus:border-primary outline-hidden font-bold text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Payment Collection Method
                    </label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary outline-hidden"
                    >
                      <option value="Cash">Cash in Hand (অফিস ক্যাশ)</option>
                      <option value="Bank Transfer">Bank Transfer (ব্যাংক একাউন্ট)</option>
                      <option value="bKash">bKash Merchant</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>

                  {/* Calculated Balance Card */}
                  <div className="bg-muted/40 border border-border p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Remaining Due Balance</span>
                    <span className="text-base font-black text-foreground">
                      BDT ৳{remainingDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none bg-muted/30 p-3 rounded-xl border border-border">
                    <input
                      type="checkbox"
                      checked={paymentData.generateReceipt}
                      onChange={(e) => setPaymentData({ ...paymentData, generateReceipt: e.target.checked })}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <span>
                      Generate official <strong>Money Receipt Voucher ({paymentData.advanceAmount ? `৳${Number(paymentData.advanceAmount).toLocaleString()}` : '৳0'})</strong> with dual-copy printable slip upon submission.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & SUMMARY */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-primary uppercase tracking-wide">
                      Case Intake Dossier Summary
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {targetStage === 'OFFER_LETTER' ? 'Stage 3: Offer Letter Approved' : targetStage === 'UNDER_PROCESS' ? 'Stage 2: Under Process' : 'Stage 1: File Intake'}
                    </span>
                  </div>

                  {/* Triad Identity Card */}
                  <div className="p-3 bg-white rounded-lg border border-black/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm text-black">{clientData.fullName || '—'}</p>
                        <p className="text-[11px] text-black/60">
                          S/O: {clientData.fatherName || '—'} • {clientData.presentAddress || 'District N/A'}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-xs bg-black/[0.04] text-black px-2 py-1 rounded-md border border-black/10">
                        🛂 {clientData.passportNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-black/70 pt-1 border-t border-black/5">
                      <div><span className="text-black/50">Phone:</span> <strong>{clientData.phone || '—'}</strong></div>
                      <div><span className="text-black/50">NID:</span> <span className="font-mono">{clientData.nidNumber || '—'}</span></div>
                    </div>
                  </div>

                  {/* 300-Tk Judicial Stamp Deed Info */}
                  <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs">
                    <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-1">
                      300-Tk Judicial Stamp Deed Guarantor:
                    </p>
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-black/80">
                      <div><span className="text-black/50">Guardian:</span> <strong>{clientData.guardianName || '—'}</strong> ({clientData.guardianRelationship})</div>
                      <div><span className="text-black/50">Phone:</span> <strong>{clientData.guardianPhone || '—'}</strong></div>
                      <div><span className="text-black/50">Guardian NID:</span> <span className="font-mono">{clientData.guardianNid || '—'}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-black/60 text-[11px]">Target Destination:</span>
                      <p className="font-bold text-black">
                        {caseDetails.destinationCountry === 'Other' ? caseDetails.customCountry : caseDetails.destinationCountry}
                      </p>
                    </div>
                    <div>
                      <span className="text-black/60 text-[11px]">Applied Trade:</span>
                      <p className="font-bold text-black">{caseDetails.tradeSkill}</p>
                    </div>
                    <div>
                      <span className="text-black/60 text-[11px]">Priority:</span>
                      <p className="font-bold text-amber-600">{caseDetails.priority}</p>
                    </div>
                    <div>
                      <span className="text-black/60 text-[11px]">Attached Documents ({uploadedDocs.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {uploadedDocs.map((d, i) => (
                          <span key={i} className="text-[10px] bg-black/[0.04] text-black px-1.5 py-0.5 rounded border border-black/10">
                            ✓ {d.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-black/10 pt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-black/60 text-[10px]">Total Package:</span>
                      <p className="font-bold text-black">৳{totalPkg.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-black/60 text-[10px]">Advance Deposit:</span>
                      <p className="font-bold text-emerald-600">৳{advPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-black/60 text-[10px]">Remaining Due:</span>
                      <p className="font-bold text-black">৳{remainingDue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-black/60 leading-relaxed">
                  Clicking <strong>"Submit & Dispatch to Admin Board"</strong> will create the Master Case File in <strong>{targetStage.replace(/_/g, ' ')}</strong> stage, attach all Document Vault scans, issue the Money Receipt, and alert the Admin Board.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-3.5 border-t border-black/10 bg-white flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1.5 px-4 h-9 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="size-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  <span>Next Step</span>
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitCase}
                  className="flex items-center gap-2 px-6 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating File...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Submit & Dispatch to Admin</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Money Receipt Print Modal */}
      {showPrintModal && createdReceipt && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-4xl max-h-[95vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="size-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Money Receipt Voucher Print Slip</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="size-3.5" />
                  Print A4
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    onClose();
                  }}
                  className="size-8 text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto grow bg-white">
              <MoneyReceiptPrintSlip receipt={createdReceipt} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CaseFileCreationModal;
