import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Wallet,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  RefreshCw,
  FileCheck,
  ArrowDownToLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function ReportsPage() {
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsService.getReportsSummary({
        period,
        startDate: period === 'custom' ? customStart : '',
        endDate: period === 'custom' ? customEnd : '',
      });
      setSummary(data);
    } catch (err) {
      toast.error('Failed to load accounts financial reports summary.');
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  const fetchDownloads = useCallback(async () => {
    setLoadingDownloads(true);
    try {
      const list = await accountsService.getExportDownloads();
      setDownloads(list || []);
    } catch (err) {
      console.error('Failed to fetch VPS download history:', err);
    } finally {
      setLoadingDownloads(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const handleExport = async (type) => {
    setExportingType(type);
    try {
      await accountsService.exportReportCsv({
        type,
        period,
        startDate: period === 'custom' ? customStart : '',
        endDate: period === 'custom' ? customEnd : '',
      });
      toast.success(`${type.toUpperCase()} report generated, saved to VPS, and downloaded!`);
      fetchDownloads();
    } catch (err) {
      toast.error(`Failed to export ${type} report.`);
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadArchived = async (fileName) => {
    try {
      await accountsService.downloadArchivedReport(fileName);
      toast.success(`Downloaded ${fileName} from VPS`);
    } catch (err) {
      toast.error('Failed to download archived report from VPS.');
    }
  };

  const PERIOD_PRESETS = [
    { id: 'this_week', label: 'This Week' },
    { id: 'last_week', label: 'Last Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const financials = summary?.financials || {};

  return (
    <div className="space-y-6">
      {/* Header Banner & Period Filter */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Financial & Operational Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
              Accounts & Executive Reports
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Filter financial collections, billing receivables, and export CSV reports directly archived on VPS.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSummary}
            className="self-start md:self-auto h-9 px-3 rounded-xl cursor-pointer text-xs gap-1.5 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Report</span>
          </Button>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Time Filter:
          </span>
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Selector */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">From:</span>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-xs bg-muted/40 border-border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">To:</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-xs bg-muted/40 border-border rounded-lg"
              />
            </div>
            <Button
              size="sm"
              onClick={fetchSummary}
              className="h-8 px-3 rounded-lg text-xs font-bold cursor-pointer"
            >
              Apply Filter
            </Button>
          </div>
        )}
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Received</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            BDT {Number(financials.totalIncome || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">
            From {financials.receiptsCount || 0} Money Receipts (Inflows)
          </p>
        </div>

        {/* Total Outflows / Expenses */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            BDT {Number(financials.totalOutflow ?? ((financials.totalExpenses || 0) + (financials.totalSalaries || 0))).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Paid Bills, Salaries &amp; Vouchers
          </p>
        </div>

        {/* Net Operational Margin */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Net Cash Flow</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <p className={`text-2xl font-black font-mono ${Number(financials.netPosition || 0) >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
            BDT {Number(financials.netPosition || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Inflows minus Outflows
          </p>
        </div>

        {/* Accounts Receivable (Client Invoices Due) */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Receivables (Due)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">
            BDT {Number(financials.accountsReceivable ?? financials.totalDueOnInvoices ?? 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Client Invoice balances</p>
        </div>

        {/* Accounts Payable (Company Bills Due) */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Payables (Due)</span>
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            BDT {Number(financials.accountsPayable ?? financials.totalDueOnBills ?? 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Unpaid Company Bills</p>
        </div>
      </div>

      {/* CSV Export Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 p-6 rounded-2xl shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-400" />
              Download & Export Reports (Saved to VPS)
            </h2>
            <p className="text-xs text-sky-100/70 max-w-2xl">
              Choose an export dataset based on your selected time filter (
              <span className="text-sky-300 font-bold capitalize">{period.replace('_', ' ')}</span>). Every CSV download is physically archived and audited on the VPS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export Payments */}
          <button
            type="button"
            disabled={exportingType !== null}
            onClick={() => handleExport('payments')}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div>
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                Export Payments Report
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">Money receipts & vouchers CSV</p>
            </div>
            <ArrowDownToLine className={`w-5 h-5 text-sky-400 shrink-0 ${exportingType === 'payments' ? 'animate-bounce' : ''}`} />
          </button>

          {/* Export Bills */}
          <button
            type="button"
            disabled={exportingType !== null}
            onClick={() => handleExport('bills')}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div>
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                Export Bills Report
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">Client invoices & receivables CSV</p>
            </div>
            <ArrowDownToLine className={`w-5 h-5 text-emerald-400 shrink-0 ${exportingType === 'bills' ? 'animate-bounce' : ''}`} />
          </button>

          {/* Export Consolidated */}
          <button
            type="button"
            disabled={exportingType !== null}
            onClick={() => handleExport('financial_summary')}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div>
              <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                Export Consolidated CSV
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">Combined income & billing register</p>
            </div>
            <ArrowDownToLine className={`w-5 h-5 text-amber-400 shrink-0 ${exportingType === 'financial_summary' ? 'animate-bounce' : ''}`} />
          </button>
        </div>
      </div>

      {/* Methods & Invoice Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Collections by Payment Method
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {summary?.methods?.length || 0} methods
            </span>
          </div>

          <div className="space-y-2.5">
            {(summary?.methods || []).length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No payment data in this period.</p>
            ) : (
              summary.methods.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-foreground capitalize">{m.method}</span>
                    <span className="text-[11px] text-muted-foreground">({m.count} txns)</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    BDT {Number(m.amount || 0).toLocaleString('en-BD')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Payment Status Breakdown */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Invoices Status Breakdown
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {summary?.invoiceStatuses?.length || 0} categories
            </span>
          </div>

          <div className="space-y-2.5">
            {(summary?.invoiceStatuses || []).length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No invoice data in this period.</p>
            ) : (
              summary.invoiceStatuses.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-bold text-foreground capitalize">{s.status}</span>
                    <span className="text-[11px] text-muted-foreground">({s.count} bills)</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    BDT {Number(s.amount || 0).toLocaleString('en-BD')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* VPS Stored Reports Archive Table */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-500" />
              VPS Stored Reports Archive
            </h3>
            <p className="text-xs text-muted-foreground">
              History of all CSV export files saved on the server. Click to re-download anytime.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDownloads}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDownloads ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
              <tr>
                <th className="py-2.5 px-3">Report File Name</th>
                <th className="py-2.5 px-3">Generated Date</th>
                <th className="py-2.5 px-3">File Size</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {downloads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No reports exported yet. Use the buttons above to generate and archive reports.
                  </td>
                </tr>
              ) : (
                downloads.map((d, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-primary">{d.fileName}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {d.createdAt ? new Date(d.createdAt).toLocaleString('en-GB') : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">
                      {(d.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadArchived(d.fileName)}
                        className="h-7 px-2.5 text-xs font-semibold gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
