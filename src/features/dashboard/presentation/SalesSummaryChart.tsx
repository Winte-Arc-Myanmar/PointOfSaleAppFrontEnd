"use client";

import { useSalesSummary } from "@/presentation/hooks/useReports";
import { formatCount, formatMoney } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, SharePieChart, chartAmount } from "./charts";
import type { DashboardRange } from "./types";

export function SalesSummaryChart({ range }: { range: DashboardRange }) {
  const query = useSalesSummary(range);
  const data = query.data;
  const byDay = (data?.byDay ?? []).map((row) => ({
    name: row.businessDate.slice(5) || row.businessDate,
    netSales: chartAmount(row.netSales),
    grandTotal: chartAmount(row.grandTotal),
    refunds: chartAmount(row.refunds),
  }));
  const byHour = (data?.byHour ?? []).map((row) => ({
    name: `${row.hour}:00`,
    netSales: chartAmount(row.netSales),
  }));
  const byOutlet = (data?.byOutlet ?? []).map((row) => ({
    name: row.locationName || "Outlet",
    netSales: chartAmount(row.netSales),
  }));
  const byService = (data?.byServiceType ?? [])
    .map((row) => ({ name: row.serviceType.replaceAll("_", " "), value: chartAmount(row.netSales) }))
    .filter((row) => row.value > 0);
  const payments = (data?.payments.byMethod ?? []).map((row) => ({
    name: row.name || row.kind,
    amount: chartAmount(row.amount),
  }));

  return (
    <ReportPanel
      title="Sales summary"
      description="Charts for the business-date range. Full figures are on Reports."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Orders" value={formatCount(data.orders.count)} />
            <SummaryCard label="Net sales" value={formatMoney(data.sales.netSales)} />
            <SummaryCard label="Grand total" value={formatMoney(data.sales.grandTotal)} />
            <SummaryCard label="Net after refunds" value={formatMoney(data.netAfterRefunds)} />
          </div>
          {byDay.length ? (
            <ChartCard title="Sales by day">
              <MoneyBarChart
                data={byDay}
                bars={[
                  { key: "netSales", name: "Net sales", color: "#16a34a" },
                  { key: "grandTotal", name: "Grand total", color: "#0f766e" },
                  { key: "refunds", name: "Refunds", color: "#dc2626" },
                ]}
              />
            </ChartCard>
          ) : (
            <EmptyChart label="No daily sales in this range." />
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {byHour.length ? (
              <ChartCard title="Sales by hour">
                <MoneyBarChart data={byHour} bars={[{ key: "netSales", name: "Net sales", color: "#16a34a" }]} />
              </ChartCard>
            ) : (
              <EmptyChart label="No hourly sales in this range." />
            )}
            {byService.length ? (
              <ChartCard title="Net sales by service">
                <SharePieChart data={byService} />
              </ChartCard>
            ) : (
              <EmptyChart label="No service-type sales in this range." />
            )}
            {byOutlet.length ? (
              <ChartCard title="Net sales by outlet">
                <MoneyBarChart
                  data={byOutlet}
                  layout="vertical"
                  bars={[{ key: "netSales", name: "Net sales", color: "#0f766e" }]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No outlet breakdown." />
            )}
            {payments.length ? (
              <ChartCard title="Payments by method">
                <MoneyBarChart data={payments} bars={[{ key: "amount", name: "Amount", color: "#ca8a04" }]} />
              </ChartCard>
            ) : (
              <EmptyChart label="No payments in this range." />
            )}
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
