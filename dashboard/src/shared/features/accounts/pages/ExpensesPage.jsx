import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedDataTable } from '../../../components/tables/UnifiedDataTable';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0, totalExpenseAmount: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getExpenses({
        page,
        limit,
        status: activeTab === 'all' ? '' : activeTab,
        search: searchQuery,
      });
      setExpenses(res.data || []);
      setMeta(res.meta || { total: 0, totalExpenseAmount: 0 });
    } catch (err) {
      toast.error('Failed to load expenses records.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, searchQuery]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'expenses',
        period: 'all',
      });
      toast.success('Expenses CSV report downloaded & archived on VPS!');
    } catch (err) {
      toast.error('Failed to export expenses report.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'voucherNo',
      header: 'Voucher No',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-primary tracking-tight">{row.voucherNo || '—'}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.voucherDate || (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : '—')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'primaryItem',
      header: 'Expense Items / Purpose',
      cell: ({ row }) => {
        const items = row.items || [];
        const primary = items[0];
        const count = items.length;
        return (
          <div className="max-w-[280px]">
            <p className="font-bold text-foreground text-xs truncate">
              {primary?.descriptionEn || primary?.descriptionBn || 'Office Expense'}
            </p>
            {primary?.descriptionBn && primary?.descriptionEn && (
              <p className="text-[11px] text-muted-foreground truncate">{primary.descriptionBn}</p>
            )}
            {count > 1 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary mt-0.5">
                +{count - 1} more items
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'preparedBy',
      header: 'Prepared By / Received By',
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <span className="text-muted-foreground text-[10px]">Prep:</span>
            <span>{row.preparedBy || 'Accounts'}</span>
          </div>
          {row.receivedBy && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5">
              <span>Recv:</span>
              <span className="text-foreground/90 font-medium">{row.receivedBy}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Amount (BDT)',
      cell: ({ row }) => {
        const total = row.grandTotal || row.subtotal || 0;
        return (
          <span className="font-bold text-xs text-rose-600 font-mono">
            BDT {Number(total).toLocaleString('en-BD')}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = String(row.status || 'confirmed').toLowerCase();
        let badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        let icon = <CheckCircle2 className="w-3 h-3 mr-1" />;

        if (st === 'draft') {
          badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          icon = <Clock className="w-3 h-3 mr-1" />;
        } else if (st === 'cancelled') {
          badgeClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
          icon = <XCircle className="w-3 h-3 mr-1" />;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${badgeClass}`}
          >
            {icon}
            {row.status || 'Confirmed'}
          </span>
        );
      },
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Expenses', count: meta.total },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'draft', label: 'Draft' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cash Expenses</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            BDT {Number(meta.totalExpenseAmount || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Across {meta.total || 0} cash vouchers</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Vouchers</span>
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground font-mono">{meta.total || 0}</p>
          <p className="text-[11px] text-muted-foreground">Active expense vouchers in database</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Export to VPS</span>
            <Download className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Export full expense register to CSV</p>
          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Expenses CSV'}
          </Button>
        </div>
      </div>

      {/* Operational Unified Expense Notice & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/[0.02] border border-black/10">
        <div className="text-xs text-black/70 space-y-0.5">
          <p className="font-bold text-black text-xs flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-black" />
            <span>Dual Operational Expense Architecture</span>
          </p>
          <p className="text-[11px] text-black/60">
            Petty cash receipts and office voucher claims are listed here. For comprehensive company operational bills (rent, utility, vendor payables), manage and settle them in <strong>Bills &amp; Expenditures</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/accounts/bills"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-black/85 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <span>Manage Company Bills</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            to="/admin/docs/cash-voucher"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-black/15 text-black hover:bg-black/5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Cash Voucher</span>
          </Link>
        </div>
      </div>

      {/* Main Unified Data Table */}
      <UnifiedDataTable
        title="Cash Money Vouchers & Expenses"
        subtitle="Live outgoing cash voucher ledger and office expense claims"
        columns={columns}
        data={expenses}
        loading={loading}
        totalItems={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by voucher no, prepared by, received by, description..."
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        onRefresh={fetchExpenses}
        onExport={handleExportCsv}
      />
    </div>
  );
}

export default ExpensesPage;
