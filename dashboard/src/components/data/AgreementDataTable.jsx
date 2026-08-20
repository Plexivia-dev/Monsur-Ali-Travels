import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileText, Trash2, Printer, Eye, X, Download } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { AgreementPreview } from '../docs/agreement/AgreementPreview';
import { PrintablePaper } from '../docs/common/PrintablePaper';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

// Normalize nested backend schema to the exact structure expected by AgreementPreview
function normalizeAgreementData(item) {
  if (!item) return {};
  return {
    _id: item._id,
    agreementId: item.agreementId || '',
    header: {
      companyName: item.প্রতিষ্ঠানের_তথ্য?.প্রতিষ্ঠানের_নাম || item.header?.companyName || 'মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)',
      officeAddress: item.প্রতিষ্ঠানের_তথ্য?.অফিসের_ঠিকানা || item.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      phone: item.প্রতিষ্ঠানের_তথ্য?.মোবাইল_নম্বর || item.header?.phone || '+8801345579534',
      email: item.প্রতিষ্ঠানের_তথ্য?.ইমেইল_অ্যাড্রেস || item.header?.email || 'contact@monsuralitravels.com',
    },
    parties: {
      agreementDate: item.সাধারণ_তথ্য?.চুক্তির_তারিখ || item.parties?.agreementDate || '',
      nidPassport: item.সাধারণ_তথ্য?.জাতীয়_পরিচয়পত্র_পাসপোর্ট || item.parties?.nidPassport || '',
      employerName: item.সাধারণ_তথ্য?.নিয়োগকর্তা_কর্তৃপক্ষ || item.parties?.employerName || 'মো: ইকরামুল হোসেন (ব্যবস্থাপনা পরিচালক)',
      employerPhone: item.সাধারণ_তথ্য?.কর্তৃপক্ষের_মোবাইল_নম্বর || item.parties?.employerPhone || '+8801345579534',
      employeeName: item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || item.parties?.employeeName || '',
      employeeEmail: item.সাধারণ_তথ্য?.কর্মচারীর_ইমেইল || item.parties?.employeeEmail || '',
      fatherHusbandName: item.সাধারণ_তথ্য?.পিতা_স্বামীর_নাম || item.parties?.fatherHusbandName || '',
      address: item.সাধারণ_তথ্য?.বর্তমান_স্থায়ী_ঠিকানা || item.parties?.address || '',
    },
    guardian: {
      guardianName: item.অভিভাবকের_তথ্য?.অভিভাবকের_নাম || item.guardian?.guardianName || '',
      guardianPhone: item.অভিভাবকের_তথ্য?.মোবাইল_নম্বর || item.guardian?.guardianPhone || '',
      relationship: item.অভিভাবকের_তথ্য?.সম্পর্ক || item.guardian?.relationship || 'পিতা',
      emergencyPhone: item.অভিভাবকের_তথ্য?.বিকল্প_জরুরি_নম্বর || item.guardian?.emergencyPhone || '',
      guardianNid: item.অভিভাবকের_তথ্য?.জাতীয়_পরিচয়পত্র_নং || item.guardian?.guardianNid || '',
      guardianAddress: item.অভিভাবকের_তথ্য?.ঠিকানা || item.guardian?.guardianAddress || '',
    },
    position: {
      designation: item.পদের_বিবরণ?.পদের_নাম || item.position?.designation || '',
      department: item.পদের_বিবরণ?.বিভাগ || item.position?.department || '',
      joiningDate: item.পদের_বিবরণ?.যোগদানের_তারিখ || item.position?.joiningDate || '',
      location: item.পদের_বিবরণ?.কর্মস্থল || item.position?.location || 'হেড অফিস, নাদampur',
      jobType: item.পদের_বিবরণ?.নিয়োগের_ধরন || item.position?.jobType || 'স্থায়ী / পূর্ণকালীন (Full-Time)',
      workSchedule: item.পদের_বিবরণ?.কাজের_সময়_ও_ছুটি || item.position?.workSchedule || 'সকাল ৯:০০ - সন্ধ্যা ৬:০০, রবিবার হতে বৃহস্পতিবার',
      probationMonths: item.পদের_বিবরণ?.শিক্ষানবিস_সময়কাল || item.position?.probationMonths || '৩ (তিন) মাস',
    },
    compensation: {
      basicSalary: item.বেতন_ও_ভাতা?.মূল_বেতন || item.compensation?.basicSalary || 0,
      houseRent: item.বেতন_ও_ভাতা?.বাড়ি_ভাড়া || item.compensation?.houseRent || 0,
      medicalAllowance: item.বেতন_ও_ভাতা?.চিকিৎসা_ভাতা || item.compensation?.medicalAllowance || 0,
      conveyanceAllowance: item.বেতন_ও_ভাতা?.যাতায়াত_ভাতা || item.compensation?.conveyanceAllowance || 0,
      specialAllowance: item.বেতন_ও_ভাতা?.বিশেষ_ভাতা || item.compensation?.specialAllowance || 0,
      paymentMethod: item.বেতন_ও_ভাতা?.পরিশোধের_মাধ্যম || item.compensation?.paymentMethod || 'ব্যাংক ট্রান্সফার / নগদ ক্যাশ',
      paymentDate: item.বেতন_ও_ভাতা?.বেতন_প্রদানের_তারিখ || item.compensation?.paymentDate || 'পরবর্তী মাসের ৭ কর্মদিবসের মধ্যে',
    },
    security: {
      guarantorName: item.নিরাপত্তা_ও_জামানত?.জামিনদারের_নাম || item.security?.guarantorName || '',
      guarantorNid: item.নিরাপত্তা_ও_জামানত?.জামিনদারের_জাতীয়_পরিচয়পত্র_নং || item.security?.guarantorNid || '',
      guarantorPhone: item.নিরাপত্তা_ও_জামানত?.জামিনদারের_মোবাইল_নম্বর || item.security?.guarantorPhone || '',
      guarantorAddress: item.নিরাপত্তা_ও_জামানত?.জামিনদারের_ঠিকানা || item.security?.guarantorAddress || '',
      depositAmount: item.নিরাপত্তা_ও_জামানত?.জামানত_বন্ডের_পরিমাণ || item.security?.depositAmount || 0,
      securityChequeNo: item.নিরাপত্তা_ও_জামানত?.সিকিউরিটি_চেক_নম্বর || item.security?.securityChequeNo || '',
      chequeBank: item.নিরাপত্তা_ও_জামানত?.ব্যাংকের_নাম || item.security?.chequeBank || '',
    },
    status: item.স্ট্যাটাস || item.status || 'Active',
    agreementTerms: item.চুক্তির_শর্তাবলী || item.agreementTerms || '',
    meta: {
      witness1Name: item.meta?.witness1Name || '',
      witness1Address: item.meta?.witness1Address || '',
      witness2Name: item.meta?.witness2Name || '',
      witness2Address: item.meta?.witness2Address || '',
      firstPartySignatureName: item.meta?.firstPartySignatureName || 'মো: ইকরামুল হোসেন',
      secondPartySignatureName: item.meta?.secondPartySignatureName || item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || '',
    }
  };
}

export function AgreementDataTable() {
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/docs/agreements', { params });
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Employment Agreements (নিয়োগ চুক্তিপত্র তালিকা)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            ডাটাবেজে সংরক্ষিত সকল কর্মচারীর চুক্তিপত্রের বিস্তারিত রেকর্ড ও প্রিন্ট লিস্ট।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'agreement')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>+ নতুন চুক্তিপত্র তৈরি</span>
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
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">Active (সক্রিয়)</option>
            <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
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
                <th className="p-3">আইডি (Agreement ID)</th>
                <th className="p-3">কর্মচারীর নাম</th>
                <th className="p-3">পদবী ও বিভাগ</th>
                <th className="p-3">চুক্তির তারিখ</th>
                <th className="p-3">মাসিক বেতন (৳)</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                    কোনো চুক্তিপত্র পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const empName = item.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || item.parties?.employeeName || '—';
                  const designation = item.পদের_বিবরণ?.পদের_নাম || item.position?.designation || '—';
                  const dept = item.পদের_বিবরণ?.বিভাগ || item.position?.department || '';
                  const agreementDate = item.সাধারণ_তথ্য?.চুক্তির_তারিখ || item.parties?.agreementDate || '';
                  const gross = item.বেতন_কাঠামো?.সর্বমোট_মাসিক_বেতন || item.salary?.grossSalary || '0';

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
                        {gross} ৳
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {item.স্ট্যাটাস || item.status || 'Active'}
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
                  চুক্তিপত্র প্রিভিউ ও ডাউনলোড — {previewItem.agreementId || ''}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  কর্মচারী: {previewItem.সাধারণ_তথ্য?.কর্মচারীর_পূর্ণ_নাম || previewItem.parties?.employeeName || '—'}
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
