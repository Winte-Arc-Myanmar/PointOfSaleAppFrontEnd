"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import {
  useSaleSummaryReport,
  type SaleSummaryReport,
} from "@/presentation/hooks/useSaleSummaryReport";
import { useToast } from "@/presentation/providers/ToastProvider";
import { ReportSectionTitle, ReportTable, type ReportScope } from "../report-export";
import { tableColumns, type ReportColumn } from "../pos/report-columns";
import { ReportPanel } from "./dashboard-ui";
import { printSaleSummarySlip } from "./sale-summary-slip";
import type { DashboardRange } from "./types";

type Row = { id: string; label: string; count: string | number | null; amount: string | null };

const COUNT_COLUMNS = tableColumns<Row>([
  { key: "label", header: "Item", value: (r) => r.label },
  { key: "count", header: "Count", value: (r) => r.count, format: "quantity" },
  { key: "amount", header: "Amount", value: (r) => r.amount, format: "money" },
] satisfies ReportColumn<Row>[]);

const QTY_COLUMNS = tableColumns<Row>([
  { key: "label", header: "Category", value: (r) => r.label },
  { key: "count", header: "Qty", value: (r) => r.count, format: "quantity" },
  { key: "amount", header: "Amount", value: (r) => r.amount, format: "money" },
] satisfies ReportColumn<Row>[]);

const toRow = (r: { key: string; label: string; count: number; amount: string }): Row => ({
  id: r.key,
  label: r.label,
  count: r.count,
  amount: r.amount,
});

function SummaryTable({
  title,
  rows,
  columns = COUNT_COLUMNS,
}: {
  title: string;
  rows: Row[];
  columns?: typeof COUNT_COLUMNS;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h4 className="text-sm font-semibold">{title}</h4>
        <ReportSectionTitle value={title}>
          <ReportTable data={rows} columns={columns} pageSize={500} emptyText="Nothing in this range." />
        </ReportSectionTitle>
      </CardContent>
    </Card>
  );
}

function sections(data: SaleSummaryReport) {
  const s = data.sales;
  const salesRows = [s.subtotal, s.serviceCharge, s.tax, s.discount, s.promotion]
    .concat(Number(s.tips.amount) > 0 ? [s.tips] : [])
    .concat([s.refund])
    .map(toRow);
  return {
    sales: [
      ...salesRows,
      { id: "total-sales", label: "Total sales", count: null, amount: s.totalSales },
      { id: "total-orders", label: "Total sale orders", count: s.totalOrders, amount: null },
    ],
    payments: [
      ...data.payments.rows.map(toRow),
      { id: "total", label: "Total sales", count: data.payments.count, amount: data.payments.amount },
    ],
    categories: [
      ...data.categories.rows.map((r) => ({ id: r.key, label: r.label, count: r.quantity, amount: r.amount })),
      { id: "total", label: "Total", count: data.categories.quantity, amount: data.categories.amount },
    ],
    orderTypes: [
      ...data.orderTypes.rows.map(toRow),
      { id: "total", label: "Total orders", count: data.orderTypes.count, amount: data.orderTypes.amount },
    ],
  };
}

export function SaleSummaryReportPanel({ range, scope }: { range: DashboardRange; scope: ReportScope }) {
  const query = useSaleSummaryReport(range);
  const data = query.data;
  const toast = useToast();
  const { preferences } = usePrinterPreferences();
  const [isPrinting, setIsPrinting] = useState(false);

  async function handlePrint() {
    if (!data) return;
    setIsPrinting(true);
    try {
      const result = await printSaleSummarySlip(
        data,
        { outlet: scope.outlet, period: scope.period },
        { paperWidthMm: preferences.receipt.paperWidthMm, mode: preferences.receipt.mode },
      );
      if (result.success) toast.success(result.message ?? "Sale summary sent to printer.");
      else toast.error(result.message ?? "Sale summary print failed.");
    } finally {
      setIsPrinting(false);
    }
  }

  const rows = data ? sections(data) : null;

  return (
    <ReportPanel
      title="Sale summary report"
      description="Category amounts are before tax and service charge."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {rows ? (
        <>
          <div className="flex justify-end print:hidden">
            <Button type="button" variant="outline" size="sm" disabled={isPrinting} onClick={() => void handlePrint()}>
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? "Printing..." : "Print slip"}
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SummaryTable title="Sale summary" rows={rows.sales} />
            <SummaryTable title="Payment summary" rows={rows.payments} />
            <SummaryTable title="Category summary" rows={rows.categories} columns={QTY_COLUMNS} />
            <SummaryTable title="Sale orders summary" rows={rows.orderTypes} />
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
