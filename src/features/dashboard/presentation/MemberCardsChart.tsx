"use client";

import { useMemberCardsReport } from "@/presentation/hooks/useReports";
import { formatCount, formatMoney } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, chartAmount } from "./charts";
import type { DashboardRange } from "./types";

export function MemberCardsChart({ range }: { range: DashboardRange }) {
  const query = useMemberCardsReport(range);
  const data = query.data;
  const ledger = data
    ? [
        { name: "Top-ups", amount: chartAmount(data.ledger.topUps.amount) },
        { name: "Preload", amount: chartAmount(data.ledger.preloadGranted.amount) },
        { name: "Spend", amount: chartAmount(data.ledger.spend.amount) },
        { name: "Refunds", amount: chartAmount(data.ledger.refunds.amount) },
        { name: "Settled", amount: chartAmount(data.ledger.settlementsCollected.amount) },
        { name: "Forfeited", amount: chartAmount(data.ledger.forfeited.amount) },
      ].filter((row) => row.amount > 0)
    : [];
  const byOutlet = (data?.spendByOutlet ?? []).map((row) => ({
    name: row.locationName || "Outlet",
    amount: chartAmount(row.amount),
  }));
  const byTier = (data?.spendByTier ?? []).map((row) => ({
    name: row.tier || "Tier",
    amount: chartAmount(row.amount),
  }));

  return (
    <ReportPanel
      title="Guest cards"
      description="Card money in the range. Top-ups are deposits, not sales. The full ledger is on Reports."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Issued" value={formatCount(data.issued.count)} />
            <SummaryCard label="Closed" value={formatCount(data.closed.count)} />
            <SummaryCard label="Top-ups" value={formatMoney(data.topUps.amount)} />
            <SummaryCard label="Owed to guests" value={formatMoney(data.outstanding.owedToGuests)} />
          </div>
          {ledger.length ? (
            <ChartCard title="Card ledger">
              <MoneyBarChart data={ledger} bars={[{ key: "amount", name: "Amount", color: "#0f766e" }]} />
            </ChartCard>
          ) : (
            <EmptyChart label="No card ledger movement in this range." />
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {byOutlet.length ? (
              <ChartCard title="Spend by outlet">
                <MoneyBarChart
                  data={byOutlet}
                  layout="vertical"
                  bars={[{ key: "amount", name: "Spend", color: "#16a34a" }]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No card spend by outlet." />
            )}
            {byTier.length ? (
              <ChartCard title="Spend by tier">
                <MoneyBarChart data={byTier} bars={[{ key: "amount", name: "Spend", color: "#ca8a04" }]} />
              </ChartCard>
            ) : (
              <EmptyChart label="No card spend by tier." />
            )}
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
