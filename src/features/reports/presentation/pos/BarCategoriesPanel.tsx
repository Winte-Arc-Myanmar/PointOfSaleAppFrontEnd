"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { useBarCategories } from "@/presentation/hooks/usePosReports";
import type { BarSubCategory } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity, withRowIds } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "../plain/dashboard-ui";
import type { DashboardRange } from "../plain/types";
import { downloadCsv, ExportButton, sheet, tableColumns, type ReportColumn } from "./report-columns";

type Row = BarSubCategory & { level: 0 | 1 };

const COLUMNS: ReportColumn<Row>[] = [
  {
    key: "categoryName",
    header: "Category",
    value: (r) => (r.level ? `   ↳ ${r.categoryName}` : r.categoryName),
  },
  { key: "orderCount", header: "Bills", value: (r) => r.orderCount },
  { key: "quantity", header: "Qty", value: (r) => r.quantity, format: "quantity" },
  { key: "grossSales", header: "Gross sales", value: (r) => r.grossSales, format: "money" },
  { key: "discounts", header: "Discounts", value: (r) => r.discounts, format: "money" },
  { key: "netSales", header: "Net sales", value: (r) => r.netSales, format: "money" },
  { key: "share", header: "Share", value: (r) => r.shareOfNetSales, format: "share" },
  { key: "compedValue", header: "Free (FOC)", value: (r) => r.compedValue, format: "money" },
  { key: "refundAmount", header: "Refunds", value: (r) => r.refundAmount, format: "money" },
];

export function BarCategoriesPanel({ range }: { range: DashboardRange }) {
  const query = useBarCategories(range);
  const data = query.data;
  const columns = useMemo(() => tableColumns(COLUMNS), []);
  const rows: Row[] = useMemo(
    () =>
      (data?.categories ?? []).flatMap((category) => [
        { ...category, level: 0 as const },
        ...category.subCategories.map((sub) => ({ ...sub, level: 1 as const })),
      ]),
    [data],
  );

  return (
    <ReportPanel
      title="Bar sales by menu category"
      description="Sales at the bar and every other till that isn't SPA or Private VIP Lounge, by menu category. Sub-categories are counted in their parent and listed under it."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Bills" value={formatCount(data.totals.orderCount)} />
            <SummaryCard label="Qty sold" value={formatQuantity(data.totals.quantity)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Free (FOC)" value={formatMoney(data.totals.compedValue)} />
          </div>
          <div className="flex justify-end">
            <ExportButton
              disabled={!rows.length}
              onClick={() =>
                downloadCsv(`bar-categories-${range.from}-to-${range.to}`, [
                  sheet(`Bar sales by category ${range.from} to ${range.to}`, COLUMNS, rows),
                ])
              }
            />
          </div>
          <DataTable
            data={withRowIds(rows, (r, i) => `${r.categoryId ?? "none"}-${r.level}-${i}`)}
            columns={columns}
            emptyText="No bar sales in this range."
            pageSize={500}
          />
        </>
      ) : null}
    </ReportPanel>
  );
}
