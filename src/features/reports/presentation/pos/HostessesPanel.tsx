"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { useHostessReport } from "@/presentation/hooks/usePosReports";
import type { HostessCallRow, HostessSummary } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { downloadCsv, ExportButton, sheet, tableColumns, type ReportColumn } from "./report-columns";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const who = (r: { hostessName: string; nickname: string | null }) =>
  r.nickname ? `${r.hostessName} (${r.nickname})` : r.hostessName;

const SUMMARY_COLUMNS: ReportColumn<HostessSummary>[] = [
  { key: "hostess", header: "Hostess", value: who },
  { key: "calls", header: "Calls", value: (r) => r.calls },
  { key: "freeCalls", header: "Free calls", value: (r) => r.freeCalls },
  { key: "hours", header: "Hours", value: (r) => r.hours, format: "quantity" },
  { key: "netSales", header: "Sales", value: (r) => r.netSales, format: "money" },
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

  return (
    <ReportPanel
      title="Hostesses"
      description="Every hostess call in the range: who went to which room, for what and how long. Free calls count as calls, not as sales."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Calls" value={formatCount(data.totals.calls)} />
            <SummaryCard label="Hostesses" value={formatCount(data.totals.hostesses)} />
            <SummaryCard label="Hours" value={formatQuantity(data.totals.hours)} />
            <SummaryCard label="Sales" value={formatMoney(data.totals.netSales)} />
          </div>
          <div className="flex justify-end">
            <ExportButton
              disabled={!data.totals.calls}
              onClick={() =>
                downloadCsv(`hostesses-${range.from}-to-${range.to}`, [
                  sheet(`Hostesses ${range.from} to ${range.to}`, SUMMARY_COLUMNS, data.byHostess),
                  sheet("Calls", CALL_COLUMNS, data.calls),
                ])
              }
            />
          </div>
          <Subsection title="By hostess">
            <DataTable
              data={withRowIds(data.byHostess, (r) => r.hostessId)}
              columns={summaryColumns}
              emptyText="No hostess calls in this range."
              pageSize={500}
            />
          </Subsection>
          <Subsection title="Calls">
            <DataTable
              data={withRowIds(data.calls, (r, i) => `${r.orderNumber}-${r.hostessId}-${i}`)}
              columns={callColumns}
              emptyText="No hostess calls in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
