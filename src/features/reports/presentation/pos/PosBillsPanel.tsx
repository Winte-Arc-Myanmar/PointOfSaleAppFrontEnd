"use client";

import { useMemo, useState } from "react";
import { allPages, ReportTable } from "@/features/reports/presentation/report-export";
import { Input } from "@/presentation/components/ui/input";
import { usePosBills } from "@/presentation/hooks/usePosReports";
import container from "@/core/infrastructure/di/container";
import type { ApiPosReportRepository } from "@/core/infrastructure/repositories/ApiPosReportRepository";
import type { PosBill, PosType } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

const PAGE_SIZE = 50;
const POS_NAME: Record<PosType, string> = { SPA: "SPA", KTV: "VIP Lounge", BAR: "Bar" };

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const COLUMNS: ReportColumn<PosBill>[] = [
  { key: "businessDate", header: "Date", value: (b) => b.businessDate },
  { key: "soldAt", header: "Time", value: (b) => time(b.soldAt) },
  { key: "orderNumber", header: "Bill", value: (b) => b.orderNumber },
  { key: "place", header: "Room / table", value: (b) => b.place },
  { key: "guestName", header: "Guest", value: (b) => b.guestName },
  {
    key: "items",
    header: "Items",
    value: (b) =>
      [
        ...b.items.map((i) => `${Number(i.quantity)} × ${i.name}`),
        ...b.compedItems.map((i) => `${Number(i.quantity)} × ${i.name} (free)`),
      ].join(", "),
  },
  { key: "discounts", header: "Discounts", value: (b) => b.discounts, format: "money" },
  { key: "netSales", header: "Net sales", value: (b) => b.netSales, format: "money" },
  { key: "tax", header: "Tax", value: (b) => b.tax, format: "money" },
  { key: "grandTotal", header: "Total", value: (b) => b.grandTotal, format: "money" },
  {
    key: "payments",
    header: "Paid by",
    value: (b) => b.payments.map((p) => `${p.name} ${formatMoney(p.amount)}`).join(", "),
  },
];

export function PosBillsPanel({ range, posType }: { range: DashboardRange; posType: PosType }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const filterKey = `${range.from}|${range.to}|${range.locationId}|${posType}|${search}`;
  const [pageKey, setPageKey] = useState(filterKey);
  const currentPage = pageKey === filterKey ? page : 1;

  const query = usePosBills({
    ...range,
    posType,
    page: currentPage,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
  });
  const data = query.data;
  const columns = useMemo(() => tableColumns(COLUMNS), []);

  const loadAll = () =>
    allPages(async (p) => {
      const repository = container.resolve<ApiPosReportRepository>("posReportRepository");
      const result = await repository.bills({ ...range, posType, page: p, limit: 500, search: search.trim() || undefined });
      return { rows: withRowIds(result.bills, (b) => b.orderId), totalPages: result.meta.totalPages };
    });

  return (
    <ReportPanel
      title={`${POS_NAME[posType]} bills`}
      description="Every bill closed in the range, newest first: where, who, what was on it, what was given free and how it was paid."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Bills" value={formatCount(data.totals.billCount)} />
            <SummaryCard label="Discounts" value={formatMoney(data.totals.discounts)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Total" value={formatMoney(data.totals.grandTotal)} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              className="max-w-xs"
              value={search}
              placeholder="Bill number, room, table or guest"
              onChange={(event) => {
                setSearch(event.target.value);
                setPageKey("");
              }}
            />
          </div>
          <ReportTable
            data={withRowIds(data.bills, (b) => b.orderId)}
            loadAll={loadAll}
            title="Bills"
            columns={columns}
            emptyText="No bills in this range."
            currentPage={data.meta.page || currentPage}
            totalPages={data.meta.totalPages}
            totalItems={data.meta.total}
            pageSize={data.meta.limit || PAGE_SIZE}
            onPageChange={(next) => {
              setPage(next);
              setPageKey(filterKey);
            }}
          />
        </>
      ) : null}
    </ReportPanel>
  );
}
