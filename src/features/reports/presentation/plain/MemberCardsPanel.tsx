"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { DetailRows } from "@/presentation/components/detail";
import { useMemberCardsReport } from "@/presentation/hooks/useReports";
import { formatCount, formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import {
  getIssuedTierColumns,
  getNamedPaymentColumns,
  getSpendOutletColumns,
  getSpendTierColumns,
} from "./dashboard-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardRange } from "./types";

export function MemberCardsPanel({ range }: { range: DashboardRange }) {
  const query = useMemberCardsReport(range);
  const data = query.data;
  const tierColumns = useMemo(() => getIssuedTierColumns(), []);
  const paymentColumns = useMemo(() => getNamedPaymentColumns(), []);
  const outletColumns = useMemo(() => getSpendOutletColumns(), []);
  const spendTierColumns = useMemo(() => getSpendTierColumns(), []);

  return (
    <ReportPanel
      title="Guest cards"
      description="Cards issued and closed, money paid in and spent, refunds and forfeits in the range, and what is still owed to guests now. Top-ups are deposits, not sales."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Issued" value={formatCount(data.issued.count)} />
            <SummaryCard label="Linked to a customer" value={formatCount(data.issued.linkedToCustomer)} />
            <SummaryCard label="Closed" value={formatCount(data.closed.count)} />
            <SummaryCard label="Top-ups" value={formatMoney(data.topUps.amount)} />
          </div>
          <DetailRows
            rows={[
              { label: "Settled", value: formatCount(data.closed.settled) },
              { label: "Voided cards", value: formatCount(data.closed.voided) },
              { label: "Top-up count", value: formatCount(data.topUps.count) },
              { label: "Ledger net change", value: formatMoney(data.ledger.netChange) },
              { label: "Active cards now", value: formatCount(data.outstanding.activeCards) },
              { label: "Owed to guests", value: formatMoney(data.outstanding.owedToGuests) },
              { label: "Purchased balance", value: formatMoney(data.outstanding.purchased) },
              { label: "Granted balance", value: formatMoney(data.outstanding.granted) },
              { label: "Wallets in credit", value: formatCount(data.outstanding.walletsInCredit) },
              { label: "Wallets in debt", value: formatCount(data.outstanding.walletsInDebt) },
              { label: "Owed by guests", value: formatMoney(data.outstanding.owedByGuests) },
            ]}
          />
          <Subsection title="Ledger">
            <DetailRows
              rows={[
                {
                  label: "Top-ups",
                  value: `${formatCount(data.ledger.topUps.count)} · ${formatMoney(data.ledger.topUps.amount)}`,
                },
                {
                  label: "Preload granted",
                  value: `${formatCount(data.ledger.preloadGranted.count)} · ${formatMoney(data.ledger.preloadGranted.amount)}`,
                },
                {
                  label: "Spend",
                  value: `${formatCount(data.ledger.spend.count)} · ${formatMoney(data.ledger.spend.amount)} · ${formatCount(data.ledger.spend.reversals ?? 0)} reversals`,
                },
                {
                  label: "Refunds",
                  value: `${formatCount(data.ledger.refunds.count)} · ${formatMoney(data.ledger.refunds.amount)}`,
                },
                {
                  label: "Settlements collected",
                  value: `${formatCount(data.ledger.settlementsCollected.count)} · ${formatMoney(data.ledger.settlementsCollected.amount)}`,
                },
                {
                  label: "Forfeited",
                  value: `${formatCount(data.ledger.forfeited.count)} · ${formatMoney(data.ledger.forfeited.amount)}`,
                },
                {
                  label: "Adjustments credit",
                  value: `${formatCount(data.ledger.adjustmentsCredit.count)} · ${formatMoney(data.ledger.adjustmentsCredit.amount)}`,
                },
                {
                  label: "Adjustments debit",
                  value: `${formatCount(data.ledger.adjustmentsDebit.count)} · ${formatMoney(data.ledger.adjustmentsDebit.amount)}`,
                },
              ]}
            />
          </Subsection>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="Issued by tier">
              <DataTable
                data={withRowIds(data.issued.byTier, (row, index) => `${row.tier}-${index}`)}
                columns={tierColumns}
                emptyText="No cards issued in this range."
              />
            </Subsection>
            <Subsection title="Spend by tier">
              <DataTable
                data={withRowIds(data.spendByTier, (row, index) => `${row.tier}-${index}`)}
                columns={spendTierColumns}
                emptyText="No card spend in this range."
              />
            </Subsection>
          </div>
          <Subsection title="Top-ups by payment method">
            <DataTable
              data={withRowIds(
                data.topUps.byPaymentMethod,
                (row, index) => row.paymentMethodId || `topup-${index}`,
              )}
              columns={paymentColumns}
              emptyText="No top-ups in this range."
            />
          </Subsection>
          <Subsection title="Spend by outlet">
            <DataTable
              data={withRowIds(data.spendByOutlet, (row, index) => row.locationId || `spend-${index}`)}
              columns={outletColumns}
              emptyText="No outlet spend in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
