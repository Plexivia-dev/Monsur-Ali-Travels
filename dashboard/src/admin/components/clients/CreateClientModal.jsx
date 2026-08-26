import React, { useState } from 'react';
import {
  UserPlus,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { UnifiedModalHeader, UnifiedModalFooter } from '@shared/components/common/UnifiedModal';

// Renders the modal dialog for creating a new client and case file
const CreateClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
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

  // Submits the new client and initial case file to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Client Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone Number is required.');
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
      // 1. Create client record
      const clientPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
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
      const createdClient = res.data?.data || res.data?.client || res.data;

      if (createdClient && createdClient.did) {
        // 2. Create linked initial case file
        try {
          await apiClient.post('/api/v1/client/cases', {
            clientDid: createdClient.did,
            applicantName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            passportNumber: formData.serviceType !== 'PASSPORT_SERVICE' && formData.passportNumber.trim() 
              ? formData.passportNumber.trim().toUpperCase() 
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

        toast.success(`Client file for "${formData.fullName}" created successfully!`);
        if (onSuccess) onSuccess(createdClient);
        onClose();
      } else {
        toast.error(res.data?.message || 'Failed to create client.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create client record.');
    } finally {
      setLoading(false);
    }
  };

  const isPassportService = formData.serviceType === 'PASSPORT_SERVICE';
  const isIndianVisa = formData.serviceType === 'INDIAN_VISA';
  const isWorkPermit = formData.serviceType === 'WORK_PERMIT';
  const isUmrah = formData.serviceType === 'UMRAH_HAJJ';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Unified Brand Navy-Blue Gradient Header */}
        <UnifiedModalHeader
          icon={UserPlus}
          title="New Client & Case File"
          subtitle="Register a new client profile and initialize their service workflow."
          onClose={onClose}
        />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-grow">
          <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          {/* ── TOP SECTION 1: SERVICE & DESTINATION (MOVED TO TOP) ────────────────── */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Briefcase className="size-4" />
              <span>1. Service & Category Selection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service / Case Type */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Service / Case Type <span className="text-rose-500">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="WORK_PERMIT">Work Permit Visa (ওয়ার্ক পারমিট ভিসা)</option>
                  <option value="INDIAN_VISA">Indian Visa (ইন্ডিয়ান ভিসা)</option>
                  <option value="PASSPORT_SERVICE">Passport Application (পাসপোর্ট আবেদন)</option>
                  <option value="TOURIST_VISA">Tourist / Visit Visa (ট্যুরিস্ট ভিসা)</option>
                  <option value="UMRAH_HAJJ">Umrah / Hajj Package (উমরাহ ও হজ)</option>
                  <option value="OTHER">Other Consular Service (অন্যান্য)</option>
                </select>
              </div>

              {/* Destination Country Selection - Conditional */}
              {isWorkPermit && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Destination Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="destinationCountry"
                    value={formData.destinationCountry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Greece">Greece (গ্রিস)</option>
                    <option value="North Macedonia">North Macedonia (মেসিডোনিয়া)</option>
                    <option value="Other">Other Country (অন্যান্য দেশ)</option>
                  </select>
                </div>
              )}

              {isIndianVisa && (
                <div className="flex flex-col justify-center p-3 rounded-xl bg-amber-50 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-700/60 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200 text-xs">
                    <Stamp className="size-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Destination: India</span>
                  </div>
                  <span className="text-[11px] text-amber-900/80 dark:text-amber-300/90 font-medium mt-1">
                    Country selection is not required for Indian Visa.
                  </span>
                </div>
              )}

              {isPassportService && (
                <div className="flex flex-col justify-center p-3 rounded-xl bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700/60 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                    <BookOpen className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>Service: Bangladesh E-Passport</span>
                  </div>
                  <span className="text-[11px] text-emerald-900/80 dark:text-emerald-300/90 font-medium mt-1">
                    No prior passport number required for new applicants.
                  </span>
                </div>
              )}

              {isUmrah && (
                <div className="flex flex-col justify-center p-3 rounded-xl bg-blue-50 border border-blue-300 dark:bg-blue-950/40 dark:border-blue-700/60 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-200 text-xs">
                    <Plane className="size-4 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span>Destination: Saudi Arabia (সৌদি আরব)</span>
                  </div>
                  <span className="text-[11px] text-blue-900/80 dark:text-blue-300/90 font-medium mt-1">
                    Umrah / Hajj processing destination is Saudi Arabia.
                  </span>
                </div>
              )}

              {!isWorkPermit && !isIndianVisa && !isPassportService && !isUmrah && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Destination Country
                  </label>
                  <select
                    name="destinationCountry"
                    value={formData.destinationCountry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">Dubai / UAE</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>
              )}
            </div>

            {/* Manual Country Input when "Other" is selected */}
            {(isWorkPermit || (!isIndianVisa && !isPassportService && !isUmrah)) &&
              formData.destinationCountry === 'Other' && (
                <div className="animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Specify Country Name (দেশের নাম লিখুন) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customCountry"
                    placeholder="e.g. Croatia, Romania, Serbia, Poland..."
                    value={formData.customCountry}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-primary/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
          </div>

          {/* ── SECTION 2: CLIENT BASIC INFO ───────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              2. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Md. Rafiqul Islam"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +880 1712-345678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. rafiq@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Passport Number Input: HIDDEN if service is PASSPORT_SERVICE */}
              {!isPassportService && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    placeholder="e.g. A01234567"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  NID Number
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  placeholder="e.g. 19881234567890"
                  value={formData.nidNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Client Type
                </label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate / Agency</option>
                  <option value="VIP">VIP Client</option>
                  <option value="Lead">Lead / Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: PACKAGE DETAILS ────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              3. Package Details
            </h3>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Total Agreed Package Amount (BDT)
              </label>
              <input
                type="number"
                name="packageAmount"
                placeholder="e.g. 450000"
                value={formData.packageAmount}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* ── SECTION 4: ADDRESS & NOTES ──────────────────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Present Address / Notes
            </label>
            <textarea
              name="address"
              rows="2"
              placeholder="e.g. Vill: Joypur, Upazila: Golapganj, Sylhet."
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
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
