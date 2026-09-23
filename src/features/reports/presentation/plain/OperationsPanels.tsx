"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { DetailRows } from "@/presentation/components/detail";
import {
  useDailySales,
  useSalesByCategory,
  useSalesByHour,
  useSalesByItem,
  useServerPerformance,
  useZReport,
} from "@/presentation/hooks/useReports";
import { formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import {
  getPaymentBreakdownColumns,
  getSalesByCategoryColumns,
  getSalesByHourColumns,
  getSalesByItemColumns,
  getServerPerformanceColumns,
  getZReportPaymentColumns,
} from "@/features/reports/presentation/report-table-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardDay, DashboardRange } from "./types";

const TOP_LIMIT = 10;

export function DailySalesPanel({ day }: { day: DashboardDay }) {
  const query = useDailySales(day);
  const columns = useMemo(() => getPaymentBreakdownColumns(), []);
  const data = query.data;

  return (
    <ReportPanel
      title="Daily sales"
      description="Orders, revenue, tax, tips, and payment breakdown for one business date."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Orders" value={String(data.orderCount)} />
            <SummaryCard label="Grand total" value={formatMoney(data.grandTotal)} />
            <SummaryCard label="Average ticket" value={formatMoney(data.averageTicket)} />
            <SummaryCard label="Tips" value={formatMoney(data.tipAmount)} />
          </div>
          <DetailRows
            rows={[
              { label: "Subtotal", value: formatMoney(data.subtotal) },
              { label: "Tax", value: formatMoney(data.totalTax) },
              { label: "Discount", value: formatMoney(data.totalDiscount) },
              { label: "Service charge", value: formatMoney(data.serviceCharge) },
            ]}
          />
          <DataTable
            data={withRowIds(data.paymentBreakdown, (row, index) => row.paymentMethodId || `pay-${index}`)}
            columns={columns}
            emptyText="No payment breakdown for this day."
          />
        </>
      ) : null}
    </ReportPanel>
  );
}

export function SalesByCategoryPanel({ range }: { range: DashboardRange }) {
  const query = useSalesByCategory({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const columns = useMemo(() => getSalesByCategoryColumns(), []);

  return (
    <ReportPanel
      title="Sales by category"
      description="Category revenue for the business-date range."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      <DataTable
        data={withRowIds(query.data ?? [], (row, index) => row.categoryId || `cat-${index}`)}
        columns={columns}
        emptyText="No category sales in this range."
      />
    </ReportPanel>
  );
}

export function SalesByItemPanel({ range }: { range: DashboardRange }) {
  const query = useSalesByItem({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const columns = useMemo(() => getSalesByItemColumns(), []);

  return (
    <ReportPanel
      title="Top items"
      description="Highest-revenue items in the business-date range."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      <DataTable
        data={withRowIds(query.data ?? [], (row, index) => row.variantId || `item-${index}`)}
        columns={columns}
        emptyText="No item sales in this range."
      />
    </ReportPanel>
  );
}

export function SalesByHourPanel({ day }: { day: DashboardDay }) {
  const query = useSalesByHour(day);
  const columns = useMemo(() => getSalesByHourColumns(), []);

  return (
    <ReportPanel
      title="Sales by hour"
      description="Sales distribution by hour for the selected business date."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      <DataTable
        data={withRowIds(query.data ?? [], (row) => `hour-${row.hour}`)}
        columns={columns}
        emptyText="No hourly sales for this day."
      />
    </ReportPanel>
  );
}

export function ServerPerformancePanel({ range }: { range: DashboardRange }) {
  const query = useServerPerformance({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const columns = useMemo(() => getServerPerformanceColumns(), []);

  return (
    <ReportPanel
      title="Server performance"
      description="Orders, revenue, and tips by server for the business-date range."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      <DataTable
        data={withRowIds(query.data ?? [], (row, index) => row.waiterId || `server-${index}`)}
        columns={columns}
        emptyText="No server performance data in this range."
      />
    </ReportPanel>
  );
}

export function ZReportPanel({ day }: { day: DashboardDay }) {
  const query = useZReport(day);
  const paymentColumns = useMemo(() => getZReportPaymentColumns(), []);
  const itemColumns = useMemo(() => getSalesByItemColumns(), []);
  const categoryColumns = useMemo(() => getSalesByCategoryColumns(), []);
  const data = query.data;

  return (
    <ReportPanel
      title="Z-report"
      description="Consolidated end-of-day rollup for the selected business date."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <DetailRows
            rows={[
              { label: "Date", value: data.date },
              { label: "Completed orders", value: String(data.orders.completed) },
              { label: "Voided orders", value: String(data.orders.voided) },
              { label: "Refunded orders", value: String(data.orders.refunded) },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard label="Grand total" value={formatMoney(data.totals.grandTotal)} />
            <SummaryCard label="Subtotal" value={formatMoney(data.totals.subtotal)} />
            <SummaryCard label="Tax" value={formatMoney(data.totals.totalTax)} />
            <SummaryCard label="Discount" value={formatMoney(data.totals.totalDiscount)} />
            <SummaryCard label="Tips" value={formatMoney(data.totals.tipAmount)} />
            <SummaryCard label="Service charge" value={formatMoney(data.totals.serviceCharge)} />
          </div>
          <Subsection title="Payments">
            <DataTable
              data={withRowIds(data.payments, (row, index) => row.paymentMethodId || `zpay-${index}`)}
              columns={paymentColumns}
              emptyText="No payments recorded."
            />
          </Subsection>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="Top items">
              <DataTable
                data={withRowIds(data.topItems, (row, index) => row.variantId || `ztop-${index}`)}
                columns={itemColumns}
                emptyText="No top items."
              />
            </Subsection>
            <Subsection title="By category">
              <DataTable
                data={withRowIds(data.byCategory, (row, index) => row.categoryId || `zcat-${index}`)}
                columns={categoryColumns}
                emptyText="No category breakdown."
              />
            </Subsection>
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
