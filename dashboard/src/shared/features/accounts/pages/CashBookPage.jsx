import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function CashBookPage() {
  const [data, setData] = useState({ summary: {}, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [isExporting, setIsExporting] = useState(false);

  const fetchCashBook = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getCashBook({ period });
      setData(res || { summary: {}, transactions: [] });
    } catch (err) {
      toast.error('Failed to load cash book ledger.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchCashBook();
  }, [fetchCashBook]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'payments',
        period,
      });
      toast.success('Cash book report exported to VPS!');
    } catch (err) {
      toast.error('Failed to export cash book.');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {};
  const transactions = data?.transactions || [];

  const PERIOD_PRESETS = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header & Time Filter */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>Real-Time Cash Management</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              Daily Cash Book & Liquid Register
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chronological cash inflows from money receipts and cash outflows from expense vouchers.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCashBook}
            className="self-start md:self-auto h-9 px-3 rounded-xl cursor-pointer text-xs gap-1.5 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Cash Book</span>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Cash Inflows */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cash Inflows</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ৳{Number(summary.totalCashIn || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">{summary.receiptsCount || 0} Cash Receipts</p>
        </div>

        {/* Cash Outflows */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cash Outflows</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            ৳{Number(summary.totalCashOut || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">{summary.vouchersCount || 0} Cash Vouchers</p>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Net Cash in Hand</span>
            <Wallet className="w-4 h-4 text-sky-500" />
          </div>
          <p className={`text-2xl font-black font-mono ${Number(summary.netCashBalance || 0) >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
            ৳{Number(summary.netCashBalance || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Period liquidity balance</p>
        </div>

        {/* Export to VPS */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Export to VPS</span>
            <Download className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Export full cash ledger to CSV</p>
          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="w-full mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Cash Book CSV'}
          </Button>
        </div>
      </div>

      {/* Chronological Cash Transactions Ledger */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Cash Transactions Statement</h3>
            <p className="text-xs text-muted-foreground">
              All physical cash movements recorded for the selected time period.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            {transactions.length} entries
          </span>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Ref No</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Party / Payee</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-right">Cash In (BDT)</th>
                <th className="py-3 px-3 text-right">Cash Out (BDT)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading cash transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No cash transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {t.date ? new Date(t.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                      {t.refNo}
                    </td>
                    <td className="py-2.5 px-3">
                      {t.type === 'INFLOW' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ArrowDownLeft className="w-3 h-3" /> Cash In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <ArrowUpRight className="w-3 h-3" /> Cash Out
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      {t.party || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-[200px] truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {t.amountIn > 0 ? `৳${t.amountIn.toLocaleString('en-BD')}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {t.amountOut > 0 ? `৳${t.amountOut.toLocaleString('en-BD')}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border capitalize">
                        {t.status || 'Confirmed'}
                      </span>
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

export default CashBookPage;
