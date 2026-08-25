import React, { useState, useMemo } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table/legacy';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';

/**
 * Unified enterprise-grade DataTable powered by TanStack Table
 *
 * @param {Object} props
 * @param {Array} props.columns - TanStack column definitions
 * @param {Array} props.data - Array of table data
 * @param {boolean} [props.isLoading=false] - Show skeleton loading state
 * @param {number} [props.loadingRowCount=5] - Number of skeleton rows to render
 * @param {boolean} [props.enablePagination=true] - Enable pagination
 * @param {number} [props.pageSize=10] - Initial page size
 * @param {Array<number>} [props.pageSizeOptions=[10, 20, 30, 50, 100]] - Page size options
 * @param {boolean} [props.enableSorting=true] - Enable column sorting
 * @param {Array} [props.initialSorting=[]] - Initial sorting state
 * @param {boolean} [props.enableFiltering=true] - Enable filtering
 * @param {boolean} [props.enableRowSelection=false] - Enable row selection checkboxes
 * @param {Function} [props.onRowSelectionChange] - Callback when row selection changes (selectedRows, tableInstance)
 * @param {boolean} [props.enableColumnPinning=false] - Enable sticky column pinning
 * @param {boolean} [props.enableExpanding=false] - Enable row expanding
 * @param {Function} [props.renderSubComponent] - Render function for expanded sub-row: ({ row }) => ReactNode
 * @param {boolean} [props.enableToolbar=true] - Show top search & export toolbar
 * @param {string} [props.searchPlaceholder='Search records...'] - Search input placeholder
 * @param {string} [props.searchKey] - Key to filter on (if not global filter)
 * @param {Array} [props.facetedFilters=[]] - Faceted filter configurations
 * @param {Array} [props.bulkActions=[]] - Bulk action button configs
 * @param {React.ReactNode} [props.customToolbarActions] - Custom action buttons in toolbar
 * @param {boolean} [props.enableExport=true] - Enable CSV/JSON export
 * @param {string} [props.exportFilename='table-records'] - Filename for export
 * @param {string} [props.emptyTitle='No records found'] - Empty state title
 * @param {string} [props.emptyDescription] - Empty state description
 * @param {React.ReactNode} [props.emptyAction] - Action button/link in empty state
 * @param {Function} [props.onRowClick] - Click handler for rows: (row, event) => void
 * @param {string} [props.className] - Container CSS classes
 * @param {string} [props.tableClassName] - Table element CSS classes
 * @param {'compact'|'normal'|'relaxed'} [props.initialDensity='normal'] - Initial row density
 *
 * Server-side / Controlled options:
 * @param {boolean} [props.manualPagination=false] - Server-side pagination
 * @param {number} [props.pageCount] - Total page count for server pagination
 * @param {number} [props.totalCount] - Total row count for server pagination
 * @param {Object} [props.paginationState] - Controlled pagination state { pageIndex, pageSize }
 * @param {Function} [props.onPaginationChange] - Controlled pagination change handler
 * @param {Array} [props.sortingState] - Controlled sorting state
 * @param {Function} [props.onSortingChange] - Controlled sorting change handler
 */
export function UnifiedDataTable({
  columns = [],
  data = [],
  isLoading = false,
  loadingRowCount = 5,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  enableSorting = true,
  initialSorting = [],
  enableFiltering = true,
  enableRowSelection = false,
  onRowSelectionChange,
  enableColumnPinning = false,
  enableExpanding = false,
  renderSubComponent,
  enableToolbar = true,
  searchPlaceholder = 'Search records...',
  searchKey,
  facetedFilters = [],
  bulkActions = [],
  customToolbarActions,
  enableExport = true,
  exportFilename = 'table-records',
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  onRowClick,
  className = '',
  tableClassName = '',
  initialDensity = 'normal',

  // Server-side / Controlled Props
  manualPagination = false,
  pageCount,
  totalCount,
  paginationState: controlledPagination,
  onPaginationChange: setControlledPagination,
  sortingState: controlledSorting,
  onSortingChange: setControlledSorting,
  ...restProps
}) {
  // Local states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState(initialSorting);
  const [density, setDensity] = useState(initialDensity);
  const [expanded, setExpanded] = useState({});
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const pagination = controlledPagination || internalPagination;
  const onPaginationChange = setControlledPagination || setInternalPagination;
  const currentSorting = controlledSorting || sorting;
  const onSortingChangeHandler = setControlledSorting || setSorting;

  // Enhance columns with selection & expander if requested
  const tableColumns = useMemo(() => {
    const cols = [];

    // Row expansion column
    if (enableExpanding && renderSubComponent) {
      cols.push({
        id: 'expander',
        header: () => null,
        size: 40,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          if (!row.getCanExpand()) return null;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-transform"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          );
        },
      });
    }

    // Row selection checkbox column
    if (enableRowSelection) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4 cursor-pointer align-middle"
            checked={table.getIsAllPageRowsSelected()}
            ref={(input) => {
              if (input) {
                input.indeterminate = table.getIsSomePageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4 cursor-pointer align-middle"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      });
    }

    return [...cols, ...columns];
  }, [columns, enableRowSelection, enableExpanding, renderSubComponent]);

  // Handle row selection change notifications
  const handleRowSelectionChange = (updater) => {
    const nextSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    setRowSelection(nextSelection);
    if (onRowSelectionChange) {
      const selectedIndices = Object.keys(nextSelection).filter((k) => nextSelection[k]);
      const selectedData = selectedIndices.map((idx) => data[idx]).filter(Boolean);
      onRowSelectionChange(selectedData, nextSelection);
    }
  };

  // TanStack table instance
  const table = useReactTable({
    data: data || [],
    columns: tableColumns,
    state: {
      sorting: currentSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
      expanded,
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: onSortingChangeHandler,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange,
    onExpandedChange: setExpanded,

    // Headless Models
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,

    // Server-side options
    manualPagination: manualPagination,
    pageCount: pageCount,

    // Custom row selection identity
    getRowId: (row, idx) => (row?.id || row?._id || row?.did || String(idx)),
  });

  // Cell padding based on density state
  const densityCellPadding = {
    compact: 'py-2 px-3 text-xs',
    normal: 'py-3 px-4 text-xs sm:text-sm',
    relaxed: 'py-4 px-5 text-sm',
  }[density] || 'py-3 px-4 text-xs sm:text-sm';

  const densityHeaderPadding = {
    compact: 'py-2 px-3 text-[11px]',
    normal: 'py-3 px-4 text-xs',
    relaxed: 'py-3.5 px-5 text-xs',
  }[density] || 'py-3 px-4 text-xs';

  return (
    <div className={cn('w-full space-y-3.5', className)}>
      {/* Top Toolbar */}
      {enableToolbar && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchKey={searchKey}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          facetedFilters={facetedFilters}
          enableExport={enableExport}
          exportFilename={exportFilename}
          enableDensity={true}
          density={density}
          setDensity={setDensity}
          bulkActions={bulkActions}
          customActions={customToolbarActions}
        />
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="relative w-full overflow-x-auto">
          <table className={cn('w-full text-left border-collapse caption-bottom', tableClassName)}>
            <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned();
                    const style = isPinned
                      ? {
                          left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                          right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                          position: 'sticky',
                          zIndex: 1,
                        }
                      : undefined;

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined, ...style }}
                        className={cn(
                          densityHeaderPadding,
                          'whitespace-nowrap align-middle font-semibold text-muted-foreground',
                          isPinned && 'bg-card shadow-xs'
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-border/60 text-foreground">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                  <tr key={`loading-${rIdx}`} className="animate-pulse">
                    {tableColumns.map((col, cIdx) => (
                      <td key={`loading-${rIdx}-${cIdx}`} className={densityCellPadding}>
                        <Skeleton className="h-4 w-full max-w-[140px] rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length > 0 ? (
                // Rendered Rows
                table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected();
                  const isExpanded = row.getIsExpanded();

                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        data-state={isSelected ? 'selected' : undefined}
                        onClick={(e) => {
                          if (onRowClick) {
                            onRowClick(row.original, e);
                          }
                        }}
                        className={cn(
                          'transition-colors hover:bg-muted/40',
                          isSelected && 'bg-primary/5 hover:bg-primary/10',
                          onRowClick && 'cursor-pointer'
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isPinned = cell.column.getIsPinned();
                          const style = isPinned
                            ? {
                                left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                                right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                                position: 'sticky',
                                zIndex: 1,
                              }
                            : undefined;

                          return (
                            <td
                              key={cell.id}
                              style={style}
                              className={cn(
                                densityCellPadding,
                                'align-middle whitespace-nowrap',
                                isPinned && 'bg-card shadow-xs'
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Expanded Sub-Component */}
                      {isExpanded && renderSubComponent && (
                        <tr className="bg-muted/20 border-b border-border/80">
                          <td colSpan={row.getVisibleCells().length} className="p-4">
                            {renderSubComponent({ row })}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                // Empty State
                <tr>
                  <td
                    colSpan={tableColumns.length || 1}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                      <div className="size-12 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center text-muted-foreground/60">
                        <Inbox className="size-6" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{emptyTitle}</span>
                      {emptyDescription && (
                        <p className="text-xs text-muted-foreground text-center">
                          {emptyDescription}
                        </p>
                      )}
                      {emptyAction && <div className="mt-2">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        {enablePagination && (
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            showSelectedCount={enableRowSelection}
            showQuickJump={true}
          />
        )}
      </div>
    </div>
  );
}

export default UnifiedDataTable;
