import React from 'react';
import { useAgencyData } from '../../api/hooks';
import { StatCard } from '../ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users2, Building2, Clock, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePortalStore } from '../../store/usePortalStore';

export const AgencyDashboard = () => {
  const { data: agencyData, isLoading } = useAgencyData();
  const switchPortal = usePortalStore((state) => state.switchPortal);

  if (isLoading || !agencyData) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading Manpower Agency Placements & Client Contracts...
      </div>
    );
  }

  const { metrics, clientContracts, employees, bills, reports } = agencyData;

  return (
    <div className="space-y-6">

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
              <p className="text-xs text-muted-foreground mt-0.5">Active Workforce vs Agency Net Margin (Year 2026)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => switchPortal('agency', 'reports')} className="cursor-pointer">
              Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.placementTrends}>
                  <defs>
                    <linearGradient id="colorAgency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                    formatter={(val, name) => [name === 'workers' ? `${val} Placed Workers` : `$${val.toLocaleString()}`, name === 'workers' ? 'Workers' : 'Net Margin']}
                  />
                  <Area type="monotone" dataKey="workers" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAgency)" />
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
            <div className="divide-y divide-border">
              {clientContracts.map((contract) => (
                <div key={contract.id} className="p-3.5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{contract.clientName}</h4>
                    <Badge variant={contract.status === 'Active' ? 'success' : 'warning'}>
                      {contract.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{contract.industry} • {contract.workersDeployed} Workers</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Rate: ${contract.hourlyRate}/hr</span>
                    <span className="font-semibold text-emerald-500">Margin: {contract.margin}</span>
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
            <Button variant="ghost" size="sm" onClick={() => switchPortal('agency', 'employees')} className="cursor-pointer">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{emp.role} @ {emp.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">${emp.hourlyPay}/hr pay</p>
                    <p className="text-[11px] text-emerald-500 font-medium">Billed: ${emp.billRate}/hr</p>
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
            <Button variant="ghost" size="sm" onClick={() => switchPortal('agency', 'bills')} className="cursor-pointer">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {bills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{bill.client}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bill.hoursBilled} hrs • Period: {bill.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">${bill.amount.toLocaleString()}</p>
                    <Badge variant={bill.status === 'Paid' ? 'success' : bill.status === 'Pending' ? 'warning' : 'destructive'}>
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

export default AgencyDashboard;
