"use client";

import { useMemo } from "react";
import { ReportTable } from "@/features/reports/presentation/report-export";
import { useSalesGroups } from "@/presentation/hooks/usePosReports";
import type { SalesGroupsReport } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

type ItemRow = { name: string; quantity: string; amount: string };
type RoomRow = SalesGroupsReport["rooms"]["rows"][number];
type CreditRow = SalesGroupsReport["credit"]["rows"][number];

const ITEM_COLUMNS: ReportColumn<ItemRow>[] = [
  { key: "name", header: "Item", value: (r) => r.name },
  { key: "quantity", header: "Qty", value: (r) => r.quantity, format: "quantity" },
  { key: "amount", header: "Amount", value: (r) => r.amount, format: "money" },
];

const ROOM_COLUMNS: ReportColumn<RoomRow>[] = [
  { key: "room", header: "Room", value: (r) => r.room },
  { key: "hours", header: "Hours", value: (r) => r.hours, format: "quantity" },
  { key: "amount", header: "Amount", value: (r) => r.amount, format: "money" },
];

const CREDIT_COLUMNS: ReportColumn<CreditRow>[] = [
  { key: "account", header: "Account", value: (r) => r.account || "No account" },
  { key: "orderNumber", header: "Bill no", value: (r) => r.orderNumber },
  { key: "amount", header: "Amount", value: (r) => r.amount, format: "money" },
];

const sectionTitle = (section: SalesGroupsReport["sections"][number]) =>
  section.kind === "STAFF_MEAL" ? "Staff meal" : section.kind === "OTHER" ? "Other" : section.name || "Other";

export function SalesGroupsPanel({ range }: { range: DashboardRange }) {
  const query = useSalesGroups(range);
  const data = query.data;
  const itemColumns = useMemo(() => tableColumns(ITEM_COLUMNS), []);
  const roomColumns = useMemo(() => tableColumns(ROOM_COLUMNS), []);
  const creditColumns = useMemo(() => tableColumns(CREDIT_COLUMNS), []);
  const nothing =
    data &&
    !data.sections.length &&
    !data.rooms.rows.length &&
    !data.takeaway.orders &&
    !data.credit.rows.length;

  return (
    <ReportPanel
      title="Sales by group"
      description="What each KDS station sold (by the categories it takes), staff meals, anything no station takes, room time per room, take-away and credit bills. Net sales: after discounts, before tax and service charge. FOC counts in the quantity at 0; voids are left out. Mark staff-meal categories under Categories."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.sections.map((section) => (
              <SummaryCard key={section.key} label={sectionTitle(section)} value={formatMoney(section.amount)} />
            ))}
            {data.rooms.rows.length ? (
              <SummaryCard label={`Rooms · ${formatQuantity(data.rooms.hours)} h`} value={formatMoney(data.rooms.amount)} />
            ) : null}
            {data.takeaway.orders ? (
              <SummaryCard
                label={`Take away · ${formatCount(data.takeaway.orders)} orders`}
                value={formatMoney(data.takeaway.amount)}
              />
            ) : null}
            {data.credit.rows.length ? (
              <SummaryCard label="Credit" value={formatMoney(data.credit.amount)} />
            ) : null}
          </div>
          {nothing ? <p className="text-sm text-muted">No sales in this range.</p> : null}
          {data.sections.map((section) => (
            <Subsection
              key={section.key}
              title={`${sectionTitle(section)} · ${formatQuantity(section.quantity)} sold · ${formatMoney(section.amount)}`}
            >
              <ReportTable
                data={withRowIds(section.items, (r) => r.variantId)}
                columns={itemColumns}
                emptyText="Nothing sold."
                pageSize={500}
              />
            </Subsection>
          ))}
          {data.rooms.rows.length ? (
            <Subsection title={`Rooms · ${formatQuantity(data.rooms.hours)} h · ${formatMoney(data.rooms.amount)}`}>
              <ReportTable
                data={withRowIds(data.rooms.rows, (r) => r.room)}
                columns={roomColumns}
                emptyText="No room time."
                pageSize={500}
              />
            </Subsection>
          ) : null}
          {data.credit.rows.length ? (
            <Subsection title={`Credit · ${formatMoney(data.credit.amount)}`}>
              <ReportTable
                data={withRowIds(data.credit.rows, (r, i) => `${r.orderNumber}-${i}`)}
                columns={creditColumns}
                emptyText="No credit bills."
                pageSize={500}
              />
            </Subsection>
          ) : null}
        </>
      ) : null}
    </ReportPanel>
  );
}
