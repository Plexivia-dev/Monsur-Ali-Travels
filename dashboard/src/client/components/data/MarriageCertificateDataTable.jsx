import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Heart, Trash2, Printer, X, Eye, Plus } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { MarriageCertificatePreview } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { useTranslation } from 'react-i18next';

export function MarriageCertificateDataTable() {
  const { t } = useTranslation();
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
      };

      const res = await apiClient.get('/api/v1/client/docs/marriage-certificates', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch marriage certificates:', err);
      toast.error('Failed to fetch marriage certificate records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/client/docs/marriage-certificates/${deleteTarget.id}`);
      toast.success(`Marriage certificate "${deleteTarget.certificateNo || deleteTarget.id}" deleted successfully.`);
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search);
    } catch (err) {
      console.error('Failed to delete marriage certificate:', err);
      toast.error('Failed to delete marriage certificate record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: previewItem?.certificateNo || previewItem?.memoNo,
      docType: 'Marriage_Certificate',
      clientName: previewItem?.groom?.name ? `${previewItem.groom.name}_and_${previewItem.bride?.name || ''}` : 'Marriage',
      elementId: 'marriage-certificate-canvas',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            {t('marriageCertificate.title', 'Marriage Certificate Records')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('marriageCertificate.subtitle', 'Official Nikahnama extracts, bilateral marital attestations, and spouse immigration records.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'marriage-certificate')}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('marriageCertificate.newForm', '+ New Marriage Certificate')}</span>
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
            placeholder={t('common.search', 'Search by Groom, Bride, Memo, or Ref No...')}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => fetchData(pagination.page, pagination.limit, search)}
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
                <th className="p-3">Certificate / Memo</th>
                <th className="p-3">Groom & Bride</th>
                <th className="p-3">Marriage Date & Place</th>
                <th className="p-3">Registrar / Kazi</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading marriage certificates...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground font-medium">
                    {t('common.noData', 'No marriage certificate records found.')}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const groomName = item.groom?.name || item.groomName || '—';
                  const brideName = item.bride?.name || item.brideName || '—';
                  const groomPhone = item.groom?.phone || '';
                  const marriageDate = item.marriageDate || '—';
                  const marriagePlace = item.marriagePlace || '—';
                  const registrarName = item.registrar?.officeName || item.registrar?.kaziName || '—';
                  const kaziName = item.registrar?.kaziName || '';
                  const issueDate = item.issueDate || item.createdAt;

                  return (
                    <tr key={item._id || item.did || index} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-center text-muted-foreground font-mono">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[11px] rounded border border-rose-500/20">
                          {item.certificateNo || item.memoNo || '—'}
                        </span>
                        {item.memoNo && item.certificateNo !== item.memoNo && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Memo: {item.memoNo}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <span>{groomName}</span>
                          <span className="text-rose-500 font-bold">&</span>
                          <span>{brideName}</span>
                        </div>
                        {groomPhone && (
                          <div className="text-[11px] text-muted-foreground font-mono">{groomPhone}</div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div className="font-medium text-foreground font-mono">
                          {formatToDdMmYyyy(marriageDate) || marriageDate}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{marriagePlace}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div className="font-medium text-foreground">{registrarName}</div>
                        {kaziName && <div className="text-[10px] text-muted-foreground">Kazi: {kaziName}</div>}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {formatToDdMmYyyy(issueDate) || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title="Preview & Print Certificate"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: item._id, certificateNo: item.certificateNo })}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title="Delete Certificate"
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
          onPageChange={(p) => fetchData(p, pagination.limit, search)}
          onLimitChange={(l) => fetchData(1, l, search)}
        />
      </div>

      {/* Universal Preview Modal (Fixed h-[70vh], Universal Modal Architecture) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white text-zinc-900 border border-black/10 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full h-[70vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Marriage Certificate — {previewItem.certificateNo || previewItem.memoNo || ''}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Groom & Bride: {previewItem.groom?.name || '—'} & {previewItem.bride?.name || '—'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-9 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="h-9 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Internal Body Scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-muted/10 flex justify-center">
              <MarriageCertificatePreview data={previewItem} onPrint={handlePrint} />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Alert Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Marriage Certificate?"
        description={`Marriage certificate record "${deleteTarget?.certificateNo || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default MarriageCertificateDataTable;
