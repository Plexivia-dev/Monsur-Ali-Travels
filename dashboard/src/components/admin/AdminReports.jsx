import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export const AdminReports = ({ adminData, addToast }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [previewReport, setPreviewReport] = useState(null);

  const reports = adminData?.reportsList || [];

  const categories = [
    'All',
    'Financial Reconciliation',
    'Factory Operations',
    'Agency Operations',
    'Tax & Legal',
    'HR & Payroll'
  ];

  const filteredReports = reports.filter((rep) => {
    return selectedCategory === 'All' || rep.category === selectedCategory;
  });

  const handleDownload = (reportTitle) => {
    addToast?.(`Downloading ${reportTitle}...`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Reports
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              Central Owner Financial & Operations
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Downloadable executive reports, tax filings, and operational audits for business owner review
          </p>
        </div>

        {/* Date Range & Period Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border text-xs">
            {['This Month', 'Last Quarter', 'Year to Date'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
            Net Business Income ({selectedPeriod})
          </span>
          <div className="text-2xl font-black tracking-tight text-emerald-400">
            ৳44,30,000
          </div>
          <p className="text-[11px] text-purple-200/80 pt-1 border-t border-white/10">
            45.0% Combined Operating Margin
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Gross Factory Revenue
          </span>
          <div className="text-2xl font-black text-amber-500">
            ৳61,00,000
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
            1,250,000 Molded Bricks Sold
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Gross Agency Revenue
          </span>
          <div className="text-2xl font-black text-sky-500">
            ৳37,50,000
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
            184 Placed Worker Contracts
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Total Combined Expenses
          </span>
          <div className="text-2xl font-black text-rose-500">
            ৳54,20,000
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
            Fuel, Payroll & Vendor Disbursements
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-muted-foreground shrink-0">Filter Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card border border-border text-foreground hover:border-muted-foreground/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports Table Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle icon={FileText}>Executive Reports Catalog</CardTitle>
            <span className="text-xs text-muted-foreground font-medium">
              Showing {filteredReports.length} Reports
            </span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Report Title & Summary</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Format & Size</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-xs">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="py-4 px-4 max-w-md">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      {report.format === 'PDF' ? (
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span>{report.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {report.summary}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground whitespace-nowrap">
                      {report.category}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-semibold text-foreground">
                    {report.period}
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{report.format}</span> ({report.fileSize})
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewReport(report)}
                      className="cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(report.title)}
                      className="cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Interactive Preview Drawer / Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {previewReport.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Period: {previewReport.period} • Category: {previewReport.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-3 gap-3">
              {previewReport.highlights?.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{h.label}</span>
                  <p className="text-base font-black text-foreground mt-0.5">{h.value}</p>
                </div>
              ))}
            </div>

            {/* Report Executive Summary */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1.5">
              <h4 className="font-bold text-primary">Executive Summary</h4>
              <p className="text-foreground leading-relaxed">
                {previewReport.summary}
              </p>
            </div>

            {/* Mock Preview Document Canvas */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs font-mono text-muted-foreground space-y-2">
              <div className="flex items-center justify-between font-bold border-b border-border pb-2 text-foreground">
                <span>[OFFICIAL REPORT PREVIEW - SMART ERP HOLDINGS]</span>
                <span>STATUS: VERIFIED AUDIT</span>
              </div>
              <p>• Data Source: Brick Factory Telemetry & Agency Billing Ledger</p>
              <p>• Generated On: {previewReport.date} by System Super Admin</p>
              <p>• Hash Signature: SHA256-88a91c0e391bd7721</p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setPreviewReport(null)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDownload(previewReport.title);
                  setPreviewReport(null);
                }}
              >
                <Download className="w-4 h-4 mr-1.5" /> Download Full Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
