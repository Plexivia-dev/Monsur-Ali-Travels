import React from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Eye, FileCheck, UserCheck } from 'lucide-react';
import { BdPhoneInput } from '../../common/BdPhoneInput';
import { DatePicker } from '../../ui/date-picker';
import { Input, Select } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

export function IndianVisaForm({ data, onChange, onSubmit, onReset, isSubmitting = false }) {
  const { t } = useTranslation();

  const handleChecklistChange = (key, checked) => {
    onChange({
      ...data,
      documentsProvided: {
        ...data.documentsProvided,
        [key]: checked
      }
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full mx-auto space-y-5">
      <div className="bg-card border border-border rounded-xl p-6 sm:p-7 space-y-5 text-sm shadow-sm">
        
        {/* Header Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
          <div>
            <h2 className="font-bold text-foreground text-xl tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary shrink-0" />
              {t('visa.title', 'Indian Visa Application Form')}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Label className="text-foreground text-xs font-semibold">{t('visa.status', 'Status')}:</Label>
            <select
              value={data.status || 'pending'}
              onChange={e => onChange({ ...data, status: e.target.value })}
              className="flex h-9 rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="pending">{t('common.pending', 'Pending')}</option>
              <option value="processing">Processing</option>
              <option value="submitted">Submitted</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-muted/20 p-4.5 rounded-lg border border-border">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">{t('visa.submissionDate', 'Submission Date')}</Label>
            <DatePicker
              value={data.submissionDate}
              onChange={val => onChange({ ...data, submissionDate: val })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-foreground">{t('visa.visaCategory', 'Visa Category')}</Label>
            <select
              value={data.visaType}
              onChange={e => onChange({ ...data, visaType: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="Tourist Visa">Tourist Visa</option>
              <option value="Medical Visa">Medical Visa</option>
              <option value="Business Visa">Business Visa</option>
              <option value="Entry Visa">Entry Visa</option>
              <option value="Student Visa">Student Visa</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPLICANT DETAILS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-primary" />
            {t('visa.applicantInfo', '1. Applicant Information')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.fullName', 'Applicant\'s Full Name')} *</Label>
              <Input
                type="text"
                required
                value={data.applicantName}
                onChange={e => onChange({ ...data, applicantName: e.target.value })}
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.passportNo', 'Passport Number')} *</Label>
              <Input
                type="text"
                required
                value={data.passportNo}
                onChange={e => onChange({ ...data, passportNo: e.target.value })}
                className="font-mono"
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.nidBirthCert', 'NID / Birth Certificate No.')}</Label>
              <Input
                type="text"
                value={data.nidBirthCertNo}
                onChange={e => onChange({ ...data, nidBirthCertNo: e.target.value })}
                className="font-mono"
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.phone', 'Phone Number')} *</Label>
              <BdPhoneInput
                value={data.applicantPhone}
                onChange={(val) => onChange({ ...data, applicantPhone: val })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.email', 'Email Address')}</Label>
              <Input
                type="email"
                value={data.applicantEmail}
                onChange={e => onChange({ ...data, applicantEmail: e.target.value })}
                placeholder=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.address', 'Full Address')}</Label>
              <Input
                type="text"
                value={data.address}
                onChange={e => onChange({ ...data, address: e.target.value })}
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: VISA SPECIFICATIONS */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-primary" />
            {t('visa.visaDetails', '2. Visa Details')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.entryPort', 'Port of Entry')}</Label>
              <select
                value={data.entryPort}
                onChange={e => onChange({ ...data, entryPort: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="Haridaspur / Gede">Haridaspur / Gede</option>
                <option value="By Air">By Air</option>
                <option value="Agartala">Agartala</option>
                <option value="Ghojadanga">Ghojadanga</option>
                <option value="Dawki / Tamabil">Dawki / Tamabil</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.duration', 'Visa Duration')}</Label>
              <select
                value={data.durationMonths}
                onChange={e => onChange({ ...data, durationMonths: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="1 Year Multiple">1 Year Multiple</option>
                <option value="6 Months Multiple">6 Months Multiple</option>
                <option value="3 Months Single">3 Months Single</option>
                <option value="5 Years Multiple">5 Years Multiple</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">{t('visa.entryType', 'Entry Type')}</Label>
              <select
                value={data.entryType}
                onChange={e => onChange({ ...data, entryType: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="Multiple Entry">Multiple Entry</option>
                <option value="Single Entry">Single Entry</option>
                <option value="Double Entry">Double Entry</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: DOCUMENTS CHECKLIST */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-primary">
            {t('visa.documents', '3. Required Documents Checklist')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4.5 rounded-lg border border-border">
            {[
              { id: 'passportOriginal', label: t('visa.passportOriginal', 'Original Passport'), desc: 'Minimum 6 months validity passport' },
              { id: 'nidCopy', label: t('visa.nidCopy', 'NID Copy'), desc: 'NID or online 17-digit birth certificate copy' },
              { id: 'photoLabPrint', label: t('visa.photoLabPrint', 'Photo (2x2 Lab Print)'), desc: 'White background print' },
              { id: 'bankSolvency', label: t('visa.bankSolvency', 'Bank Solvency Certificate / Dollar Endorsement'), desc: 'Minimum 20,000 BDT solvency or $200 endorsement' },
              { id: 'utilityBillCopy', label: t('visa.utilityBill', 'Utility Bill Copy (Electricity/Gas/Water)'), desc: 'Electricity/Water/Gas bill copy' },
              { id: 'previousVisaCopy', label: t('visa.previousVisa', 'Previous Indian Visa Copy (if any)'), desc: 'Old Indian visa copy' },
              { id: 'nocTradeLicense', label: t('visa.nocTradeLicense', 'NOC / Trade License / Student ID'), desc: 'Professional/educational document' },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(data.documentsProvided?.[item.id])}
                  onChange={e => handleChecklistChange(item.id, e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-foreground block text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="border-t border-border pt-4 space-y-1.5">
          <Label className="block text-xs font-semibold text-foreground">{t('visa.remarks', 'Special Remarks / Instructions')}</Label>
          <Textarea
            rows={2}
            value={data.remarks}
            onChange={e => onChange({ ...data, remarks: e.target.value })}
            placeholder=""
          />
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-card border border-border p-4.5 rounded-lg flex items-center justify-between gap-3 shadow-sm">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span>{t('common.reset', 'Reset')}</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/95 disabled:opacity-60 text-primary-foreground shadow-sm transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{t('visa.submitting', 'Submitting...')}</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>{t('visa.submit', 'Submit & Preview')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
