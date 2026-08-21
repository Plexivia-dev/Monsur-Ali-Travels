import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Search,
  UserPlus,
  Globe2,
  Briefcase,
  FileText,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  Printer,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { MoneyReceiptPrintSlip } from '../docs/receipt/MoneyReceiptPrintSlip';

const DESTINATION_OPTIONS = [
  { value: 'Greece (Work Permit)', label: 'Greece (Work Permit)', flag: '🇬🇷' },
  { value: 'Macedonia (Work Permit)', label: 'Macedonia (Work Permit)', flag: '🇲🇰' },
];

const TRADE_SKILLS = [
  'General Worker',
  'Construction Worker',
  'Agriculture & Greenhouse',
  'Factory Worker',
  'Warehouse / Packaging',
  'Heavy Equipment Operator',
  'Professional Driver',
  'Hospitality & Cleaning',
  'Electrician / Plumber',
  'Other Specialized Skill'
];

export function CaseFileCreationModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Client Selection & Creation
  const [clientMode, setClientMode] = useState('new'); // 'search' or 'new'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    passportNumber: '',
    address: '',
  });

  // Step 2: Destination & Case Details
  const [caseDetails, setCaseDetails] = useState({
    destinationCountry: 'Greece (Work Permit)',
    tradeSkill: 'General Worker',
    priority: 'normal',
    notes: '',
  });

  // Step 3: Document Uploads
  const [documents, setDocuments] = useState({
    passportScan: null,
    passportScanName: '',
    photo: null,
    photoName: '',
    additionalDoc: null,
    additionalDocName: '',
  });

  // Step 4: Advance Financials & Receipt
  const [financials, setFinancials] = useState({
    totalAgreedAmount: '',
    advanceAmount: '',
    paymentMethod: 'Cash',
    receiptNotes: 'Advance payment for overseas work permit case processing',
  });

  // Generated receipt state for direct printing
  const [createdReceiptData, setCreatedReceiptData] = useState(null);
  const [showReceiptPrint, setShowReceiptPrint] = useState(false);

  // Search existing clients with debounce
  useEffect(() => {
    if (clientMode !== 'search' || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get(`/api/v1/client/customers?search=${encodeURIComponent(searchQuery)}`);
        const data = res.data?.data?.customers || res.data?.data || res.data || [];
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, clientMode]);

  if (!isOpen) return null;

  // Handle client selection from search
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientForm({
      name: client.name || client.fullName || '',
      phone: client.phone || client.mobileNumber || '',
      email: client.email || '',
      passportNumber: client.passportNumber || client.passportNo || '',
      address: client.address || '',
    });
  };

  // Handle file select
  const handleFileChange = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments((prev) => ({
          ...prev,
          [key]: reader.result,
          [`${key}Name`]: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation per step
  const validateStep = () => {
    if (step === 1) {
      if (!clientForm.name.trim()) {
        toast.error('Please provide candidate / client full name.');
        return false;
      }
      if (!clientForm.phone.trim()) {
        toast.error('Please provide candidate phone number.');
        return false;
      }
      if (!clientForm.passportNumber.trim()) {
        toast.error('Please provide passport number.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!caseDetails.destinationCountry) {
        toast.error('Please select destination country.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      return true;
    }

    if (step === 4) {
      if (financials.advanceAmount && Number(financials.advanceAmount) > Number(financials.totalAgreedAmount || 0) && Number(financials.totalAgreedAmount) > 0) {
        toast.error('Advance amount cannot exceed total agreed amount.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission to Admin Board
  const handleSubmitCase = async () => {
    setSubmitting(true);
    try {
      const agreed = Number(financials.totalAgreedAmount) || 0;
      const advance = Number(financials.advanceAmount) || 0;
      const due = Math.max(0, agreed - advance);

      const casePayload = {
        candidateName: clientForm.name,
        candidatePhone: clientForm.phone,
        candidateEmail: clientForm.email,
        passportNumber: clientForm.passportNumber,
        address: clientForm.address,
        destinationCountry: caseDetails.destinationCountry,
        tradeSkill: caseDetails.tradeSkill,
        casePriority: caseDetails.priority,
        status: 'New', // Immediate handoff status
        workflowStatus: 'Received',
        totalAgreedAmount: agreed,
        advanceAmount: advance,
        dueAmount: due,
        notes: caseDetails.notes,
        createdByDid: user?.did || user?.id,
        createdByName: user?.name || 'Frontdesk Staff',
        documents: {
          passportScanName: documents.passportScanName,
          photoName: documents.photoName,
          additionalDocName: documents.additionalDocName,
        },
      };

      // 1. Create Case File
      const caseRes = await apiClient.post('/api/v1/client/candidates', casePayload).catch(async () => {
        return await apiClient.post('/api/v1/client/cases', casePayload);
      });

      // 2. If advance payment was made, generate Money Receipt
      if (advance > 0) {
        const receiptPayload = {
          clientName: clientForm.name,
          clientPhone: clientForm.phone,
          passportNumber: clientForm.passportNumber,
          serviceType: `${caseDetails.destinationCountry} - Advance`,
          purpose: `Advance deposit for ${caseDetails.destinationCountry} Case File`,
          amount: advance,
          paymentMethod: financials.paymentMethod,
          createdByName: user?.name || 'Frontdesk Staff',
          notes: financials.receiptNotes,
          caseRef: caseRes?.data?._id || caseRes?.data?.data?._id || null,
        };

        const receiptRes = await apiClient.post('/api/v1/client/receipts', receiptPayload).catch(() => null);
        if (receiptRes?.data?.data) {
          setCreatedReceiptData(receiptRes.data.data);
        }
      }

      toast.success('Case File created successfully and handed over to Admin Master Board!');
      if (onSuccess) onSuccess();

      if (advance > 0) {
        setShowReceiptPrint(true);
      } else {
        onClose();
      }
    } catch (err) {
      toast.error('Failed to submit case file. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>New Case File Entry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-400/20 font-mono">
                  Step {step} of 5
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">Frontdesk Onboarding & Admin Handoff Wizard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-card border-b border-border/60">
          <div className="grid grid-cols-5 gap-2">
            {[
              { num: 1, title: 'Client Info' },
              { num: 2, title: 'Country & Trade' },
              { num: 3, title: 'Document Vault' },
              { num: 4, title: 'Advance Payment' },
              { num: 5, title: 'Admin Handoff' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    step >= s.num ? 'bg-sky-500' : 'bg-muted'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold truncate hidden sm:block ${
                    step === s.num ? 'text-sky-400' : step > s.num ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}
                >
                  {s.num}. {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: Client Selection & Creation */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5 ${
                    clientMode === 'new' ? 'bg-sky-500 text-slate-950 shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('search')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center justify-center gap-1.5 ${
                    clientMode === 'search' ? 'bg-sky-500 text-slate-950 shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Existing</span>
                </button>
              </div>

              {clientMode === 'search' && (
                <div className="space-y-3 p-4 bg-muted/20 border border-border rounded-xl">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search client by Name, Phone, or Passport..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                    />
                    {searching && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-sky-400" />}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border/80 rounded-lg p-1.5 bg-background">
                      {searchResults.map((c) => (
                        <div
                          key={c._id || c.id}
                          onClick={() => handleSelectClient(c)}
                          className={`p-2 rounded-md flex items-center justify-between cursor-pointer transition ${
                            selectedClient?._id === c._id ? 'bg-sky-500/20 border border-sky-400/40 text-foreground' : 'hover:bg-muted/40'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-foreground block">{c.name || c.fullName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{c.phone} | {c.passportNumber || 'No Passport'}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold">Select</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Client Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    Candidate Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md Rahim Ahmed"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    Phone / WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+880 17XX XXXXXX"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    Passport Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A01234567"
                    value={clientForm.passportNumber}
                    onChange={(e) => setClientForm({ ...clientForm, passportNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono uppercase focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-foreground">Present Address / Hometown</label>
                  <input
                    type="text"
                    placeholder="e.g. Jagannathpur, Sunamganj"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Destination & Case Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <label className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-sky-400" />
                  Select Destination Country & Program <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DESTINATION_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setCaseDetails({ ...caseDetails, destinationCountry: opt.value })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                        caseDetails.destinationCountry === opt.value
                          ? 'border-sky-500 bg-sky-500/15 text-foreground shadow-xs'
                          : 'border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <span className="text-3xl">{opt.flag}</span>
                      <div>
                        <span className="font-bold text-foreground text-sm block">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">Official European Work Permit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Trade / Applied Position
                  </label>
                  <select
                    value={caseDetails.tradeSkill}
                    onChange={(e) => setCaseDetails({ ...caseDetails, tradeSkill: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden cursor-pointer"
                  >
                    {TRADE_SKILLS.map((sk) => (
                      <option key={sk} value={sk}>{sk}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" /> Case Priority
                  </label>
                  <select
                    value={caseDetails.priority}
                    onChange={(e) => setCaseDetails({ ...caseDetails, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden cursor-pointer"
                  >
                    <option value="normal">Normal Processing</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Fast-Track</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-foreground">Special Instructions / Case Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Add any specific notes for Admin or Processor..."
                    value={caseDetails.notes}
                    onChange={(e) => setCaseDetails({ ...caseDetails, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Document Vault Uploads */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-xl text-sky-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
                <span>Uploaded documents will be directly stored in the candidate's secure Document Vault.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Passport Scan */}
                <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/15 flex flex-col items-center justify-center text-center space-y-2 relative">
                  <UploadCloud className="w-7 h-7 text-sky-400" />
                  <span className="font-bold text-foreground text-xs">Original Passport Scan Copy</span>
                  <span className="text-[10px] text-muted-foreground">PDF, JPG, or PNG (Max 5MB)</span>
                  {documents.passportScanName ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-mono text-[11px] truncate max-w-xs">
                      ✓ {documents.passportScanName}
                    </span>
                  ) : (
                    <label className="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer hover:bg-sky-400 transition">
                      Upload Passport Scan
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, 'passportScan')} />
                    </label>
                  )}
                </div>

                {/* Candidate Photo */}
                <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/15 flex flex-col items-center justify-center text-center space-y-2 relative">
                  <User className="w-7 h-7 text-sky-400" />
                  <span className="font-bold text-foreground text-xs">Candidate Passport Photo</span>
                  <span className="text-[10px] text-muted-foreground">White background 35x45mm</span>
                  {documents.photoName ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-mono text-[11px] truncate max-w-xs">
                      ✓ {documents.photoName}
                    </span>
                  ) : (
                    <label className="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer hover:bg-sky-400 transition">
                      Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} />
                    </label>
                  )}
                </div>
              </div>

              {/* Additional Document Upload */}
              <div className="p-3 border border-border rounded-xl bg-muted/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block text-xs">Additional Supporting Document</span>
                  <span className="text-[10px] text-muted-foreground">{documents.additionalDocName || 'NID, Police Clearance, or Medical'}</span>
                </div>
                <label className="px-3 py-1 bg-muted/60 hover:bg-muted text-foreground font-semibold rounded-lg text-xs cursor-pointer border border-border transition">
                  {documents.additionalDocName ? 'Change File' : 'Attach File'}
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, 'additionalDoc')} />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Advance Payment & Money Receipt */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-sky-400" /> Total Package Agreed Amount (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 650000"
                    value={financials.totalAgreedAmount}
                    onChange={(e) => setFinancials({ ...financials, totalAgreedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Today's Advance Received (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={financials.advanceAmount}
                    onChange={(e) => setFinancials({ ...financials, advanceAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Payment Method</label>
                  <select
                    value={financials.paymentMethod}
                    onChange={(e) => setFinancials({ ...financials, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden cursor-pointer"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Remaining Due Balance</label>
                  <div className="px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs font-mono font-bold text-rose-400">
                    ৳ {Math.max(0, (Number(financials.totalAgreedAmount) || 0) - (Number(financials.advanceAmount) || 0)).toLocaleString()} BDT
                  </div>
                </div>
              </div>

              {Number(financials.advanceAmount) > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Automatic Money Receipt will be generated upon submission</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A formal advance payment voucher will be recorded for {clientForm.name} (Amount: ৳ {Number(financials.advanceAmount).toLocaleString()}). You can immediately print it for the client.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Admin Handoff */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-black text-foreground text-sm">{clientForm.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{clientForm.phone} | Passport: {clientForm.passportNumber}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-400/30">
                    Status: New (Pending Admin Handoff)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Program & Country</span>
                    <span className="font-bold text-foreground">{caseDetails.destinationCountry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Applied Skill / Trade</span>
                    <span className="font-semibold text-foreground">{caseDetails.tradeSkill}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Agreed Amount</span>
                    <span className="font-mono font-bold text-foreground">৳ {Number(financials.totalAgreedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Advance Deposit</span>
                    <span className="font-mono font-bold text-emerald-400">৳ {Number(financials.advanceAmount || 0).toLocaleString()} ({financials.paymentMethod})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Vault Files:</span>
                  {documents.passportScanName ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                      Passport Attached
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">No Passport File</span>
                  )}
                  {documents.photoName && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                      Photo Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Clicking <strong>Submit Case File</strong> will instantly transfer this candidate file to the Admin Master Workflow Board for processor assignment.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-muted/50 hover:bg-muted text-foreground font-semibold rounded-xl transition cursor-pointer text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground font-semibold rounded-xl transition cursor-pointer text-xs"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition cursor-pointer text-xs shadow-sm"
            >
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitCase}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer text-xs shadow-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Case File & Handoff to Admin'}
            </button>
          )}
        </div>
      </div>

      {/* Direct Money Receipt Print Modal */}
      {showReceiptPrint && createdReceiptData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" /> Advance Money Receipt Ready
              </h3>
              <button onClick={() => { setShowReceiptPrint(false); onClose(); }} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <MoneyReceiptPrintSlip data={createdReceiptData} />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Money Receipt
              </button>
              <button
                onClick={() => { setShowReceiptPrint(false); onClose(); }}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseFileCreationModal;
