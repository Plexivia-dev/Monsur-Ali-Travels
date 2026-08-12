import React, { useState } from 'react';
import { useFactoryData } from '../../api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart3, Download, PieChart } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { ExportModal } from '../common/ExportModal';

export const FactoryReports = () => {
  const { data: factoryData, isLoading } = useFactoryData();
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (isLoading || !factoryData) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Factory Intelligence Reports...</div>;
  }

  const { reports, metrics } = factoryData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 border border-border rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Brick Factory Operational Reports & KPIs
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Production output analysis, coal efficiency ratios, and material cost breakdown.
          </p>
        </div>
        <Button variant="primary" icon={Download} onClick={() => setIsExportOpen(true)}>
          Export Production Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Year Production</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {(metrics.monthlyProductionTotal / 1000000).toFixed(2)}M Units
          </h3>
          <p className="text-xs text-emerald-500 font-medium mt-1">102% of Annual Target</p>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Avg Defective Rate</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{metrics.defectiveRate}</h3>
          <p className="text-xs text-emerald-500 font-medium mt-1">Industry standard benchmark &lt; 2.5%</p>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Coal Consumption Ratio</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">32.8 Kg / 1,000 Bricks</h3>
          <p className="text-xs text-primary font-medium mt-1">Optimal Kiln Efficiency</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Production vs Target & Wages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle icon={BarChart3}>Monthly Production Output vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports.monthlyProduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                  />
                  <Legend />
                  <Bar dataKey="produced" name="Molded Bricks Produced" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Capacity" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle icon={PieChart}>Factory Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={reports.costDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {reports.costDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} formatter={(val) => [`${val}%`, 'Expense Share']} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {reports.costDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Modal Trigger */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Brick Factory Audit Report"
        dataName="Brick Production & Kiln Audit Logs"
      />
    </div>
  );
};
