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
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// Renders the modal dialog for creating a new client and case file
const CreateClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    passportNumber: '',
    nidNumber: '',
    customerType: 'Individual',
    serviceType: 'WORK_PERMIT',
    destinationCountry: 'Saudi Arabia',
    packageAmount: '',
    advanceAmount: '',
    paymentMethod: 'CASH',
    address: '',
    notes: '',
  });

  if (!isOpen) return null;

  // Handles text input field updates
  const handleChange = (e) => {
    const { name, value } = e.target;
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

    setLoading(true);
    try {
      // 1. Create client record
      const clientPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        passportNumber: formData.passportNumber.trim() || undefined,
        nidNumber: formData.nidNumber.trim() || undefined,
        customerType: formData.customerType,
        presentAddress: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const res = await apiClient.post('/api/v1/client/clients', clientPayload);
      const createdClient = res.data?.data;

      if (createdClient && createdClient.did) {
        // 2. Optionally create linked initial case file if packageAmount or serviceType is provided
        if (formData.packageAmount || formData.serviceType) {
          try {
            await apiClient.post('/api/v1/client/cases', {
              clientDid: createdClient.did,
              applicantName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              passportNumber: formData.passportNumber.trim() || undefined,
              destinationCountry: formData.destinationCountry,
              caseType: formData.serviceType,
              packageCost: Number(formData.packageAmount) || 0,
              initialPaidAmount: Number(formData.advanceAmount) || 0,
              paymentMethod: formData.paymentMethod,
            });
          } catch (caseErr) {
            console.warn('Initial case creation note:', caseErr);
          }
        }

        toast.success(`Client "${formData.fullName}" created successfully!`);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                New Client & Case File
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Register a new client profile and initialize their service workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow">
          {/* Section 1: Client Personal Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              1. Basic Information
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

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
                  Customer Type
                </label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate / Agency</option>
                  <option value="VIP">VIP Customer</option>
                  <option value="Lead">Lead / Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Initial Case & Service Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              2. Service & Package Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Service / Case Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="WORK_PERMIT">Work Permit Visa</option>
                  <option value="TOURIST_VISA">Tourist / Visit Visa</option>
                  <option value="MEDICAL_VISA">Medical Visa</option>
                  <option value="UMRAH_HAJJ">Umrah / Hajj Package</option>
                  <option value="STUDENT_VISA">Student Visa</option>
                  <option value="MANPOWER">Manpower & Emigration</option>
                </select>
              </div>

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
                  <option value="Malaysia">Malaysia</option>
                  <option value="United Arab Emirates">Dubai / UAE</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Oman">Oman</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="India">India</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other Country</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Total Package Amount (BDT)
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

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Initial Advance Paid (BDT)
                </label>
                <input
                  type="number"
                  name="advanceAmount"
                  placeholder="e.g. 50000"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Address */}
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

          {/* Modal Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              <span>{loading ? 'Creating Client...' : 'Create Client File'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;
