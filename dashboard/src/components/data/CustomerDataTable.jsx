import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Users,
  Trash2,
  Eye,
  X,
  Plus,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ChevronRight,
  Edit,
  User,
  Receipt,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { usePortal } from '../../context/PortalContext';
import { MoneyReceiptModal } from '../docs/receipt/MoneyReceiptModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

export function CustomerDataTable() {
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    skip: 0,
    totalCount: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [profileItem, setProfileItem] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async (
    page = 1,
    limit = pagination.limit,
    searchQuery = search,
    statusVal = statusFilter,
    typeVal = typeFilter
  ) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusVal !== 'all' ? statusVal : undefined,
        customerType: typeVal !== 'all' ? typeVal : undefined,
      };

      const res = await apiClient.get('/api/v1/customers', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, statusFilter, typeFilter);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/customers/${deleteTarget.id}`);
      toast.success('কাস্টমার প্রোফাইল মুছে ফেলা হয়েছে।');
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, statusFilter, typeFilter);
    } catch (err) {
      console.error('Failed to delete customer:', err);
      toast.error('কাস্টমার মুছতে সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      Lead: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      Inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      Blacklisted: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      Archived: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    return map[status] || map.Active;
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            Customers (কাস্টমার তালিকা)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            কেন্দ্রীয় কাস্টমার প্রোফাইল, যোগাযোগ তথ্য, সার্ভিস হিস্ট্রি ও পেমেন্ট লেজার।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('data', 'customer-add')}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কাস্টমার</span>
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
            placeholder="নাম, ফোন, পাসপোর্ট, NID সার্চ করুন..."
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="Active">Active (সক্রিয়)</option>
            <option value="Lead">Lead (লিড)</option>
            <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল টাইপ</option>
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
            <option value="Agent_Referred">Agent Referred</option>
            <option value="VIP">VIP</option>
          </select>

          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search, statusFilter, typeFilter)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">কাস্টমার কোড</th>
                <th className="p-3">নাম</th>
                <th className="p-3">ফোন</th>
                <th className="p-3">পাসপোর্ট / NID</th>
                <th className="p-3 text-center">সার্ভিস</th>
                <th className="p-3 text-right">বকেয়া (৳)</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground font-medium">
                    কোনো কাস্টমার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const totalServices =
                    (item.applications?.length || 0) +
                    (item.visaSubmissions?.length || 0) +
                    (item.passportSubmissions?.length || 0) +
                    (item.candidateCases?.length || 0) +
                    (item.agreements?.length || 0) +
                    (item.invoices?.length || 0);

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-center font-mono text-muted-foreground">
                        {pagination.skip + idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-600">
                        {item.customerCode || '—'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-foreground">{item.fullName || '—'}</div>
                        {item.fatherName && (
                          <div className="text-[10px] text-muted-foreground">
                            পিতা: {item.fatherName}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-foreground">
                        {item.phone || '—'}
                      </td>
                      <td className="p-3">
                        {item.passportNumber && (
                          <div className="font-mono font-medium text-foreground">
                            {item.passportNumber}
                          </div>
                        )}
                        {item.nidNumber && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            NID: {item.nidNumber}
                          </div>
                        )}
                        {!item.passportNumber && !item.nidNumber && '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block min-w-[24px] px-2 py-0.5 rounded text-[10px] font-bold ${
                            totalServices > 0
                              ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {totalServices}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {item.totalDueAmount > 0 ? (
                          <span className="text-rose-500">
                            {Number(item.totalDueAmount).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-500">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptModalData({
                                clientName: item.fullName,
                                clientPhone: item.phone,
                                passportNumber: item.passportNumber,
                                customerId: item._id,
                              })
                            }
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer"
                            title="টোকেন / মানি রিসিট দিন"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileItem(item)}
                            className="p-1.5 rounded hover:bg-sky-500/10 text-sky-600 transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, customerCode: item.customerCode })}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete"
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
          onPageChange={(p) => fetchData(p, pagination.limit, search, statusFilter, typeFilter)}
          onLimitChange={(l) => fetchData(1, l, search, statusFilter, typeFilter)}
        />
      </div>

      {/* Customer Profile Modal */}
      {profileItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-500" />
                  কাস্টমার প্রোফাইল — {profileItem.customerCode}
                </h3>
                <p className="text-[11px] text-muted-foreground">{profileItem.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileItem(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBlock label="পুরো নাম" value={profileItem.fullName} />
                <InfoBlock label="কাস্টমার কোড" value={profileItem.customerCode} mono />
                <InfoBlock label="ফোন" value={profileItem.phone} mono icon={<Phone className="w-3 h-3" />} />
                <InfoBlock label="ইমেইল" value={profileItem.email} icon={<Mail className="w-3 h-3" />} />
                <InfoBlock label="পাসপোর্ট নং" value={profileItem.passportNumber} mono icon={<CreditCard className="w-3 h-3" />} />
                <InfoBlock label="NID নং" value={profileItem.nidNumber} mono />
                <InfoBlock label="পিতার নাম" value={profileItem.fatherName} />
                <InfoBlock label="মাতার নাম" value={profileItem.motherName} />
                <InfoBlock label="জন্ম তারিখ" value={profileItem.birthDate} />
                <InfoBlock label="লিঙ্গ" value={profileItem.gender} />
                <InfoBlock label="রক্তের গ্রুপ" value={profileItem.bloodGroup} />
                <InfoBlock label="বৈবাহিক অবস্থা" value={profileItem.maritalStatus} />
              </div>

              {/* Address */}
              {(profileItem.presentAddress || profileItem.permanentAddress) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">ঠিকানা</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="বর্তমান ঠিকানা" value={profileItem.presentAddress} />
                    <InfoBlock label="স্থায়ী ঠিকানা" value={profileItem.permanentAddress} />
                    <InfoBlock label="জেলা" value={profileItem.district} />
                    <InfoBlock label="থানা" value={profileItem.policeStation} />
                  </div>
                </div>
              )}

              {/* Guardian */}
              {profileItem.guardian?.name && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">অভিভাবক</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="নাম" value={profileItem.guardian.name} />
                    <InfoBlock label="সম্পর্ক" value={profileItem.guardian.relationship} />
                    <InfoBlock label="ফোন" value={profileItem.guardian.phone} mono />
                    <InfoBlock label="NID" value={profileItem.guardian.nidNumber} mono />
                  </div>
                </div>
              )}

              {/* Financial Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">আর্থিক লেজার</h4>
                <div className="grid grid-cols-3 gap-3">
                  <LedgerCard label="মোট বিল" value={profileItem.totalBilledAmount} color="sky" />
                  <LedgerCard label="মোট পরিশোধ" value={profileItem.totalPaidAmount} color="emerald" />
                  <LedgerCard label="বকেয়া" value={profileItem.totalDueAmount} color="rose" />
                </div>
              </div>

              {/* Linked Services Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">সার্ভিস হিস্ট্রি</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <ServiceBadge label="আবেদন" count={profileItem.applications?.length || 0} />
                  <ServiceBadge label="ভিসা" count={profileItem.visaSubmissions?.length || 0} />
                  <ServiceBadge label="পাসপোর্ট" count={profileItem.passportSubmissions?.length || 0} />
                  <ServiceBadge label="কেস ফাইল" count={profileItem.candidateCases?.length || 0} />
                  <ServiceBadge label="চুক্তিপত্র" count={profileItem.agreements?.length || 0} />
                  <ServiceBadge label="ইনভয়েস" count={profileItem.invoices?.length || 0} />
                </div>
              </div>

              {/* Actions inside Profile View */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setReceiptModalData({
                      clientName: profileItem.fullName,
                      clientPhone: profileItem.phone,
                      passportNumber: profileItem.passportNumber,
                      customerId: profileItem._id,
                    });
                    setProfileItem(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>পেমেন্ট টোকেন / রিসিট তৈরি করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Money Receipt Modal */}
      <MoneyReceiptModal
        isOpen={Boolean(receiptModalData)}
        onClose={() => setReceiptModalData(null)}
        initialData={receiptModalData || {}}
        onCreated={() => {
          fetchData(pagination.page);
        }}
      />

      {/* Confirm Delete Alert Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this?"
        description={`Customer code "${deleteTarget?.customerCode || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Helper Components

function InfoBlock({ label, value, mono = false, icon = null }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`text-xs text-foreground font-medium ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function LedgerCard({ label, value = 0, color = 'sky' }) {
  const colorMap = {
    sky: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };
  return (
    <div className={`p-3 rounded-lg border text-center ${colorMap[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-sm font-bold font-mono mt-0.5">
        ৳ {Number(value || 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function ServiceBadge({ label, count = 0 }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
          count > 0 ? 'bg-sky-500/10 text-sky-600' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </div>
  );
}
