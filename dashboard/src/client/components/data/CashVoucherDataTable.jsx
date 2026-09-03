import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Receipt,
  Trash2,
  Printer,
  Download,
  X,
  Eye,
  Wallet,
  DollarSign,
  CheckCircle2,
  Clock,
  Share2,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy } from '../../lib/utils';
import { printDocument, downloadDocumentDirect } from '@shared/lib/utils';
import { usePortal } from '../../context/PortalContext';
import { CashVoucherPreview } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function CashVoucherDataTable() {
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

  // Financial KPI Summary
  const [stats, setStats] = useState({
    totalCount: 0,
    totalDisbursedBDT: 0,
    confirmedCount: 0,
    draftCount: 0,
  });

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      let res;
      try {
        res = await apiClient.get('/api/v1/client/cash-vouchers', { params });
      } catch (_) {
        res = await apiClient.get('/api/v1/cash-vouchers', { params });
      }

      if (res.data?.success || res.data?.status === 'success') {
        const list = res.data.data || [];
        setData(list);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }

        // Calculate KPI Stats
        const totalDisbursed = list.reduce((sum, it) => sum + Number(it.grandTotal || it.subtotal || 0), 0);
        const confirmed = list.filter((it) => it.status === 'confirmed' || !it.status).length;
        const draft = list.filter((it) => it.status === 'draft').length;

        setStats({
          totalCount: res.data.pagination?.totalCount || list.length,
          totalDisbursedBDT: totalDisbursed,
          confirmedCount: confirmed,
          draftCount: draft,
        });
      }
    } catch (err) {
      console.error('Failed to fetch cash vouchers:', err);
      toast.error('Failed to load cash voucher records.');
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
      const targetId = deleteTarget._id || deleteTarget.id || deleteTarget.did;
      await apiClient.delete(`/api/v1/client/cash-vouchers/${targetId}`);
      toast.success(`Cash Voucher #${deleteTarget.voucherNo} deleted successfully.`);
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete cash voucher:', err);
      toast.error('Failed to delete cash voucher.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = (item) => {
    printDocument({
      docId: item.voucherNo,
      docType: 'Cash_Voucher',
      clientName: item.paidTo || item.receivedBy,
      elementId: 'cash-voucher-canvas',
    });
  };

  const handleDownloadDirect = async (item) => {
    try {
      await downloadDocumentDirect({
        docId: item.voucherNo,
        docType: 'Cash_Voucher',
        clientName: item.paidTo || item.receivedBy,
        elementId: 'cash-voucher-canvas',
      });
      toast.success(`Cash Voucher #${item.voucherNo} downloaded successfully!`);
    } catch (err) {
      toast.error('Failed to download voucher image.');
    }
  };

  const getStatusBadge = (st) => {
    const s = String(st || 'confirmed').toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Confirmed
        </span>
      );
    }
    if (s === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
        {st || 'Draft'}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <span>Cash Money Voucher Records</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Official agency cash money disbursements, petty cash expense records, and payment voucher memos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchData(pagination.page)}
            className="p-2.5 bg-background hover:bg-muted text-foreground border border-border rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => switchPortal('docs', 'cash-voucher')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>+ Generate Cash Voucher</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Vouchers</span>
            <div className="text-2xl font-black text-foreground mt-0.5">{stats.totalCount}</div>
          </div>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="size-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Disbursed Total</span>
            <div className="text-2xl font-black text-indigo-600 mt-0.5">
              ৳ {stats.totalDisbursedBDT.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <DollarSign className="size-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirmed</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{stats.confirmedCount}</div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Drafts</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{stats.draftCount}</div>
          </div>
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Voucher No, Paid To, Prepared By..."
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Voucher No & Date</th>
                <th className="py-3 px-4">Paid To / Received By</th>
                <th className="py-3 px-4">Category / Purpose</th>
                <th className="py-3 px-4">Expense Items</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading cash voucher records...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No Cash Voucher records found.</p>
                    <p className="text-[11px] mt-1">Generate a cash voucher from Document Studio to start logging records.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const total = Number(item.grandTotal || item.subtotal || 0);
                  const itemCount = Array.isArray(item.items) ? item.items.length : 0;
                  const firstItemDesc = item.items?.[0]?.descriptionEn || item.items?.[0]?.descriptionBn || item.purpose || 'Office Expense';

                  return (
                    <tr key={item._id || item.did || item.voucherNo} className="hover:bg-muted/30 transition-colors">
                      {/* Voucher No & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                          <span>{item.voucherNo || 'MAT-KV-0000'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {item.voucherDate || formatToDdMmYyyy(item.createdAt)}
                        </span>
                      </td>

                      {/* Paid To / Received By */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">
                          {item.paidTo || item.receivedBy || item.receivedFrom || '—'}
                        </div>
                        {item.phone && (
                          <div className="text-[10px] font-mono text-muted-foreground">{item.phone}</div>
                        )}
                      </td>

                      {/* Category / Purpose */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground border border-border">
                          {item.category || 'Office Expense'}
                        </span>
                        {item.purpose && (
                          <span className="text-[10px] text-muted-foreground block mt-1 truncate max-w-[180px]">
                            {item.purpose}
                          </span>
                        )}
                      </td>

                      {/* Expense Items */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-foreground font-medium truncate max-w-[200px]">
                          {firstItemDesc}
                        </div>
                        {itemCount > 1 && (
                          <span className="text-[10px] text-muted-foreground italic block">
                            +{itemCount - 1} more items
                          </span>
                        )}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4">
                        <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                          ৳ {total.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                            title="View Preview Voucher"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Action */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewItem(item);
                              setTimeout(() => handlePrint(item), 300);
                            }}
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                            title="Print Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Download Action */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewItem(item);
                              setTimeout(() => handleDownloadDirect(item), 300);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors cursor-pointer"
                            title="Download Voucher Slip"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors cursor-pointer"
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

        {/* Pagination */}
        {data.length > 0 && (
          <div className="border-t border-border p-3.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Showing {data.length} of {pagination.totalCount} vouchers
            </span>
            <DataTablePagination
              pagination={pagination}
              onPageChange={(p) => fetchData(p, pagination.limit, search, status)}
              onLimitChange={(l) => fetchData(1, l, search, status)}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-foreground">
                  Cash Voucher #{previewItem.voucherNo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(previewItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs transition hover:bg-primary/90 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDirect(previewItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition hover:bg-emerald-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-zinc-900 flex justify-center">
              <CashVoucherPreview data={previewItem} />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
        title="Delete Cash Voucher Record?"
        description={`Are you sure you want to delete Cash Voucher #${deleteTarget?.voucherNo}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default CashVoucherDataTable;
