import React from 'react';
import { useAgencyData } from '../../api/hooks';
import { StatCard } from '../ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Users2, Building2, Clock, DollarSign, TrendingUp, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePortal } from '../../context/PortalContext';

export const AgencyDashboard = () => {
  const { data: agencyData, isLoading } = useAgencyData();
  const { switchPortal } = usePortal();

  if (isLoading || !agencyData) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading Manpower Agency Placements & Client Contracts...
      </div>
    );
  }

  const { metrics, clientContracts, employees, bills, reports } = agencyData;

  return (
    <div className="space-y-6">
      {/* Top Banner info */}
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-900 dark:text-sky-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Manpower Operations Summary</p>
            <p className="text-xs text-sky-700 dark:text-sky-300">
              {metrics.activePlacedWorkers} contractors currently deployed across {metrics.totalContracts} enterprise client contracts.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => switchPortal('agency', 'employees')}
        >
          View Contractor Roster
        </Button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Placed Workers"
          value={metrics.activePlacedWorkers.toString()}
          trend={metrics.placedWorkerGrowth}
          trendType="up"
          subtitle={`${metrics.fulfilledPositions} positions fulfilled`}
          icon={Users2}
          badgeColor="blue"
        />

        <StatCard
          title="Client Enterprise Contracts"
          value={metrics.totalContracts.toString()}
          trend={`${metrics.pendingRequisitions} open requisitions`}
          trendType="neutral"
          subtitle="Construction, Warehouse, Tech"
          icon={Building2}
          badgeColor="indigo"
        />

        <StatCard
          title="Unbilled Timesheet Hours"
          value={`${metrics.unbilledHours} hrs`}
          trend="Ready for Billing"
          trendType="up"
          subtitle="Weekly Client Invoicing"
          icon={Clock}
          badgeColor="amber"
        />

        <StatCard
          title="Agency Net Commission Margin"
          value={`${metrics.agencyMarginPercent}%`}
          trend="Avg $68.4k Weekly Revenue"
          trendType="up"
          subtitle="Spread: Bill Rate vs Worker Pay"
          icon={DollarSign}
          badgeColor="emerald"
        />
      </div>

      {/* Placement Trend Chart & Client Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle icon={TrendingUp}>Contractor Placement & Revenue Growth</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Active Workforce vs Agency Net Margin (Year 2026)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => switchPortal('agency', 'reports')}>
              Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.placementTrends}>
                  <defs>
                    <linearGradient id="colorAgency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(val, name) => [name === 'workers' ? `${val} Placed Workers` : `$${val.toLocaleString()}`, name === 'workers' ? 'Workers' : 'Net Margin']}
                  />
                  <Area type="monotone" dataKey="workers" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorAgency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Client Contracts Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle icon={Building2}>Key Client Contracts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {clientContracts.map((contract) => (
                <div key={contract.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{contract.clientName}</h4>
                    <Badge variant={contract.status === 'Active' ? 'success' : 'warning'}>
                      {contract.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{contract.industry} • {contract.workersDeployed} Workers</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Rate: ${contract.hourlyRate}/hr</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Margin: {contract.margin}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contractor Roster & Invoicing Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contractor Deployments Preview */}
        <Card>
          <CardHeader>
            <CardTitle icon={Users2}>Recent Contractor Deployments</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => switchPortal('agency', 'employees')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{emp.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{emp.role} @ {emp.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">${emp.hourlyPay}/hr pay</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Billed: ${emp.billRate}/hr</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Invoices Preview */}
        <Card>
          <CardHeader>
            <CardTitle icon={DollarSign}>Recent Client Invoices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => switchPortal('agency', 'bills')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{bill.client}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{bill.hoursBilled} hrs • Period: {bill.period}</p>
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
