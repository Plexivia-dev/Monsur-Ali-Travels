import React from 'react';
import { useFactoryData } from '../../api/hooks';
import { StatCard } from '../ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Factory, Flame, Truck, Layers, Coins, AlertCircle, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePortal } from '../../context/PortalContext';

export const FactoryDashboard = () => {
  const { data: factoryData, isLoading } = useFactoryData();
  const { switchPortal, addToast } = usePortal();

  if (isLoading || !factoryData) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading Factory Telemetry & Production Records...
      </div>
    );
  }

  const { metrics, productionBatches, bills, payments, reports } = factoryData;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Coal Stock is low */}
      {metrics.coalStockTons < metrics.coalThresholdTons && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Low Coal Stock Warning</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Current coal reserves ({metrics.coalStockTons} Tons) are below the minimum operational buffer ({metrics.coalThresholdTons} Tons).
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => switchPortal('factory', 'bills')}
          >
            Create Coal Order
          </Button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Molded Bricks"
          value={metrics.dailyMoldedBricks.toLocaleString()}
          trend="+8.5% vs yesterday"
          trendType="up"
          subtitle={`Target: ${metrics.dailyTarget.toLocaleString()}`}
          icon={Layers}
          badgeColor="blue"
          progress={(metrics.dailyMoldedBricks / metrics.dailyTarget) * 100}
        />

        <StatCard
          title="Coal Stock Level"
          value={`${metrics.coalStockTons} Tons`}
          trend={metrics.coalStockTons < 20 ? 'Below Threshold' : 'Stock Normal'}
          trendType={metrics.coalStockTons < 20 ? 'down' : 'up'}
          subtitle={`Min Threshold: ${metrics.coalThresholdTons} Tons`}
          icon={Flame}
          badgeColor="amber"
          progress={(metrics.coalStockTons / 50) * 100}
        />

        <StatCard
          title="Truckload Dispatches"
          value={`${metrics.truckloadDeliveries} Loads`}
          trend="+3 loads today"
          trendType="up"
          subtitle="Haulage Fleet Dispatched"
          icon={Truck}
          badgeColor="emerald"
        />

        <StatCard
          title="Daily Worker Wage Expense"
          value={metrics.dailyWagesPaid}
          trend="Kiln & Molding Crew"
          trendType="neutral"
          subtitle={`${metrics.activeKilns} Active Kilns Firing`}
          icon={Coins}
          badgeColor="purple"
        />
      </div>

      {/* Production Chart & Kiln Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Production Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle icon={Factory}>Monthly Brick Production Trend</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Actual Molded Units vs Target (Year 2026)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => switchPortal('factory', 'reports')}>
              Full Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.monthlyProduction}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(val) => [`${val.toLocaleString()} Bricks`, 'Production']}
                  />
                  <Area type="monotone" dataKey="produced" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Kiln Status Card */}
        <Card>
          <CardHeader>
            <CardTitle icon={Flame}>Active Kiln Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Kiln Chamber A</span>
                <Badge variant="success">Firing (1,080°C)</Badge>
              </div>
              <p className="text-xs text-slate-500">Batch #892 - Red Clay Solid Brick</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Progress: 85%</span>
                <span>Eta: 4 hrs</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Kiln Chamber B</span>
                <Badge variant="warning">Molding Phase</Badge>
              </div>
              <p className="text-xs text-slate-500">Batch #893 - Fly Ash Brick</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Progress: 45%</span>
                <span>Eta: 12 hrs</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Kiln Chamber C</span>
                <Badge variant="info">Cooling Stage</Badge>
              </div>
              <p className="text-xs text-slate-500">Batch #894 - Perforated Hollow</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '95%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Progress: 95%</span>
                <span>Ready for unload</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Batches & Recent Raw Material Bills Table preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Batches */}
        <Card>
          <CardHeader>
            <CardTitle icon={Layers}>Active Production Batches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {productionBatches.map((batch) => (
                <div key={batch.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{batch.id}</span>
                      <Badge variant={batch.status === 'Firing' ? 'success' : batch.status === 'Cooling' ? 'info' : 'warning'}>
                        {batch.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{batch.type} • {batch.quantity.toLocaleString()} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{batch.kilnId}</p>
                    <p className="text-[11px] text-slate-400">{batch.supervisor}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vendor Bills */}
        <Card>
          <CardHeader>
            <CardTitle icon={Coins}>Recent Factory Expenses & Bills</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => switchPortal('factory', 'bills')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{bill.vendor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{bill.category} • {bill.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">${bill.amount.toLocaleString()}</p>
                    <Badge variant={bill.status === 'Paid' ? 'success' : bill.status === 'Pending' ? 'warning' : 'danger'}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
