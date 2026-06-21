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
import {
  CheckSquare,
  LayoutGrid,
  List,
  MoreHorizontal,
  Square,
} from "lucide-react";
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
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { TablePagination } from "./TablePagination";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  accessorKey?: keyof T | string;
}

function resolveHeaderTranslationKey(header: string): string | null {
  const normalized = header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const map: Record<string, string> = {
    abbreviation: "abbreviation",
    accountname: "accountName",
    accounttype: "accountType",
    agent: "agent",
    barcode: "barcode",
    baseprice: "basePrice",
    basesku: "baseSku",
    cashier: "cashier",
    channel: "channel",
    classid: "classId",
    name: "name",
    code: "code",
    conversionrate: "conversionRate",
    createdat: "createdAt",
    credit: "credit",
    type: "type",
    default: "default",
    deletedat: "deletedAt",
    description: "description",
    domain: "domain",
    expectedclose: "expectedClose",
    expiry: "expiry",
    filename: "fileName",
    folder: "folder",
    fullname: "fullName",
    glaccountid: "glAccountId",
    grandtotal: "grandTotal",
    jobtitle: "jobTitle",
    legalname: "legalName",
    loyaltytier: "loyaltyTier",
    macaddress: "macAddress",
    openingfloat: "openingFloat",
    options: "options",
    order: "orderNumber",
    orderref: "orderRef",
    points: "points",
    pricemodifier: "priceModifier",
    priority: "priority",
    qty: "qty",
    reconcilable: "reconcilable",
    register: "register",
    reward: "reward",
    size: "size",
    stackable: "stackable",
    status: "status",
    summary: "summary",
    customer: "customer",
    product: "product",
    category: "category",
    branch: "branch",
    city: "city",
    country: "country",
    location: "location",
    tenant: "tenant",
    tenantid: "tenantId",
    role: "role",
    email: "email",
    phone: "phone",
    amount: "amount",
    total: "total",
    subtotal: "subtotal",
    tax: "tax",
    taxable: "taxable",
    quantity: "quantity",
    uom: "uom",
    unitcost: "unitCost",
    updatedat: "updatedAt",
    url: "url",
    username: "username",
    variant: "variant",
    variantsku: "variantSku",
    tracking: "tracking",
    price: "price",
    created: "created",
    updated: "updated",
    date: "date",
    id: "id",
  };
  return map[normalized] ?? null;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  variant?: "default" | "destructive" | "secondary";
}

export type DataTableViewMode = "table" | "grid";

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
  /** Enables table/grid toggle. Requires renderGridItem to render cards. */
  enableGridView?: boolean;
  defaultViewMode?: DataTableViewMode;
  renderGridItem?: (item: T) => React.ReactNode;
  gridClassName?: string;
  gridCardClassName?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  allSelected?: boolean;
  onToggleSelectAll?: () => void;
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
  enableGridView = false,
  defaultViewMode = "table",
  renderGridItem,
  gridClassName,
  gridCardClassName,
  selectable = false,
  selectedIds,
  onToggleSelect,
  allSelected = false,
  onToggleSelectAll,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [viewMode, setViewMode] =
    React.useState<DataTableViewMode>(defaultViewMode);
  const hasServerPagination = typeof currentPage === "number" && onPageChange;
  const hasServerSort = typeof sortBy === "string" && onSort;
  const canUseGrid = enableGridView && typeof renderGridItem === "function";

  const columnDefs = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = columns.map((col) => ({
      id: col.key,
      accessorKey: (col.accessorKey as keyof T) ?? col.key,
      header: (() => {
        const key = resolveHeaderTranslationKey(col.header);
        if (!key) return col.header;
        return t(`tableHeaders.${key}` as never, col.header);
      })(),
      enableSorting: col.sortable ?? false,
      cell: ({ row }) => {
        if (col.render) return col.render(row.original);
        const value = (row.original as Record<string, unknown>)[col.key];
        return (value as React.ReactNode) ?? "-";
      },
      meta: { className: col.className },
    }));
    return cols;
  }, [columns, t]);

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
  const pageCount = hasServerPagination
    ? Math.max(
        totalPages,
        data.length >= pageSize ? pageIndex + 2 : pageIndex + 1,
      )
    : Math.max(1, table.getPageCount());
  const total = hasServerPagination ? totalItems : data.length;
  const currentPageOneBased = pageIndex + 1;

  const canPreviousPage = hasServerPagination
    ? currentPageOneBased > 1
    : table.getCanPreviousPage();
  const canNextPage = hasServerPagination
    ? data.length >= pageSize
    : table.getCanNextPage();

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, nextPage);
    if (hasServerPagination) {
      onPageChange?.(safePage);
      return;
    }
    table.setPageIndex(safePage - 1);
  };

  const hasActions = actions.length > 0 || onView || onEdit || onDelete;
  const rows = table.getRowModel().rows;
  const showLoading = isLoading && data.length === 0 && !error;

  React.useEffect(() => {
    if (!canUseGrid && viewMode !== "table") setViewMode("table");
  }, [canUseGrid, viewMode]);

  const renderActionsMenu = (item: T) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(item)}>
            {t("common.view")}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            {t("common.edit")}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(item)}
          >
            {t("common.delete")}
          </DropdownMenuItem>
        )}
        {actions.map((action, idx) => {
          const disabled = action.disabled?.(item);
          return (
            <DropdownMenuItem
              key={idx}
              disabled={disabled}
              variant={action.variant === "destructive" ? "destructive" : "default"}
              onClick={() => !disabled && action.onClick(item)}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {canUseGrid && (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
            {t("common.table")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            {t("common.grid")}
          </Button>
        </div>
      )}
      {showLoading ? (
        <div className="panel flex items-center justify-center min-h-64 rounded-xl bg-background/80">
          <AppLoader fullScreen={false} showName={false} size="sm" message={loadingText} />
        </div>
      ) : canUseGrid && viewMode === "grid" ? (
        <div>
          {error ? (
            <div className="panel flex h-40 flex-col items-center justify-center gap-3 rounded-xl bg-background/80">
              <p className="text-red-400">{error.message}</p>
              {error.onRetry && (
                <Button variant="outline" size="sm" onClick={error.onRetry}>
                  {t("common.retry")}
                </Button>
              )}
            </div>
          ) : rows.length === 0 ? (
            <div className="panel flex h-40 flex-col items-center justify-center gap-3 rounded-xl bg-background/80">
              <p className="text-muted">{emptyText}</p>
              {emptyAction && (
                <Button variant="default" size="sm" onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                gridClassName
              )}
            >
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-border bg-background/80 p-3",
                    gridCardClassName
                  )}
                >
                  {hasActions && (
                    <div className="absolute right-2 top-2 z-10">
                      {renderActionsMenu(row.original)}
                    </div>
                  )}
                  <div className={hasActions ? "pr-8" : undefined}>
                    {renderGridItem?.(row.original)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {selectable && (
                  <TableHead className="w-12 text-xs font-bold">
                    <button
                      type="button"
                      onClick={onToggleSelectAll}
                      className="inline-flex items-center justify-center text-muted hover:text-foreground"
                      aria-label={t("common.selectAll")}
                    >
                      {allSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-xs font-bold",
                      (header.column.columnDef.meta as { className?: string })
                        ?.className
                    )}
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
                  <TableHead className="w-25 text-xs font-bold">{t("common.actions")}</TableHead>
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
                        {t("common.retry")}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
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
              rows.map((row) => (
                <TableRow key={row.id}>
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(String(row.original.id)) ?? false}
                        onChange={() => onToggleSelect?.(String(row.original.id))}
                        aria-label={`Select row ${row.original.id}`}
                        className="h-4 w-4 rounded border border-input align-middle"
                      />
                    </TableCell>
                  )}
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
                      {renderActionsMenu(row.original)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {!error && !showLoading && (
        <TablePagination
          page={currentPageOneBased}
          pageCount={pageCount}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          isLoading={isLoading}
          forceShow={!!hasServerPagination}
        />
      )}
    </div>
  );
}
