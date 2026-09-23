"use client";

import { useMemo } from "react";
import { DataTable } from "@/presentation/components/data-table";
import { useOtherIncomeExpenses } from "@/presentation/hooks/useReports";
import { formatCount, formatMoney, withRowIds } from "@/features/reports/presentation/report-utils";
import {
  getOtherIncomeDayColumns,
  getOtherIncomeEntryColumns,
  getOtherIncomeMethodColumns,
  getOtherIncomeOutletColumns,
} from "./dashboard-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardRange } from "./types";

export function OtherIncomePanel({ range }: { range: DashboardRange }) {
  const query = useOtherIncomeExpenses(range);
  const data = query.data;
  const dayColumns = useMemo(() => getOtherIncomeDayColumns(), []);
  const methodColumns = useMemo(() => getOtherIncomeMethodColumns(), []);
  const outletColumns = useMemo(() => getOtherIncomeOutletColumns(), []);
  const entryColumns = useMemo(() => getOtherIncomeEntryColumns(), []);

  return (
    <ReportPanel
      title="Other income and expenses"
      description="Paid-ins and paid-outs recorded against a till. Drops, float corrections, and guest-card money are left out."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Income"
              value={`${formatMoney(data.totals.income)} · ${formatCount(data.totals.incomeCount)}`}
            />
            <SummaryCard
              label="Expense"
              value={`${formatMoney(data.totals.expense)} · ${formatCount(data.totals.expenseCount)}`}
            />
            <SummaryCard label="Net" value={formatMoney(data.totals.net)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Subsection title="By day">
              <DataTable
                data={withRowIds(data.byDay, (row) => row.businessDate)}
                columns={dayColumns}
                emptyText="No till movements in this range."
              />
            </Subsection>
            <Subsection title="By payment method">
              <DataTable
                data={withRowIds(
                  data.byPaymentMethod,
                  (row, index) => row.paymentMethodId || `method-${index}`,
                )}
                columns={methodColumns}
                emptyText="No payment-method breakdown."
              />
            </Subsection>
          </div>
          <Subsection title="By outlet">
            <DataTable
              data={withRowIds(data.byOutlet, (row, index) => row.locationId || `outlet-${index}`)}
              columns={outletColumns}
              emptyText="No outlet breakdown."
            />
          </Subsection>
          <Subsection title="Entries">
            <DataTable
              data={withRowIds(data.entries, (row, index) => row.id || `entry-${index}`)}
              columns={entryColumns}
              emptyText="No paid-ins or paid-outs in this range."
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
