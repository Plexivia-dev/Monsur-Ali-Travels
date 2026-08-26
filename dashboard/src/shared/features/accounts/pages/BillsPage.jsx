import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  DollarSign,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedDataTable } from '../../../components/tables/UnifiedDataTable';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getBills({
        page,
        limit,
        paymentStatus: activeTab === 'all' ? '' : activeTab,
        search: searchQuery,
      });
      setBills(res.data || []);
      setMeta(res.meta || { total: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 });
    } catch (err) {
      toast.error('Failed to load bills & invoices.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, searchQuery]);

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
      toast.success('Bills CSV report downloaded & archived on VPS!');
    } catch (err) {
      toast.error('Failed to export bills report.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice No',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-primary tracking-tight">{row.invoiceNo || '—'}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : '—'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Details',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-xs leading-tight">{row.customerName || 'Unnamed'}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {row.customerPhone && <span>{row.customerPhone}</span>}
            {row.trackingNumber && <span className="font-mono text-sky-400">Ref: {row.trackingNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total Bill (BDT)',
      cell: ({ row }) => {
        const total = row.grandTotal || row.totalAmount || 0;
        return (
          <span className="font-bold text-xs text-foreground font-mono">
            BDT {Number(total).toLocaleString('en-BD')}
          </span>
        );
      },
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid (BDT)',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          BDT {Number(row.paidAmount || 0).toLocaleString('en-BD')}
        </span>
      ),
    },
    {
      accessorKey: 'dueAmount',
      header: 'Due (BDT)',
      cell: ({ row }) => {
        const due = row.dueAmount || 0;
        return (
          <span
            className={`font-semibold text-xs font-mono ${
              due > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-muted-foreground'
            }`}
          >
            BDT {Number(due).toLocaleString('en-BD')}
          </span>
        );
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: ({ row }) => {
        const st = String(row.paymentStatus || 'Pending').toLowerCase();
        let badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        let icon = <Clock className="w-3 h-3 mr-1" />;

        if (st === 'paid') {
          badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
        } else if (st === 'partial') {
          badgeClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          icon = <Clock className="w-3 h-3 mr-1" />;
        } else if (st === 'overdue') {
          badgeClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
          icon = <AlertTriangle className="w-3 h-3 mr-1" />;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${badgeClass}`}
          >
            {icon}
            {row.paymentStatus || 'Pending'}
          </span>
        );
      },
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Bills', count: meta.total },
    { id: 'Paid', label: 'Fully Paid' },
    { id: 'Partial', label: 'Partial Paid' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Overdue', label: 'Overdue' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground font-mono">
            BDT {Number(meta.totalAmount || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Grand total billed</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Collected on Bills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            BDT {Number(meta.totalPaid || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Settled payments</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Outstanding Due</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            BDT {Number(meta.totalDue || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Pending receivables</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Export to VPS</span>
            <Download className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Export full billing register to CSV</p>
          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Bills CSV'}
          </Button>
        </div>
      </div>

      {/* Main Unified Data Table */}
      <UnifiedDataTable
        title="Bills & Invoice Register"
        subtitle="Comprehensive billing records, invoice balances, and client receivables"
        columns={columns}
        data={bills}
        loading={loading}
        totalItems={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by invoice no, customer name, phone, ref..."
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        onRefresh={fetchBills}
        onExport={handleExportCsv}
      />
    </div>
  );
}

export default BillsPage;
