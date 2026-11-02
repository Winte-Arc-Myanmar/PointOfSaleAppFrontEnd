"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/presentation/components/data-table";
import { DatePicker } from "@/presentation/components/ui/date-picker";
import { Input } from "@/presentation/components/ui/input";
import { formatDate } from "@/presentation/components/detail";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useAllSalesOrderEdits } from "@/presentation/hooks/useSalesOrders";
import type { SalesOrderEditListItem } from "@/core/domain/entities/SalesOrderEdit";
import { toDateInputValue } from "@/features/reports/presentation/report-utils";
import { formatMoney } from "@/lib/money";
import {
  differenceTone,
  formatDifference,
  personName,
} from "./order-edit-format";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const historyHref = (row: SalesOrderEditListItem) =>
  `/sales-orders/${row.salesOrder.id}#edit-history`;

const startOfDay = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const endOfDay = (date: string) => new Date(`${date}T23:59:59.999`).toISOString();

/** Every manager-approved edit to a paid order, newest first. */
export function OrderEditList() {
  const router = useRouter();
  const today = toDateInputValue(new Date());
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toDateInputValue(date);
  });
  const [to, setTo] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { setPage } = pagination;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, setPage]);

  const changeRange = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    setPage(1);
  };

  const { data, isLoading, error, refetch } = useAllSalesOrderEdits({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dateFrom: from ? startOfDay(from) : undefined,
    dateTo: to ? endOfDay(to) : undefined,
  });

  const columns = useMemo<DataTableColumn<SalesOrderEditListItem>[]>(
    () => [
      {
        key: "createdAt",
        header: "Date",
        render: (row) => <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
      },
      {
        key: "orderNumber",
        header: "Order #",
        render: (row) => (
          <Link href={historyHref(row)} className="font-medium text-mint hover:underline">
            {row.salesOrder.orderNumber}
          </Link>
        ),
      },
      { key: "editedBy", header: "Edited by", render: (row) => personName(row.editedBy) },
      { key: "approvedBy", header: "Approved by", render: (row) => personName(row.approvedBy) },
      {
        key: "previousTotal",
        header: "Before",
        className: "text-right",
        render: (row) => formatMoney(row.previousTotal),
      },
      {
        key: "newTotal",
        header: "After",
        className: "text-right",
        render: (row) => formatMoney(row.newTotal),
      },
      {
        key: "difference",
        header: "Difference",
        className: "text-right",
        render: (row) => (
          <span className={`font-semibold ${differenceTone(row.previousTotal, row.newTotal)}`}>
            {formatDifference(row.previousTotal, row.newTotal)}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        render: (row) => (
          <span className="line-clamp-2 max-w-xs text-muted" title={row.reason}>
            {row.reason}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-label">Order edits</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <DatePicker
              aria-label="From"
              value={from}
              max={to}
              onChange={(value) => changeRange(value, to)}
              className="h-9"
            />
            <span className="text-muted">→</span>
            <DatePicker
              aria-label="To"
              value={to}
              min={from}
              onChange={(value) => changeRange(from, value)}
              className="h-9"
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search order #"
              aria-label="Search order number"
              className="h-9 w-48 pl-8"
            />
          </div>
        </div>
      </div>
      <DataTable<SalesOrderEditListItem>
        data={data?.items ?? []}
        columns={columns}
        onView={(row) => router.push(historyHref(row))}
        isLoading={isLoading}
        loadingText="Loading order edits..."
        emptyText="No orders were edited in these dates."
        error={
          error
            ? { message: "Failed to load order edits.", onRetry: () => refetch() }
            : undefined
        }
        pageSize={PAGE_SIZE}
        currentPage={pagination.page}
        totalPages={data?.totalPages ?? pagination.getTotalPages(data?.total)}
        totalItems={data?.total ?? 0}
        onPageChange={pagination.setPage}
      />
    </div>
  );
}
