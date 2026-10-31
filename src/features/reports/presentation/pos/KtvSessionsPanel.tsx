"use client";

import { useMemo } from "react";
import { ReportTable } from "@/features/reports/presentation/report-export";
import { useKtvSessionReport } from "@/presentation/hooks/usePosReports";
import type { KtvRoomSummary, KtvSessionRow } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

const duration = (minutes: number | null) =>
  minutes == null ? null : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;

const SESSION_COLUMNS: ReportColumn<KtvSessionRow>[] = [
  { key: "businessDate", header: "Date", value: (r) => r.businessDate },
  { key: "room", header: "Room", value: (r) => (r.roomName ? `${r.roomNumber} · ${r.roomName}` : r.roomNumber) },
  { key: "guestName", header: "Guest", value: (r) => r.guestName },
  { key: "openedAt", header: "Start", value: (r) => time(r.openedAt) },
  { key: "closedAt", header: "End", value: (r) => time(r.closedAt) },
  { key: "used", header: "Used", value: (r) => duration(r.minutesUsed) },
  { key: "hoursSold", header: "Hours sold", value: (r) => r.hoursSold, format: "quantity" },
  { key: "freeHours", header: "Free hours", value: (r) => r.freeHours, format: "quantity" },
  { key: "roomSales", header: "Room", value: (r) => r.roomSales, format: "money" },
  { key: "fnbSales", header: "Food & drink", value: (r) => r.fnbSales, format: "money" },
  { key: "compedValue", header: "Free (FOC)", value: (r) => r.compedValue, format: "money" },
  { key: "grandTotal", header: "Total", value: (r) => r.grandTotal, format: "money" },
  {
    key: "payments",
    header: "Paid by",
    value: (r) => r.payments.map((p) => `${p.name} ${formatMoney(p.amount)}`).join(", "),
  },
];

const ROOM_COLUMNS: ReportColumn<KtvRoomSummary>[] = [
  { key: "room", header: "Room", value: (r) => (r.roomName ? `${r.roomNumber} · ${r.roomName}` : r.roomNumber) },
  { key: "sessionCount", header: "Sessions", value: (r) => r.sessionCount },
  { key: "hoursSold", header: "Hours sold", value: (r) => r.hoursSold, format: "quantity" },
  { key: "freeHours", header: "Free hours", value: (r) => r.freeHours, format: "quantity" },
  { key: "roomSales", header: "Room", value: (r) => r.roomSales, format: "money" },
  { key: "fnbSales", header: "Food & drink", value: (r) => r.fnbSales, format: "money" },
  { key: "grandTotal", header: "Total", value: (r) => r.grandTotal, format: "money" },
];

export function KtvSessionsPanel({ range }: { range: DashboardRange }) {
  const query = useKtvSessionReport(range);
  const data = query.data;
  const sessionColumns = useMemo(() => tableColumns(SESSION_COLUMNS), []);
  const roomColumns = useMemo(() => tableColumns(ROOM_COLUMNS), []);

  return (
    <ReportPanel
      title="VIP Lounge sales by session"
      description="Each room session sold in the range, with hours, room and food & drink sales, and how it was paid. Totals cover all sessions."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Sessions" value={formatCount(data.totals.sessionCount)} />
            <SummaryCard
              label="Hours sold"
              value={`${formatQuantity(data.totals.hoursSold)}${Number(data.totals.freeHours) ? ` + ${formatQuantity(data.totals.freeHours)} free` : ""}`}
            />
            <SummaryCard label="Room sales" value={formatMoney(data.totals.roomSales)} />
            <SummaryCard label="Food & drink" value={formatMoney(data.totals.fnbSales)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Discounts" value={formatMoney(data.totals.discounts)} />
            <SummaryCard label="Free (FOC)" value={formatMoney(data.totals.compedValue)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Total, all sessions" value={formatMoney(data.totals.grandTotal)} />
          </div>
          <Subsection title="By room">
            <ReportTable
              data={withRowIds(data.byRoom, (r) => r.roomId)}
              columns={roomColumns}
              emptyText="No VIP Lounge sessions in this range."
              pageSize={500}
            />
          </Subsection>
          <Subsection title="Sessions">
            <ReportTable
              data={withRowIds(data.sessions, (r) => r.orderId)}
              columns={sessionColumns}
              emptyText="No VIP Lounge sessions in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
