"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChefHat,
  Clock3,
  LayoutGrid,
  List,
  ListChecks,
  Search,
  Trash2,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { AppLoader } from "@/presentation/components/loader";
import { useSalesOrders } from "@/presentation/hooks/useSalesOrders";
import { useReceipt } from "@/presentation/hooks/useReceipts";
import { usePagination } from "@/presentation/hooks/usePagination";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { BulkDeleteDialog } from "./BulkDeleteDialog";
import { SalesOrderListTable } from "./SalesOrderListTable";
import type {
  SalesOrder,
  SalesOrderStatus,
} from "@/core/domain/entities/SalesOrder";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 24;

type BoardStatus =
  | "all"
  | "new"
  | "cooking"
  | "ready"
  | "completed"
  | "cancelled";

type OrderBoardStatus = Exclude<BoardStatus, "all">;

type DatePreset = "today" | "yesterday" | "this-week";

type ViewMode = "grid" | "list";

const VIEW_STORAGE_KEY = "sales-orders:view";

const viewListeners = new Set<() => void>();

function readView(): ViewMode {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "list"
      ? "list"
      : "grid";
  } catch {
    return "grid";
  }
}

function subscribeView(listener: () => void) {
  viewListeners.add(listener);
  return () => {
    viewListeners.delete(listener);
  };
}

function saveView(view: ViewMode) {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // The choice just isn't remembered.
  }
  viewListeners.forEach((listener) => listener());
}

const STATUS_FILTERS: Array<{
  key: BoardStatus;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "cooking", label: "Cooking" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatOrderDate(value?: string | null): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeBoardStatus(status: SalesOrderStatus): OrderBoardStatus {
  const normalized = String(status).trim().toUpperCase();
  if (
    [
      "DRAFT",
      "NEW",
      "PENDING",
      "PLACED",
      "OPEN",
    ].includes(normalized)
  ) {
    return "new";
  }
  if (
    ["CONFIRMED", "COOKING", "IN_PROGRESS", "PREPARING"].includes(normalized)
  ) {
    return "cooking";
  }
  if (["READY", "READY_TO_SERVE", "SERVED"].includes(normalized)) {
    return "ready";
  }
  if (["COMPLETED", "CLOSED", "DELIVERED"].includes(normalized)) {
    return "completed";
  }
  if (["CANCELLED", "VOIDED", "REJECTED"].includes(normalized)) {
    return "cancelled";
  }
  return "new";
}

function getDateRangeForPreset(preset: DatePreset): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }

  if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }

  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
}

export function SalesOrderList() {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BoardStatus>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const view = useSyncExternalStore(subscribeView, readView, () => "grid");
  const [selectMode, setSelectMode] = useState(false);
  const selectionScope = `${search}|${datePreset}|${statusFilter}|${pagination.page}`;
  const [selection, setSelection] = useState<{
    scope: string;
    ids: Set<string>;
  }>(() => ({ scope: "", ids: new Set() }));
  const selected = useMemo(
    () =>
      selection.scope === selectionScope ? selection.ids : new Set<string>(),
    [selection, selectionScope],
  );
  const setSelected = useCallback(
    (update: Set<string> | ((current: Set<string>) => Set<string>)) =>
      setSelection((current) => {
        const ids =
          current.scope === selectionScope ? current.ids : new Set<string>();
        return {
          scope: selectionScope,
          ids: typeof update === "function" ? update(ids) : update,
        };
      }),
    [selectionScope],
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { can } = usePermissions();
  const canDelete = can("sales:sales-order:delete");
  const selectable = canDelete && (view === "list" || selectMode);

  const changeView = (next: ViewMode) => {
    saveView(next);
    setSelectMode(false);
    setSelected(new Set());
  };

  const clearSelection = useCallback(
    () => setSelected(new Set()),
    [setSelected],
  );
  const toggleOne = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    const id = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, datePreset, pagination.reset]);

  const dateRange = useMemo(
    () => getDateRangeForPreset(datePreset),
    [datePreset],
  );

  const { data: ordersResult, isLoading, error, refetch } = useSalesOrders({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  const orders = ordersResult?.items ?? [];
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(
      (order) => normalizeBoardStatus(order.status) === statusFilter,
    );
  }, [orders, statusFilter]);

  const counts = useMemo(() => {
    const base = {
      all: orders.length,
      new: 0,
      cooking: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    } satisfies Record<BoardStatus, number>;

    for (const order of orders) {
      base[normalizeBoardStatus(order.status)] += 1;
    }
    return base;
  }, [orders]);

  const totalPages =
    ordersResult?.totalPages ?? pagination.getTotalPages(ordersResult?.total);

  const toggleAll = (checked: boolean) =>
    setSelected(
      checked ? new Set(filteredOrders.map((o) => String(o.id))) : new Set(),
    );
  const selectedIds = useMemo(() => [...selected], [selected]);
  const selectedTotal = filteredOrders
    .filter((o) => selected.has(String(o.id)))
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,247,0.96))] px-3 py-2.5 shadow-[var(--shadow-panel)] dark:bg-[linear-gradient(180deg,rgba(37,35,36,0.98),rgba(31,29,30,0.96))]">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-all",
                    isActive
                      ? "border-green-200 bg-green-50 text-green-800 shadow-sm dark:border-mint/20 dark:bg-mint/10 dark:text-mint"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-border dark:bg-background dark:text-muted dark:hover:text-foreground",
                  )}
                >
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                      isActive
                        ? "bg-green-600 text-white dark:bg-mint dark:text-gloss-black"
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-foreground",
                    )}
                  >
                    {counts[filter.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 border-l border-border pl-2">
            <div
              role="group"
              aria-label="View"
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-border dark:bg-background"
            >
              {(
                [
                  ["grid", LayoutGrid, "Grid"],
                  ["list", List, "List"],
                ] as const
              ).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={view === mode}
                  aria-label={`${label} view`}
                  title={`${label} view`}
                  onClick={() => changeView(mode)}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    view === mode
                      ? "bg-green-50 text-green-800 dark:bg-mint/10 dark:text-mint"
                      : "text-slate-500 hover:text-slate-900 dark:text-muted dark:hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            {canDelete && view === "grid" ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl border-slate-200 bg-white px-2.5 dark:border-border dark:bg-background sm:px-3"
                aria-label={selectMode ? "Cancel selecting" : "Select orders"}
                title={selectMode ? "Cancel selecting" : "Select orders"}
                onClick={() => {
                  setSelectMode((current) => !current);
                  clearSelection();
                }}
              >
                {selectMode ? (
                  <XCircle className="h-4 w-4 sm:hidden" />
                ) : (
                  <ListChecks className="h-4 w-4 sm:hidden" />
                )}
                <span className="hidden sm:inline">
                  {selectMode ? "Cancel" : "Select"}
                </span>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 bg-white dark:border-border dark:bg-background"
              onClick={() => setSearchVisible((current) => !current)}
              aria-label="Toggle order search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Select
              value={datePreset}
              onValueChange={(value: DatePreset) => setDatePreset(value)}
            >
              <SelectTrigger className="h-9 w-auto min-w-[96px] rounded-xl sm:min-w-[112px] border-slate-200 bg-white shadow-sm dark:border-border dark:bg-background">
                <SelectValue placeholder="Today" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {searchVisible ? (
          <div className="mt-2.5">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order number or customer..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-4 shadow-sm dark:border-border dark:bg-background"
            />
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <AppLoader fullScreen={false} size="md" message="Loading order board..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-center justify-between gap-3">
            <span>Failed to load sales orders.</span>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-background/70 px-6 py-14 text-center shadow-[var(--shadow-panel)]">
          <ChefHat className="mx-auto h-10 w-10 text-mint" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            No orders in this lane
          </p>
          <p className="mt-2 text-sm text-muted">
            {search
              ? "Try a different search term or status filter."
              : "New orders will appear here as they come in."}
          </p>
        </div>
      ) : view === "list" ? (
        <SalesOrderListTable
          orders={filteredOrders}
          selectable={selectable}
          selected={selected}
          onToggle={toggleOne}
          onToggleAll={toggleAll}
          onOpen={(order) => router.push(`/sales-orders/${order.id}`)}
        />
      ) : (
        <div className="space-y-3">
          {selectable ? (
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-500"
                checked={
                  filteredOrders.length > 0 &&
                  filteredOrders.every((o) => selected.has(String(o.id)))
                }
                onChange={(e) => toggleAll(e.target.checked)}
              />
              Select all on this page
            </label>
          ) : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.map((order) => (
              <OrderTrackingCard
                key={String(order.id)}
                order={order}
                selectable={selectable}
                selected={selected.has(String(order.id))}
                onOpen={() =>
                  selectable
                    ? toggleOne(String(order.id))
                    : router.push(`/sales-orders/${order.id}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {selectable && selected.size > 0 ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-foreground">
            {selected.size} selected · {formatMoney(selectedTotal)}
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={clearSelection}>
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete {selected.size}
            </Button>
          </div>
        </div>
      ) : null}

      <BulkDeleteDialog
        ids={selectedIds}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          clearSelection();
          setSelectMode(false);
        }}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-[var(--shadow-panel)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          Showing page {pagination.page} of {totalPages} • {ordersResult?.total ?? 0}{" "}
          total orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => pagination.setPage(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page >= totalPages}
            onClick={() => pagination.setPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderTrackingCard({
  order,
  onOpen,
  selectable = false,
  selected = false,
}: {
  order: SalesOrder;
  onOpen: () => void;
  selectable?: boolean;
  selected?: boolean;
}) {
  const {
    data: receipt,
    isLoading: itemsLoading,
    isError: itemsFailed,
    refetch: retryItems,
  } = useReceipt(String(order.id));
  const boardStatus = normalizeBoardStatus(order.status);
  const lineItems = receipt?.lineItems ?? [];
  const previewItems = lineItems.slice(0, 2);
  const hiddenItemsCount = Math.max(0, lineItems.length - previewItems.length);
  const customerName =
    receipt?.customer?.name?.trim() ||
    (order.customerId?.trim() ? `Customer ${order.customerId.slice(0, 8)}` : "Walk-in Guest");
  const serviceLabel =
    receipt?.orderInfo.locationName?.trim() ||
    (order.salesChannel === "POS"
      ? "Table service"
      : order.salesChannel === "ONLINE"
        ? "Delivery"
        : order.salesChannel === "PHONE"
          ? "Takeaway"
          : "Takeaway");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-pressed={selectable ? selected : undefined}
      className={cn(
        "rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfdfb)] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.4)] dark:border-border dark:bg-[linear-gradient(180deg,rgba(37,35,36,0.98),rgba(30,28,29,0.96))]",
        selected && "border-emerald-400 ring-2 ring-emerald-400/60 dark:border-mint dark:ring-mint/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {selectable ? (
            <input
              type="checkbox"
              tabIndex={-1}
              aria-label={`Select order ${order.orderNumber}`}
              className="h-4 w-4 shrink-0 accent-emerald-500"
              checked={selected}
              onChange={onOpen}
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="truncate text-left text-base font-bold tracking-tight text-slate-900 transition-colors hover:text-mint dark:text-foreground dark:hover:text-mint"
          >
            {customerName}
          </button>
        </div>
        <span className="shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {order.orderNumber ? `#${order.orderNumber}` : ""}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatOrderDate(receipt?.orderInfo.dateTime ?? order.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          {serviceLabel}
        </span>
      </div>

      <div className="my-4 border-t border-dashed border-slate-200 dark:border-border" />

      <div className="space-y-2.5">
        {previewItems.length > 0 ? (
          previewItems.map((item, index) => (
            <div
              key={`${item.productName}-${index}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <p className="min-w-0 flex-1 pr-2 leading-6 text-slate-700 dark:text-foreground">
                <span className="font-semibold text-slate-900 dark:text-foreground">
                  {item.quantity}x
                </span>{" "}
                <span className="line-clamp-1">{item.productName}</span>
              </p>
              <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-foreground">
                {formatMoney(item.lineTotal || item.unitPrice)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:bg-white/5 dark:text-muted">
            <span>
              {itemsLoading
                ? "Loading items..."
                : itemsFailed
                  ? "Couldn't load the items."
                  : "No items on this order."}
            </span>
            {itemsFailed ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void retryItems();
                }}
                className="shrink-0 font-semibold text-mint hover:text-mint-hover"
              >
                Retry
              </button>
            ) : null}
          </div>
        )}

        {hiddenItemsCount > 0 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="text-sm font-semibold text-mint transition-colors hover:text-mint-hover"
          >
            See more &gt;
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <StatusBadge status={boardStatus} />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-muted dark:hover:text-foreground"
        >
          Open order
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: OrderBoardStatus }) {
  const config = {
    new: {
      label: "New",
      className:
        "bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/20",
      icon: UtensilsCrossed,
    },
    cooking: {
      label: "Cooking",
      className:
        "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20",
      icon: ChefHat,
    },
    ready: {
      label: "Ready to Serve",
      className:
        "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/20",
      icon: Clock3,
    },
    completed: {
      label: "Completed",
      className:
        "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20",
      icon: CalendarDays,
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20",
      icon: XCircle,
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

