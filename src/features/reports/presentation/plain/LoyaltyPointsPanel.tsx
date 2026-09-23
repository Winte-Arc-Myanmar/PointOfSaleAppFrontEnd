"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useLoyaltyPointsReport } from "@/presentation/hooks/useReports";
import { formatCount, withRowIds } from "@/features/reports/presentation/report-utils";
import {
  getLoyaltyTierColumns,
  getLoyaltyTypeColumns,
  getTopMemberColumns,
} from "./dashboard-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardRange } from "./types";

export function LoyaltyPointsPanel({ range }: { range: DashboardRange }) {
  const [top, setTop] = useState(10);
  const query = useLoyaltyPointsReport({ ...range, top });
  const data = query.data;
  const typeColumns = useMemo(() => getLoyaltyTypeColumns(), []);
  const tierColumns = useMemo(() => getLoyaltyTierColumns(), []);
  const memberColumns = useMemo(() => getTopMemberColumns(), []);

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <Label htmlFor="loyalty-top">Top members</Label>
        <Input
          id="loyalty-top"
          type="number"
          min={1}
          max={100}
          value={top}
          onChange={(event) => {
            const next = Number(event.target.value);
            setTop(Number.isFinite(next) && next > 0 ? Math.min(100, Math.floor(next)) : 10);
          }}
        />
      </div>
    <ReportPanel
      title="Loyalty points"
      description="Points earned and reversed in the range, and the balance members hold now. Points cannot yet be redeemed or expire, so those figures stay at zero."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Points earned" value={formatCount(data.period.pointsEarned)} />
            <SummaryCard label="Points reversed" value={formatCount(data.period.pointsReversed)} />
            <SummaryCard label="Net points" value={formatCount(data.period.netPoints)} />
            <SummaryCard label="Outstanding points" value={formatCount(data.outstanding.points)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Active members" value={formatCount(data.period.activeMembers)} />
            <SummaryCard label="New members" value={formatCount(data.period.newMembers)} />
            <SummaryCard label="Members with a balance" value={formatCount(data.outstanding.members)} />
            <SummaryCard
              label="Redeemed / expired"
              value={`${formatCount(data.outstanding.pointsRedeemed)} / ${formatCount(data.outstanding.pointsExpired)}`}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="By transaction type">
              <DataTable
                data={withRowIds(
                  data.period.byTransactionType,
                  (row, index) => `${row.transactionType}-${index}`,
                )}
                columns={typeColumns}
                emptyText="No point movements in this range."
              />
            </Subsection>
            <Subsection title="By loyalty tier">
              <DataTable
                data={withRowIds(data.byLoyaltyTier, (row) => row.loyaltyTier || "tier")}
                columns={tierColumns}
                emptyText="No loyalty tiers."
              />
            </Subsection>
          </div>
          <Subsection title="Top members">
            <DataTable
              data={withRowIds(data.topMembers, (row, index) => row.customerId || `member-${index}`)}
              columns={memberColumns}
              emptyText="No members earned points in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
    </div>
  );
}
