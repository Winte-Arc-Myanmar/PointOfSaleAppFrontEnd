"use client";

import { useMemo, useState } from "react";
import { ReportTable } from "@/features/reports/presentation/report-export";
import { useShiftReport } from "@/presentation/hooks/usePosReports";
import { useItemSales } from "@/presentation/hooks/useReports";
import { getItemSalesColumns } from "../plain/dashboard-columns";
import { shiftLabel } from "../plain/ItemSalesPanel";
import type { ShiftRow, ShiftStaffRow } from "@/core/domain/entities/ShiftCardReport";
import { formatCount, formatLabel, formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : null;

const paidBy = (payments: { name: string; amount: string }[]) =>
  payments.map((p) => `${p.name} ${formatMoney(p.amount)}`).join(", ");

const SHIFT_COLUMNS: ReportColumn<ShiftRow>[] = [
  { key: "businessDate", header: "Date", value: (r) => r.businessDate },
  { key: "registerName", header: "POS device", value: (r) => r.registerName },
  { key: "cashierName", header: "Staff", value: (r) => r.cashierName },
  { key: "openedAt", header: "Opened", value: (r) => when(r.openedAt) },
  { key: "closedAt", header: "Closed", value: (r) => when(r.closedAt) ?? formatLabel(r.status) },
  { key: "salesCount", header: "Bills", value: (r) => r.salesCount },
  { key: "totalSales", header: "Sales", value: (r) => r.totalSales, format: "money" },
  { key: "totalRefunds", header: "Refunds", value: (r) => r.totalRefunds, format: "money" },
  { key: "netTotal", header: "Net", value: (r) => r.netTotal, format: "money" },
  { key: "payments", header: "Paid by", value: (r) => paidBy(r.payments) },
  { key: "cardTopUps", header: "Card top-ups", value: (r) => r.cardTopUps, format: "money" },
  { key: "cardRefunds", header: "Card refunds", value: (r) => r.cardRefunds, format: "money" },
];

const STAFF_COLUMNS: ReportColumn<ShiftStaffRow>[] = [
  { key: "cashierName", header: "Staff", value: (r) => r.cashierName },
  { key: "shifts", header: "Shifts", value: (r) => r.shifts },
  { key: "salesCount", header: "Bills", value: (r) => r.salesCount },
  { key: "totalSales", header: "Sales", value: (r) => r.totalSales, format: "money" },
  { key: "totalRefunds", header: "Refunds", value: (r) => r.totalRefunds, format: "money" },
  { key: "netTotal", header: "Net", value: (r) => r.netTotal, format: "money" },
  { key: "payments", header: "Paid by", value: (r) => paidBy(r.payments) },
  { key: "cardTopUps", header: "Card top-ups", value: (r) => r.cardTopUps, format: "money" },
];

type MethodRow = { name: string; kind: string; count: number; amount: string };

const METHOD_COLUMNS: ReportColumn<MethodRow>[] = [
  { key: "name", header: "Payment method", value: (r) => r.name },
  { key: "count", header: "Payments", value: (r) => r.count },
  { key: "amount", header: "Net amount", value: (r) => r.amount, format: "money" },
];

export function ShiftsPanel({ range }: { range: DashboardRange }) {
  const query = useShiftReport(range);
  const data = query.data;
  const shiftColumns = useMemo(() => tableColumns(SHIFT_COLUMNS), []);
  const staffColumns = useMemo(() => tableColumns(STAFF_COLUMNS), []);
  const methodColumns = useMemo(() => tableColumns(METHOD_COLUMNS), []);
  const itemColumns = useMemo(() => getItemSalesColumns(), []);
  const [shiftId, setShiftId] = useState("");
  const shift = data?.shifts.find((row) => row.sessionId === shiftId);
  // What the chosen shift sold: bills it took payment for, from the day it opened.
  const shiftItems = useItemSales(
    shift
      ? {
          from: shift.businessDate,
          to: range.to && range.to > shift.businessDate ? range.to : shift.businessDate,
          locationId: range.locationId,
          posSessionId: shift.sessionId,
          page: 1,
          limit: 500,
          sortBy: "quantitySold",
          sortOrder: "desc",
        }
      : null,
  );

  return (
    <ReportPanel
      title="Shifts"
      description="Every shift that opened in the range: who ran it, what it sold and how it was paid. Card top-ups are deposits and are kept apart from sales."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Shifts" value={formatCount(data.totals.shifts)} />
            <SummaryCard label="Bills" value={formatCount(data.totals.salesCount)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netTotal)} />
            <SummaryCard label="Card top-ups" value={formatMoney(data.totals.cardTopUps)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="By staff">
              <ReportTable
                data={withRowIds(data.byStaff, (r) => r.cashierId)}
                columns={staffColumns}
                emptyText="No shifts in this range."
              />
            </Subsection>
            <Subsection title="By payment method">
              <ReportTable
                data={withRowIds(data.byPaymentMethod, (r) => r.name)}
                columns={methodColumns}
                emptyText="No payments in this range."
              />
            </Subsection>
          </div>
          <Subsection title="Shifts">
            <ReportTable
              data={withRowIds(data.shifts, (r) => r.sessionId)}
              columns={shiftColumns}
              emptyText="No shifts in this range."
              pageSize={20}
            />
          </Subsection>
          <Subsection title="Menu sales by shift">
            <label className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Shift</span>
              <select
                className="h-9 max-w-full rounded-md border border-input bg-background px-2"
                value={shiftId}
                onChange={(event) => setShiftId(event.target.value)}
              >
                <option value="">Choose a shift</option>
                {data.shifts.map((row) => (
                  <option key={row.sessionId} value={row.sessionId}>
                    {shiftLabel(row)}
                  </option>
                ))}
              </select>
            </label>
            {shift ? (
              <ReportTable
                data={withRowIds(shiftItems.data?.items ?? [], (r, i) => r.variantId || `item-${i}`)}
                columns={itemColumns}
                emptyText={shiftItems.isLoading ? "Loading..." : "This shift sold no items."}
                pageSize={50}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose a shift to see how many of each item it sold.
              </p>
            )}
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
