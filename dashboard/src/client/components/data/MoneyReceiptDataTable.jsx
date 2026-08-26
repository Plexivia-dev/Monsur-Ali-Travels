import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Receipt,
  Plus,
  Printer,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Trash2,
  DollarSign,
  Download,
  Filter,
  ArrowUpDown,
  User,
  Eye,
  Check,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { DataTablePagination } from './DataTablePagination';
import { toast } from 'sonner';
import { formatToDdMmYyyy, printDocument } from '../../lib/utils';
import { MoneyReceiptModal, ReceiptConfirmModal, MoneyReceiptPrintSlip } from '@/shared/features/document-studio';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function MoneyReceiptDataTable() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, skip: 0, totalCount: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Financial KPI Summary
  const [summary, setSummary] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmModalItem, setConfirmModalItem] = useState(null);
  const [bankDepositTarget, setBankDepositTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await apiClient.get('/api/v1/client/receipts/summary');
      if (res.data?.success || res.data?.status === 'success') {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load receipt summary:', err);
    }
  };

  const fetchData = async (page = 1, limit = pagination.limit, searchQuery = search, statusFilter = status, serviceFilter = serviceType) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceFilter !== 'all' ? serviceFilter : undefined,
      };

      const res = await apiClient.get('/api/v1/client/receipts', { params });
      if (res.data?.success || res.data?.status === 'success') {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch money receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    fetchSummary();
  }, [status, serviceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, pagination.limit, search, status, serviceType);
  };

  const handleConfirmBankDeposit = async () => {
    if (!bankDepositTarget) return;
    const newState = !bankDepositTarget.handedOverToBank;
    try {
      const res = await apiClient.patch(`/api/v1/client/receipts/${bankDepositTarget._id || bankDepositTarget.id}/bank-deposit`, {
        handedOverToBank: newState,
      });
      if (res.data?.success || res.data?.status === 'success') {
        toast.success(`Bank deposit status updated.`);
        setBankDepositTarget(null);
        fetchData(pagination.page);
        fetchSummary();
      }
    } catch (err) {
      toast.error('Failed to update bank status.');
    }
  };

  const handleCancelReceipt = async (item) => {
    const reason = window.prompt(`Enter cancellation reason for Token #${item.receiptNo}:`, 'Client cancelled request');
    if (reason === null) return;

    try {
      const res = await apiClient.patch(`/api/v1/client/receipts/${item._id || item.id}/cancel`, { reason });
      if (res.data?.success || res.data?.status === 'success') {
        toast.success(`Token #${item.receiptNo} has been cancelled.`);
        fetchData(pagination.page);
        fetchSummary();
      }
    } catch (err) {
      toast.error('Failed to cancel token.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await apiClient.delete(`/api/v1/client/receipts/${deleteTarget.id}`);
      if (res.data?.success || res.data?.status === 'success') {
        toast.success(`Token #${deleteTarget.receiptNo} deleted successfully.`);
        setDeleteTarget(null);
        fetchData(pagination.page);
        fetchSummary();
      }
    } catch (err) {
      toast.error('Failed to delete token.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              {t('moneyReceipts.title', 'Money Receipts & Payment Collection')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('moneyReceipts.subtitle', 'All transaction tokens, advance receipts, and client payment vouchers.')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('moneyReceipts.newReceipt', '+ New Money Receipt')}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Today Confirmed */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold block">Today's Total Cash Collected</span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 font-mono">
                BDT  {Number(summary.todayConfirmed?.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {summary.todayConfirmed?.count || 0} Receipts Confirmed
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Pending at Cashier */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold block">Cashier Pending Tokens</span>
              <span className="text-lg sm:text-xl font-black text-amber-600 font-mono">
                BDT  {Number(summary.pending?.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {summary.pending?.count || 0} Tokens in Queue
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Cash In Office */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold block">Undeposited Cash Balance</span>
              <span className="text-lg sm:text-xl font-black text-primary font-mono">
                BDT  {Number(summary.cashInOffice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Pending Bank Deposit
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Bank Deposited */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold block">Bank Deposited</span>
              <span className="text-lg sm:text-xl font-black text-blue-600 font-mono">
                BDT  {Number(summary.bankDeposited?.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {summary.bankDeposited?.count || 0} Receipts Deposited
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Token (MR-...), Client Name, Phone, Passport..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
          />
        </form>

        <div className="flex items-center flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: '⏳ Pending' },
              { id: 'confirmed', label: '✅ Seal Verified' },
              { id: 'cancelled', label: '❌ Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  status === tab.id
                    ? 'bg-background text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              fetchData(1);
              fetchSummary();
            }}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">{t('tables.tokenNo', 'Token No')}</th>
                <th className="px-4 py-3">{t('tables.clientDetails', 'Client Details')}</th>
                <th className="px-4 py-3">{t('tables.serviceDetails', 'Service Details')}</th>
                <th className="px-4 py-3">{t('tables.amount', 'Amount')}</th>
                <th className="px-4 py-3">{t('tables.status', 'Status')}</th>
                <th className="px-4 py-3">{t('tables.createdBy', 'Created By')}</th>
                <th className="px-4 py-3">{t('tables.signedBy', 'Signed By')}</th>
                <th className="px-4 py-3">{t('tables.bankDeposit', 'Bank Deposit')}</th>
                <th className="px-4 py-3 text-right">{t('tables.action', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-muted-foreground">
                    {t('common.noData', 'No data found')}
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const isConfirmed = item.status === 'confirmed';
                  const isPending = item.status === 'pending';
                  const isCancelled = item.status === 'cancelled';

                  return (
                    <tr key={item._id || item.id} className="hover:bg-muted/30 transition-colors">
                      
                      {/* Token No */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-primary text-xs">
                          {item.receiptNo}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatToDdMmYyyy(item.createdAt)}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{item.clientName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                          <span>{item.clientPhone || 'No phone'}</span>
                          {item.passportNumber && (
                            <span className="bg-muted px-1.5 py-0.2 rounded uppercase text-[10px] font-semibold text-slate-700">
                              {item.passportNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-semibold text-foreground truncate">{item.serviceType}</div>
                        {item.purpose && (
                          <div className="text-[11px] text-muted-foreground truncate" title={item.purpose}>
                            {item.purpose}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-mono">
                        <span className="font-black text-sm text-foreground">
                          BDT  {Number(item.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({item.paymentMethod || 'Cash'})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Seal
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Created By */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="font-medium text-foreground">{item.createdByName || 'Manager'}</div>
                      </td>

                      {/* Confirmed By */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {isConfirmed ? (
                          <div>
                            <div className="font-bold text-emerald-700">{item.confirmedByName || 'Accountant'}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {formatToDdMmYyyy(item.confirmedAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not Yet Sealed</span>
                        )}
                      </td>

                      {/* Bank Handover */}
                      <td className="px-4 py-3">
                        {isConfirmed ? (
                          <button
                            onClick={() => setBankDepositTarget(item)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              item.handedOverToBank
                                ? 'bg-blue-500/10 text-blue-700 border-blue-300'
                                : 'bg-muted text-muted-foreground border-border hover:border-blue-400'
                            }`}
                            title="Click to toggle bank deposit status"
                          >
                            <Building2 className="w-3 h-3" />
                            {item.handedOverToBank ? 'Bank Deposited' : 'In Office Vault'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Confirm / Seal Button (If Pending) */}
                          {isPending && (
                            <button
                              onClick={() => setConfirmModalItem(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                              title="Confirm Cash & Apply Seal"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Apply Seal</span>
                            </button>
                          )}

                          {/* Print / View Slip Button */}
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                            title="Token   Print"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Button */}
                          {isPending && (
                            <button
                              onClick={() => handleCancelReceipt(item)}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                              title="Token Rejected "
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteTarget({ id: item._id || item.id, receiptNo: item.receiptNo })}
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
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

        {/* Pagination */}
        <DataTablePagination
          pagination={pagination}
          onPageChange={(p) => fetchData(p)}
          onLimitChange={(l) => fetchData(1, l)}
        />
      </div>

      {/* Manager Token Create Modal */}
      <MoneyReceiptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          fetchData(1);
          fetchSummary();
        }}
      />

      {/* Accountant Confirm / Seal Modal */}
      <ReceiptConfirmModal
        isOpen={Boolean(confirmModalItem)}
        onClose={() => setConfirmModalItem(null)}
        receipt={confirmModalItem}
        onConfirmed={() => {
          setConfirmModalItem(null);
          fetchData(pagination.page);
          fetchSummary();
        }}
      />

      {/* Preview / Print Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">
                  Money Receipt  Token Print  (#{previewItem.receiptNo})
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MoneyReceiptPrintSlip
                data={previewItem}
                onPrint={() =>
                  printDocument({
                    docId: previewItem?.receiptNo,
                    docType: 'Money_Receipt',
                    clientName: previewItem?.clientName,
                  })
                }
              />
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
        description={`Money receipt token #${deleteTarget?.receiptNo} will be permanently removed.`}
        cancelText="NO"
        confirmText="Yes"
        isDeleting={isDeleting}
      />

      {/* Confirm Bank Deposit Status Change Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(bankDepositTarget)}
        onOpenChange={(open) => !open && setBankDepositTarget(null)}
        onConfirm={handleConfirmBankDeposit}
        type={bankDepositTarget?.handedOverToBank ? "reset" : "delete"}
        title={bankDepositTarget?.handedOverToBank ? "Are you sure you want to reset this?" : "Are you sure you want to update bank deposit?"}
        description={bankDepositTarget?.handedOverToBank ? `Reset bank deposit status for token #${bankDepositTarget?.receiptNo}.` : `Record token #${bankDepositTarget?.receiptNo} as deposited to bank.`}
        cancelText="NO"
        confirmText="Yes"
      />

    </div>
  );
}
