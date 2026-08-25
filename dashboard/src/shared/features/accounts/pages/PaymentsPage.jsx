import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  CreditCard,
  Plus,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedDataTable } from '../../../components/tables/UnifiedDataTable';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0, totalAmount: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getPayments({
        page,
        limit,
        status: activeTab === 'all' ? '' : activeTab,
        search: searchQuery,
      });
      setPayments(res.data || []);
      setMeta(res.meta || { total: 0, totalAmount: 0 });
    } catch (err) {
      toast.error('Failed to load payments records.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'payments',
        period: 'all',
      });
      toast.success('Payments CSV report downloaded & archived on VPS!');
    } catch (err) {
      toast.error('Failed to export payments report.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'receiptNo',
      header: 'Receipt No',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-primary tracking-tight">{row.receiptNo || '—'}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : '—'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'clientName',
      header: 'Client Details',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-xs leading-tight">{row.clientName || 'Unnamed'}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {row.clientPhone && <span>{row.clientPhone}</span>}
            {row.passportNumber && <span className="font-mono text-primary/80">({row.passportNumber})</span>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'serviceType',
      header: 'Service / Purpose',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.purpose || row.serviceType}>
          <span className="text-xs text-foreground/90 font-medium">{row.serviceType || 'General Service'}</span>
          <p className="text-[11px] text-muted-foreground truncate">{row.purpose || '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
          {row.paymentMethod || 'Cash'}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount (BDT)',
      cell: ({ row }) => (
        <span className="font-bold text-xs text-foreground font-mono">
          ৳{Number(row.amount || 0).toLocaleString('en-BD')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = String(row.status || 'Draft').toLowerCase();
        let badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        let icon = <Clock className="w-3 h-3 mr-1" />;

        if (st === 'confirmed') {
          badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
        } else if (st === 'cancelled') {
          badgeClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
          icon = <XCircle className="w-3 h-3 mr-1" />;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${badgeClass}`}
          >
            {icon}
            {row.status || 'Draft'}
          </span>
        );
      },
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Payments', count: meta.total },
    { id: 'Confirmed', label: 'Confirmed' },
    { id: 'Draft', label: 'Draft / Unconfirmed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Received</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground font-mono">
            ৳{Number(meta.totalAmount || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Across {meta.total || 0} payment receipts</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground font-mono">{meta.total || 0}</p>
          <p className="text-[11px] text-muted-foreground">Active vouchers in database</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Export to VPS</span>
            <Download className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Export full payments ledger directly to CSV</p>
          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Payments CSV'}
          </Button>
        </div>
      </div>

      {/* Main Unified Data Table */}
      <UnifiedDataTable
        title="Payment Receipts & Vouchers"
        subtitle="Live payment collection ledger and money receipts across all services"
        columns={columns}
        data={payments}
        loading={loading}
        totalItems={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by receipt no, client name, phone, passport..."
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        onRefresh={fetchPayments}
        onExport={handleExportCsv}
      />
    </div>
  );
}

export default PaymentsPage;
