import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  User,
  Users,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Building2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function AgreementForm({ formData, setFormData, onSubmit, onReset, isSubmitting = false }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const steps = [
    { id: 1, title: t('agreement.partiesGuardian'), icon: User },
    { id: 2, title: t('agreement.positionSchedule'), icon: Briefcase },
    { id: 3, title: t('agreement.salaryLeave'), icon: DollarSign },
    { id: 4, title: t('agreement.noticeSignatures'), icon: ShieldCheck },
  ];

  const updateNested = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSalaryChange = (field, value) => {
    const updatedSalary = {
      ...formData.salary,
      [field]: value
    };

    const basic = parseFloat(updatedSalary.basicSalary) || 0;
    const house = parseFloat(updatedSalary.houseRent) || 0;
    const med = parseFloat(updatedSalary.medical) || 0;
    const conv = parseFloat(updatedSalary.conveyance) || 0;
    const spec = parseFloat(updatedSalary.specialAllowance) || 0;

    const total = basic + house + med + conv + spec;
    if (total > 0 && field !== 'grossSalary') {
      updatedSalary.grossSalary = total.toLocaleString('en-BD');
    }

    setFormData((prev) => ({
      ...prev,
      salary: updatedSalary
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirmReset = () => {
    onReset();
    setCurrentStep(1);
    setResetDialogOpen(false);
  };

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-5 w-full mx-auto">
      {/* Top Header Card */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            <FileText className="w-6 h-6 text-primary shrink-0" />
            {t('agreement.formTitle', { step: currentStep })}
          </h2>
        </div>

        <Button
          type="button"
          variant="reset"
          size="sm"
          onClick={() => setResetDialogOpen(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('agreement.reset', 'Reset')}</span>
        </Button>
      </div>

      {/* Corporate Stepper Header */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isPassed = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`p-2.5 rounded-lg text-left border transition-all flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary text-foreground font-bold shadow-2xs'
                    : isPassed
                    ? 'bg-muted/40 border-border text-foreground hover:bg-muted cursor-pointer'
                    : 'bg-background border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                    isPassed || isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">{step.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Step Form Fields */}
      <form onSubmit={handleNext} className="space-y-4">
        {/* STEP 1: Parties & Guardian Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Header Office Details */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <Building2 className="w-4 h-4" /> {t('agreement.companyHeader')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>{t('agreement.companyName')} :</Label>
                  <Input
                    type="text"
                    value={formData.header?.companyName || ''}
                    onChange={(e) => updateNested('header', 'companyName', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>{t('agreement.officeAddress')} :</Label>
                  <Input
                    type="text"
                    value={formData.header?.officeAddress || ''}
                    onChange={(e) => updateNested('header', 'officeAddress', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.phone')} :</Label>
                  <BdPhoneInput
                    value={formData.header?.phone || ''}
                    onChange={(val) => updateNested('header', 'phone', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.email')} :</Label>
                  <Input
                    type="email"
                    value={formData.header?.email || ''}
                    onChange={(e) => updateNested('header', 'email', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Parties Details */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <User className="w-4 h-4" /> {t('agreement.partiesDetails')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('agreement.agreementDate')} :</Label>
                  <DatePicker
                    value={formData.parties?.agreementDate || ''}
                    onChange={(val) => updateNested('parties', 'agreementDate', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.nidPassport')} : *</Label>
                  <Input
                    type="text"
                    required
                    value={formData.parties?.nidPassport || ''}
                    onChange={(e) => updateNested('parties', 'nidPassport', e.target.value)}
                    className="font-mono font-bold"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.employerName')} :</Label>
                  <Input
                    type="text"
                    value={formData.parties?.employerName || ''}
                    onChange={(e) => updateNested('parties', 'employerName', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.employerPhone')} :</Label>
                  <BdPhoneInput
                    value={formData.parties?.employerPhone || ''}
                    onChange={(val) => updateNested('parties', 'employerPhone', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.employeeName')} : *</Label>
                  <Input
                    type="text"
                    required
                    value={formData.parties?.employeeName || ''}
                    onChange={(e) => updateNested('parties', 'employeeName', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.employeeEmail')} :</Label>
                  <Input
                    type="email"
                    value={formData.parties?.employeeEmail || ''}
                    onChange={(e) => updateNested('parties', 'employeeEmail', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.fatherHusband')} :</Label>
                  <Input
                    type="text"
                    value={formData.parties?.fatherHusbandName || ''}
                    onChange={(e) => updateNested('parties', 'fatherHusbandName', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.address')} :</Label>
                  <Input
                    type="text"
                    value={formData.parties?.address || ''}
                    onChange={(e) => updateNested('parties', 'address', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Guardian Details */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <Users className="w-4 h-4" /> {t('agreement.guardianDetails')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('agreement.guardianName')} :</Label>
                  <Input
                    type="text"
                    value={formData.guardian?.guardianName || ''}
                    onChange={(e) => updateNested('guardian', 'guardianName', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.guardianPhone')} :</Label>
                  <BdPhoneInput
                    value={formData.guardian?.guardianPhone || ''}
                    onChange={(val) => updateNested('guardian', 'guardianPhone', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.relationship')} :</Label>
                  <select
                    value={formData.guardian?.relationship || 'Father'}
                    onChange={(e) => updateNested('guardian', 'relationship', e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="Father">{t('agreement.father')}</option>
                    <option value="Mother">{t('agreement.mother')}</option>
                    <option value="Legal Guardian">{t('agreement.legalGuardian')}</option>
                    <option value="Spouse">{t('agreement.spouse')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.emergencyPhone')} :</Label>
                  <BdPhoneInput
                    value={formData.guardian?.emergencyPhone || ''}
                    onChange={(val) => updateNested('guardian', 'emergencyPhone', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.guardianNid')} :</Label>
                  <Input
                    type="text"
                    value={formData.guardian?.guardianNid || ''}
                    onChange={(e) => updateNested('guardian', 'guardianNid', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.guardianAddress')} :</Label>
                  <Input
                    type="text"
                    value={formData.guardian?.guardianAddress || ''}
                    onChange={(e) => updateNested('guardian', 'guardianAddress', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Position & Schedule */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <Briefcase className="w-4 h-4" /> {t('agreement.positionDetails')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('agreement.designation')} :</Label>
                  <Input
                    type="text"
                    value={formData.position?.designation || ''}
                    onChange={(e) => updateNested('position', 'designation', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.department')} :</Label>
                  <Input
                    type="text"
                    value={formData.position?.department || ''}
                    onChange={(e) => updateNested('position', 'department', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.joiningDate')} :</Label>
                  <DatePicker
                    value={formData.position?.joiningDate || ''}
                    onChange={(val) => updateNested('position', 'joiningDate', val)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.workingHours')} :</Label>
                  <Input
                    type="text"
                    value={formData.position?.workSchedule || ''}
                    onChange={(e) => updateNested('position', 'workSchedule', e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>{t('agreement.relationship')} :</Label>
                  <select
                    value={formData.position?.jobType || 'Full-Time'}
                    onChange={(e) => updateNested('position', 'jobType', e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Salary & Leave Policy */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Salary structure */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <DollarSign className="w-4 h-4" /> {t('agreement.salaryDetails')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('agreement.basicSalary')} ৳</Label>
                  <Input
                    type="number"
                    value={formData.salary?.basicSalary || ''}
                    onChange={(e) => handleSalaryChange('basicSalary', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.houseRent')} ৳</Label>
                  <Input
                    type="number"
                    value={formData.salary?.houseRent || ''}
                    onChange={(e) => handleSalaryChange('houseRent', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.medical')} ৳</Label>
                  <Input
                    type="number"
                    value={formData.salary?.medical || ''}
                    onChange={(e) => handleSalaryChange('medical', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.conveyance')} ৳</Label>
                  <Input
                    type="number"
                    value={formData.salary?.conveyance || ''}
                    onChange={(e) => handleSalaryChange('conveyance', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.specialAllowance')} ৳</Label>
                  <Input
                    type="number"
                    value={formData.salary?.specialAllowance || ''}
                    onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.grossSalary')} ৳</Label>
                  <Input
                    type="text"
                    value={formData.salary?.grossSalary || ''}
                    onChange={(e) => handleSalaryChange('grossSalary', e.target.value)}
                    className="font-mono bg-primary/5 text-primary font-bold border-primary/20"
                    placeholder=""
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <Label>{t('agreement.grossSalary')} (Words) :</Label>
                  <Input
                    type="text"
                    value={formData.salary?.grossSalaryInWords || ''}
                    onChange={(e) => updateNested('salary', 'grossSalaryInWords', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Leave Policy */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <Calendar className="w-4 h-4" /> {t('agreement.salaryLeave')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('agreement.yearlyLeave')} :</Label>
                  <Input
                    type="number"
                    value={formData.leave?.casualDays || '10'}
                    onChange={(e) => updateNested('leave', 'casualDays', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('agreement.sickLeave')} :</Label>
                  <Input
                    type="number"
                    value={formData.leave?.sickDays || '14'}
                    onChange={(e) => updateNested('leave', 'sickDays', e.target.value)}
                    className="font-mono"
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Notice, NDA & Signatures */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Legal / Notice Details */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                {t('agreement.noticeDetails')}
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/30 border border-border/70 rounded-lg space-y-1.5">
                <p>• <strong>{t('agreement.noticePeriod')}:</strong> 3 months notice is required prior to resignation.</p>
                <p>• <strong>{t('agreement.ndaClause')}:</strong> Confidential information, codebases, and systems must be protected under standard NDA regulations.</p>
              </div>
            </div>

            {/* Witnesses */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-xs text-primary border-b border-border pb-2">
                <Users className="w-4 h-4" /> {t('agreement.witness1')} & {t('agreement.witness2')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Witness 1 */}
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                  <span className="font-semibold text-foreground block border-b border-border pb-1 text-xs">{t('agreement.witness1')} :</span>
                  <div className="space-y-1.5">
                    <Label>{t('agreement.employeeName')} :</Label>
                    <Input
                      type="text"
                      value={formData.witnesses?.firstWitnessName || ''}
                      onChange={(e) => updateNested('witnesses', 'firstWitnessName', e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('agreement.phone')} :</Label>
                    <BdPhoneInput
                      value={formData.witnesses?.firstWitnessPhone || ''}
                      onChange={(val) => updateNested('witnesses', 'firstWitnessPhone', val)}
                    />
                  </div>
                </div>

                {/* Witness 2 */}
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                  <span className="font-semibold text-foreground block border-b border-border pb-1 text-xs">{t('agreement.witness2')} :</span>
                  <div className="space-y-1.5">
                    <Label>{t('agreement.employeeName')} :</Label>
                    <Input
                      type="text"
                      value={formData.witnesses?.secondWitnessName || ''}
                      onChange={(e) => updateNested('witnesses', 'secondWitnessName', e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('agreement.phone')} :</Label>
                    <BdPhoneInput
                      value={formData.witnesses?.secondWitnessPhone || ''}
                      onChange={(val) => updateNested('witnesses', 'secondWitnessPhone', val)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                Review & Confirm
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-background border border-border rounded-lg">
                  <span className="text-muted-foreground block text-[10px]">Employee Name:</span>
                  <span className="font-semibold text-foreground">{formData.parties?.employeeName || '—'}</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-lg">
                  <span className="text-muted-foreground block text-[10px]">Designation:</span>
                  <span className="font-semibold text-foreground">{formData.position?.designation || '—'}</span>
                </div>
                <div className="p-2.5 bg-background border border-border rounded-lg">
                  <span className="text-muted-foreground block text-[10px]">Gross Salary:</span>
                  <span className="font-semibold text-primary font-mono">{formData.salary?.grossSalary || '0'} ৳</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('agreement.back', 'Back')}</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              <span>{t('agreement.next', 'Next Step')}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{t('common.loading', 'Generating...')}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>{t('agreement.submit', 'Generate & Preview')}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Confirm Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">{t('agreement.resetTitle', 'Confirm Reset')}</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('agreement.resetConfirm', 'Are you sure you want to reset the form? All inputted data will be cleared.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(false)}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmReset}
            >
              {t('agreement.yesReset', 'Yes, Reset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
