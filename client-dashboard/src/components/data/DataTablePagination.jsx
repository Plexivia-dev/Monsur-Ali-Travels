import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTablePagination({
  pagination = {},
  onPageChange,
  onLimitChange,
  isLoading = false,
}) {
  const { skip = 0, limit = 10, totalCount = 0, page = 1, totalPages = 1 } = pagination;

  const start = totalCount === 0 ? 0 : skip + 1;
  const end = Math.min(skip + limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-card border-t border-border text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="text-foreground font-mono">{start}</strong> to{' '}
          <strong className="text-foreground font-mono">{end}</strong> of{' '}
          <strong className="text-foreground font-mono">{totalCount}</strong> records
        </span>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            className="bg-background border border-border rounded px-2 py-1 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="p-1.5 rounded border border-border bg-muted/40 hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 font-mono font-bold text-foreground text-xs">
            {page} / {totalPages || 1}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="p-1.5 rounded border border-border bg-muted/40 hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
