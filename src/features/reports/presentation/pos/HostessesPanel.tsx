"use client";

import { useMemo, useState } from "react";
import { ReportTable } from "@/features/reports/presentation/report-export";
import { useHostessReport } from "@/presentation/hooks/usePosReports";
import type {
  HostessCallRow,
  HostessMenuOrderRow,
  HostessSummary,
} from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { tableColumns, type ReportColumn } from "./report-columns";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const who = (r: { hostessName: string; nickname: string | null }) =>
  r.nickname ? `${r.hostessName} (${r.nickname})` : r.hostessName;

const SUMMARY_COLUMNS: ReportColumn<HostessSummary>[] = [
  { key: "hostess", header: "Hostess", value: who },
  { key: "calls", header: "Calls", value: (r) => r.calls },
  { key: "freeCalls", header: "Free calls", value: (r) => r.freeCalls },
  { key: "hours", header: "Hours", value: (r) => r.hours, format: "quantity" },
  { key: "netSales", header: "Sales", value: (r) => r.netSales, format: "money" },
  { key: "menuOrders", header: "Menu ordered", value: (r) => r.menuOrders ?? 0 },
  { key: "menuSales", header: "Menu sales", value: (r) => r.menuSales ?? "0", format: "money" },
];

const MENU_ORDER_COLUMNS: ReportColumn<HostessMenuOrderRow>[] = [
  { key: "businessDate", header: "Date", value: (r) => r.businessDate },
  { key: "soldAt", header: "Time", value: (r) => time(r.soldAt) },
  { key: "room", header: "Room", value: (r) => r.roomNumber },
  { key: "hostess", header: "Hostess", value: who },
  { key: "item", header: "Item", value: (r) => r.item },
  { key: "quantity", header: "Qty", value: (r) => r.quantity, format: "quantity" },
  { key: "free", header: "Free", value: (r) => (r.free ? "Yes" : "") },
  { key: "netSales", header: "Amount", value: (r) => r.netSales, format: "money" },
  { key: "orderNumber", header: "Bill", value: (r) => r.orderNumber },
];

const CALL_COLUMNS: ReportColumn<HostessCallRow>[] = [
  { key: "businessDate", header: "Date", value: (r) => r.businessDate },
  { key: "soldAt", header: "Time", value: (r) => time(r.soldAt) },
  { key: "room", header: "Room", value: (r) => r.roomNumber },
  { key: "hostess", header: "Hostess", value: who },
  { key: "service", header: "Service", value: (r) => r.service },
  { key: "quantity", header: "Qty", value: (r) => r.quantity, format: "quantity" },
  { key: "hours", header: "Hours", value: (r) => r.hours, format: "quantity" },
  { key: "free", header: "Free", value: (r) => (r.free ? "Yes" : "") },
  { key: "netSales", header: "Sales", value: (r) => r.netSales, format: "money" },
  { key: "orderNumber", header: "Bill", value: (r) => r.orderNumber },
];

export function HostessesPanel({ range }: { range: DashboardRange }) {
  const query = useHostessReport(range);
  const data = query.data;
  const summaryColumns = useMemo(() => tableColumns(SUMMARY_COLUMNS), []);
  const callColumns = useMemo(() => tableColumns(CALL_COLUMNS), []);
  const menuOrderColumns = useMemo(() => tableColumns(MENU_ORDER_COLUMNS), []);
  const [menuHostessId, setMenuHostessId] = useState("");
  const menuOrders = (data?.menuOrders ?? []).filter(
    (r) => !menuHostessId || r.hostessId === menuHostessId,
  );

  return (
    <ReportPanel
      title="Hostesses"
      description="Every hostess call in the range: who went to which room, for what and how long, and the dishes and drinks each hostess ordered. Free calls and items count, not as sales."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard label="Calls" value={formatCount(data.totals.calls)} />
            <SummaryCard label="Hostesses" value={formatCount(data.totals.hostesses)} />
            <SummaryCard label="Hours" value={formatQuantity(data.totals.hours)} />
            <SummaryCard label="Sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Menu ordered" value={formatCount(data.totals.menuOrders ?? 0)} />
            <SummaryCard label="Menu sales" value={formatMoney(data.totals.menuSales ?? "0")} />
          </div>
          <Subsection title="By hostess">
            <ReportTable
              data={withRowIds(data.byHostess, (r) => r.hostessId)}
              columns={summaryColumns}
              emptyText="No hostess calls in this range."
              pageSize={500}
            />
          </Subsection>
          <Subsection title="Calls">
            <ReportTable
              data={withRowIds(data.calls, (r, i) => `${r.orderNumber}-${r.hostessId}-${i}`)}
              columns={callColumns}
              emptyText="No hostess calls in this range."
            />
          </Subsection>
          <Subsection title="Hostess ordered menus">
            <label className="mb-3 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Hostess</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-2"
                value={menuHostessId}
                onChange={(event) => setMenuHostessId(event.target.value)}
              >
                <option value="">All hostesses</option>
                {data.byHostess
                  .filter((r) => (r.menuOrders ?? 0) > 0)
                  .map((r) => (
                    <option key={r.hostessId} value={r.hostessId}>
                      {who(r)}
                    </option>
                  ))}
              </select>
            </label>
            <ReportTable
              data={withRowIds(menuOrders, (r, i) => `${r.orderNumber}-${r.hostessId}-${i}`)}
              columns={menuOrderColumns}
              emptyText="No dishes or drinks ordered by hostesses in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
