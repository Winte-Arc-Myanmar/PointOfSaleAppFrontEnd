"use client";

import { useOtherIncomeExpenses } from "@/presentation/hooks/useReports";
import { formatMoney } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, chartAmount } from "./charts";
import type { DashboardRange } from "./types";

export function OtherIncomeChart({ range }: { range: DashboardRange }) {
  const query = useOtherIncomeExpenses(range);
  const data = query.data;
  const byDay = (data?.byDay ?? []).map((row) => ({
    name: row.businessDate.slice(5) || row.businessDate,
    income: chartAmount(row.income),
    expense: chartAmount(row.expense),
  }));
  const byOutlet = (data?.byOutlet ?? []).map((row) => ({
    name: row.locationName || "Outlet",
    net: chartAmount(row.net),
  }));
  const byMethod = (data?.byPaymentMethod ?? []).map((row) => ({
    name: row.name || row.kind,
    income: chartAmount(row.income),
    expense: chartAmount(row.expense),
  }));

  return (
    <ReportPanel
      title="Other income and expenses"
      description="Paid-ins and paid-outs. Line-by-line entries are on Reports."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Income" value={formatMoney(data.totals.income)} />
            <SummaryCard label="Expense" value={formatMoney(data.totals.expense)} />
            <SummaryCard label="Net" value={formatMoney(data.totals.net)} />
          </div>
          {byDay.length ? (
            <ChartCard title="Income and expense by day">
              <MoneyBarChart
                data={byDay}
                bars={[
                  { key: "income", name: "Income", color: "#16a34a" },
                  { key: "expense", name: "Expense", color: "#dc2626" },
                ]}
              />
            </ChartCard>
          ) : (
            <EmptyChart label="No till movements in this range." />
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {byOutlet.length ? (
              <ChartCard title="Net by outlet">
                <MoneyBarChart
                  data={byOutlet}
                  layout="vertical"
                  bars={[{ key: "net", name: "Net", color: "#0f766e" }]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No outlet breakdown." />
            )}
            {byMethod.length ? (
              <ChartCard title="By payment method">
                <MoneyBarChart
                  data={byMethod}
                  bars={[
                    { key: "income", name: "Income", color: "#16a34a" },
                    { key: "expense", name: "Expense", color: "#ea580c" },
                  ]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No payment-method breakdown." />
            )}
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
