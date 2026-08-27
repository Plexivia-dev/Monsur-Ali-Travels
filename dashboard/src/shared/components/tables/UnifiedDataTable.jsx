import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * UnifiedDataTable - Standardized, accessible, and performant data table
 * supporting search, multi-column sorting, tab filters, pagination, and CSV export.
 */
export function UnifiedDataTable({
  columns = [],
  data = [],
  loading = false,
  totalItems = null,
  page = 1,
  limit = 25,
  onPageChange = null,
  onLimitChange = null,
  onSearch = null,
  searchPlaceholder = 'Search records...',
  filterTabs = [],
  activeTab = 'all',
  onTabChange = null,
  onRefresh = null,
  onExport = null,
  exportFileName = 'export.csv',
  title = '',
  subtitle = '',
  headerActions = null,
  emptyMessage = 'No records found matching criteria',
  className = '',
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Handle Local or Server-side Search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  // Local Sort Handler if server pagination is not used
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Data Locally when client-side
  const processedData = useMemo(() => {
    if (onPageChange && totalItems !== null) {
      // Server-side handled
      return data;
    }

    let filtered = [...data];

    // Search
    if (localSearch) {
      const q = localSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return filtered;
  }, [data, localSearch, sortColumn, sortDirection, onPageChange, totalItems]);

  // Client-side pagination if needed
  const displayData = useMemo(() => {
    if (onPageChange && totalItems !== null) {
      return processedData;
    }
    const start = (page - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, page, limit, onPageChange, totalItems]);

  const effectiveTotal = totalItems !== null ? totalItems : processedData.length;
  const totalPages = Math.ceil(effectiveTotal / limit) || 1;

  // Local Export to CSV if onExport not overridden
  const handleDefaultExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    if (!data || data.length === 0) return;

    const visibleCols = columns.filter((c) => c.accessorKey || c.id);
    const headers = visibleCols.map((c) => c.header || c.title || c.accessorKey);
    const rows = [headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',')];

    for (const row of processedData) {
      const rowValues = visibleCols.map((col) => {
        const key = col.accessorKey || col.id;
        const val = row[key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      });
      rows.push(rowValues.join(','));
    }

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-xs">
        <div>
          {title && <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 text-xs bg-muted/40 border-border focus:bg-background rounded-xl"
            />
          </div>

          {/* Refresh Action */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 px-3 rounded-xl cursor-pointer text-xs"
              title="Refresh Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {/* Export Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDefaultExport}
            className="h-9 px-3 rounded-xl cursor-pointer text-xs gap-1.5 font-semibold"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {headerActions}
        </div>
      </div>

      {/* Filter Tabs if provided */}
      {filterTabs.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                {columns.map((col, idx) => {
                  const isSortable = col.sortable !== false && col.accessorKey;
                  const isCurrentSort = sortColumn === col.accessorKey;

                  return (
                    <th
                      key={col.accessorKey || col.id || idx}
                      className={`px-4 py-3 select-none ${col.className || ''} ${
                        isSortable ? 'cursor-pointer hover:text-foreground' : ''
                      }`}
                      onClick={() => isSortable && handleSort(col.accessorKey)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header || col.title}</span>
                        {isSortable && (
                          <span className="text-muted-foreground/60">
                            {isCurrentSort ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skeleton-cell-${cIdx}`} className="px-4 py-3.5">
                        <div className="h-4 bg-muted/60 rounded-md w-full max-w-[85%]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground/40" />
                      <span className="text-xs font-semibold">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((row, rowIdx) => (
                  <tr
                    key={row._id || row.id || row.did || rowIdx}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {columns.map((col, colIdx) => {
                      const key = col.accessorKey || col.id;
                      const rawValue = key ? row[key] : undefined;

                      return (
                        <td
                          key={key || colIdx}
                          className={`px-4 py-3 text-foreground ${col.cellClassName || ''}`}
                        >
                          {col.cell ? col.cell({ row, value: rawValue }) : rawValue ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing {effectiveTotal > 0 ? (page - 1) * limit + 1 : 0} to{' '}
              {Math.min(page * limit, effectiveTotal)} of {effectiveTotal} records
            </span>

            {onLimitChange && (
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="ml-2 bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange && onPageChange(1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <span className="px-3 py-1 text-xs font-bold text-foreground bg-card border border-border rounded-lg">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange && onPageChange(totalPages)}
              className="h-8 w-8 rounded-lg cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedDataTable;
