import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Users,
  X,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Building2,
  Globe,
  MapPin,
  Calendar,
  Stamp,
  BookOpen,
  Briefcase,
  Plane,
  Layers,
  Search,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { UnifiedModalHeader, UnifiedModalFooter } from '@shared/components/common/UnifiedModal';

// Renders the modal dialog for creating a new client and case file
const CreateClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('new'); // 'new' | 'existing'
  
  // Existing client search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Service Configuration (at the TOP)
    serviceType: 'WORK_PERMIT', // 'WORK_PERMIT' | 'INDIAN_VISA' | 'PASSPORT_SERVICE' | 'TOURIST_VISA' | 'UMRAH_HAJJ' | 'OTHER'
    destinationCountry: 'Greece', // 'Greece' | 'North Macedonia' | 'Other'
    customCountry: '',
    
    // Client Personal Info
    fullName: '',
    phone: '',
    email: '',
    passportNumber: '',
    nidNumber: '',
    clientType: 'Individual',
    
    // Financial / Package Details
    packageAmount: '',
    
    // Notes & Address
    address: '',
    notes: '',
  });

  // Debounced search for existing clients
  useEffect(() => {
    if (clientMode !== 'existing') return;
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
  }, [searchQuery, clientMode]);

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

  // Handles text and select input field updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'serviceType') {
      let defaultCountry = 'Greece';
      if (value === 'WORK_PERMIT') defaultCountry = 'Greece';
      else if (value === 'INDIAN_VISA') defaultCountry = 'India';
      else if (value === 'PASSPORT_SERVICE') defaultCountry = 'Bangladesh';
      else if (value === 'UMRAH_HAJJ') defaultCountry = 'Saudi Arabia';
      else defaultCountry = 'Other';

      setFormData((prev) => ({
        ...prev,
        serviceType: value,
        destinationCountry: defaultCountry,
        customCountry: '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles selecting an existing client from dropdown
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchQuery(client.fullName || client.phone || '');
    setDropdownOpen(false);
    setFormData((prev) => ({
      ...prev,
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      passportNumber: client.passportNumber || '',
      nidNumber: client.nidNumber || '',
      clientType: client.clientType || 'Individual',
      address: client.presentAddress || client.address || '',
    }));
  };

  // Submits the client / case file to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation for Existing Client selection
    if (clientMode === 'existing') {
      if (!selectedClient) {
        toast.error('Please search and select an existing client.');
        return;
      }
    } else {
      // 2. Validation for New Client
      if (!formData.fullName.trim()) {
        toast.error('Client Full Name is required.');
        return;
      }
      if (!formData.phone.trim()) {
        toast.error('Phone Number is required.');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email Address is required.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Please enter a valid email address.');
        return;
      }
    }

    // 3. Package Details Validation (Mandatory for all)
    if (!formData.packageAmount || isNaN(Number(formData.packageAmount)) || Number(formData.packageAmount) <= 0) {
      toast.error('Total Agreed Package Amount is required and must be greater than 0.');
      return;
    }

    // Resolve destination country based on serviceType
    let resolvedCountry = 'Other';
    if (formData.serviceType === 'INDIAN_VISA') {
      resolvedCountry = 'India';
    } else if (formData.serviceType === 'PASSPORT_SERVICE') {
      resolvedCountry = 'Bangladesh';
    } else if (formData.serviceType === 'UMRAH_HAJJ') {
      resolvedCountry = 'Saudi Arabia';
    } else if (formData.destinationCountry === 'Other') {
      resolvedCountry = formData.customCountry.trim() || 'Other Country';
    } else {
      resolvedCountry = formData.destinationCountry;
    }

    setLoading(true);
    try {
      let targetClient = selectedClient;

      // If new client mode, create client record first
      if (clientMode === 'new') {
        const clientPayload = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          passportNumber: formData.serviceType !== 'PASSPORT_SERVICE' && formData.passportNumber.trim() 
            ? formData.passportNumber.trim().toUpperCase() 
            : undefined,
          nidNumber: formData.nidNumber.trim() || undefined,
          clientType: formData.clientType,
          presentAddress: formData.address.trim() || undefined,
          notes: formData.notes.trim() || undefined,
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
        // Create linked initial case file
        try {
          await apiClient.post('/api/v1/client/cases', {
            clientDid: targetClient.did,
            applicantName: (targetClient.fullName || formData.fullName).trim(),
            phone: (targetClient.phone || formData.phone).trim(),
            passportNumber: formData.serviceType !== 'PASSPORT_SERVICE' && (targetClient.passportNumber || formData.passportNumber).trim() 
              ? (targetClient.passportNumber || formData.passportNumber).trim().toUpperCase() 
              : undefined,
            destinationCountry: resolvedCountry,
            caseType: formData.serviceType,
            serviceType: formData.serviceType,
            packageCost: Number(formData.packageAmount) || 0,
            remarks: formData.notes.trim() || formData.address.trim() || undefined,
          });
        } catch (caseErr) {
          console.warn('Initial case creation note:', caseErr);
        }

        toast.success(`Client file for "${targetClient.fullName || formData.fullName}" created successfully!`);
        if (onSuccess) onSuccess(targetClient);
        onClose();
      } else {
        toast.error('Failed to create or link client record.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process client case.');
    } finally {
      setLoading(false);
    }
  };

  const isPassportService = formData.serviceType === 'PASSPORT_SERVICE';
  const isIndianVisa = formData.serviceType === 'INDIAN_VISA';
  const isWorkPermit = formData.serviceType === 'WORK_PERMIT';
  const isUmrah = formData.serviceType === 'UMRAH_HAJJ';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white text-zinc-900 rounded-2xl border border-black/10 shadow-2xl max-w-2xl w-full h-[70vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        <UnifiedModalHeader
          icon={UserPlus}
          title="New Client & Case File"
          subtitle="Register a new client profile and initialize their service workflow."
          onClose={onClose}
        />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1 min-h-0 relative z-10">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0 text-xs text-zinc-900">
            {/* ── TOP SECTION 1: SERVICE & DESTINATION ────────────────── */}
            <div className="p-4 rounded-xl bg-black/[0.02] border border-black/10 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Briefcase className="size-4" />
                <span>1. Service & Category Selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service / Case Type */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Service / Case Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="WORK_PERMIT" className="bg-zinc-950 text-zinc-100">Work Permit Visa</option>
                    <option value="INDIAN_VISA" className="bg-zinc-950 text-zinc-100">Indian Visa</option>
                    <option value="PASSPORT_SERVICE" className="bg-zinc-950 text-zinc-100">Passport Application</option>
                    <option value="TOURIST_VISA" className="bg-zinc-950 text-zinc-100">Tourist / Visit Visa (Tourist Visa)</option>
                    <option value="UMRAH_HAJJ" className="bg-zinc-950 text-zinc-100">Umrah / Hajj Package</option>
                    <option value="OTHER" className="bg-zinc-950 text-zinc-100">Other Consular Service</option>
                  </select>
                </div>

                {/* Destination Country Selection - Conditional */}
                {isWorkPermit && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Destination Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="Greece" className="bg-zinc-950 text-zinc-100">Greece</option>
                      <option value="North Macedonia" className="bg-zinc-950 text-zinc-100">North Macedonia</option>
                      <option value="Other" className="bg-zinc-950 text-zinc-100">Other Country</option>
                    </select>
                  </div>
                )}

                {isIndianVisa && (
                  <div className="flex flex-col justify-center p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-amber-200 text-xs">
                      <Stamp className="size-4 text-amber-400 shrink-0" />
                      <span>Destination: India</span>
                    </div>
                    <span className="text-[11px] text-amber-300/80 font-medium mt-1">
                      Country selection is not required for Indian Visa.
                    </span>
                  </div>
                )}

                {isPassportService && (
                  <div className="flex flex-col justify-center p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-200 text-xs">
                      <BookOpen className="size-4 text-emerald-400 shrink-0" />
                      <span>Service: Bangladesh E-Passport</span>
                    </div>
                    <span className="text-[11px] text-emerald-300/80 font-medium mt-1">
                      No prior passport number required for new applicants.
                    </span>
                  </div>
                )}

                {isUmrah && (
                  <div className="flex flex-col justify-center p-3 rounded-xl bg-blue-950/30 border border-blue-800/50 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-blue-200 text-xs">
                      <Plane className="size-4 text-blue-400 shrink-0" />
                      <span>Destination: Saudi Arabia</span>
                    </div>
                    <span className="text-[11px] text-blue-300/80 font-medium mt-1">
                      Umrah / Hajj processing destination is Saudi Arabia.
                    </span>
                  </div>
                )}

                {!isWorkPermit && !isIndianVisa && !isPassportService && !isUmrah && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Destination Country
                    </label>
                    <select
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="Saudi Arabia" className="bg-zinc-950 text-zinc-100">Saudi Arabia</option>
                      <option value="United Arab Emirates" className="bg-zinc-950 text-zinc-100">Dubai / UAE</option>
                      <option value="Qatar" className="bg-zinc-950 text-zinc-100">Qatar</option>
                      <option value="Oman" className="bg-zinc-950 text-zinc-100">Oman</option>
                      <option value="Kuwait" className="bg-zinc-950 text-zinc-100">Kuwait</option>
                      <option value="Singapore" className="bg-zinc-950 text-zinc-100">Singapore</option>
                      <option value="Malaysia" className="bg-zinc-950 text-zinc-100">Malaysia</option>
                      <option value="Thailand" className="bg-zinc-950 text-zinc-100">Thailand</option>
                      <option value="Other" className="bg-zinc-950 text-zinc-100">Other Country</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Manual Country Input when "Other" is selected */}
              {(isWorkPermit || (!isIndianVisa && !isPassportService && !isUmrah)) &&
                formData.destinationCountry === 'Other' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Specify Country Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customCountry"
                      placeholder="e.g. Croatia, Romania, Serbia, Poland..."
                      value={formData.customCountry}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-primary/40 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
            </div>

            {/* ── SECTION 2: CLIENT BASIC INFO WITH RADIO SELECTOR ───────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Basic Information
                </h3>
              </div>

              {/* Radio Selector: Add New vs Existing Client */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
                <label
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    clientMode === 'new'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="clientMode"
                    value="new"
                    checked={clientMode === 'new'}
                    onChange={() => {
                      setClientMode('new');
                      setSelectedClient(null);
                    }}
                    className="sr-only"
                  />
                  <UserPlus className="size-3.5" />
                  <span>Add New Client</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    clientMode === 'existing'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="clientMode"
                    value="existing"
                    checked={clientMode === 'existing'}
                    onChange={() => setClientMode('existing')}
                    className="sr-only"
                  />
                  <Users className="size-3.5" />
                  <span>Existing Client</span>
                </label>
              </div>

              {/* Existing Client Search Box */}
              {clientMode === 'existing' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="relative" ref={searchContainerRef}>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Search Existing Client <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, passport, or client code..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedClient(null);
                        }}
                        onFocus={() => {
                          if (searchResults.length > 0) setDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin" />
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {dropdownOpen && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-30 divide-y divide-zinc-800/60">
                        {searchResults.map((client) => {
                          const isSel = selectedClient && (selectedClient.did === client.did || selectedClient._id === client._id);
                          return (
                            <button
                              key={client._id || client.did}
                              type="button"
                              onClick={() => handleSelectClient(client)}
                              className={`w-full text-left p-3 hover:bg-zinc-800/80 transition-colors flex items-center justify-between cursor-pointer ${
                                isSel ? 'bg-primary/10 border-l-2 border-primary' : ''
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <div className="font-bold text-zinc-100 text-xs truncate">
                                  {client.fullName}
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                                  <span>Phone: {client.phone || '—'}</span>
                                  {client.passportNumber && <span>Passport: {client.passportNumber}</span>}
                                </div>
                              </div>
                              {isSel && <Check className="size-4 text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Client Summary Card */}
                  {selectedClient && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between font-bold text-emerald-400">
                        <span>Selected: {selectedClient.fullName}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300">
                          {selectedClient.clientCode || 'Client'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-300 grid grid-cols-2 gap-2 pt-1">
                        <div>Phone: <span className="font-mono text-zinc-100">{selectedClient.phone || '—'}</span></div>
                        <div>Email: <span className="text-zinc-100">{selectedClient.email || '—'}</span></div>
                        <div>Passport: <span className="font-mono text-zinc-100">{selectedClient.passportNumber || '—'}</span></div>
                        <div>NID: <span className="font-mono text-zinc-100">{selectedClient.nidNumber || '—'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Client Form Inputs */}
              {clientMode === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Md. Rafiqul Islam"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +880 1712-345678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. rafiq@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Passport Number Input: HIDDEN if service is PASSPORT_SERVICE */}
                  {!isPassportService && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        placeholder="e.g. A01234567"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      NID Number
                    </label>
                    <input
                      type="text"
                      name="nidNumber"
                      placeholder="e.g. 19881234567890"
                      value={formData.nidNumber}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Client Type
                    </label>
                    <select
                      name="clientType"
                      value={formData.clientType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="Individual" className="bg-zinc-950 text-zinc-100">Individual</option>
                      <option value="Corporate" className="bg-zinc-950 text-zinc-100">Corporate / Agency</option>
                      <option value="VIP" className="bg-zinc-950 text-zinc-100">VIP Client</option>
                      <option value="Lead" className="bg-zinc-950 text-zinc-100">Lead / Prospect</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION 3: PACKAGE DETAILS ────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                3. Package Details
              </h3>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Total Agreed Package Amount (BDT) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="packageAmount"
                  required
                  min="1"
                  placeholder="e.g. 450000"
                  value={formData.packageAmount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono font-bold"
                />
              </div>
            </div>

            {/* ── SECTION 4: ADDRESS & NOTES ──────────────────────────────────────── */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Present Address / Notes
              </label>
              <textarea
                name="address"
                rows="2"
                placeholder="e.g. Vill: Joypur, Upazila: Golapganj, Sylhet."
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          {/* Unified Modal Action Bar */}
          <UnifiedModalFooter
            onCancel={onClose}
            cancelText="Cancel"
            submitText="Create Client File"
            loadingText="Creating Client..."
            submitIcon={CheckCircle2}
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;

