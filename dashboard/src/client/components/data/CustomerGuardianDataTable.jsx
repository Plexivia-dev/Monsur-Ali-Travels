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
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { usePortal } from '../../context/PortalContext';
import { ClientGuardianPreview, STATUS_OPTIONS, SERVICE_TYPES } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function ClientGuardianDataTable({ onEditItem }) {
  const { t, i18n } = useTranslation();
  const { switchPortal } = usePortal();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const res = await apiClient.get('/api/v1/client/docs/client-guardians', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch client applications:', err);
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
      const res = await apiClient.patch(`/api/v1/client/docs/client-guardians/${id}/status`, {
        status: newStatus,
        note: `Status changed to ${newStatus} from data table.`,
      });

      if (res.data?.success || res.data?.status === 'success') {
        toast.success(t('clientApplications.statusUpdated', 'File status updated successfully!'));
        setData(prev =>
          prev.map(item => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(t('clientApplications.statusUpdateError', 'Failed to update file status.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/client/docs/client-guardians/${deleteTarget.id}`);
      toast.success(t('clientApplications.deleteSuccess', 'Client record deleted successfully.'));
      setDeleteTarget(null);
      fetchData(pagination.page, pagination.limit, search, status, serviceType);
    } catch (err) {
      console.error('Failed to delete client record:', err);
      toast.error(t('clientApplications.deleteError', 'Failed to delete client record.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (item) => {
    if (onEditItem) {
      onEditItem(item);
    } else {
      switchPortal('docs', 'client-form');
    }
  };

  const handleWhatsAppShare = (item) => {
    const clientName = item.client?.fullName || 'Client';
    const total = Number(item.payment?.totalAmount || 0).toLocaleString('en-IN');
    const advance = Number(item.payment?.advancePaid || 0).toLocaleString('en-IN');
    const due = Number(item.payment?.dueAmount || 0).toLocaleString('en-IN');

    const msg =
      `*📄 MONSUR ALI TRAVELS*\n` +
      `*CUSTOMER & GUARDIAN APPLICATION (${item.applicationNo || 'APP-0000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Name:* ${clientName}\n` +
      `📌 *Service:* ${item.serviceType || 'Indian Visa'}\n` +
      `🆔 *NID:* ${item.client?.nidNumber || 'N/A'}\n` +
      `🛂 *Passport:* ${item.client?.passportNumber || 'N/A'}\n` +
      `💰 *Total Fee:* BDT  ${total}\n` +
      `✅ *Advance:* BDT  ${advance}\n` +
      `⏳ *Due:* BDT  ${due}\n` +
      `-----------------------------------------\n` +
      `📅 *Date:* ${item.dateReceived || 'Today'}\n\n` +
      `🏢 *Monsur Ali Travels*\n` +
      `📍 Address: Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Contact: +8801345579534`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadge = (statusKey) => {
    const obj = STATUS_OPTIONS.find(s => s.id === statusKey);
    if (!obj) return <span className="text-xs text-muted-foreground">{statusKey}</span>;
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${obj.color}`}>
        {i18n.language === 'bn' ? obj.bn : obj.label}
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
            {t('clientApplications.title', 'Client & Guardian Applications')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('clientApplications.subtitle', 'Central database of submitted client files, document checklists, and advance payments.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => switchPortal('docs', 'client-form')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>{t('clientApplications.newApplication', '+ New Client File')}</span>
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
            placeholder={t('clientApplications.searchPlaceholder', 'Search by Name, Passport, NID, Phone...')}
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
            <option value="all">{t('clientApplications.allServices', 'All Services')}</option>
            {SERVICE_TYPES.map((st) => (
              <option key={st.id} value={st.id}>
                {i18n.language === 'bn' ? st.bn : st.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">{t('clientApplications.allStatus', 'All Statuses')}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {i18n.language === 'bn' ? s.bn : s.label}
              </option>
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
                <th className="py-3 px-4">{t('clientApplications.applicationNo', 'Application #')}</th>
                <th className="py-3 px-4">{t('clientApplications.clientDetails', 'Client Details')}</th>
                <th className="py-3 px-4">{t('clientApplications.service', 'Service')}</th>
                <th className="py-3 px-4">{t('clientApplications.payment', 'Payment (BDT )')}</th>
                <th className="py-3 px-4">{t('clientApplications.currentStatus', 'Current Status')}</th>
                <th className="py-3 px-4">{t('clientApplications.date', 'Date')}</th>
                <th className="py-3 px-4 text-right">{t('clientApplications.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    {t('common.loading', 'Loading data...')}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    {t('common.noData', 'No data found')}
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

                      {/* Client Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">{item.client?.fullName || '—'}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          {item.client?.passportNumber && <span>Passport: {item.client.passportNumber}</span>}
                          {item.client?.mobileNumber && <span>📞 {item.client.mobileNumber}</span>}
                        </div>
                        {/* Attachments Indicator */}
                        {(item.attachments?.passportPhoto || item.attachments?.passportScan || item.attachments?.nidScan || (item.attachments?.otherFiles || []).length > 0) && (
                          <div className="flex items-center gap-1 mt-1 text-[9.5px]">
                            {item.attachments?.passportPhoto && (
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">📷 Photo</span>
                            )}
                            {item.attachments?.passportScan && (
                              <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-semibold">🛂 Passport</span>
                            )}
                            {item.attachments?.nidScan && (
                              <span className="bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded font-semibold">🪪 NID</span>
                            )}
                            {(item.attachments?.otherFiles || []).length > 0 && (
                              <span className="bg-sky-500/10 text-sky-600 px-1.5 py-0.5 rounded font-semibold">
                                📁 {item.attachments.otherFiles.length} Docs
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Service Type */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {getServiceLabel(item.serviceType, i18n.language)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">BDT  {total.toLocaleString('en-IN')}</div>
                        <div className="text-[10.5px] flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-600 font-semibold">
                            Adv: BDT {advance.toLocaleString('en-IN')}
                          </span>
                          {due > 0 && (
                            <span className="text-rose-600 font-semibold">
                              Due: BDT {due.toLocaleString('en-IN')}
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
                            <option key={s.id} value={s.id}>
                              {i18n.language === 'bn' ? s.bn : s.label}
                            </option>
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
                            onClick={() => setDeleteTarget({ id: item._id, applicationNo: item.applicationNo })}
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-150">
          <div className="bg-white text-black border border-black/10 rounded-2xl max-w-4xl w-full h-[70vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="no-print flex items-center justify-between border-b border-black/10 px-6 py-4 bg-black/[0.02] shrink-0">
              <div>
                <h3 className="font-bold text-sm text-black">
                  Printable Application Form ({previewItem.applicationNo})
                </h3>
                <p className="text-xs text-black/60">
                  Client: {previewItem.client?.fullName} | Service: {previewItem.serviceType}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    printDocument({
                      docId: previewItem?.applicationNo || previewItem?.receiptNo,
                      docType: 'Customer_Guardian_Form',
                      clientName: previewItem?.client?.fullName,
                    })
                  }
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 h-9 rounded-xl shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download PDF / Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-black/[0.02] flex justify-center">
              <ClientGuardianPreview data={previewItem} />
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
        description={`Client file "${deleteTarget?.applicationNo || deleteTarget?.id}" will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />
    </div>
  );
}
