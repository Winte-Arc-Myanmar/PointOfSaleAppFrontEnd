"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
  const plain = (id: string, label: string, amount: string | null, count: string | number | null = null): Row => ({
    id,
    label,
    count,
    amount,
  });
  const group = (g: SaleSummaryReport["payments"]["receipts"]): Row[] => [
    plain("total", "Total", g.amount, g.count),
    ...g.rows.map(toRow),
  ];
  const drawer = data.cashDrawer;
  return {
    sales: [
      plain("settled", "Settled orders", null, s.totalOrders),
      plain("returned", "Return quantity", null, s.returnQuantity),
      plain("subtotal", "Subtotal", s.subtotal.amount),
      toRow(s.discount),
      toRow(s.promotion),
      plain("serviceCharge", s.serviceCharge.label, s.serviceCharge.amount),
      plain("tax", s.tax.label, s.tax.amount),
      ...(Number(s.tips.amount) > 0 ? [plain("tips", "Tips", s.tips.amount)] : []),
      toRow(s.refund),
      plain("total", "Total", s.total),
      plain("receivable", "Receivable", s.receivable),
    ],
    receipts: group(data.payments.receipts),
    excluded: group(data.payments.excluded),
    drawer: [
      plain("petty", "Petty cash", drawer.pettyCash),
      plain("revenue", "Order revenue", drawer.orderRevenue),
      ...(Number(drawer.cashRefunds) > 0 ? [plain("refunds", "Cash refunds", `-${drawer.cashRefunds}`)] : []),
      plain("estimated", "Estimated amount", drawer.estimated),
    ],
    categories: [
      plain("total", "Total", data.categories.amount, data.categories.quantity),
      ...data.categories.rows.map((r) => plain(r.key, r.label, r.amount, r.quantity)),
    ],
    orderTypes: [plain("total", "Total", data.orderTypes.amount, data.orderTypes.count), ...data.orderTypes.rows.map(toRow)],
  };
}

export function SaleSummaryReportPanel({ range, scope }: { range: DashboardRange; scope: ReportScope }) {
  const query = useSaleSummaryReport(range);
  const data = query.data;
  const toast = useToast();
  const { preferences } = usePrinterPreferences();
  const [isPrinting, setIsPrinting] = useState(false);
  const { data: session } = useSession();

  async function handlePrint() {
    if (!data) return;
    setIsPrinting(true);
    try {
      const result = await printSaleSummarySlip(
        data,
        { outlet: scope.outlet, printedBy: session?.user?.name ?? session?.user?.email ?? null },
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
      description="Categories add up to the Subtotal. Receipts are cash and Food Panda / Grab."
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
            <SummaryTable title="Sales summary" rows={rows.sales} />
            <div className="grid gap-4">
              <SummaryTable title="Receipts" rows={rows.receipts} />
              <SummaryTable title="Exclude receipts" rows={rows.excluded} />
            </div>
            <SummaryTable title="Cash drawer verification" rows={rows.drawer} />
            <SummaryTable title="Category summary" rows={rows.categories} columns={QTY_COLUMNS} />
            <SummaryTable title="Order type" rows={rows.orderTypes} />
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
