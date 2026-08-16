import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PrintablePaper } from '../common/PrintablePaper';
import { SalarySlipForm, numberToWords } from './SalarySlipForm';
import { SalarySlipPreview } from './SalarySlipPreview';
import { Printer, Save, RefreshCw, FileText, CheckCircle2, History, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function SalarySlipStudio() {
  const sampleData = {
    _id: null,
    companyName: 'MANSUR ALI TOURS & TRAVELS',
    companyAddress: 'Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh',
    slipNo: 'SLIP-2026-001',

    // Employee Info
    employeeName: 'MD Hakimul Islam',
    employeeId: '123',
    designation: 'Managing Director',
    department: 'Management',
    joiningDate: '01-10-2025',

    // Control Info
    salaryMonth: 'October 2025',
    payDate: '01-11-2025',
    paymentMode: 'Cash',
    attendanceDays: 30,

    // Earnings
    basicSalary: 40000,
    houseRentAllowance: 10000,
    medicalAllowance: 3000,
    conveyanceAllowance: 2000,
    otherAllowance: 0,
    overtimeExtraDuty: 0,
    grossEarnings: 55000,

    // Deductions
    advanceSalary: 0,
    unpaidLeaveAbsence: 0,
    loanAuthorizedDeduction: 0,
    taxStatutoryDeduction: 0,
    otherAuthorizedDeduction: 0,
    totalDeduction: 0,

    // Net Payable
    netSalaryPayable: 55000,
    netSalaryInWords: 'Fifty Five Thousand Taka Only',

    // Attendance Values
    workingDays: 30,
    presentDays: 30,
    paidLeave: 0,
    unpaidLeave: 0,

    // Signatures
    preparedBy: 'HR Department',
    checkedBy: 'Accounts Department',
    authorizedSignatory: 'Managing Director',
    remarks: '',
  };

  const [formData, setFormData] = useState(sampleData);
  const [savedSlips, setSavedSlips] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch saved salary slips from Backend API
  const fetchSavedSlips = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/docs/payrolls');
      if (res.data && res.data.success) {
        setSavedSlips(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch salary slips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSlips();
  }, []);

  const handleReset = () => {
    setFormData(sampleData);
    toast.info('Form reset to default sample data');
  };

  const handleNewForm = () => {
    setFormData({
      ...sampleData,
      _id: null,
      slipNo: `SLIP-${new Date().getFullYear()}-${String(savedSlips.length + 1).padStart(3, '0')}`,
      employeeName: '',
      employeeId: '',
      designation: 'Employee',
      basicSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      conveyanceAllowance: 0,
      otherAllowance: 0,
      overtimeExtraDuty: 0,
      grossEarnings: 0,
      advanceSalary: 0,
      unpaidLeaveAbsence: 0,
      loanAuthorizedDeduction: 0,
      taxStatutoryDeduction: 0,
      otherAuthorizedDeduction: 0,
      totalDeduction: 0,
      netSalaryPayable: 0,
      netSalaryInWords: 'Zero Taka Only',
    });
    toast.info('New blank salary slip form created');
  };

  // Save or Update Salary Slip to Backend API
  const handleSaveToApi = async () => {
    if (!formData.employeeName || !formData.employeeId || !formData.salaryMonth) {
      toast.error('Please enter Employee Name, Employee ID, and Salary Month');
      return;
    }

    try {
      setIsSaving(true);
      if (formData._id) {
        // Update existing
        const res = await axios.put(`/api/v1/docs/payrolls/${formData._id}`, formData);
        if (res.data && res.data.success) {
          toast.success('Salary Slip updated successfully in backend database!');
          fetchSavedSlips();
        }
      } else {
        // Create new
        const res = await axios.post('/api/v1/docs/payrolls', formData);
        if (res.data && res.data.success) {
          toast.success('Salary Slip saved successfully to MongoDB!');
          setFormData((prev) => ({ ...prev, _id: res.data.data._id }));
          fetchSavedSlips();
        }
      }
    } catch (err) {
      console.error('Error saving salary slip:', err);
      toast.error('Failed to save salary slip to backend server');
    } finally {
      setIsSaving(false);
    }
  };

  // Select a saved salary slip
  const handleSelectSlip = (e) => {
    const id = e.target.value;
    if (!id) return;
    const found = savedSlips.find((s) => s._id === id);
    if (found) {
      setFormData(found);
      toast.success(`Loaded Salary Slip: ${found.slipNo || found.employeeName}`);
    }
  };

  // Delete saved salary slip
  const handleDeleteSlip = async () => {
    if (!formData._id) return;
    if (!window.confirm('Are you sure you want to delete this saved salary slip?')) return;

    try {
      setIsSaving(true);
      await axios.delete(`/api/v1/docs/payrolls/${formData._id}`);
      toast.success('Salary slip deleted from backend server');
      handleNewForm();
      fetchSavedSlips();
    } catch (err) {
      console.error('Error deleting salary slip:', err);
      toast.error('Failed to delete salary slip');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Toolbar */}
      <div className="no-print bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            📄 Individual Monthly Salary Slip Studio
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Backend API & A4 Print Ready
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in employee payroll details, auto-calculate net payable, save to MongoDB API, and print A4 salary slip.
          </p>
        </div>

        {/* Saved Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Saved Slips Dropdown */}
          {savedSlips.length > 0 && (
            <div className="relative">
              <select
                onChange={handleSelectSlip}
                value={formData._id || ''}
                className="bg-muted text-foreground text-xs font-semibold px-3 py-2 rounded-xl border border-border focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer max-w-[200px] truncate"
              >
                <option value="">-- Load Saved Slip --</option>
                {savedSlips.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.slipNo ? `${s.slipNo} - ${s.employeeName}` : s.employeeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleNewForm}
            className="flex items-center space-x-1 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer border border-border"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={handleSaveToApi}
            disabled={isSaving}
            className="flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : formData._id ? 'Update API' : 'Save to API'}</span>
          </button>

          {formData._id && (
            <button
              onClick={handleDeleteSlip}
              disabled={isSaving}
              className="flex items-center space-x-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Editor */}
        <div className="no-print lg:col-span-5">
          <SalarySlipForm
            formData={formData}
            setFormData={setFormData}
            onReset={handleReset}
          />
        </div>

        {/* Right Printable A4 Sheet Preview */}
        <div className="lg:col-span-7 flex justify-center overflow-x-auto pb-6">
          <PrintablePaper id="salary-slip-printable-paper">
            <SalarySlipPreview data={formData} />
          </PrintablePaper>
        </div>

      </div>

    </div>
  );
}
