"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { useSpaMenuReport } from "@/presentation/hooks/usePosReports";
import type { SpaMenuRow, SpaMenuSection } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatShare, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, Subsection, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { downloadCsv, ExportButton, sheet, tableColumns, type ReportColumn } from "./report-columns";

const COLUMNS: ReportColumn<SpaMenuRow>[] = [
  {
    key: "name",
    header: "Item",
    value: (r) => (r.includes.length ? `${r.name} (with ${r.includes.join(", ")})` : r.name),
  },
  { key: "duration", header: "Time", value: (r) => (r.durationMinutes ? `${r.durationMinutes} min` : null) },
  { key: "quantity", header: "Qty", value: (r) => r.quantity, format: "quantity" },
  { key: "grossSales", header: "Gross sales", value: (r) => r.grossSales, format: "money" },
  { key: "discounts", header: "Discounts", value: (r) => r.discounts, format: "money" },
  { key: "netSales", header: "Net sales", value: (r) => r.netSales, format: "money" },
  { key: "share", header: "Share", value: (r) => r.shareOfNetSales, format: "share" },
  { key: "compedQuantity", header: "Free qty", value: (r) => r.compedQuantity, format: "quantity" },
  { key: "compedValue", header: "Free (FOC)", value: (r) => r.compedValue, format: "money" },
];

const SECTIONS: { key: "spaMenu" | "roomMenuPackages" | "roomServices" | "roomTime"; title: string; empty: string }[] = [
  { key: "spaMenu", title: "SPA menu (service packages)", empty: "No service packages sold." },
  { key: "roomMenuPackages", title: "Room + menu packages", empty: "No packages with food or drinks sold." },
  { key: "roomServices", title: "Room services (ordered in the room)", empty: "Nothing ordered in the rooms." },
  { key: "roomTime", title: "Room time (older priced rooms)", empty: "" },
];

function SectionTable({ section, empty }: { section: SpaMenuSection; empty: string }) {
  const columns = useMemo(() => tableColumns(COLUMNS), []);
  return (
    <>
      <p className="text-xs text-muted">
        Net sales {formatMoney(section.totals.netSales)} · {formatShare(section.totals.shareOfNetSales)} of SPA
        {Number(section.totals.compedValue) ? ` · free ${formatMoney(section.totals.compedValue)}` : ""}
      </p>
      <DataTable
        data={withRowIds(section.rows, (r) => r.variantId)}
        columns={columns}
        emptyText={empty}
        pageSize={500}
      />
    </>
  );
}

export function SpaMenuPanel({ range }: { range: DashboardRange }) {
  const query = useSpaMenuReport(range);
  const data = query.data;

  return (
    <ReportPanel
      title="SPA sales by menu"
      description="Service packages, packages that include food or drinks, and what guests ordered in the room. Items included in a package are counted with the package, not again as room services."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Bills" value={formatCount(data.totals.orderCount)} />
            <SummaryCard label="SPA menu" value={formatMoney(data.spaMenu.totals.netSales)} />
            <SummaryCard label="Room + menu packages" value={formatMoney(data.roomMenuPackages.totals.netSales)} />
            <SummaryCard label="Room services" value={formatMoney(data.roomServices.totals.netSales)} />
          </div>
          <div className="flex justify-end">
            <ExportButton
              disabled={!data.totals.orderCount}
              onClick={() =>
                downloadCsv(
                  `spa-menu-${range.from}-to-${range.to}`,
                  SECTIONS.filter((s) => s.key !== "roomTime" || data.roomTime.rows.length).map((s) =>
                    sheet(s.title, COLUMNS, data[s.key].rows),
                  ),
                )
              }
            />
          </div>
          {SECTIONS.filter((s) => s.key !== "roomTime" || data.roomTime.rows.length).map((s) => (
            <Subsection key={s.key} title={s.title}>
              <SectionTable section={data[s.key]} empty={s.empty} />
            </Subsection>
          ))}
        </>
      ) : null}
    </ReportPanel>
  );
}
