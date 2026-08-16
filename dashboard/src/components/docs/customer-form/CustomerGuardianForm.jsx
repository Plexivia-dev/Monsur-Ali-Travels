import React from 'react';
import {
  User,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Building,
  Save,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import { BdPhoneInput } from '../../common/BdPhoneInput';
import { DatePicker } from '../../ui/date-picker';
import { SERVICE_TYPES, STATUS_OPTIONS } from './sampleData';

export function CustomerGuardianForm({ data, onChange, onReset, onSave, onPreview, isSubmitting }) {
  const handleCustomerChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const handleGuardianChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      guardian: { ...prev.guardian, [field]: value }
    }));
  };

  const handlePaymentChange = (field, value) => {
    onChange(prev => {
      const updatedPayment = { ...prev.payment, [field]: value };
      const total = Number(field === 'totalAmount' ? value : updatedPayment.totalAmount) || 0;
      const advance = Number(field === 'advancePaid' ? value : updatedPayment.advancePaid) || 0;
      updatedPayment.dueAmount = Math.max(0, total - advance);

      if (total > 0 && advance >= total) {
        updatedPayment.paymentStatus = 'Paid';
      } else if (advance > 0) {
        updatedPayment.paymentStatus = 'Partial';
      } else {
        updatedPayment.paymentStatus = 'Unpaid';
      }

      return { ...prev, payment: updatedPayment };
    });
  };

  const handleDocChange = (index, field, value) => {
    onChange(prev => {
      const updated = [...(prev.requirementDocuments || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, requirementDocuments: updated };
    });
  };

  const handleAddDoc = () => {
    onChange(prev => {
      const list = prev.requirementDocuments || [];
      const newDoc = {
        id: list.length + 1,
        name: 'New Required Document',
        submitted: 'Yes',
        remarks: ''
      };
      return { ...prev, requirementDocuments: [...list, newDoc] };
    });
  };

  const handleRemoveDoc = (index) => {
    onChange(prev => {
      const updated = prev.requirementDocuments.filter((_, idx) => idx !== index);
      const reindexed = updated.map((item, i) => ({ ...item, id: i + 1 }));
      return { ...prev, requirementDocuments: reindexed };
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Customer &amp; Guardian Information Application Form
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            কাস্টমার ও অভিভাবকের তথ্য, ফাইল স্ট্যাটাস ও অগ্রিম পেমেন্টের হিসাব ডাটাবেজে সংরক্ষণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear / Reset Form</span>
          </button>
        </div>
      </div>

      {/* SERVICE & STATUS CONTROL BAR */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Service Type (কাজের ধরণ / উদ্দেশ্য)
            </label>
            <select
              value={data.serviceType || SERVICE_TYPES[0]}
              onChange={(e) => onChange(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {SERVICE_TYPES.map((st, i) => (
                <option key={i} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              File Processing Status (ফাইলের অবস্থান)
            </label>
            <select
              value={data.status || 'received'}
              onChange={(e) => onChange(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-bold text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {STATUS_OPTIONS.map((so) => (
                <option key={so.id} value={so.id}>{so.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Application No.</label>
            <input
              type="text"
              value={data.applicationNo || ''}
              onChange={(e) => onChange(prev => ({ ...prev, applicationNo: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Date Received</label>
            <DatePicker
              value={data.dateReceived || ''}
              onChange={(val) => onChange(prev => ({ ...prev, dateReceived: val, declarationDate: val }))}
            />
          </div>
        </div>
      </div>

      {/* 1. CUSTOMER DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#103058] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>1. Customer Details (কাস্টমারের বিবরণ)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Full Name (পূর্ণ নাম) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="কাস্টমারের পূর্ণ নাম লিখুন"
              value={data.customer?.fullName || ''}
              onChange={(e) => handleCustomerChange('fullName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              NID Number <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="জাতীয় পরিচয়পত্র নম্বর"
              value={data.customer?.nidNumber || ''}
              onChange={(e) => handleCustomerChange('nidNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Passport Number</label>
            <input
              type="text"
              placeholder="পাসপোর্ট নম্বর"
              value={data.customer?.passportNumber || ''}
              onChange={(e) => handleCustomerChange('passportNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1 leading-tight truncate" title="Country previously applied to and rejected by">
              Rejected Country (যদি থাকে)
            </label>
            <input
              type="text"
              placeholder="পূর্বে রিজেক্ট হওয়া দেশ (যদি থাকে)"
              value={data.customer?.countryRejected || ''}
              onChange={(e) => handleCustomerChange('countryRejected', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Father Name (পিতার নাম)</label>
            <input
              type="text"
              placeholder="পিতার নাম লিখুন"
              value={data.customer?.fatherName || ''}
              onChange={(e) => handleCustomerChange('fatherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Mother Name (মাতার নাম)</label>
            <input
              type="text"
              placeholder="মাতার নাম লিখুন"
              value={data.customer?.motherName || ''}
              onChange={(e) => handleCustomerChange('motherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Mobile Number (ফোন)</label>
            <BdPhoneInput
              value={data.customer?.mobileNumber || ''}
              onChange={(val) => handleCustomerChange('mobileNumber', val)}
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Email Address</label>
            <input
              type="email"
              placeholder="ইমেইল অ্যাড্রেস"
              value={data.customer?.email || ''}
              onChange={(e) => handleCustomerChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. GUARDIAN DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#103058] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>2. Guardian Details (অভিভাবকের বিবরণ)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Guardian Full Name (নাম)</label>
            <input
              type="text"
              placeholder="অভিভাবকের পূর্ণ নাম"
              value={data.guardian?.fullName || ''}
              onChange={(e) => handleGuardianChange('fullName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">NID Card Number</label>
            <input
              type="text"
              placeholder="অভিভাবকের NID নম্বর"
              value={data.guardian?.nidNumber || ''}
              onChange={(e) => handleGuardianChange('nidNumber', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Father Name (পিতার নাম)</label>
            <input
              type="text"
              placeholder="পিতার নাম"
              value={data.guardian?.fatherName || ''}
              onChange={(e) => handleGuardianChange('fatherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Mother Name (মাতার নাম)</label>
            <input
              type="text"
              placeholder="মাতার নাম"
              value={data.guardian?.motherName || ''}
              onChange={(e) => handleGuardianChange('motherName', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Mobile Number</label>
            <BdPhoneInput
              value={data.guardian?.mobileNumber || ''}
              onChange={(val) => handleGuardianChange('mobileNumber', val)}
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Email Address</label>
            <input
              type="email"
              placeholder="ইমেইল"
              value={data.guardian?.email || ''}
              onChange={(e) => handleGuardianChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Relationship with Customer</label>
            <input
              type="text"
              placeholder="সম্পর্ক (যেমন: পিতা, চাচা, ভাই)"
              value={data.guardian?.relationship || ''}
              onChange={(e) => handleGuardianChange('relationship', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Guardian Address (ঠিকানা)</label>
            <input
              type="text"
              placeholder="গ্রাম, ডাকঘর, জেলা"
              value={data.guardian?.address || ''}
              onChange={(e) => handleGuardianChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER REQUIREMENT DOCUMENTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-[#103058] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>3. Customer Requirement Documents (প্রয়োজনীয় কাগজপত্র)</span>
          </div>
          <button
            type="button"
            onClick={handleAddDoc}
            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Document</span>
          </button>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border text-[11px] uppercase font-bold">
              <tr>
                <th className="py-2 px-3 w-12 text-center">No.</th>
                <th className="py-2 px-3">Required Document</th>
                <th className="py-2 px-3 w-36">Submitted Status</th>
                <th className="py-2 px-3 w-48">Remarks</th>
                <th className="py-2 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data.requirementDocuments || []).map((doc, idx) => (
                <tr key={doc.id || idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => handleDocChange(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border-0 font-medium text-foreground text-xs focus:ring-1 focus:ring-primary rounded"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={doc.submitted || 'Yes'}
                      onChange={(e) => handleDocChange(idx, 'submitted', e.target.value)}
                      className="w-full px-2 py-1 bg-muted/60 border border-border rounded text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="Yes">Yes (জমা আছে)</option>
                      <option value="No">No (জমা নেই)</option>
                      <option value="Pending">Pending</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="Remarks..."
                      value={doc.remarks || ''}
                      onChange={(e) => handleDocChange(idx, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 bg-muted/50 border border-border rounded text-xs text-foreground focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADVANCE PAYMENT DETAILS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[#103058] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          <DollarSign className="w-4 h-4" />
          <span>4. Service Fee &amp; Advance Payment (অগ্রিম পেমেন্ট ও সার্ভিস চার্জ)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-muted/30 p-4 rounded-xl border border-border">
          <div>
            <label className="block font-bold text-foreground mb-1">Total Agreed Fee (মোট টাকা)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-muted-foreground">৳</span>
              <input
                type="number"
                placeholder="0"
                value={data.payment?.totalAmount || ''}
                onChange={(e) => handlePaymentChange('totalAmount', e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              Advance Paid (অগ্রিম জমা)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-emerald-600">৳</span>
              <input
                type="number"
                placeholder="0"
                value={data.payment?.advancePaid || ''}
                onChange={(e) => handlePaymentChange('advancePaid', e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-background border border-emerald-500/40 rounded-lg text-emerald-700 dark:text-emerald-400 font-mono font-black focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-rose-600 dark:text-rose-400 mb-1">
              Due Amount (বকেয়া টাকা)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-bold text-rose-600">৳</span>
              <input
                type="number"
                readOnly
                value={data.payment?.dueAmount || 0}
                className="w-full pl-8 pr-3 py-2 bg-muted/60 border border-rose-500/40 rounded-lg text-rose-600 dark:text-rose-400 font-mono font-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Payment Method</label>
            <select
              value={data.payment?.paymentMethod || 'Cash'}
              onChange={(e) => handlePaymentChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="Cash">Cash (নগদ)</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Money Receipt No.</label>
            <input
              type="text"
              placeholder="e.g. REC-5829"
              value={data.payment?.receiptNo || ''}
              onChange={(e) => handlePaymentChange('receiptNo', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-medium focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 5. OFFICE NOTES & DECLARATION */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Building className="w-4 h-4 text-primary" />
          <span>Office Remarks &amp; Officer Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Verified By (অফিস কর্মকর্তা)</label>
            <input
              type="text"
              value={data.verifiedBy || ''}
              onChange={(e) => onChange(prev => ({ ...prev, verifiedBy: e.target.value }))}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground font-semibold text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-muted-foreground mb-1">Office Internal Notes (অফিস নোট)</label>
            <input
              type="text"
              placeholder="Internal file remarks..."
              value={data.officeNotes || ''}
              onChange={(e) => onChange(prev => ({ ...prev, officeNotes: e.target.value }))}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bottom Submit / View Preview Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {data._id ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Editing saved application: {data.applicationNo}
            </span>
          ) : (
            <span>New application not yet saved to database.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-2 border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>View Preview</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : data._id ? 'Update Database (আপডেট করুন)' : 'Save to Database (ডাটাবেজে সেভ করুন)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
