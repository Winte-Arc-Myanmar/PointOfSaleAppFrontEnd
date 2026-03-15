"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { Button } from "@/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  accessorKey?: keyof T | string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  variant?: "default" | "destructive" | "secondary";
}

export interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  /** Optional CTA for empty state (e.g. "Add Product" button) */
  emptyAction?: { label: string; onClick: () => void };
  /** When set, table shows column headers and this error state in the body (e.g. fetch failed) */
  error?: { message: string; onRetry?: () => void };
  /** Client-side pagination (uses table state) */
  pageSize?: number;
  /** Server-side pagination */
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  /** Server-side sort */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  isLoading = false,
  loadingText = "Loading...",
  emptyText = "No data found",
  emptyAction,
  error,
  pageSize = 10,
  currentPage,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  sortBy,
  sortOrder = "asc",
  onSort,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const hasServerPagination = typeof currentPage === "number" && onPageChange;
  const hasServerSort = typeof sortBy === "string" && onSort;

  const columnDefs = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = columns.map((col) => ({
      id: col.key,
      accessorKey: (col.accessorKey as keyof T) ?? col.key,
      header: col.header,
      enableSorting: col.sortable ?? false,
      cell: ({ row }) => {
        if (col.render) return col.render(row.original);
        const value = (row.original as Record<string, unknown>)[col.key];
        return (value as React.ReactNode) ?? "-";
      },
      meta: { className: col.className },
    }));
    return cols;
  }, [columns]);

  // TanStack Table returns non-memoizable refs; React Compiler skips this by design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      sorting: hasServerSort ? undefined : sorting,
      pagination: hasServerPagination ? undefined : { pageIndex: 0, pageSize },
    },
    onSortingChange: hasServerSort ? undefined : setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: hasServerSort ? undefined : getSortedRowModel(),
    getPaginationRowModel: hasServerPagination
      ? undefined
      : getPaginationRowModel(),
    manualPagination: !!hasServerPagination,
    manualSorting: !!hasServerSort,
    pageCount: hasServerPagination ? totalPages : undefined,
  });

  const handleSort = (field: string) => {
    if (hasServerSort && onSort) onSort(field);
    else {
      setSorting((prev) => {
        const next = prev.find((s) => s.id === field);
        return [
          {
            id: field,
            desc: next ? !next.desc : false,
          },
        ];
      });
    }
  };

  const pageIndex = hasServerPagination
    ? (currentPage ?? 1) - 1
    : table.getState().pagination.pageIndex;
  const pageCount = hasServerPagination ? totalPages : table.getPageCount();
  const total = hasServerPagination ? totalItems : data.length;
  const start = hasServerPagination
    ? pageIndex * (table.getState().pagination?.pageSize ?? pageSize) + 1
    : pageIndex * pageSize + 1;
  const end = Math.min(
    start + (table.getState().pagination?.pageSize ?? pageSize) - 1,
    total
  );

  const hasActions = actions.length > 0 || onView || onEdit || onDelete;
  const showLoading = isLoading && data.length === 0 && !error;

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {showLoading ? (
        <div className="panel flex items-center justify-center h-64 rounded-xl bg-background/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-mint/30 border-t-mint mx-auto mb-4" />
            <p className="page-description">{loadingText}</p>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as { className?: string })
                        ?.className
                    }
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 hover:text-mint transition-colors"
                        onClick={() => handleSort(header.column.id)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {sortBy === header.column.id ||
                        sorting[0]?.id === header.column.id
                          ? sortOrder === "desc" || sorting[0]?.desc
                            ? " ↓"
                            : " ↑"
                          : null}
                      </button>
                    ) : header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
                {hasActions && (
                  <TableHead className="w-[100px] section-label">Actions</TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length + (hasActions ? 1 : 0)}
                  className="h-40 py-10 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-red-400">{error.message}</p>
                    {error.onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={error.onRetry}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length + (hasActions ? 1 : 0)}
                  className="h-40 py-10 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-muted">{emptyText}</p>
                    {emptyAction && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={emptyAction.onClick}
                      >
                        {emptyAction.label}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        (cell.column.columnDef.meta as { className?: string })
                          ?.className
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(row.original)}
                            >
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(row.original)}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(row.original)}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                          {actions.map((action, idx) => {
                            const disabled = action.disabled?.(row.original);
                            return (
                              <DropdownMenuItem
                                key={idx}
                                disabled={disabled}
                                variant={
                                  action.variant === "destructive"
                                    ? "destructive"
                                    : "default"
                                }
                                onClick={() =>
                                  !disabled && action.onClick(row.original)
                                }
                              >
                                {action.icon && (
                                  <action.icon className="mr-2 h-4 w-4" />
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {!error &&
        pageCount > 1 &&
        (hasServerPagination ? onPageChange : true) && (
          <div className="flex items-center justify-between px-2 py-4">
            <p className="page-description text-sm">
              Showing {total === 0 ? 0 : start} to {end} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex <= 0}
                onClick={() =>
                  hasServerPagination
                    ? onPageChange?.(pageIndex)
                    : table.previousPage()
                }
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="page-description text-sm">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= pageCount - 1}
                onClick={() =>
                  hasServerPagination
                    ? onPageChange?.(pageIndex + 2)
                    : table.nextPage()
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
