import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Plus,
  Eye,
  Trash2,
  FileText,
  Building2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedDataTable } from '../../../components/tables/UnifiedDataTable';
import { accountsService } from '../services/accountsService';
import { CreateBillModal, BILL_CATEGORIES } from '../components/CreateBillModal';
import { BillPreviewModal } from '../components/BillPreviewModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { toast } from 'sonner';

export function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getBills({
        page,
        limit,
        paymentStatus: activeTab === 'all' ? '' : activeTab,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        search: searchQuery,
      });
      setBills(res.data || []);
      setMeta(res.meta || { total: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 });
    } catch (err) {
      toast.error('Failed to load company expense bills.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'bills',
        period: 'all',
      });
      toast.success('Company Bills CSV report downloaded & archived on VPS!');
    } catch (err) {
      toast.error('Failed to export bills report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteBill = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await accountsService.deleteBill(deleteTarget._id || deleteTarget.did || deleteTarget.id);
      toast.success('Company Bill voucher deleted successfully.');
      setDeleteTarget(null);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete bill.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'billNumber',
      header: 'Bill Voucher #',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-black tracking-tight">
            {row.billNumber || row.did || '—'}
          </span>
          <span className="text-[10px] text-black/50">
            {row.billDate ? new Date(row.billDate).toLocaleDateString('en-GB') : '—'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Bill Description & Category',
      cell: ({ row }) => (
        <div className="max-w-[260px]">
          <p className="font-bold text-black text-xs leading-tight truncate" title={row.title}>
            {row.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-black/[0.04] border border-black/10 text-[10px] font-semibold text-black/80">
              {row.category || 'Office Expense'}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'payee',
      header: 'Paid To / Payee',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-black text-xs">{row.payee || '—'}</p>
          {row.payeePhone && <p className="text-[10px] text-black/50 font-mono">{row.payeePhone}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-black">
          <CreditCard className="w-3 h-3 text-black/50" />
          {row.paymentMethod || 'Cash'}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Total Amount (BDT)',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-black">
          ৳ {Number(row.amount || 0).toLocaleString('en-BD')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const st = (row.paymentStatus || 'Paid').toLowerCase();
        let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (st === 'unpaid') badgeStyle = 'bg-red-50 text-red-800 border-red-200';
        if (st === 'partial') badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';

        return (
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
            {row.paymentStatus || 'Paid'}
          </span>
        );
      },
    },
    {
      accessorKey: 'documentUrl',
      header: 'Receipt Slip',
      cell: ({ row }) =>
        row.documentUrl ? (
          <a
            href={row.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-md text-[10px] font-bold transition cursor-pointer"
          >
            <FileText className="w-3 h-3 text-emerald-600" />
            <span>View Slip</span>
          </a>
        ) : (
          <span className="text-[10px] text-black/40 italic">No File</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewBill(row)}
            className="h-7 px-2 text-xs font-semibold border-black/15 text-black hover:bg-black/5 gap-1 cursor-pointer"
            title="View Bill Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteTarget(row)}
            className="h-7 px-2 text-xs font-semibold border-red-500/30 text-red-600 hover:bg-red-500/10 cursor-pointer"
            title="Delete Bill"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Receipt className="w-6 h-6 text-black" />
            Company Expense Bills &amp; Expenditures
          </h1>
          <p className="text-xs sm:text-sm text-black/60 mt-0.5">
            Manage company outgoing operational bills, utility payments, employee salary disbursements, and office expenses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="border-black/15 text-black hover:bg-black/5 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white hover:bg-black/90 gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Bill / Expense
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Total Bills Amount</span>
            <div className="p-2 rounded-xl bg-black/[0.04] text-black">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-black">
            ৳ {Number(meta.totalAmount || 0).toLocaleString('en-BD')}
          </p>
          <span className="text-[11px] text-black/50">Overall recorded company expenses</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Bills</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700">
            ৳ {Number(meta.totalPaid || 0).toLocaleString('en-BD')}
          </p>
          <span className="text-[11px] text-emerald-800/60">Disbursed &amp; settled vouchers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Due / Unpaid</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-red-700">
            ৳ {Number(meta.totalDue || 0).toLocaleString('en-BD')}
          </p>
          <span className="text-[11px] text-red-800/60">Pending company payables</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Total Vouchers</span>
            <div className="p-2 rounded-xl bg-black/[0.04] text-black">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-black">{meta.total || 0}</p>
          <span className="text-[11px] text-black/50">Recorded bill voucher records</span>
        </div>
      </div>

      {/* 3. Filters Bar (Status Tabs + Category Filter) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/10">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl border border-black/10 text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Unpaid', label: 'Unpaid / Due' },
            { id: 'Partial', label: 'Partial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-black/60 whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-black/15 rounded-xl text-black font-semibold text-xs focus:ring-2 focus:ring-black/10 outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Expense Categories</option>
            {BILL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Unified Data Table */}
      <UnifiedDataTable
        columns={columns}
        data={bills}
        loading={loading}
        pagination={{
          page,
          limit,
          total: meta.total || 0,
          totalPages: meta.totalPages || 1,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        search={{
          value: searchQuery,
          onChange: (val) => {
            setSearchQuery(val);
            setPage(1);
          },
          placeholder: 'Search by title, payee, or bill #...',
        }}
      />

      {/* 5. Create Bill Modal */}
      <CreateBillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchBills}
      />

      {/* 6. Preview Bill Modal */}
      <BillPreviewModal
        isOpen={Boolean(previewBill)}
        onClose={() => setPreviewBill(null)}
        bill={previewBill}
      />

      {/* 7. Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBill}
        title="Delete Bill Voucher"
        description={`Are you sure you want to delete bill voucher "${deleteTarget?.title || deleteTarget?.billNumber}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default BillsPage;
