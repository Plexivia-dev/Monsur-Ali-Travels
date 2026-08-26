import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Trash2, Printer, Download, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { InvoicePreview } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { useTranslation } from 'react-i18next';

export function InvoiceDataTable() {
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

      const res = await apiClient.get('/api/v1/client/docs/invoices', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
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
      await apiClient.delete(`/api/v1/client/docs/invoices/${deleteTarget.id}`);
      toast.success('ইনভয়েস মুছে ফেলা হয়েছে।');
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, status);
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      toast.error('ইনভয়েস মুছতে সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: previewItem?.invoiceNo,
      docType: 'Invoice',
      clientName: previewItem?.client?.name,
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'Paid') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Paid</span>;
    }
    if (status === 'Pending') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">Pending</span>;
    }
    if (status === 'Overdue') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Overdue</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{status || 'Draft'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            {t('invoices.title', 'Invoices & Billing History')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('invoices.subtitle', 'Client and agency billing invoice records, payment status, and due accounts.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'invoice')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>{t('invoices.newInvoice', '+ Create New Invoice')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
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
            <option value="all">{t('invoices.allStatus', 'All Statuses')}</option>
            <option value="Paid">{t('invoices.paid', 'Paid')}</option>
            <option value="Pending">{t('invoices.pending', 'Pending')}</option>
            <option value="Overdue">{t('invoices.overdue', 'Overdue')}</option>
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
                <th className="p-3">{t('tables.invoiceNo', 'Invoice No')}</th>
                <th className="p-3">{t('tables.clientClient', 'Client / Client')}</th>
                <th className="p-3">{t('tables.issueDate', 'Issue Date')}</th>
                <th className="p-3">{t('tables.dueDate', 'Due Date')}</th>
                <th className="p-3">{t('tables.itemCount', 'Items')}</th>
                <th className="p-3 text-center">{t('tables.paymentStatus', 'Payment Status')}</th>
                <th className="p-3 text-right">{t('tables.action', 'Actions')}</th>
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
                    {t('common.noData', 'No data found')}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-center font-mono text-muted-foreground">
                      {pagination.skip + idx + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {item.invoiceNo || '—'}
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {item.client?.name || '—'}
                      {item.client?.phone && (
                        <div className="text-[10px] text-muted-foreground font-mono font-normal">
                          {item.client.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatToDdMmYyyy(item.issueDate) || '—'}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {formatToDdMmYyyy(item.dueDate) || '—'}
                    </td>
                    <td className="p-3 font-mono text-foreground font-semibold">
                      {item.items?.length || 0} টি
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(item.paymentStatus)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="View & Download/Print Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / Print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: item._id, invoiceNo: item.invoiceNo })}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                  ইনভয়েস প্রিভিউ ও প্রিন্ট — {previewItem.invoiceNo || ''}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  ক্লায়েন্ট: {previewItem.client?.name || '—'}
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/40 flex justify-center">
              <InvoicePreview data={previewItem} onPrint={handlePrint} />
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
        description={`Invoice "${deleteTarget?.invoiceNo || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}
