import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Factory,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronRight,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Success
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Info className="w-3 h-3" /> Info
          </span>
        );
    }
  };

  const getModuleBadge = (moduleName) => {
    if (moduleName === 'Brick Factory') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
          <Factory className="w-3.5 h-3.5 text-amber-500" /> Brick Factory
        </span>
      );
    }
    if (moduleName === 'Manpower Agency') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20">
          <Users2 className="w-3.5 h-3.5 text-sky-500" /> Manpower Agency
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/20">
        <Shield className="w-3.5 h-3.5 text-purple-500" /> System Admin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Activity Log
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Real-Time System Audit Trail
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by user name, action, or log ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
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
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
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
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Log ID & Timestamp</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">User / Manager</th>
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">IP / Source</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No audit log records match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="font-bold text-slate-900 dark:text-white">{log.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</div>
                    </td>

                    <td className="py-3.5 px-4">{getModuleBadge(log.module)}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.user}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{log.userRole}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-900 dark:text-white">{log.action}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {log.details}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {log.ip}
                    </td>

                    <td className="py-3.5 px-4 text-center">{getStatusBadge(log.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveLogDetail(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
                  {activeLogDetail.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Audit Log Details
                </h3>
              </div>
              <button
                onClick={() => setActiveLogDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Timestamp</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeLogDetail.timestamp}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Module</span>
                  <div className="mt-0.5">{getModuleBadge(activeLogDetail.module)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">User / Actor</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeLogDetail.user} ({activeLogDetail.userRole})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <div className="mt-0.5">{getStatusBadge(activeLogDetail.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeLogDetail.action}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Detailed Payload / Description</span>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
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
