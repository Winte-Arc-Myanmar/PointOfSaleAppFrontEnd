"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChefHat,
  Clock3,
  Search,
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
import type {
  SalesOrder,
  SalesOrderStatus,
} from "@/core/domain/entities/SalesOrder";
import { cn } from "@/lib/utils";

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

function formatMoney(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

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

function getShortOrderId(orderNumber: string): string {
  const digits = orderNumber.replace(/\D/g, "");
  if (!digits) return `#${orderNumber.slice(-3).toUpperCase()}`;
  return `#${digits.slice(-3).padStart(3, "0")}`;
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,247,0.96))] p-5 shadow-[var(--shadow-panel)] dark:bg-[linear-gradient(180deg,rgba(37,35,36,0.98),rgba(31,29,30,0.96))]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "border-green-200 bg-green-50 text-green-800 shadow-sm dark:border-mint/20 dark:bg-mint/10 dark:text-mint"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-border dark:bg-background dark:text-muted dark:hover:text-foreground",
                  )}
                >
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold",
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

          <div className="flex items-center gap-2 self-start xl:self-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl border-slate-200 bg-white dark:border-border dark:bg-background"
              onClick={() => setSearchVisible((current) => !current)}
              aria-label="Toggle order search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Select
              value={datePreset}
              onValueChange={(value: DatePreset) => setDatePreset(value)}
            >
              <SelectTrigger className="h-11 min-w-[132px] rounded-2xl border-slate-200 bg-white shadow-sm dark:border-border dark:bg-background">
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
          <div className="mt-4">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order number or customer..."
              className="h-12 rounded-2xl border-slate-200 bg-white pl-4 shadow-sm dark:border-border dark:bg-background"
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
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => (
            <OrderTrackingCard
              key={String(order.id)}
              order={order}
              onOpen={() => router.push(`/sales-orders/${order.id}`)}
            />
          ))}
        </div>
      )}

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
}: {
  order: SalesOrder;
  onOpen: () => void;
}) {
  const { data: receipt } = useReceipt(String(order.id));
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
      className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfdfb)] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.4)] dark:border-border dark:bg-[linear-gradient(180deg,rgba(37,35,36,0.98),rgba(30,28,29,0.96))]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
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
          {getShortOrderId(order.orderNumber)}
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
          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:bg-white/5 dark:text-muted">
            Receipt items are still syncing for this order.
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
      label: "New Order",
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
        "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold",
        config.className,
      )}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

