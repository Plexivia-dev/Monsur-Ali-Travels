import React, { useState, useEffect, useCallback } from 'react';
import {
  Banknote,
  Users,
  Download,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedDataTable } from '../../../components/tables/UnifiedDataTable';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function SalarySlipsPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [meta, setMeta] = useState({ total: 0, totalGross: 0, totalDeductions: 0, totalNetPayable: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getSalaries({
        page,
        limit,
        month: activeTab === 'all' ? '' : activeTab,
        search: searchQuery,
      });
      setSalaries(res.data || []);
      setMeta(res.meta || { total: 0, totalGross: 0, totalDeductions: 0, totalNetPayable: 0 });
    } catch (err) {
      toast.error('Failed to load salary slips records.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, searchQuery]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'salaries',
        period: 'all',
      });
      toast.success('Salary slips CSV report downloaded & archived on VPS!');
    } catch (err) {
      toast.error('Failed to export salary slips report.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'slipNo',
      header: 'Slip No',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-primary tracking-tight">{row.slipNo || '—'}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB') : '—'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'salaryMonth',
      header: 'Month / Cycle',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
          <Calendar className="w-3.5 h-3.5 text-sky-500" />
          <span>{row.salaryMonth || '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'employeeName',
      header: 'Employee Details',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-xs leading-tight">{row.employeeName || 'Unnamed'}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span className="font-mono text-primary/80 font-semibold">{row.employeeId || 'ID: —'}</span>
            <span>•</span>
            <span>{row.designation || 'Staff'}</span>
            {row.department && (
              <>
                <span>•</span>
                <span className="text-muted-foreground/80">({row.department})</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'grossEarnings',
      header: 'Gross (BDT)',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-foreground font-mono">
          BDT {Number(row.grossEarnings || 0).toLocaleString('en-BD')}
        </span>
      ),
    },
    {
      accessorKey: 'totalDeduction',
      header: 'Deductions (BDT)',
      cell: ({ row }) => {
        const ded = Number(row.totalDeduction || 0);
        return (
          <span className={`font-semibold text-xs font-mono ${ded > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
            BDT {ded.toLocaleString('en-BD')}
          </span>
        );
      },
    },
    {
      accessorKey: 'netSalaryPayable',
      header: 'Net Payable (BDT)',
      cell: ({ row }) => (
        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          BDT {Number(row.netSalaryPayable || 0).toLocaleString('en-BD')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMode',
      header: 'Mode',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
          {row.paymentMode || 'Cash'}
        </span>
      ),
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Slips', count: meta.total },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Net Salaries</span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            BDT {Number(meta.totalNetPayable || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Disbursed salary total</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Payroll</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-foreground font-mono">
            BDT {Number(meta.totalGross || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Before deductions</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Deductions</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            BDT {Number(meta.totalDeductions || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Advances & statutory cuts</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Export to VPS</span>
            <Download className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Export full payroll register to CSV</p>
          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Salaries CSV'}
          </Button>
        </div>
      </div>

      {/* Main Unified Data Table */}
      <UnifiedDataTable
        title="Employee Salary Slips Register"
        subtitle="Historical records of generated salary slips, allowances, deductions, and disbursements"
        columns={columns}
        data={salaries}
        loading={loading}
        totalItems={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by slip no, employee name, ID, month, department..."
        filterTabs={filterTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        onRefresh={fetchSalaries}
        onExport={handleExportCsv}
      />
    </div>
  );
}

export default SalarySlipsPage;
