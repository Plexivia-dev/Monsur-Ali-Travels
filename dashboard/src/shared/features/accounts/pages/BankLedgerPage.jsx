import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  CreditCard,
  RefreshCw,
  Calendar,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accountsService } from '../services/accountsService';
import { toast } from 'sonner';

export function BankLedgerPage() {
  const [data, setData] = useState({ summary: {}, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'INFLOW' | 'OUTFLOW'
  const [isExporting, setIsExporting] = useState(false);

  const fetchBankLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsService.getBankLedger({ period });
      setData(res || { summary: {}, transactions: [] });
    } catch (err) {
      toast.error('Failed to load bank ledger.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchBankLedger();
  }, [fetchBankLedger]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await accountsService.exportReportCsv({
        type: 'payments',
        period,
      });
      toast.success('Bank ledger report exported to VPS!');
    } catch (err) {
      toast.error('Failed to export bank ledger.');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {};
  const allTransactions = data?.transactions || [];
  const channels = summary?.channelBreakdown || [];

  const filteredTransactions = allTransactions.filter((t) => {
    if (filterType === 'INFLOW') return t.type === 'INFLOW';
    if (filterType === 'OUTFLOW') return t.type === 'OUTFLOW';
    return true;
  });

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
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-bold mb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank &amp; Digital Payment Accounts</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              Bank Ledger &amp; Digital Accounts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive double-entry statement of bank transfers, cheques, card collections, and outgoing bill settlements.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchBankLedger}
            className="self-start md:self-auto h-9 px-3 rounded-xl cursor-pointer text-xs gap-1.5 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Bank Ledger</span>
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bank Deposits */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bank Inflows</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            BDT {Number(summary.totalBankIn || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">{summary.inflowsCount || 0} Electronic Deposits</p>
        </div>

        {/* Total Bank Payments / Outflows */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bank Outflows</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            BDT {Number(summary.totalBankOut || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">{summary.outflowsCount || 0} Paid Company Bills</p>
        </div>

        {/* Net Bank Position */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Net Bank Flow</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className={`text-2xl font-black font-mono ${Number(summary.netBankBalance || 0) >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
            BDT {Number(summary.netBankBalance || 0).toLocaleString('en-BD')}
          </p>
          <p className="text-[11px] text-muted-foreground">Inflows minus Outflows</p>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Channel Inflows</span>
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
            {channels.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">No channels recorded</span>
            ) : (
              channels.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 text-foreground border border-border text-[10px] font-semibold"
                >
                  <span>{c.channel}:</span>
                  <span className="font-mono font-bold text-primary">৳{Number(c.amount || 0).toLocaleString('en-BD')}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bank Ledger Table */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Bank &amp; Digital Statement</h3>
            <p className="text-xs text-muted-foreground">
              Dual-entry ledger tracking client deposits and outgoing bill expenditures.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({allTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('INFLOW')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'INFLOW'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deposits In ({summary.inflowsCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('OUTFLOW')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'OUTFLOW'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payments Out ({summary.outflowsCount || 0})
            </button>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Ref / Doc #</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Method / Channel</th>
                <th className="py-3 px-3">Party / Payee</th>
                <th className="py-3 px-3">Account / Purpose</th>
                <th className="py-3 px-3 text-right">Inflow (BDT)</th>
                <th className="py-3 px-3 text-right">Outflow (BDT)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Loading bank transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No transactions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => {
                  const isInflow = t.type === 'INFLOW';
                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {t.date ? new Date(t.date).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                        {t.refNo}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                            isInflow
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}
                        >
                          {isInflow ? '+ Inflow' : '- Outflow'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20 uppercase">
                          {t.method || 'Bank'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        <p>{t.party || '—'}</p>
                        {t.phone && <p className="text-[11px] text-muted-foreground font-normal">{t.phone}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {t.bankName ? (
                          <div className="text-xs">
                            <span className="font-semibold text-foreground">{t.bankName}</span>
                            {t.accountNo && <span className="block text-[11px] font-mono">A/C: {t.accountNo}</span>}
                          </div>
                        ) : (
                          <span className="text-xs truncate max-w-[160px] block" title={t.description}>
                            {t.description || '—'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {Number(t.amountIn || 0) > 0 ? `+৳${Number(t.amountIn).toLocaleString('en-BD')}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                        {Number(t.amountOut || 0) > 0 ? `-৳${Number(t.amountOut).toLocaleString('en-BD')}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t.status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BankLedgerPage;
