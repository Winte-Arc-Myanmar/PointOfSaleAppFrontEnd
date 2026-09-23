"use client";

import { useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useLoyaltyPointsReport } from "@/presentation/hooks/useReports";
import { formatCount } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart } from "./charts";
import type { DashboardRange } from "./types";

export function LoyaltyChart({ range }: { range: DashboardRange }) {
  const [top, setTop] = useState(10);
  const query = useLoyaltyPointsReport({ ...range, top });
  const data = query.data;
  const byType = (data?.period.byTransactionType ?? []).map((row) => ({
    name: row.transactionType.replaceAll("_", " "),
    points: row.points,
  }));
  const byTier = (data?.byLoyaltyTier ?? []).map((row) => ({
    name: row.loyaltyTier.replaceAll("_", " "),
    members: row.members,
  }));
  const members = (data?.topMembers ?? []).map((row) => ({
    name: row.name || "Member",
    points: row.pointsEarned,
  }));

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <Label htmlFor="chart-loyalty-top">Top members</Label>
        <Input
          id="chart-loyalty-top"
          type="number"
          min={1}
          max={100}
          value={top}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next > 0) setTop(Math.min(100, Math.floor(next)));
          }}
        />
      </div>
      <ReportPanel
        title="Loyalty points"
        description="Points earned in the range. Member balances are listed on Reports."
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
      >
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Points earned" value={formatCount(data.period.pointsEarned)} />
              <SummaryCard label="Reversed" value={formatCount(data.period.pointsReversed)} />
              <SummaryCard label="Net points" value={formatCount(data.period.netPoints)} />
              <SummaryCard label="Outstanding" value={formatCount(data.outstanding.points)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {byType.length ? (
                <ChartCard title="Points by transaction type">
                  <MoneyBarChart
                    data={byType}
                    valueFormat="count"
                    bars={[{ key: "points", name: "Points", color: "#16a34a" }]}
                  />
                </ChartCard>
              ) : (
                <EmptyChart label="No point movements in this range." />
              )}
              {byTier.length ? (
                <ChartCard title="Members by tier">
                  <MoneyBarChart
                    data={byTier}
                    valueFormat="count"
                    bars={[{ key: "members", name: "Members", color: "#2563eb" }]}
                  />
                </ChartCard>
              ) : (
                <EmptyChart label="No loyalty tiers." />
              )}
            </div>
            {members.length ? (
              <ChartCard title="Top members by points earned" height={360}>
                <MoneyBarChart
                  data={members}
                  layout="vertical"
                  valueFormat="count"
                  bars={[{ key: "points", name: "Points earned", color: "#0f766e" }]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No members earned points in this range." />
            )}
          </>
        ) : null}
      </ReportPanel>
    </div>
  );
}
