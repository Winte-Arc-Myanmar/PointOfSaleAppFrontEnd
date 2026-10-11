"use client";

import { useMemo, useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { allPages, ReportTable } from "@/features/reports/presentation/report-export";
import { useCardActivity } from "@/presentation/hooks/usePosReports";
import container from "@/core/infrastructure/di/container";
import type { ApiPosReportRepository } from "@/core/infrastructure/repositories/ApiPosReportRepository";
import type { CardActivityReport, CardEntry, CardEntryType } from "@/core/domain/entities/ShiftCardReport";
import { formatCount, formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

const PAGE_SIZE = 50;

export const CARD_ENTRY_LABEL: Record<CardEntryType, string> = {
  TOP_UP: "Top-up",
  PRELOAD_GRANT: "Preload",
  SPEND: "Spend",
  SPEND_REVERSAL: "Spend reversed",
  REFUND_OUT: "Refund",
  SETTLEMENT_COLLECTION: "Settlement",
  GRANT_FORFEIT: "Forfeit",
  ADJUSTMENT_CREDIT: "Adjustment (+)",
  ADJUSTMENT_DEBIT: "Adjustment (−)",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
const negate = (amount: string) => String(-Number(amount));
const card = (e: CardEntry) => e.cardUid ?? e.walletNumber;

const COMMON: ReportColumn<CardEntry>[] = [
  { key: "createdAt", header: "Time", value: (e) => when(e.createdAt) },
  { key: "type", header: "Type", value: (e) => CARD_ENTRY_LABEL[e.type] },
  { key: "card", header: "Card", value: card },
  { key: "guestName", header: "Guest", value: (e) => e.guestName },
  { key: "tier", header: "Tier", value: (e) => e.tier },
  { key: "locationName", header: "Outlet", value: (e) => e.locationName },
];

const USAGE_COLUMNS: ReportColumn<CardEntry>[] = [
  ...COMMON,
  { key: "orderNumber", header: "Bill", value: (e) => e.orderNumber },
  { key: "spent", header: "Spent", value: (e) => negate(e.amount), format: "money" },
  { key: "balanceAfter", header: "Balance after", value: (e) => e.balanceAfter, format: "money" },
  { key: "staffName", header: "Staff", value: (e) => e.staffName },
];

const MONEY_COLUMNS: ReportColumn<CardEntry>[] = [
  ...COMMON,
  { key: "amount", header: "In (+) / out (−)", value: (e) => e.amount, format: "money" },
  { key: "balanceAfter", header: "Balance after", value: (e) => e.balanceAfter, format: "money" },
  { key: "paymentMethod", header: "Paid by", value: (e) => e.paymentMethod },
  { key: "reference", header: "Reference", value: (e) => e.reference },
  { key: "staffName", header: "Staff", value: (e) => e.staffName },
  { key: "approverName", header: "Approved by", value: (e) => e.approverName },
  { key: "notes", header: "Notes", value: (e) => e.notes },
];

type TypeRow = CardActivityReport["totals"]["byType"][number];
type TierRow = CardActivityReport["byTier"][number];
type MethodRow = CardActivityReport["byPaymentMethod"][number];

const typeColumns = (usage: boolean): ReportColumn<TypeRow>[] => [
  { key: "type", header: "Type", value: (r) => CARD_ENTRY_LABEL[r.type] },
  { key: "count", header: "Entries", value: (r) => r.count },
  {
    key: "amount",
    header: usage ? "Spent" : "In (+) / out (−)",
    value: (r) => (usage ? negate(r.amount) : r.amount),
    format: "money",
  },
];

const tierColumns = (usage: boolean): ReportColumn<TierRow>[] => [
  { key: "tier", header: "Tier", value: (r) => r.tier },
  { key: "count", header: usage ? "Spends" : "Entries", value: (r) => r.count },
  {
    key: "amount",
    header: usage ? "Spent" : "Net change",
    value: (r) => (usage ? negate(r.amount) : r.amount),
    format: "money",
  },
];

const METHOD_COLUMNS: ReportColumn<MethodRow>[] = [
  { key: "name", header: "Payment method", value: (r) => r.name },
  { key: "count", header: "Payments", value: (r) => r.count },
  { key: "topUps", header: "Top-ups", value: (r) => r.topUps, format: "money" },
  { key: "refunds", header: "Refunds", value: (r) => r.refunds, format: "money" },
  { key: "settlements", header: "Settlements", value: (r) => r.settlements, format: "money" },
  { key: "net", header: "Net", value: (r) => r.net, format: "money" },
];

const sumOf = (data: CardActivityReport, types: CardEntryType[]) =>
  data.totals.byType.filter((r) => types.includes(r.type)).reduce((sum, r) => sum + Number(r.amount), 0);

export function CardActivityPanel({ range, kind }: { range: DashboardRange; kind: "USAGE" | "MONEY" }) {
  const usage = kind === "USAGE";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const filterKey = `${range.from}|${range.to}|${range.locationId}|${kind}|${search}`;
  const [pageKey, setPageKey] = useState(filterKey);
  const currentPage = pageKey === filterKey ? page : 1;

  const params = { ...range, kind, page: currentPage, limit: PAGE_SIZE, search: search.trim() || undefined };
  const query = useCardActivity(params);
  const data = query.data;
  const entryColumns = useMemo(() => tableColumns(usage ? USAGE_COLUMNS : MONEY_COLUMNS), [usage]);
  const byTypeColumns = useMemo(() => tableColumns(typeColumns(usage)), [usage]);
  const byTierColumns = useMemo(() => tableColumns(tierColumns(usage)), [usage]);
  const methodColumns = useMemo(() => tableColumns(METHOD_COLUMNS), []);

  const loadAll = () =>
    allPages(async (p) => {
      const repository = container.resolve<ApiPosReportRepository>("posReportRepository");
      const result = await repository.cardActivity({ ...params, page: p, limit: 500 });
      return { rows: withRowIds(result.entries, (e) => e.entryId), totalPages: result.meta.totalPages };
    });

  return (
    <ReportPanel
      title={usage ? "Card usage" : "Card top-ups & refunds"}
      description={
        usage
          ? "Every guest-card spend in the range, newest first, with the bill it paid. Reversals come from voided or refunded bills."
          : "Every top-up, preload, refund, settlement, forfeit and adjustment on guest cards in the range, newest first. Top-ups are deposits, not sales."
      }
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usage ? (
              <>
                <SummaryCard label="Spends" value={formatCount(data.totals.byType.find((r) => r.type === "SPEND")?.count ?? 0)} />
                <SummaryCard label="Spent" value={formatMoney(-sumOf(data, ["SPEND"]))} />
                <SummaryCard label="Reversed" value={formatMoney(sumOf(data, ["SPEND_REVERSAL"]))} />
                <SummaryCard label="Net spent" value={formatMoney(-Number(data.totals.netChange))} />
              </>
            ) : (
              <>
                <SummaryCard label="Top-ups" value={formatMoney(sumOf(data, ["TOP_UP"]))} />
                <SummaryCard label="Preloads" value={formatMoney(sumOf(data, ["PRELOAD_GRANT"]))} />
                <SummaryCard label="Refunds" value={formatMoney(-sumOf(data, ["REFUND_OUT"]))} />
                <SummaryCard label="Settlements" value={formatMoney(sumOf(data, ["SETTLEMENT_COLLECTION"]))} />
              </>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="By type">
              <ReportTable
                data={withRowIds(data.totals.byType, (r) => r.type)}
                columns={byTypeColumns}
                emptyText="Nothing in this range."
              />
            </Subsection>
            <Subsection title="By tier">
              <ReportTable
                data={withRowIds(data.byTier, (r) => r.tier)}
                columns={byTierColumns}
                emptyText="Nothing in this range."
              />
            </Subsection>
          </div>
          {usage ? null : (
            <Subsection title="By payment method">
              <ReportTable
                data={withRowIds(data.byPaymentMethod, (r) => r.name)}
                columns={methodColumns}
                emptyText="No card money taken or paid out in this range."
              />
            </Subsection>
          )}
          <Subsection title={usage ? "Spends" : "Entries"}>
            <div className="mb-3">
              <Input
                className="max-w-xs"
                value={search}
                placeholder="Card, wallet number, guest or phone"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageKey("");
                }}
              />
            </div>
            <ReportTable
              data={withRowIds(data.entries, (e) => e.entryId)}
              loadAll={loadAll}
              columns={entryColumns}
              emptyText="Nothing in this range."
              currentPage={data.meta.page || currentPage}
              totalPages={data.meta.totalPages}
              totalItems={data.meta.total}
              pageSize={data.meta.limit || PAGE_SIZE}
              onPageChange={(next) => {
                setPage(next);
                setPageKey(filterKey);
              }}
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
