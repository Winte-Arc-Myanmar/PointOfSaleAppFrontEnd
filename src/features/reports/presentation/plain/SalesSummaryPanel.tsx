"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { DetailRows } from "@/presentation/components/detail";
import { useSalesSummary } from "@/presentation/hooks/useReports";
import { formatCount, formatMoney } from "@/features/reports/presentation/report-utils";
import { withRowIds } from "@/features/reports/presentation/report-utils";
import {
  getNamedPaymentColumns,
  getRefundMethodColumns,
  getSalesSummaryDayColumns,
  getSalesSummaryHourColumns,
  getSalesSummaryOutletColumns,
  getSalesSummaryServiceColumns,
} from "./dashboard-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardRange } from "./types";

export function SalesSummaryPanel({ range }: { range: DashboardRange }) {
  const query = useSalesSummary(range);
  const data = query.data;
  const dayColumns = useMemo(() => getSalesSummaryDayColumns(), []);
  const hourColumns = useMemo(() => getSalesSummaryHourColumns(), []);
  const outletColumns = useMemo(() => getSalesSummaryOutletColumns(), []);
  const serviceColumns = useMemo(() => getSalesSummaryServiceColumns(), []);
  const paymentColumns = useMemo(() => getNamedPaymentColumns(), []);
  const refundColumns = useMemo(() => getRefundMethodColumns(), []);

  return (
    <ReportPanel
      title="Sales summary"
      description="Sales filed on each business date, with refunds on the day they were made. Guest-card top-ups are deposits and do not appear here."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Orders" value={formatCount(data.orders.count)} />
            <SummaryCard label="Net sales" value={formatMoney(data.sales.netSales)} />
            <SummaryCard label="Grand total" value={formatMoney(data.sales.grandTotal)} />
            <SummaryCard label="Net after refunds" value={formatMoney(data.netAfterRefunds)} />
          </div>
          <DetailRows
            rows={[
              { label: "Gross sales", value: formatMoney(data.sales.grossSales) },
              { label: "Line discounts", value: formatMoney(data.sales.lineDiscounts) },
              { label: "Order discounts", value: formatMoney(data.sales.orderDiscounts) },
              { label: "Total discounts", value: formatMoney(data.sales.totalDiscounts) },
              { label: "Service charge", value: formatMoney(data.sales.serviceCharge) },
              { label: "Tax", value: formatMoney(data.sales.tax) },
              { label: "Tips", value: formatMoney(data.sales.tips) },
              { label: "Average net sales", value: formatMoney(data.orders.averageNetSales) },
              { label: "Average grand total", value: formatMoney(data.orders.averageGrandTotal) },
              { label: "Voided orders", value: formatCount(data.orders.voided.count) },
              { label: "Voided order amount", value: formatMoney(data.orders.voided.amount) },
              {
                label: "Voided lines",
                value: `${formatCount(data.voidedLines.count)} · ${formatMoney(data.voidedLines.amount)}`,
              },
              {
                label: "Comped lines",
                value: `${formatCount(data.compedLines.count)} · ${formatMoney(data.compedLines.amount)}`,
              },
              { label: "Tendered", value: formatMoney(data.payments.tendered) },
              { label: "Change given", value: formatMoney(data.payments.changeGiven) },
            ]}
          />
          <Subsection title="Refunds">
            <div className="mb-3 grid gap-4 sm:grid-cols-3">
              <SummaryCard label="Refund count" value={formatCount(data.refunds.count)} />
              <SummaryCard label="Refund subtotal" value={formatMoney(data.refunds.subtotal)} />
              <SummaryCard label="Refund total" value={formatMoney(data.refunds.total)} />
            </div>
            <DataTable
              data={withRowIds(data.refunds.byMethod, (row, index) => `${row.refundMethod}-${index}`)}
              columns={refundColumns}
              emptyText="No refunds in this range."
            />
          </Subsection>
          <Subsection title="Payments">
            <DataTable
              data={withRowIds(data.payments.byMethod, (row, index) => row.paymentMethodId || `pay-${index}`)}
              columns={paymentColumns}
              emptyText="No payments in this range."
            />
          </Subsection>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="By day">
              <DataTable
                data={withRowIds(data.byDay, (row) => row.businessDate)}
                columns={dayColumns}
                emptyText="No daily sales in this range."
              />
            </Subsection>
            <Subsection title="By hour">
              <DataTable
                data={withRowIds(data.byHour, (row) => `hour-${row.hour}`)}
                columns={hourColumns}
                emptyText="No hourly sales in this range."
              />
            </Subsection>
            <Subsection title="By outlet">
              <DataTable
                data={withRowIds(data.byOutlet, (row, index) => row.locationId || `outlet-${index}`)}
                columns={outletColumns}
                emptyText="No outlet breakdown."
              />
            </Subsection>
            <Subsection title="By service type">
              <DataTable
                data={withRowIds(data.byServiceType, (row) => row.serviceType)}
                columns={serviceColumns}
                emptyText="No service-type breakdown."
              />
            </Subsection>
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}
