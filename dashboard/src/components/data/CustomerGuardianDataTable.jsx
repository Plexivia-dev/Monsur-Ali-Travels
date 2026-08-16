import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  FileText,
  Trash2,
  Printer,
  Download,
  X,
  Edit3,
  CheckCircle2,
  DollarSign,
  Activity,
  Share2,
  Phone,
  Eye
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { CustomerGuardianPreview } from '../docs/customer-form/CustomerGuardianPreview';
import { STATUS_OPTIONS, SERVICE_TYPES } from '../docs/customer-form/sampleData';

export function CustomerGuardianDataTable({ onEditItem }) {
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchData = async (
    page = 1,
    limit = pagination.limit,
    searchQuery = search,
    statusFilter = status,
    serviceFilter = serviceType
  ) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceFilter !== 'all' ? serviceFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/docs/customer-guardians', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch customer applications:', err);
      toast.error('কাস্টমার ফাইলের তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [status, serviceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, status, serviceType);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await apiClient.patch(`/api/v1/docs/customer-guardians/${id}/status`, {
        status: newStatus,
        note: `Status changed to ${newStatus} from data table.`,
      });

      if (res.data?.success || res.data?.status === 'success') {
        toast.success('ফাইলের স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
        setData(prev =>
          prev.map(item => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handleDelete = async (id, appNo) => {
    if (!window.confirm(`আপনি কি কাস্টমার ফাইল "${appNo || id}" মুছে ফেলতে চান?`)) return;
    try {
      await apiClient.delete(`/api/v1/docs/customer-guardians/${id}`);
      toast.success('কাস্টমার ফাইল মুছে ফেলা হয়েছে।');
      fetchData(pagination.page, pagination.limit, search, status, serviceType);
    } catch (err) {
      console.error('Failed to delete customer record:', err);
      toast.error('ফাইল মুছতে সমস্যা হয়েছে।');
    }
  };

  const handleEdit = (item) => {
    if (onEditItem) {
      onEditItem(item);
    } else {
      switchPortal('docs', 'customer-form');
    }
  };

  const handleWhatsAppShare = (item) => {
    const customerName = item.customer?.fullName || 'সম্মানিত কাস্টমার';
    const total = Number(item.payment?.totalAmount || 0).toLocaleString('en-IN');
    const advance = Number(item.payment?.advancePaid || 0).toLocaleString('en-IN');
    const due = Number(item.payment?.dueAmount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 মনসুর আলী ট্রাভেলস (MONSUR ALI TRAVELS)*\n` +
      `*CUSTOMER & GUARDIAN APPLICATION (${item.applicationNo || 'APP-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *কাস্টমারের নাম:* ${customerName}\n` +
      `📌 *সার্ভিস:* ${item.serviceType || 'Indian Visa'}\n` +
      `🆔 *NID:* ${item.customer?.nidNumber || 'N/A'}\n` +
      `🛂 *পাসপোর্ট:* ${item.customer?.passportNumber || 'N/A'}\n` +
      `💰 *মোট ফি:* ৳ ${total}\n` +
      `✅ *অগ্রিম জমা:* ৳ ${advance}\n` +
      `⏳ *বকেয়া:* ৳ ${due}\n` +
      `-----------------------------------------\n` +
      `📅 *জমার তারিখ:* ${item.dateReceived || 'আজ'}\n\n` +
      `🏢 *মনসুর আলী ট্রাভেলস*\n` +
      `📍 ঠিকানা: Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet\n` +
      `📞 যোগাযোগ: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadge = (statusKey) => {
    const obj = STATUS_OPTIONS.find(s => s.id === statusKey);
    if (!obj) return <span className="text-xs text-muted-foreground">{statusKey}</span>;
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${obj.color}`}>
        {obj.label.split('(')[0]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Customer &amp; Guardian Applications (কাস্টমার ফাইল ও পেমেন্ট তালিকা)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            জমাকৃত কাস্টমার ফাইল, প্রয়োজনীয় ডকুমেন্ট চেকলিস্ট ও অগ্রিম পেমেন্টের সার্বিক ডাটাবেজ।
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'customer-form')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>+ নতুন কাস্টমার ফাইল</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-3.5 rounded-2xl shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Passport, NID, Phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs font-medium text-foreground outline-hidden focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap justify-end">
          {/* Service Type Filter */}
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Services (সব সেবা)</option>
            {SERVICE_TYPES.map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Status (সব অবস্থা)</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchData(1, pagination.limit, search, status, serviceType)}
            className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Payment (টাকা)</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    তথ্য লোড হচ্ছে...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    কোনো কাস্টমার আবেদন ফাইল পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const total = Number(item.payment?.totalAmount || 0);
                  const advance = Number(item.payment?.advancePaid || 0);
                  const due = Number(item.payment?.dueAmount || Math.max(0, total - advance));

                  return (
                    <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                      {/* App No */}
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {item.applicationNo || 'CGA-000000'}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">{item.customer?.fullName || '—'}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          {item.customer?.passportNumber && <span>Passport: {item.customer.passportNumber}</span>}
                          {item.customer?.mobileNumber && <span>📞 {item.customer.mobileNumber}</span>}
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {item.serviceType?.split('(')[0] || 'Indian Visa'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">৳ {total.toLocaleString('en-IN')}</div>
                        <div className="text-[10.5px] flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Adv: ৳{advance.toLocaleString('en-IN')}
                          </span>
                          {due > 0 && (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              Due: ৳{due.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={item.status || 'received'}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className="px-2 py-1 bg-background border border-border rounded-lg text-[11px] font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.id} value={s.id}>{s.label.split('(')[0]}</option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {formatToDdMmYyyy(item.dateReceived) || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / Print */}
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                            title="Print Preview & Download PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppShare(item)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                            title="WhatsApp Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.applicationNo)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 bg-muted/60 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        <DataTablePagination
          pagination={pagination}
          onPageChange={(p) => fetchData(p, pagination.limit, search, status, serviceType)}
          onLimitChange={(l) => fetchData(1, l, search, status, serviceType)}
        />
      </div>

      {/* Fullscreen Print / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="no-print flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Printable Application Form ({previewItem.applicationNo})
                </h3>
                <p className="text-xs text-muted-foreground">
                  কাস্টমার: {previewItem.customer?.fullName} | সার্ভিস: {previewItem.serviceType}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download PDF / Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center bg-muted/20 p-2 sm:p-4 rounded-xl">
              <CustomerGuardianPreview data={previewItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
