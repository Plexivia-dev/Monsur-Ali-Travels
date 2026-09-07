import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  FileText,
  Stamp,
  BookOpen,
  Layers,
  FolderOpen,
  Search,
  Check,
  UploadCloud,
  Eye,
  Trash2,
  Sparkles,
  Lock,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { UnifiedModalHeader, UnifiedModalFooter } from '@shared/components/common/UnifiedModal';

/**
 * Format string to Title Case (e.g. "MD SUHAG RAHMAN" -> "Md Suhag Rahman")
 */
function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Parses YYMMDD from MRZ string to YYYY-MM-DD
 */
function parseMrzDate(yymmdd, isDob = false) {
  if (!yymmdd || yymmdd.length !== 6 || !/^\d{6}$/.test(yymmdd)) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return '';

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;
  let yyyy;
  if (isDob) {
    yyyy = yy > currentYY ? 1900 + yy : 2000 + yy;
  } else {
    yyyy = 2000 + yy;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateClientModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('new'); // 'new' | 'existing'
  const [clientMatchStatus, setClientMatchStatus] = useState('none'); // 'none' | 'matched' | 'new'

  // 1. Top Stage Radio: Target creation stage
  const [targetStage, setTargetStage] = useState('INTAKE'); // 'INTAKE' | 'UNDER_PROCESS' | 'OFFER_LETTER'

  // Existing client search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // 2. Service / Case Type (Strictly 3 options)
  const [serviceType, setServiceType] = useState('WORK_PERMIT');
  const [destinationCountry, setDestinationCountry] = useState('Greece');
  const [customCountry, setCustomCountry] = useState('');

  // 3. Mandatory Passport Scan & Live Preview State
  const [passportFile, setPassportFile] = useState(null);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState(null);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [passportDocData, setPassportDocData] = useState(null);
  const [autoExtractedBadge, setAutoExtractedBadge] = useState(false);

  // 4. Candidate / Passport Fields (Editable Manual Fields)
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    phone: '',
    dateOfBirth: '',
    passportExpiryDate: '',
    fatherName: '',
    nidNumber: '',
    email: '',
    address: '',
    notes: '',
    packageAmount: '',
    totalPaid: '',
  });

  // 5. Optional Documents State
  const [optionalDocs, setOptionalDocs] = useState([]);
  const [uploadingOptionalDoc, setUploadingOptionalDoc] = useState(false);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setTargetStage('INTAKE');
      setServiceType('WORK_PERMIT');
      setDestinationCountry('Greece');
      setCustomCountry('');
      setPassportFile(null);
      setPassportPreviewUrl(null);
      setPassportDocData(null);
      setAutoExtractedBadge(false);
      setOptionalDocs([]);
      setSelectedClient(null);
      setClientMode('new');
      setClientMatchStatus('none');
      setSearchQuery('');
      setSearchResults([]);
      setFormData({
        fullName: '',
        passportNumber: '',
        phone: '',
        dateOfBirth: '',
        passportExpiryDate: '',
        fatherName: '',
        nidNumber: '',
        email: '',
        address: '',
        notes: '',
        packageAmount: '',
        totalPaid: '',
      });
    }
  }, [isOpen]);

  // Debounced search for existing clients
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get('/api/v1/client/clients', {
          params: { search: searchQuery.trim(), limit: 10 },
        });
        const list = res.data?.data || res.data?.clients || (Array.isArray(res.data) ? res.data : []);
        setSearchResults(list);
        setDropdownOpen(true);
      } catch (err) {
        console.error('Failed to search clients:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close client search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Handles text & input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles selecting an existing client from search
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientMode('existing');
    setClientMatchStatus('matched');
    setSearchQuery('');
    setDropdownOpen(false);

    setFormData((prev) => ({
      ...prev,
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      passportNumber: (client.passportNumber || '').toUpperCase(),
      dateOfBirth: client.birthDate || client.dateOfBirth || '',
      passportExpiryDate: client.passportExpiryDate || '',
      fatherName: client.fatherName || client.guardian?.name || '',
      nidNumber: client.nidNumber || '',
      address: client.presentAddress || client.address || '',
    }));

    // Attach existing passport scan if available
    const scanUrl = client.attachments?.passportScan || client.passportScanUrl;
    if (scanUrl) {
      setPassportPreviewUrl(scanUrl);
      setPassportDocData({
        title: 'Passport Scan',
        documentType: 'Passport Scan',
        fileUrl: scanUrl,
        fileName: `${client.passportNumber || 'Client'}_Passport_Scan`,
        did: `DOC-ATTACHED-${Date.now()}`,
      });
      setAutoExtractedBadge(true);
    }

    toast.success(`Client profile linked: ${client.fullName} (${client.passportNumber || client.phone})`);
  };

  // Handles switching from matched/existing client to creating a brand-new client
  const handleSwitchToNewClient = () => {
    setSelectedClient(null);
    setClientMode('new');
    setClientMatchStatus('new');
    toast.info('Switched to New Client mode. A new client record will be registered.');
  };

  /**
   * Helper: Check if a client exists with the given passport number
   */
  const lookupClientByPassport = async (passportNo, fallbackName, extractedDob, extractedExpiry, extraData = {}) => {
    if (!passportNo && !fallbackName) return;

    try {
      const searchTerm = passportNo || fallbackName;
      const res = await apiClient.get('/api/v1/client/clients', {
        params: { search: searchTerm.trim(), limit: 5 },
      });
      const list = res.data?.data || res.data?.clients || (Array.isArray(res.data) ? res.data : []);

      // Check for exact passport match
      const exactMatch = list.find(
        (c) =>
          c.passportNumber &&
          passportNo &&
          c.passportNumber.trim().toUpperCase() === passportNo.trim().toUpperCase()
      );

      if (exactMatch) {
        // Automatically link existing client
        setSelectedClient(exactMatch);
        setClientMode('existing');
        setClientMatchStatus('matched');
        setFormData((prev) => ({
          ...prev,
          fullName: exactMatch.fullName || fallbackName || prev.fullName,
          passportNumber: exactMatch.passportNumber || passportNo || prev.passportNumber,
          phone: exactMatch.phone || extraData.phone || prev.phone,
          email: exactMatch.email || prev.email,
          fatherName: exactMatch.fatherName || exactMatch.guardian?.name || extraData.fatherName || prev.fatherName,
          dateOfBirth: exactMatch.birthDate || exactMatch.dateOfBirth || extractedDob || prev.dateOfBirth,
          passportExpiryDate: exactMatch.passportExpiryDate || extractedExpiry || prev.passportExpiryDate,
          nidNumber: exactMatch.nidNumber || prev.nidNumber,
          address: exactMatch.presentAddress || exactMatch.address || extraData.address || prev.address,
        }));
        toast.success(`Existing client detected: ${exactMatch.fullName} (${exactMatch.passportNumber}). Profile linked!`);
      } else {
        // No match: Prepare as new client
        setSelectedClient(null);
        setClientMode('new');
        setClientMatchStatus('new');
        setFormData((prev) => ({
          ...prev,
          fullName: fallbackName || prev.fullName,
          passportNumber: passportNo || prev.passportNumber,
          dateOfBirth: extractedDob || prev.dateOfBirth,
          passportExpiryDate: extractedExpiry || prev.passportExpiryDate,
          fatherName: extraData.fatherName || prev.fatherName,
          phone: extraData.phone || prev.phone,
          address: extraData.address || prev.address,
        }));
      }
    } catch (err) {
      console.warn('Client passport lookup notice:', err);
      setSelectedClient(null);
      setClientMode('new');
      setClientMatchStatus('new');
    }
  };

  // Mandatory Passport Upload & Document Reader
  const handlePassportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPassportFile(file);
    setPassportPreviewUrl(localUrl);
    setUploadingPassport(true);

    let nameToSet = '';
    let passportToSet = '';
    let dobToSet = '';
    let expiryToSet = '';
    let fatherNameToSet = '';
    let phoneToSet = '';
    let addressToSet = '';

    // If PDF, inspect MRZ pattern as client-side fallback
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const content = String(reader.result || '');

          // Look for Bangladeshi MRZ Line 1: P<BGD[SURNAME]<<[GIVEN_NAMES]
          const mrzLine1 = content.match(/P<BGD([A-Z<]+)/);
          if (mrzLine1) {
            const rawNames = mrzLine1[1].replace(/<+/g, ' ').trim();
            if (rawNames) nameToSet = formatTitleCase(rawNames);
          }

          // Look for Bangladeshi MRZ Line 2: [PASSPORT_NO (9)][CHECK 1][BGD][DOB (6)][CHECK 1][SEX][EXPIRY (6)]
          const mrzLine2 = content.match(/([A-PR-WY][0-9]{7,8})[0-9]BGD([0-9]{6})[0-9][MF<]([0-9]{6})/);
          if (mrzLine2) {
            passportToSet = mrzLine2[1].toUpperCase();
            dobToSet = parseMrzDate(mrzLine2[2], true);
            expiryToSet = parseMrzDate(mrzLine2[3], false);
          } else {
            const passMatch = content.match(/\b([A-PR-WY][0-9]{7,8})\b/);
            if (passMatch && !passportToSet) passportToSet = passMatch[1].toUpperCase();
          }

          if (nameToSet || passportToSet) {
            setAutoExtractedBadge(true);
            await lookupClientByPassport(passportToSet, nameToSet, dobToSet, expiryToSet);
          }
        };
        reader.readAsText(file.slice(0, 30000));
      } catch (pdfErr) {
        console.warn('PDF reader note:', pdfErr);
      }
    }

    // Upload to server and trigger intelligent OCR
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('documentType', 'Passport Scan');

    try {
      const res = await apiClient.post('/api/v1/upload/document', uploadData, {
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
      setPassportDocData(newDoc);

      // Extract server-side OCR passport data
      const passportData = fileData.passportData;
      if (passportData) {
        if (passportData.fullName) nameToSet = passportData.fullName;
        if (passportData.passportNumber) passportToSet = passportData.passportNumber;
        if (passportData.dateOfBirth) dobToSet = passportData.dateOfBirth;
        if (passportData.passportExpiryDate) expiryToSet = passportData.passportExpiryDate;
        if (passportData.fatherName) fatherNameToSet = passportData.fatherName;
        if (passportData.phone) phoneToSet = passportData.phone;
        if (passportData.address) addressToSet = passportData.address;
      }

      if (nameToSet || passportToSet) {
        setAutoExtractedBadge(true);
      }

      // Perform database lookup and auto-link/auto-populate
      await lookupClientByPassport(passportToSet, nameToSet, dobToSet, expiryToSet, {
        fatherName: fatherNameToSet,
        phone: phoneToSet,
        address: addressToSet,
      });

      if (nameToSet || passportToSet) {
        toast.success(`Passport verified: ${nameToSet || passportToSet}`);
      } else {
        toast.success('Passport scan uploaded to vault successfully.');
      }
    } catch (err) {
      console.warn('Passport upload fallback to local URL:', err);
      toast.info('Passport scan attached (Local Preview).');
      setPassportDocData({
        title: 'Passport Scan',
        documentType: 'Passport Scan',
        fileName: file.name,
        fileUrl: localUrl,
        size: file.size,
        did: `DOC-LOCAL-PASSPORT-${Date.now()}`,
      });

      if (passportToSet || nameToSet) {
        await lookupClientByPassport(passportToSet, nameToSet, dobToSet, expiryToSet, {
          fatherName: fatherNameToSet,
          phone: phoneToSet,
          address: addressToSet,
        });
      }
    } finally {
      setUploadingPassport(false);
    }
  };

  // Optional Documents Upload Handler
  const handleOptionalDocUpload = async (e, docTypeTitle) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setUploadingOptionalDoc(true);

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('documentType', docTypeTitle || 'Supporting Document');

    try {
      const res = await apiClient.post('/api/v1/upload/document', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileData = res.data?.data || res.data;
      const uploadedUrl = fileData.fileUrl || fileData.url || localUrl;

      const newDoc = {
        title: docTypeTitle || file.name,
        documentType: docTypeTitle || 'Supporting Document',
        fileUrl: uploadedUrl,
        fileName: file.name,
        size: file.size,
        did: fileData.did || `DOC-OPT-${Date.now()}`,
      };
      setOptionalDocs((prev) => [...prev, newDoc]);
      toast.success(`"${docTypeTitle || file.name}" attached successfully!`);
    } catch (err) {
      const fallbackDoc = {
        title: docTypeTitle || file.name,
        documentType: docTypeTitle || 'Supporting Document',
        fileUrl: localUrl,
        fileName: file.name,
        size: file.size,
        did: `DOC-OPT-LOCAL-${Date.now()}`,
      };
      setOptionalDocs((prev) => [...prev, fallbackDoc]);
      toast.info(`"${docTypeTitle || file.name}" attached (Local)`);
    } finally {
      setUploadingOptionalDoc(false);
      e.target.value = '';
    }
  };

  const removeOptionalDoc = (docDid) => {
    setOptionalDocs((prev) => prev.filter((d) => d.did !== docDid));
  };

  // Check if Section 2 (Candidate & Financial Details) is unlocked
  const isStep2Unlocked = Boolean(passportDocData || passportPreviewUrl || selectedClient);

  // Mid-stage flag: UNDER_PROCESS or OFFER_LETTER requires both Total Agreed and Total Paid
  const isMidStage = targetStage === 'UNDER_PROCESS' || targetStage === 'OFFER_LETTER';

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Passport Gate
    if (!isStep2Unlocked) {
      toast.error('Passport scan copy is mandatory! Please upload passport scan to proceed.');
      return;
    }

    // 2. Mandatory Candidate Fields Validation
    if (!formData.fullName.trim()) {
      toast.error('Full name (as per passport) is required.');
      return;
    }
    if (!formData.passportNumber.trim()) {
      toast.error('Passport number is required.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    if (!formData.fatherName.trim()) {
      toast.error("Father's name is required.");
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required.');
      return;
    }
    if (!formData.passportExpiryDate) {
      toast.error('Passport expiry date is required.');
      return;
    }

    // 3. Package Financial Validation
    const totalAgreed = Number(formData.packageAmount) || 0;
    if (!formData.packageAmount || isNaN(totalAgreed) || totalAgreed <= 0) {
      toast.error('Total agreed amount (BDT) is required and must be greater than 0.');
      return;
    }

    const totalPaid = isMidStage ? (Number(formData.totalPaid) || 0) : 0;
    if (isMidStage) {
      if (totalPaid < 0) {
        toast.error('Total paid amount cannot be negative.');
        return;
      }
      if (totalPaid > totalAgreed) {
        toast.error('Total paid amount cannot exceed the total agreed package amount.');
        return;
      }
    }
    const remainingDue = Math.max(0, totalAgreed - totalPaid);

    // Destination Country Resolution
    let resolvedCountry = 'Greece';
    if (serviceType === 'WORK_PERMIT') {
      resolvedCountry = destinationCountry === 'Other' ? (customCountry.trim() || 'Europe') : destinationCountry;
    } else if (serviceType === 'INDIAN_VISA') {
      resolvedCountry = 'India';
    } else if (serviceType === 'PASSPORT_SERVICE') {
      resolvedCountry = 'Bangladesh';
    }

    // Combine documents to ingest
    const allInitialDocs = [];
    if (passportDocData) allInitialDocs.push(passportDocData);
    optionalDocs.forEach((d) => allInitialDocs.push(d));

    setLoading(true);
    try {
      let targetClient = selectedClient;

      // Create new Client record if clientMode === 'new' or no client selected
      if (clientMode === 'new' || !targetClient) {
        const clientPayload = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim()
            ? formData.email.trim().toLowerCase()
            : `${formData.phone.trim().replace(/[^0-9]/g, '')}@monsuralitravels.com`,
          passportNumber: formData.passportNumber.trim().toUpperCase(),
          birthDate: formData.dateOfBirth || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          passportExpiryDate: formData.passportExpiryDate || undefined,
          fatherName: formData.fatherName.trim() || undefined,
          nidNumber: formData.nidNumber.trim() || undefined,
          presentAddress: formData.address.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          attachments: {
            passportScan: passportDocData?.fileUrl || passportPreviewUrl || undefined,
          },
        };

        let res;
        try {
          res = await apiClient.post('/api/v1/client/clients', clientPayload);
        } catch (err1) {
          res = await apiClient.post('/api/v1/admin/clients', clientPayload);
        }
        targetClient = res.data?.data || res.data?.client || res.data;
      }

      if (targetClient && targetClient.did) {
        // Create Case File with Target Pipeline Stage
        const casePayload = {
          clientDid: targetClient.did,
          applicantName: (targetClient.fullName || formData.fullName).trim(),
          phone: (targetClient.phone || formData.phone).trim(),
          passportNumber: (targetClient.passportNumber || formData.passportNumber).trim().toUpperCase(),
          dateOfBirth: formData.dateOfBirth || targetClient.birthDate || undefined,
          passportExpiryDate: formData.passportExpiryDate || targetClient.passportExpiryDate || undefined,
          fatherName: formData.fatherName.trim() || targetClient.fatherName || undefined,
          nidNumber: formData.nidNumber.trim() || targetClient.nidNumber || undefined,
          guardian: {
            name: (formData.fatherName || targetClient.fatherName || '').trim(),
            relationship: 'Father',
          },
          destinationCountry: resolvedCountry,
          caseType: serviceType,
          serviceType: serviceType,
          status: targetStage,
          packageCost: totalAgreed,
          packageAmount: totalAgreed,
          initialPaidAmount: totalPaid,
          advanceAmount: totalPaid,
          paymentMethod: 'Cash',
          paymentLedger: {
            totalAgreedAmount: totalAgreed,
            step1_advance: totalPaid,
            totalPaidAmount: totalPaid,
            dueAmount: remainingDue,
            isFullyPaid: totalAgreed > 0 && totalPaid >= totalAgreed,
            paymentMethod: 'Cash',
          },
          passportScan: passportDocData?.fileUrl || passportPreviewUrl || '',
          initialDocuments: allInitialDocs,
          remarks: formData.notes.trim() || formData.address.trim() || `Created in stage: ${targetStage}`,
        };

        await apiClient.post('/api/v1/client/cases', casePayload);

        const stageLabelMap = {
          INTAKE: '1. File Intake',
          UNDER_PROCESS: '2. Under Process',
          OFFER_LETTER: '3. Offer Letter',
        };

        toast.success(
          `New case file (${targetClient.fullName || formData.fullName}) created successfully in "${stageLabelMap[targetStage]}" stage!`
        );

        if (onSuccess) onSuccess(targetClient);
        onClose();
      } else {
        toast.error('Failed to create client record.');
      }
    } catch (err) {
      console.error('Case file creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to create case file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white text-zinc-900 rounded-2xl border border-black/10 shadow-2xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        <UnifiedModalHeader
          icon={UserPlus}
          title="New Client Case File"
          subtitle="Select target pipeline stage, upload mandatory passport, and configure file details."
          onClose={onClose}
        />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1 min-h-0 relative z-10">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-xs text-black">
            
            {/* ── STEP 0: TARGET PIPELINE STAGE SELECTOR (3 RADIO BOXES) ──────── */}
            <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/10 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Select Target Pipeline Stage *</span>
                </label>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Target: {targetStage === 'INTAKE' ? '1. File Intake' : targetStage === 'UNDER_PROCESS' ? '2. Under Process' : '3. Offer Letter'}
                </span>
              </div>

              {/* 3 Radio Card Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. File Intake */}
                <label
                  className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    targetStage === 'INTAKE'
                      ? 'bg-blue-500/10 border-blue-600 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/20 hover:bg-black/[0.01]'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetStage"
                    value="INTAKE"
                    checked={targetStage === 'INTAKE'}
                    onChange={() => setTargetStage('INTAKE')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-8 rounded-lg bg-blue-500/15 text-blue-700 flex items-center justify-center">
                      <FolderOpen className="size-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-800">
                      Step 1
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-black text-black block">1. File Intake</span>
                    <span className="text-[11px] text-black/60 block mt-0.5 leading-tight">
                      Passport & bio intake submission
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                    <span className="text-black/50">Advance Intake</span>
                    {targetStage === 'INTAKE' && <Check className="size-3.5 text-blue-600 font-bold" />}
                  </div>
                </label>

                {/* 2. Under Process */}
                <label
                  className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    targetStage === 'UNDER_PROCESS'
                      ? 'bg-sky-500/10 border-sky-600 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/20 hover:bg-black/[0.01]'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetStage"
                    value="UNDER_PROCESS"
                    checked={targetStage === 'UNDER_PROCESS'}
                    onChange={() => setTargetStage('UNDER_PROCESS')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-8 rounded-lg bg-sky-500/15 text-sky-700 flex items-center justify-center">
                      <Layers className="size-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-800">
                      Step 2
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-black text-black block">2. Under Process</span>
                    <span className="text-[11px] text-black/60 block mt-0.5 leading-tight">
                      Ministry & legal processing
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                    <span className="text-black/50">In-Transit</span>
                    {targetStage === 'UNDER_PROCESS' && <Check className="size-3.5 text-sky-600 font-bold" />}
                  </div>
                </label>

                {/* 3. Offer Letter */}
                <label
                  className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    targetStage === 'OFFER_LETTER'
                      ? 'bg-indigo-500/10 border-indigo-600 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/20 hover:bg-black/[0.01]'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetStage"
                    value="OFFER_LETTER"
                    checked={targetStage === 'OFFER_LETTER'}
                    onChange={() => setTargetStage('OFFER_LETTER')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-8 rounded-lg bg-indigo-500/15 text-indigo-700 flex items-center justify-center">
                      <Stamp className="size-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-800">
                      Step 3
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-black text-black block">3. Offer Letter</span>
                    <span className="text-[11px] text-black/60 block mt-0.5 leading-tight">
                      Work permit / offer approved
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                    <span className="text-black/50">5-Page Permit</span>
                    {targetStage === 'OFFER_LETTER' && <Check className="size-3.5 text-indigo-600 font-bold" />}
                  </div>
                </label>
              </div>
            </div>

            {/* ── SECTION 2: SERVICE / CASE TYPE (STRICTLY 3 OPTIONS) ─────────── */}
            <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/10 space-y-3 shadow-2xs">
              <label className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">2</span>
                <span>Service / Case Type *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-black/80 block mb-1.5">
                    Service Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      setServiceType(e.target.value);
                      if (e.target.value === 'WORK_PERMIT') setDestinationCountry('Greece');
                      else if (e.target.value === 'INDIAN_VISA') setDestinationCountry('India');
                      else if (e.target.value === 'PASSPORT_SERVICE') setDestinationCountry('Bangladesh');
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="WORK_PERMIT">Work Permit Visa</option>
                    <option value="INDIAN_VISA">Indian Visa</option>
                    <option value="PASSPORT_SERVICE">Passport Application</option>
                  </select>
                </div>

                {/* Conditional Destination */}
                {serviceType === 'WORK_PERMIT' && (
                  <div>
                    <label className="text-xs font-semibold text-black/80 block mb-1.5">
                      Destination Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="Greece">Greece</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>
                )}

                {serviceType === 'INDIAN_VISA' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                    <Stamp className="size-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">Destination: India</span>
                      <span className="text-[11px] text-amber-800">Double-entry embassy transit or tourist processing</span>
                    </div>
                  </div>
                )}

                {serviceType === 'PASSPORT_SERVICE' && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                    <BookOpen className="size-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">Service: Bangladesh E-Passport</span>
                      <span className="text-[11px] text-emerald-800">Government passport renewal & issuance handling</span>
                    </div>
                  </div>
                )}
              </div>

              {serviceType === 'WORK_PERMIT' && destinationCountry === 'Other' && (
                <div className="pt-1 animate-in fade-in duration-150">
                  <label className="text-xs font-semibold text-black/80 block mb-1">
                    Specify Country Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Romania, Serbia, Croatia, Poland..."
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* ── SECTION 3: MANDATORY PASSPORT SCAN & CLIENT MATCHING ────────── */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border-2 border-dashed border-amber-500/30 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Mandatory Passport Scan & Client Matching *</span>
                </label>
                {selectedClient ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck className="size-3" />
                    <span>Existing Client Linked</span>
                  </span>
                ) : (passportDocData || passportPreviewUrl) ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>Passport Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="size-3" />
                    <span>Required to Unlock</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-black/70 leading-relaxed">
                Upload the passport bio-page scan below. The system will automatically extract candidate details and search for existing clients. You can also search for an existing client directly using the search bar.
              </p>

              {/* Direct Existing Client Search Bar */}
              <div className="relative" ref={searchContainerRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-black/80 flex items-center gap-1.5">
                    <Search className="size-3.5 text-primary" />
                    <span>Search Existing Client (Passport / Phone / Name)</span>
                  </label>
                  {selectedClient && (
                    <button
                      type="button"
                      onClick={handleSwitchToNewClient}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      + Switch to New Client
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search by passport number, phone, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setDropdownOpen(true);
                    }}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden shadow-2xs"
                  />
                  {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin" />}
                </div>

                {dropdownOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-black/10 rounded-xl shadow-xl z-30 divide-y divide-black/10 animate-in fade-in zoom-in-95">
                    {searchResults.map((c) => (
                      <button
                        key={c._id || c.did}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full text-left p-2.5 hover:bg-primary/5 transition flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-xs text-black">{c.fullName}</div>
                          <div className="text-[10px] text-black/60">
                            Phone: {c.phone || 'N/A'} • Passport: <span className="font-mono font-bold text-primary">{c.passportNumber || 'N/A'}</span>
                          </div>
                        </div>
                        <Check className="size-4 text-primary shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Dropzone or Attached Preview */}
              {passportPreviewUrl ? (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-500/40 shadow-xs">
                  {passportFile?.type?.startsWith('image/') || (!passportFile && passportPreviewUrl.match(/\.(jpeg|jpg|png|webp)/i)) ? (
                    <img
                      src={passportPreviewUrl}
                      alt="Passport Bio-Page Scan"
                      className="size-16 object-cover rounded-lg border border-black/10 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 flex flex-col items-center justify-center shrink-0">
                      <FileText className="size-6" />
                      <span className="text-[9px] font-bold mt-0.5">PDF SCAN</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-black truncate">
                        {passportFile?.name || 'Passport_Bio_Data_Scan.pdf'}
                      </p>
                      {autoExtractedBadge && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 flex items-center gap-0.5">
                          <Sparkles className="size-2.5" /> Auto-Read
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-black/50 mt-0.5">
                      {passportFile?.size ? `${(passportFile.size / 1024).toFixed(1)} KB` : 'Attached Bio-Data'} • Cloudflare R2 Vault
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px]">
                      <a
                        href={passportPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <Eye className="size-3" />
                        <span>View Document ↗</span>
                      </a>
                      <label className="text-black/70 hover:text-black cursor-pointer underline font-medium">
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
                <label className="border-2 border-dashed border-amber-500/40 hover:border-amber-600 bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                  <UploadCloud className="size-7 text-amber-600" />
                  <span className="text-xs font-bold text-black">
                    Click or drag passport bio-page scan here *
                  </span>
                  <span className="text-[10px] text-black/50">
                    PDF, JPG, PNG, WEBP (Triggers automatic data reading & client matching)
                  </span>
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
                <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <Loader2 className="size-3.5 animate-spin text-amber-600" />
                  <span>Uploading to Vault & Auto-Reading Passport...</span>
                </div>
              )}

              {/* Dynamic Match Alert Banner */}
              {clientMatchStatus === 'matched' && selectedClient && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                      <UserCheck className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold flex items-center gap-1.5 flex-wrap">
                        <span>Existing Client Linked:</span>
                        <span className="underline decoration-emerald-400">{selectedClient.fullName}</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 truncate mt-0.5">
                        Passport: {selectedClient.passportNumber || 'N/A'} • Phone: {selectedClient.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchToNewClient}
                    className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Switch to New Client
                  </button>
                </div>
              )}

              {clientMatchStatus === 'new' && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2.5 text-xs text-sky-950 animate-in fade-in duration-200">
                  <div className="size-8 rounded-lg bg-sky-500/20 text-sky-700 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold">New Client Profile Detected</div>
                    <div className="text-[10px] text-sky-800 mt-0.5">
                      No existing profile matches passport {formData.passportNumber ? `"${formData.passportNumber}"` : 'number'}. A new client profile will be created upon file creation.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 2 LOCKED PLACEHOLDER (WHEN NO PASSPORT OR CLIENT) ───────── */}
            {!isStep2Unlocked && (
              <div className="p-8 rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.01] flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200">
                <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Lock className="size-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-black">Candidate & Financial Sections Locked</h4>
                  <p className="text-xs text-black/60 mt-1 leading-relaxed">
                    Please upload the mandatory passport scan copy or search and select an existing client in Step 3 above. 
                    Candidate information, supporting documents, and package details will unlock automatically.
                  </p>
                </div>
              </div>
            )}

            {isStep2Unlocked && (
              <>
                {/* ── SECTION 4: CANDIDATE & PASSPORT DETAILS ─────────────── */}
                <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/10 space-y-4 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">4</span>
                      <span>Candidate & Passport Information</span>
                    </label>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-black/70 border border-black/10">
                      {selectedClient ? 'Linked to Existing Profile' : 'New Client Profile'}
                    </span>
                  </div>

                  {/* Editable Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Full Name (as per Passport) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="e.g. Md. Suhag Rahman"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black font-semibold focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Passport Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        placeholder="e.g. A02948192"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black font-mono uppercase font-bold focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 01712345678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black font-mono focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Father's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        placeholder="e.g. Late Monir Uddin"
                        value={formData.fatherName}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Passport Expiry Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="passportExpiryDate"
                        value={formData.passportExpiryDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        National ID (NID)
                      </label>
                      <input
                        type="text"
                        name="nidNumber"
                        placeholder="e.g. 19881234567890"
                        value={formData.nidNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black font-mono focus:border-primary outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-black/80 block mb-1">
                        Present Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="e.g. Sylhet, Bangladesh"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/15 bg-white text-black focus:border-primary outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 5: OPTIONAL SUPPORTING DOCUMENTS ────────────────────── */}
                <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/10 space-y-3 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">5</span>
                      <span>Supporting Documents</span>
                    </label>
                    <span className="text-[10px] text-black/50 font-semibold">(Optional)</span>
                  </div>
                  <p className="text-[11px] text-black/60">
                    Supporting documents are optional. You can upload them now or attach them later from the Case Workspace.
                  </p>

                  {/* Quick Upload Slots */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {/* Photo Upload */}
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-black/15 hover:bg-black/[0.03] text-xs font-semibold text-black cursor-pointer flex items-center gap-1.5 transition">
                      <UploadCloud className="size-3.5 text-black/60" />
                      <span>+ Candidate Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleOptionalDocUpload(e, 'Candidate Photo (2x2)')}
                        disabled={uploadingOptionalDoc}
                      />
                    </label>

                    {/* NID Card Upload */}
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-black/15 hover:bg-black/[0.03] text-xs font-semibold text-black cursor-pointer flex items-center gap-1.5 transition">
                      <UploadCloud className="size-3.5 text-black/60" />
                      <span>+ NID Scan</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleOptionalDocUpload(e, 'National ID (NID)')}
                        disabled={uploadingOptionalDoc}
                      />
                    </label>

                    {/* Offer Letter Upload */}
                    <label className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition ${
                      targetStage === 'OFFER_LETTER'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900 font-bold hover:bg-indigo-500/20'
                        : 'bg-white border-black/15 hover:bg-black/[0.03] text-black'
                    }`}>
                      <FileCheck className="size-3.5 text-indigo-600" />
                      <span>+ Offer Letter / Work Permit Dossier</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleOptionalDocUpload(e, 'Offer Letter / Work Permit Dossier')}
                        disabled={uploadingOptionalDoc}
                      />
                    </label>

                    {/* General Supporting Doc */}
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-black/15 hover:bg-black/[0.03] text-xs font-semibold text-black cursor-pointer flex items-center gap-1.5 transition">
                      <UploadCloud className="size-3.5 text-black/60" />
                      <span>+ Other Document</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleOptionalDocUpload(e, 'Supporting Document')}
                        disabled={uploadingOptionalDoc}
                      />
                    </label>
                  </div>

                  {uploadingOptionalDoc && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Uploading document to vault...</span>
                    </div>
                  )}

                  {/* Uploaded Optional Docs List */}
                  {optionalDocs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {optionalDocs.map((doc) => (
                        <div key={doc.did} className="flex items-center justify-between p-2 bg-white rounded-lg border border-black/10 text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <FileText className="size-4 text-primary shrink-0" />
                            <span className="font-semibold text-black truncate">{doc.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOptionalDoc(doc.did)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer shrink-0"
                            title="Remove Document"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── SECTION 6: PACKAGE DETAILS & FINANCIALS ─────────────────────── */}
                <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/10 space-y-4 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">6</span>
                      <span>Package & Financial Details</span>
                    </label>
                    <span className="text-[10px] font-semibold text-black/50">
                      {isMidStage ? 'Configured for advanced stage' : 'Payments collected via assigned tasks'}
                    </span>
                  </div>

                  {isMidStage ? (
                    <div className="space-y-3.5">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                        <Sparkles className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          For <strong>{targetStage === 'UNDER_PROCESS' ? '2. Under Process' : '3. Offer Letter'}</strong> cases, specify both the <strong>Total Agreed Amount</strong> and any <strong>Total Paid</strong> amount collected so far. The remaining balance will be automatically calculated.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-semibold text-black/80 block mb-1.5">
                            Total Agreed Amount (BDT) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 select-none">
                              BDT
                            </span>
                            <input
                              type="number"
                              name="packageAmount"
                              required
                              min="1"
                              placeholder="e.g. 450000"
                              value={formData.packageAmount}
                              onChange={handleChange}
                              className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-black/15 bg-white text-black font-mono font-bold focus:border-primary outline-hidden shadow-2xs"
                            />
                          </div>
                          <p className="text-[11px] text-black/55 mt-1">
                            Total agreed contract value for this case file.
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-black/80 block mb-1.5">
                            Total Paid So Far (BDT)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 select-none">
                              BDT
                            </span>
                            <input
                              type="number"
                              name="totalPaid"
                              min="0"
                              placeholder="e.g. 150000"
                              value={formData.totalPaid}
                              onChange={handleChange}
                              className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-black/15 bg-white text-black font-mono font-bold focus:border-primary outline-hidden shadow-2xs"
                            />
                          </div>
                          <p className="text-[11px] text-black/55 mt-1">
                            Payment amount already collected from client up to this stage.
                          </p>
                        </div>
                      </div>

                      {/* Real-time Dynamic Financial Balance Card */}
                      <div className="p-3.5 rounded-xl bg-white border border-black/10 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-black/70 uppercase tracking-wider">
                            Live Financial Balance Breakdown
                          </span>
                          {(Number(formData.packageAmount) || 0) > 0 && (
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                              (Number(formData.totalPaid) || 0) >= (Number(formData.packageAmount) || 0)
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : (Number(formData.totalPaid) || 0) > 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}>
                              {(Number(formData.totalPaid) || 0) >= (Number(formData.packageAmount) || 0)
                                ? 'Fully Settled'
                                : (Number(formData.totalPaid) || 0) > 0
                                ? 'Partially Paid'
                                : 'Full Balance Due'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-lg bg-black/[0.03] border border-black/5">
                            <div className="text-[10px] text-black/50 font-medium">Total Agreed</div>
                            <div className="text-xs sm:text-sm font-mono font-bold text-black mt-0.5">
                              BDT {(Number(formData.packageAmount) || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-[10px] text-emerald-800 font-medium">Total Paid</div>
                            <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700 mt-0.5">
                              BDT {(Number(formData.totalPaid) || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className={`p-2.5 rounded-lg border ${
                            (Number(formData.packageAmount) || 0) > 0 && (Number(formData.packageAmount) || 0) <= (Number(formData.totalPaid) || 0)
                              ? 'bg-emerald-500/15 border-emerald-500/30'
                              : 'bg-amber-500/10 border-amber-500/20'
                          }`}>
                            <div className="text-[10px] text-black/60 font-medium">Remaining Due</div>
                            <div className={`text-xs sm:text-sm font-mono font-bold mt-0.5 ${
                              (Number(formData.packageAmount) || 0) > 0 && (Number(formData.packageAmount) || 0) <= (Number(formData.totalPaid) || 0)
                                ? 'text-emerald-800'
                                : 'text-amber-700'
                            }`}>
                              BDT {Math.max(0, (Number(formData.packageAmount) || 0) - (Number(formData.totalPaid) || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {Number(formData.totalPaid) > Number(formData.packageAmount) && Number(formData.packageAmount) > 0 && (
                          <div className="text-[11px] text-rose-600 font-bold animate-in fade-in">
                            ⚠️ Total paid amount exceeds total agreed package price!
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md">
                      <label className="text-xs font-semibold text-black/80 block mb-1.5">
                        Total Agreed Amount (BDT) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 select-none">
                          BDT
                        </span>
                        <input
                          type="number"
                          name="packageAmount"
                          required
                          min="1"
                          placeholder="e.g. 450000"
                          value={formData.packageAmount}
                          onChange={handleChange}
                          className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-black/15 bg-white text-black font-mono font-bold focus:border-primary outline-hidden shadow-2xs"
                        />
                      </div>
                      <p className="text-[11px] text-black/55 mt-1.5">
                        Total contract price for this case file. In Intake stage, full amount remains due initially; payment collection tasks, invoices, and receipts will be handled directly through task assignment.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Modal Footer */}
          <UnifiedModalFooter
            onCancel={onClose}
            cancelText="Cancel"
            submitText={
              loading
                ? 'Creating...'
                : !isStep2Unlocked
                ? 'Upload Passport to Proceed'
                : `Create Case File in ${
                    targetStage === 'INTAKE'
                      ? 'Intake'
                      : targetStage === 'UNDER_PROCESS'
                      ? 'Processing'
                      : 'Offer Letter'
                  }`
            }
            loadingText="Creating Case File..."
            submitIcon={!isStep2Unlocked ? Lock : CheckCircle2}
            loading={loading}
            disabled={!isStep2Unlocked}
          />
        </form>
      </div>
    </div>
  );
}
