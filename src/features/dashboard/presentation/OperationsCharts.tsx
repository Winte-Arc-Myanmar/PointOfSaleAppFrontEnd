"use client";

import {
  useDailySales,
  useSalesByCategory,
  useSalesByHour,
  useSalesByItem,
  useServerPerformance,
  useZReport,
} from "@/presentation/hooks/useReports";
import { formatMoney } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, SharePieChart, chartAmount } from "./charts";
import type { DashboardDay, DashboardRange } from "./types";

const TOP_LIMIT = 10;

export function DailySalesChart({ day }: { day: DashboardDay }) {
  const query = useDailySales(day);
  const data = query.data;
  const payments = (data?.paymentBreakdown ?? [])
    .map((row) => ({ name: row.method || "Method", value: chartAmount(row.total) }))
    .filter((row) => row.value > 0);

  return (
    <ReportPanel
      title="Daily sales"
      description="Payment mix for one business date. The full breakdown is on Reports."
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
          {payments.length ? (
            <ChartCard title="Payments">
              <SharePieChart data={payments} />
            </ChartCard>
          ) : (
            <EmptyChart label="No payments for this day." />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}

export function SalesByCategoryChart({ range }: { range: DashboardRange }) {
  const query = useSalesByCategory({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const rows = (query.data ?? []).map((row) => ({
    name: row.categoryName || "Category",
    revenue: chartAmount(row.totalRevenue),
  }));

  return (
    <ReportPanel
      title="Sales by category"
      description="Category revenue for the range."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {rows.length ? (
        <ChartCard title="Revenue by category">
          <MoneyBarChart data={rows} bars={[{ key: "revenue", name: "Revenue", color: "#16a34a" }]} />
        </ChartCard>
      ) : (
        <EmptyChart label="No category sales in this range." />
      )}
    </ReportPanel>
  );
}

export function SalesByItemChart({ range }: { range: DashboardRange }) {
  const query = useSalesByItem({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const rows = (query.data ?? []).map((row) => ({
    name: row.productName || row.variantSku || "Item",
    revenue: chartAmount(row.totalRevenue),
  }));

  return (
    <ReportPanel
      title="Top items"
      description="Highest-revenue items in the range."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {rows.length ? (
        <ChartCard title="Revenue by item" height={360}>
          <MoneyBarChart
            data={rows}
            layout="vertical"
            bars={[{ key: "revenue", name: "Revenue", color: "#0f766e" }]}
          />
        </ChartCard>
      ) : (
        <EmptyChart label="No item sales in this range." />
      )}
    </ReportPanel>
  );
}

export function SalesByHourChart({ day }: { day: DashboardDay }) {
  const query = useSalesByHour(day);
  const rows = (query.data ?? []).map((row) => ({
    name: `${row.hour}:00`,
    revenue: chartAmount(row.totalRevenue),
    orders: row.orderCount,
  }));

  return (
    <ReportPanel
      title="Sales by hour"
      description="Hourly revenue for the selected business date."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {rows.length ? (
        <ChartCard title="Revenue by hour">
          <MoneyBarChart data={rows} bars={[{ key: "revenue", name: "Revenue", color: "#16a34a" }]} />
        </ChartCard>
      ) : (
        <EmptyChart label="No hourly sales for this day." />
      )}
    </ReportPanel>
  );
}

export function ServerPerformanceChart({ range }: { range: DashboardRange }) {
  const query = useServerPerformance({
    locationId: range.locationId,
    fromDate: range.from,
    toDate: range.to,
    limit: TOP_LIMIT,
  });
  const rows = (query.data ?? []).map((row) => ({
    name: row.waiterName || "Server",
    revenue: chartAmount(row.totalRevenue),
    tips: chartAmount(row.totalTips),
  }));

  return (
    <ReportPanel
      title="Server performance"
      description="Revenue and tips by server."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {rows.length ? (
        <ChartCard title="Servers" height={360}>
          <MoneyBarChart
            data={rows}
            layout="vertical"
            bars={[
              { key: "revenue", name: "Revenue", color: "#16a34a" },
              { key: "tips", name: "Tips", color: "#ca8a04" },
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyChart label="No server performance data in this range." />
      )}
    </ReportPanel>
  );
}

export function ZReportChart({ day }: { day: DashboardDay }) {
  const query = useZReport(day);
  const data = query.data;
  const payments = (data?.payments ?? []).map((row) => ({
    name: row.method || "Method",
    total: chartAmount(row.total),
  }));
  const categories = (data?.byCategory ?? []).map((row) => ({
    name: row.categoryName || "Category",
    revenue: chartAmount(row.totalRevenue),
  }));
  const items = (data?.topItems ?? []).map((row) => ({
    name: row.productName || "Item",
    revenue: chartAmount(row.totalRevenue),
  }));

  return (
    <ReportPanel
      title="Z-report"
      description="End-of-day picture. The full rollup is on Reports, where it can be printed."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard label="Grand total" value={formatMoney(data.totals.grandTotal)} />
            <SummaryCard label="Completed" value={String(data.orders.completed)} />
            <SummaryCard label="Voided" value={String(data.orders.voided)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {payments.length ? (
              <ChartCard title="Payments">
                <MoneyBarChart data={payments} bars={[{ key: "total", name: "Total", color: "#16a34a" }]} />
              </ChartCard>
            ) : (
              <EmptyChart label="No payments recorded." />
            )}
            {categories.length ? (
              <ChartCard title="By category">
                <MoneyBarChart data={categories} bars={[{ key: "revenue", name: "Revenue", color: "#0f766e" }]} />
              </ChartCard>
            ) : (
              <EmptyChart label="No category breakdown." />
            )}
          </div>
          {items.length ? (
            <ChartCard title="Top items" height={360}>
              <MoneyBarChart
                data={items}
                layout="vertical"
                bars={[{ key: "revenue", name: "Revenue", color: "#ca8a04" }]}
              />
            </ChartCard>
          ) : null}
        </>
      ) : null}
    </ReportPanel>
  );
}
