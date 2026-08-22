import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { StatCard } from '@/components/ui/StatCard';
import { Wallet, CreditCard, Banknote, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Accounting() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiClient.get('/api/v1/admin/dashboard/accounting');
        if (res.data?.status === 'success') {
            setStats(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load accounting statistics');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const revenue = stats?.totalRevenue || 0;
  const dues = stats?.totalDues || 0;
  const expenses = stats?.officeExpenses || 0;
  const payroll = stats?.payroll || 0;
  const netProfit = stats?.netProfit || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Master Ledger</h1>
          <p className="text-muted-foreground mt-1">Financial overview of agency revenue, dues, expenses, and payroll.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue)}
          subtitle="All invoiced amounts"
          icon={Wallet}
          badgeColor="emerald"
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(dues)}
          subtitle="Unpaid or partially paid invoices"
          icon={CreditCard}
          badgeColor="rose"
        />
        <StatCard
          title="Office Expenses"
          value={formatCurrency(expenses)}
          subtitle="Confirmed cash vouchers"
          icon={Banknote}
          badgeColor="amber"
        />
        <StatCard
          title="Payroll Processed"
          value={formatCurrency(payroll)}
          subtitle="Total net salary payouts"
          icon={FileText}
          badgeColor="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <StatCard
          title="Net Profit (Calculated)"
          value={formatCurrency(netProfit)}
          trend={netProfit >= 0 ? "Profitable" : "Loss"}
          trendType={netProfit >= 0 ? "up" : "down"}
          subtitle="Revenue - (Expenses + Payroll)"
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          badgeColor={netProfit >= 0 ? "blue" : "rose"}
          className="lg:col-span-1"
        />
      </div>
    </div>
  );
}
