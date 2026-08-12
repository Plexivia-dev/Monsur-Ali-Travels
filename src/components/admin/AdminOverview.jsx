import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  Users,
  AlertCircle,
  Factory,
  Users2,
  Search,
  Clock,
  ChevronDown,
  Building2,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const AdminOverview = ({ adminData }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Today');
  const [feedFilter, setFeedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const timeframeOptions = ['Today', 'Last 7 Days', 'Last 30 Days'];

  // Extract owner overview data for active timeframe
  const ownerOverview = adminData?.ownerOverview || {};
  const timeframeData =
    ownerOverview.timeframes?.[selectedTimeframe] ||
    ownerOverview.timeframes?.['Today'] ||
    {};

  // Feed items
  const rawFeed = adminData?.recentActivityFeed || [];
  const filteredFeed = rawFeed.filter((item) => {
    const matchesModule =
      feedFilter === 'All' ||
      (feedFilter === 'Factory' && item.module === 'Factory') ||
      (feedFilter === 'Agency' && item.module === 'Agency');

    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              Owner Portal
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Centralized real-time monitoring for Brick Factory & Manpower Agency operations
          </p>
        </div>

        {/* Timeframe Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground hidden md:inline">
            Timeframe:
          </span>
          <div className="relative inline-block text-left">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="appearance-none bg-background border border-border text-foreground text-xs font-bold rounded-xl px-4 py-2.5 pr-9 shadow-sm hover:border-muted-foreground/30 focus:outline-hidden focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            >
              {timeframeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 1: Key Metric Cards (4 KPI Cards in a row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Expense */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:border-muted-foreground/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {selectedTimeframe}'s Total Expense
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {timeframeData.totalExpenseFormatted || '৳0'}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Combined:</span>
            <span>Factory ৳{(timeframeData.expenseBreakdown?.factory / 1000).toFixed(0)}k</span>
            <span>•</span>
            <span>Agency ৳{(timeframeData.expenseBreakdown?.agency / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* 2. Total Cash In / Revenue */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:border-muted-foreground/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {selectedTimeframe}'s Total Cash In
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {timeframeData.totalCashInFormatted || '৳0'}
          </div>
          <div className="mt-2 text-[11px] text-emerald-500 font-medium flex items-center gap-1.5 pt-2 border-t border-border">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Factory ৳{(timeframeData.cashInBreakdown?.factory / 1000).toFixed(0)}k | Agency ৳{(timeframeData.cashInBreakdown?.agency / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* 3. Employee Attendance Rate (%) */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:border-muted-foreground/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Attendance Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-foreground tracking-tight">
              {timeframeData.attendanceRate}%
            </div>
            <span className="text-xs font-semibold text-emerald-500">
              High Shift Compliance
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
            <span>{timeframeData.attendanceDetails || '212/224 Present'}</span>
            <span className="font-semibold text-primary">
              Active
            </span>
          </div>
        </div>

        {/* 4. Total Pending Payments / Collection Dues */}
        <div className="bg-amber-500/5 rounded-2xl border border-amber-500/30 p-4 shadow-sm hover:border-amber-500/55 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Pending Collection Dues
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500 tracking-tight">
            {timeframeData.pendingPaymentsFormatted || '৳0'}
          </div>
          <div className="mt-2 text-[11px] text-amber-500 font-medium pt-2 border-t border-amber-500/20 flex items-center justify-between">
            <span>Receivable Funds Dues</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold text-[10px]">
              Requires Follow-up
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area (Split into 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Recent Activity Feed - 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle icon={Clock}>Recent Activity Feed</CardTitle>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Real-Time Cross-Business Stream
                </span>
              </div>

              {/* Module Filter Tabs & Search */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted">
                  {['All', 'Factory', 'Agency'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFeedFilter(tab)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        feedFilter === tab
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'All' ? 'All Events' : tab === 'Factory' ? 'Brick Factory' : 'Agency'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter live event feed..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[520px] divide-y divide-border">
              {filteredFeed.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <p>No activity logs found for selected filter.</p>
                </div>
              ) : (
                filteredFeed.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-muted/40 transition-colors space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.module === 'Factory'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                          }`}
                        >
                          {item.module === 'Factory' ? 'Brick Factory' : 'Manpower Agency'}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {item.timestamp}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.status === 'Completed' || item.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <div className="w-5 h-5 rounded-full bg-muted text-foreground text-[9px] font-bold flex items-center justify-center">
                          {item.avatar}
                        </div>
                        <span>{item.user}</span>
                      </div>

                      {item.amount && (
                        <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                          {item.amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Visual Analytics / Charts - 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Chart 1: Expense vs Cash In Flow Trends */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle icon={TrendingUp}>Expense vs. Cash In Flow Trends</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Comparative financial velocity for {selectedTimeframe}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Cash In</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Operating Expense</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeframeData.cashFlowTrends || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border)', opacity: 0.3 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `৳${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        color: 'var(--foreground)',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`৳${val.toLocaleString()}`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cashIn"
                      name="Total Cash In"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCashIn)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Total Expense"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Factory vs Agency Performance Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle icon={Building2}>Factory vs. Agency Financial Comparison</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Business unit breakdown across revenue, expense, and surplus
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Brick Factory</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Manpower Agency</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-56 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeframeData.businessComparison || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border)', opacity: 0.3 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `৳${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        color: 'var(--foreground)',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`৳${val.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="factory" name="Brick Factory" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="agency" name="Manpower Agency" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
