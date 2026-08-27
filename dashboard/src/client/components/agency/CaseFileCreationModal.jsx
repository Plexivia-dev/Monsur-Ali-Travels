import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Search,
  UserPlus,
  Globe2,
  Briefcase,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';

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

  // Step 1: Client Selection & Details
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

  const [caseDetails, setCaseDetails] = useState({
    destinationCountry: 'Greece (Work Permit)',
    tradeSkill: 'General Worker',
    notes: '',
  });

  // Step 2: Document Uploads
  const [documents, setDocuments] = useState({
    passportScan: null,
    passportScanName: '',
    photo: null,
    photoName: '',
    additionalDoc: null,
    additionalDocName: '',
  });

  // Search existing clients with debounce
  useEffect(() => {
    if (clientMode !== 'search' || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get(`/api/v1/client/clients?search=${encodeURIComponent(searchQuery)}`);
        const data = res.data?.data?.clients || res.data?.data || res.data || [];
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
        toast.error('Please provide client full name.');
        return false;
      }
      if (!clientForm.phone.trim()) {
        toast.error('Please provide client phone number.');
        return false;
      }
      if (!clientForm.passportNumber.trim()) {
        toast.error('Please provide passport number.');
        return false;
      }
      if (!caseDetails.destinationCountry) {
        toast.error('Please select destination country.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission to Admin Board
  const handleSubmitCase = async () => {
    setSubmitting(true);
    try {
      const formattedPayload = {
        applicantName: clientForm.name,
        phone: clientForm.phone,
        passportNumber: clientForm.passportNumber,
        caseType: caseDetails.destinationCountry,
        status: "ENTRY",
        notes: caseDetails.notes,
        paymentLedger: {
          totalAgreedAmount: 0,
          step1_advance: 0,
          dueAmount: 0,
          totalPaidAmount: 0
        },
        documents: {
          passportScanName: documents.passportScanName,
          photoName: documents.photoName,
          additionalDocName: documents.additionalDocName,
        }
      };

      await apiClient.post('/api/v1/client/cases', formattedPayload);

      toast.success('Case File submitted to Admin Queue for verification.');
      if (onSuccess) onSuccess();
      onClose();
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
                <span>Client Intake</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-400/20 font-mono">
                  Step {step} of 2
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">Frontdesk Onboarding to Admin Queue</p>
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
          <div className="grid grid-cols-2 gap-2">
            {[
              { num: 1, title: 'Client Info & Destination' },
              { num: 2, title: 'Document Vault & Notes' },
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
                    Client Full Name <span className="text-rose-400">*</span>
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
                    placeholder="client@example.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-sky-500 outline-hidden"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border/50">
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

              <div className="grid grid-cols-1 gap-3 pt-2">
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
              </div>
            </div>
          )}

          {/* STEP 2: Document Vault Uploads & Notes */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-xl text-sky-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
                <span>Uploaded documents will be directly stored in the client's secure Document Vault.</span>
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

                {/* Client Photo */}
                <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/15 flex flex-col items-center justify-center text-center space-y-2 relative">
                  <User className="w-7 h-7 text-sky-400" />
                  <span className="font-bold text-foreground text-xs">Client Passport Photo</span>
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
              
              <div className="space-y-1">
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

          {step < 2 ? (
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
              {submitting ? 'Submitting...' : 'Submit to Admin Queue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseFileCreationModal;
