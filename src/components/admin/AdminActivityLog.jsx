import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Shield,
  Factory,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronRight,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export const AdminActivityLog = ({ adminData, addToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeLogDetail, setActiveLogDetail] = useState(null);

  const logs = adminData?.auditLogs || [];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule =
      selectedModule === 'All' || log.module === selectedModule;

    const matchesStatus =
      selectedStatus === 'All' || log.status === selectedStatus;

    return matchesSearch && matchesModule && matchesStatus;
  });

  const handleExportLogs = () => {
    addToast?.('Exporting system activity logs (CSV/PDF)...', 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Success
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-550 border border-blue-500/20">
            <Info className="w-3 h-3" /> Info
          </span>
        );
    }
  };

  const getModuleBadge = (moduleName) => {
    if (moduleName === 'Brick Factory') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Factory className="w-3.5 h-3.5 text-amber-500" /> Brick Factory
        </span>
      );
    }
    if (moduleName === 'Manpower Agency') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Users2 className="w-3.5 h-3.5 text-sky-500" /> Manpower Agency
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
        <Shield className="w-3.5 h-3.5 text-purple-500" /> System Admin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Activity Log
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
              Real-Time System Audit Trail
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete audit trail recording manager actions, financial authorizations, and system operations across both businesses
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportLogs}
          className="flex items-center gap-2 text-xs shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Audit CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by user name, action, or log ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="bg-background border border-border text-foreground text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="All">All Modules</option>
                <option value="Brick Factory">Brick Factory</option>
                <option value="Manpower Agency">Manpower Agency</option>
                <option value="System Admin">System Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-border text-foreground text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Log ID & Timestamp</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">User / Manager</th>
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">IP / Source</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No audit log records match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      <div className="font-bold text-foreground">{log.id}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{log.timestamp}</div>
                    </td>

                    <td className="py-3.5 px-4">{getModuleBadge(log.module)}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">{log.user}</div>
                      <div className="text-[10px] text-muted-foreground">{log.userRole}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-foreground">{log.action}</div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {log.details}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {log.ip}
                    </td>

                    <td className="py-3.5 px-4 text-center">{getStatusBadge(log.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveLogDetail(log)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Drawer for Log Detail */}
      {activeLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-xs text-primary font-bold">
                  {activeLogDetail.id}
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Audit Log Details
                </h3>
              </div>
              <button
                onClick={() => setActiveLogDetail(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Timestamp</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {activeLogDetail.timestamp}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Module</span>
                  <div className="mt-0.5">{getModuleBadge(activeLogDetail.module)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">User / Actor</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {activeLogDetail.user} ({activeLogDetail.userRole})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                  <div className="mt-0.5">{getStatusBadge(activeLogDetail.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Action</span>
                <p className="font-bold text-foreground mt-0.5">
                  {activeLogDetail.action}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Detailed Payload / Description</span>
                <div className="p-3 rounded-xl bg-muted font-mono text-[11px] text-foreground mt-1 leading-relaxed">
                  {activeLogDetail.details}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setActiveLogDetail(null)}>
                  Close Audit View
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
