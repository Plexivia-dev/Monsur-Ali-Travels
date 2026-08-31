import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileText, Trash2, Printer, Eye, X, Download } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { AgreementPreview, PrintablePaper } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Normalize nested backend schema to the exact structure expected by AgreementPreview
function normalizeAgreementData(item) {
  if (!item) return {};
  return {
    _id: item._id,
    agreementId: item.agreementId || '',
    header: {
      companyName: item.companyInfo?.companyName || item.header?.companyName || 'MONSUR ALI TRAVELS',
      officeAddress: item.companyInfo?.officeAddress || item.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      phone: item.companyInfo?.phone || item.header?.phone || '+8801345579534',
      email: item.companyInfo?.email || item.header?.email || 'contact@monsuralitravels.com',
    },
    parties: {
      agreementDate: item.parties?.agreementDate || item.parties?.agreementDate || '',
      nidPassport: item.parties?.nidPassport || item.parties?.nidPassport || '',
      employerName: item.parties?.employerName || item.parties?.employerName || '',
      employerPhone: item.parties?.employerPhone || item.parties?.employerPhone || '',
      employeeName: item.parties?.employeeName || item.parties?.employeeName || '',
      employeeEmail: item.parties?.employeeEmail || item.parties?.employeeEmail || '',
      fatherHusbandName: item.parties?.fatherHusbandName || item.parties?.fatherHusbandName || '',
      address: item.parties?.address || item.parties?.address || '',
    },
    guardian: {
      guardianName: item.guardian?.guardianName || item.guardian?.guardianName || '',
      guardianPhone: item.guardian?.guardianPhone || item.guardian?.guardianPhone || '',
      relationship: item.guardian?.relationship || item.guardian?.relationship || 'Father',
      emergencyPhone: item.guardian?.emergencyPhone || item.guardian?.emergencyPhone || '',
      guardianNid: item.guardian?.guardianNid || item.guardian?.guardianNid || '',
      guardianAddress: item.guardian?.guardianAddress || item.guardian?.guardianAddress || '',
    },
    position: {
      designation: item.position?.designation || item.position?.designation || '',
      department: item.position?.department || item.position?.department || '',
      joiningDate: item.position?.joiningDate || item.position?.joiningDate || '',
      location: item.position?.location || item.position?.location || 'Head Office, Nadampur',
      jobType: item.position?.jobType || item.position?.jobType || 'Permanent (Full-Time)',
      workSchedule: item.position?.workSchedule || item.position?.workSchedule || '9:00 AM - 6:00 PM, Sunday to Thursday',
      probationMonths: item.position?.probationMonths || item.position?.probationMonths || '3 (Three) Months',
    },
    salary: {
      basicSalary: item.salary?.basicSalary || item.salary?.basicSalary || item.salary?.basicSalary || item.compensation?.basicSalary || '15000',
      houseRent: item.salary?.houseRent || item.salary?.houseRent || item.salary?.houseRent || item.compensation?.houseRent || '5000',
      medical: item.salary?.medical || item.salary?.medical || item.salary?.medical || item.compensation?.medicalAllowance || '2000',
      conveyance: item.salary?.conveyance || item.salary?.conveyance || item.salary?.conveyance || item.compensation?.conveyanceAllowance || '1500',
      specialAllowance: item.salary?.specialAllowance || item.compensation?.specialAllowance || '1500',
      grossSalary: item.salary?.grossSalary || item.salary?.grossSalary || '25,000',
      grossSalaryInWords: item.salary?.grossSalaryInWords || '',
    },
    leave: {
      casualDays: item.leave?.casualDays || item.leave?.casualDays || '10',
      sickDays: item.leave?.sickDays || item.leave?.sickDays || '14',
      earnedDays: item.leave?.earnedDays || item.leave?.earnedDays || '18',
      lunchProvided: item.leave?.lunchProvided ?? item.leave?.lunchProvided ?? true,
      teaSnacks: item.leave?.teaSnacks ?? item.leave?.teaSnacks ?? true,
      lunchAllowance: item.leave?.lunchAllowance || item.leave?.lunchAllowance || '',
    },
    witnesses: {
      firstWitnessName: item.witnesses?.firstWitness?.name || item.witnesses?.firstWitnessName || '',
      firstWitnessPhone: item.witnesses?.firstWitnessPhone || '',
      firstWitnessAddress: item.witnesses?.firstWitness?.address || item.witnesses?.firstWitnessAddress || '',
      secondWitnessName: item.witnesses?.secondWitness?.name || item.witnesses?.secondWitnessName || '',
      secondWitnessPhone: item.witnesses?.secondWitnessPhone || '',
      secondWitnessAddress: item.witnesses?.secondWitness?.address || item.witnesses?.secondWitnessAddress || '',
    },
    compensation: {
      basicSalary: item.salary?.basicSalary || item.compensation?.basicSalary || 0,
      houseRent: item.salary?.houseRent || item.compensation?.houseRent || 0,
      medicalAllowance: item.salary?.medical || item.compensation?.medicalAllowance || 0,
      conveyanceAllowance: item.salary?.conveyance || item.compensation?.conveyanceAllowance || 0,
      specialAllowance: item.salary?.specialAllowance || item.compensation?.specialAllowance || 0,
      paymentMethod: item.compensation?.paymentMethod || 'Bank Transfer / Direct Cash',
      paymentDate: item.compensation?.paymentDate || '1st - 5th of each month',
    },
    security: {
      guarantorName: item.security?.guarantorName || item.guardian?.guardianName || '',
      guarantorNid: item.security?.guarantorNid || item.guardian?.guardianNid || '',
      guarantorPhone: item.security?.guarantorPhone || item.guardian?.guardianPhone || '',
      guarantorAddress: item.security?.guarantorAddress || item.guardian?.guardianAddress || '',
      depositAmount: item.security?.depositAmount || 0,
      securityChequeNo: item.security?.securityChequeNo || '',
      chequeBank: item.security?.chequeBank || '',
    },
    status: item.status || 'Active',
    agreementTerms: item.agreementTerms || '',
    meta: {
      witness1Name: item.meta?.witness1Name || '',
      witness1Address: item.meta?.witness1Address || '',
      witness2Name: item.meta?.witness2Name || '',
      witness2Address: item.meta?.witness2Address || '',
      firstPartySignatureName: item.meta?.firstPartySignatureName || 'MD. IKRAMUL HOSSAIN',
      secondPartySignatureName: item.meta?.secondPartySignatureName || item.parties?.employeeName || '',
    }
  };
}

export function AgreementDataTable() {
  const { t } = useTranslation();
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/client/docs/agreements', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch agreements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, status);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/client/docs/agreements/${deleteTarget.id}`);
      toast.success(`Agreement "${deleteTarget.agreementId || deleteTarget.id}" deleted successfully.`);
      setDeleteTarget(null);
      fetchData(pagination.page);
    } catch (err) {
      toast.error('Failed to delete agreement.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: previewItem?.agreementId,
      docType: 'Employment_Agreement',
      clientName: previewItem?.parties?.employeeName,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            {t('agreements.title', 'Employment Agreements')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('agreements.subtitle', 'Detailed records and print list of all employee employment contracts in the database.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'agreement')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>{t('agreements.newAgreement', '+ Create New Agreement')}</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search...')}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">{t('agreements.allStatus', 'All Statuses')}</option>
            <option value="active">{t('agreements.active', 'Active')}</option>
            <option value="inactive">{t('agreements.inactive', 'Inactive')}</option>
          </select>

          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search, status)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{t('tables.agreementId', 'Agreement ID')}</th>
                <th className="p-3">{t('tables.employeeName', 'Employee Name')}</th>
                <th className="p-3">{t('tables.designationDept', 'Designation & Dept')}</th>
                <th className="p-3">{t('tables.agreementDate', 'Agreement Date')}</th>
                <th className="p-3">{t('tables.monthlySalary', 'Monthly Salary (BDT )')}</th>
                <th className="p-3 text-center">{t('tables.status', 'Status')}</th>
                <th className="p-3 text-right">{t('tables.action', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>  ...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                    {t('common.noData', 'No data found')}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const empName = item.parties?.employeeName || item.parties?.employeeName || '—';
                  const designation = item.position?.designation || item.position?.designation || '—';
                  const dept = item.position?.department || item.position?.department || '';
                  const agreementDate = item.parties?.agreementDate || item.parties?.agreementDate || '';
                  const gross = item.salary?.grossSalary || item.salary?.grossSalary || '0';

                  return (
                    <tr key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-center font-mono text-muted-foreground">
                        {pagination.skip + idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600">
                        {item.agreementId || '—'}
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        {empName}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{designation}</div>
                        {dept && <div className="text-[10px] text-muted-foreground">{dept}</div>}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {formatToDdMmYyyy(agreementDate) || '—'}
                      </td>
                      <td className="p-3 font-mono font-bold text-foreground">
                        {gross} BDT 
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {item.Status || item.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title="View & Download/Print Agreement PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download / Print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, agreementId: item.agreementId })}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <DataTablePagination
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={(p) => fetchData(p, pagination.limit, search, status)}
          onLimitChange={(l) => fetchData(1, l, search, status)}
        />
      </div>

      {/* Full Preview & Download Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                      — {previewItem.agreementId || ''}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Employee: {previewItem._?.__ || previewItem.parties?.employeeName || '—'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body with Printable Paper Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/40 flex justify-center">
              <PrintablePaper id="printable-agreement-canvas">
                <AgreementPreview data={normalizeAgreementData(previewItem)} />
              </PrintablePaper>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Alert Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this?"
        description={`Employment agreement "${deleteTarget?.agreementId || deleteTarget?.id}" will be permanently deleted.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}
