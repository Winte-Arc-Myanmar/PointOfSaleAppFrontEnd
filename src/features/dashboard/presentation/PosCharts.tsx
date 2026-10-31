"use client";

import {
  useBarCategories,
  useCardActivity,
  useHostessReport,
  useShiftReport,
  useKtvSessionReport,
  usePosBills,
  useSpaMenuReport,
} from "@/presentation/hooks/usePosReports";
import type { PosType, SpaMenuSection } from "@/core/domain/entities/PosReport";
import { formatCount, formatMoney, formatQuantity } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, SharePieChart, chartAmount } from "./charts";
import { CARD_ENTRY_LABEL } from "@/features/reports/presentation/pos/CardActivityPanel";
import type { DashboardRange } from "./types";

const POS_NAME: Record<PosType, string> = { SPA: "SPA", KTV: "VIP Lounge", BAR: "Bar" };
const BILLS_SHOWN = 500;

function top<T>(rows: T[], amount: (row: T) => number, count = 10): T[] {
  return [...rows].sort((a, b) => amount(b) - amount(a)).slice(0, count);
}

export function PosBillsChart({ range, posType }: { range: DashboardRange; posType: PosType }) {
  const query = usePosBills({ ...range, posType, page: 1, limit: BILLS_SHOWN });
  const data = query.data;
  const byDay = new Map<string, { bills: number; grandTotal: number }>();
  const byMethod = new Map<string, number>();
  for (const bill of data?.bills ?? []) {
    const day = byDay.get(bill.businessDate) ?? { bills: 0, grandTotal: 0 };
    day.bills += 1;
    day.grandTotal += chartAmount(bill.grandTotal);
    byDay.set(bill.businessDate, day);
    for (const payment of bill.payments) {
      byMethod.set(payment.name, (byMethod.get(payment.name) ?? 0) + chartAmount(payment.amount));
    }
  }
  const days = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => ({ name: date.slice(5) || date, ...day }));
  const methods = [...byMethod.entries()].map(([name, value]) => ({ name, value })).filter((row) => row.value > 0);
  const partial = data ? data.meta.total > data.bills.length : false;

  return (
    <ReportPanel
      title={`${POS_NAME[posType]} bills`}
      description={
        partial
          ? `Charts cover the latest ${BILLS_SHOWN} of ${data?.meta.total} bills. Totals cover all of them. Every bill is on Reports.`
          : "Bills closed in the range. Every bill is listed on Reports."
      }
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Bills" value={formatCount(data.totals.billCount)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Tax" value={formatMoney(data.totals.tax)} />
            <SummaryCard label="Grand total" value={formatMoney(data.totals.grandTotal)} />
          </div>
          {days.length ? (
            <ChartCard title="Grand total by day">
              <MoneyBarChart data={days} bars={[{ key: "grandTotal", name: "Grand total", color: "#0f766e" }]} />
            </ChartCard>
          ) : (
            <EmptyChart label="No bills in this range." />
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {days.length ? (
              <ChartCard title="Bills by day">
                <MoneyBarChart
                  data={days}
                  valueFormat="count"
                  bars={[{ key: "bills", name: "Bills", color: "#2563eb" }]}
                />
              </ChartCard>
            ) : (
              <EmptyChart label="No bills in this range." />
            )}
            {methods.length ? (
              <ChartCard title="Paid by">
                <SharePieChart data={methods} />
              </ChartCard>
            ) : (
              <EmptyChart label="No payments in this range." />
            )}
          </div>
        </>
      ) : null}
    </ReportPanel>
  );
}

export function BarCategoriesChart({ range }: { range: DashboardRange }) {
  const query = useBarCategories(range);
  const data = query.data;
  const categories = top(data?.categories ?? [], (row) => chartAmount(row.netSales)).map((row) => ({
    name: row.categoryName,
    netSales: chartAmount(row.netSales),
    compedValue: chartAmount(row.compedValue),
  }));
  const share = (data?.categories ?? [])
    .map((row) => ({ name: row.categoryName, value: chartAmount(row.netSales) }))
    .filter((row) => row.value > 0);

  return (
    <ReportPanel
      title="Bar sales by menu category"
      description="Net sales per top-level menu category. Sub-categories are counted in their parent."
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
          {categories.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Top categories">
                <MoneyBarChart
                  data={categories}
                  layout="vertical"
                  bars={[
                    { key: "netSales", name: "Net sales", color: "#16a34a" },
                    { key: "compedValue", name: "Free (FOC)", color: "#ca8a04" },
                  ]}
                />
              </ChartCard>
              {share.length ? (
                <ChartCard title="Share of net sales">
                  <SharePieChart data={share} />
                </ChartCard>
              ) : (
                <EmptyChart label="No net sales in this range." />
              )}
            </div>
          ) : (
            <EmptyChart label="No bar sales in this range." />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}

const SPA_SECTIONS: Array<{ key: "spaMenu" | "roomMenuPackages" | "roomServices" | "roomTime"; label: string }> = [
  { key: "spaMenu", label: "SPA menu" },
  { key: "roomMenuPackages", label: "Room packages" },
  { key: "roomServices", label: "Room services" },
  { key: "roomTime", label: "Room time" },
];

export function SpaMenuChart({ range }: { range: DashboardRange }) {
  const query = useSpaMenuReport(range);
  const data = query.data;
  const sections = SPA_SECTIONS.map(({ key, label }) => ({
    name: label,
    value: chartAmount((data?.[key] as SpaMenuSection | undefined)?.totals.netSales),
  })).filter((row) => row.value > 0);
  const menus = top(
    SPA_SECTIONS.flatMap(({ key }) => (data?.[key] as SpaMenuSection | undefined)?.rows ?? []),
    (row) => chartAmount(row.netSales),
  ).map((row) => ({ name: row.name, netSales: chartAmount(row.netSales) }));

  return (
    <ReportPanel
      title="SPA sales by menu"
      description="Net sales per SPA menu and room package, service and time."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Bills" value={formatCount(data.totals.orderCount)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
            <SummaryCard label="Grand total" value={formatMoney(data.totals.grandTotal)} />
          </div>
          {menus.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Top menus">
                <MoneyBarChart
                  data={menus}
                  layout="vertical"
                  bars={[{ key: "netSales", name: "Net sales", color: "#16a34a" }]}
                />
              </ChartCard>
              {sections.length ? (
                <ChartCard title="Net sales by kind">
                  <SharePieChart data={sections} />
                </ChartCard>
              ) : (
                <EmptyChart label="No net sales in this range." />
              )}
            </div>
          ) : (
            <EmptyChart label="No SPA sales in this range." />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}

export function KtvSessionsChart({ range }: { range: DashboardRange }) {
  const query = useKtvSessionReport(range);
  const data = query.data;
  const rooms = top(data?.byRoom ?? [], (row) => chartAmount(row.grandTotal)).map((row) => ({
    name: row.roomName ? `${row.roomNumber} ${row.roomName}` : row.roomNumber,
    roomSales: chartAmount(row.roomSales),
    fnbSales: chartAmount(row.fnbSales),
  }));
  const hours = top(data?.byRoom ?? [], (row) => chartAmount(row.hoursSold)).map((row) => ({
    name: row.roomName ? `${row.roomNumber} ${row.roomName}` : row.roomNumber,
    hoursSold: chartAmount(row.hoursSold),
    freeHours: chartAmount(row.freeHours),
  }));

  return (
    <ReportPanel
      title="VIP Lounge sessions"
      description="Room time and food and drink sold per room."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Sessions" value={formatCount(data.totals.sessionCount)} />
            <SummaryCard label="Hours sold" value={formatQuantity(data.totals.hoursSold)} />
            <SummaryCard label="Room sales" value={formatMoney(data.totals.roomSales)} />
            <SummaryCard label="Grand total" value={formatMoney(data.totals.grandTotal)} />
          </div>
          {rooms.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Sales by room">
                <MoneyBarChart
                  data={rooms}
                  layout="vertical"
                  bars={[
                    { key: "roomSales", name: "Room", color: "#0f766e" },
                    { key: "fnbSales", name: "Food & drink", color: "#16a34a" },
                  ]}
                />
              </ChartCard>
              <ChartCard title="Hours by room">
                <MoneyBarChart
                  data={hours}
                  layout="vertical"
                  valueFormat="count"
                  bars={[
                    { key: "hoursSold", name: "Hours sold", color: "#2563eb" },
                    { key: "freeHours", name: "Free hours", color: "#ca8a04" },
                  ]}
                />
              </ChartCard>
            </div>
          ) : (
            <EmptyChart label="No sessions in this range." />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}

export function HostessesChart({ range }: { range: DashboardRange }) {
  const query = useHostessReport(range);
  const data = query.data;
  const label = (row: { hostessName: string; nickname: string | null }) =>
    row.nickname ? `${row.hostessName} (${row.nickname})` : row.hostessName;
  const sales = top(data?.byHostess ?? [], (row) => chartAmount(row.netSales)).map((row) => ({
    name: label(row),
    netSales: chartAmount(row.netSales),
  }));
  const calls = top(data?.byHostess ?? [], (row) => row.calls).map((row) => ({
    name: label(row),
    calls: row.calls - row.freeCalls,
    freeCalls: row.freeCalls,
  }));

  return (
    <ReportPanel
      title="Hostesses"
      description="Calls and sales per hostess."
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Hostesses" value={formatCount(data.totals.hostesses)} />
            <SummaryCard label="Calls" value={formatCount(data.totals.calls)} />
            <SummaryCard label="Hours" value={formatQuantity(data.totals.hours)} />
            <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
          </div>
          {sales.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Net sales by hostess">
                <MoneyBarChart
                  data={sales}
                  layout="vertical"
                  bars={[{ key: "netSales", name: "Net sales", color: "#c026d3" }]}
                />
              </ChartCard>
              <ChartCard title="Calls by hostess">
                <MoneyBarChart
                  data={calls}
                  layout="vertical"
                  valueFormat="count"
                  bars={[
                    { key: "calls", name: "Paid calls", color: "#2563eb" },
                    { key: "freeCalls", name: "Free calls", color: "#ca8a04" },
                  ]}
                />
              </ChartCard>
            </div>
          ) : (
            <EmptyChart label="No hostess calls in this range." />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}

export function ShiftsChart({ range }: { range: DashboardRange }) {
  const query = useShiftReport(range);
  const data = query.data;
  const staff = top(data?.byStaff ?? [], (row) => chartAmount(row.netTotal)).map((row) => ({
    name: row.cashierName,
    netTotal: chartAmount(row.netTotal),
    cardTopUps: chartAmount(row.cardTopUps),
  }));
  const methods = (data?.byPaymentMethod ?? [])
    .map((row) => ({ name: row.name, value: chartAmount(row.amount) }))
    .filter((row) => row.value > 0);
  const byDay = new Map<string, number>();
  for (const shift of data?.shifts ?? []) {
    byDay.set(shift.businessDate, (byDay.get(shift.businessDate) ?? 0) + chartAmount(shift.netTotal));
  }
  const days = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, netTotal]) => ({ name: date.slice(5) || date, netTotal }));

  return (
    <ReportPanel
      title="Shifts"
      description="Sales by staff and payment method across the shifts that opened in the range."
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
          {staff.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Net sales by staff">
                <MoneyBarChart
                  data={staff}
                  layout="vertical"
                  bars={[
                    { key: "netTotal", name: "Net sales", color: "#16a34a" },
                    { key: "cardTopUps", name: "Card top-ups", color: "#2563eb" },
                  ]}
                />
              </ChartCard>
              {methods.length ? (
                <ChartCard title="Paid by">
                  <SharePieChart data={methods} />
                </ChartCard>
              ) : (
                <EmptyChart label="No payments in this range." />
              )}
            </div>
          ) : (
            <EmptyChart label="No shifts in this range." />
          )}
          {days.length ? (
            <ChartCard title="Net sales by shift date">
              <MoneyBarChart data={days} bars={[{ key: "netTotal", name: "Net sales", color: "#0f766e" }]} />
            </ChartCard>
          ) : null}
        </>
      ) : null}
    </ReportPanel>
  );
}

export function CardActivityChart({ range, kind }: { range: DashboardRange; kind: "USAGE" | "MONEY" }) {
  const usage = kind === "USAGE";
  const query = useCardActivity({ ...range, kind, page: 1, limit: 1 });
  const data = query.data;
  const sign = usage ? -1 : 1;
  const tiers = top(data?.byTier ?? [], (row) => Math.abs(chartAmount(row.amount))).map((row) => ({
    name: row.tier,
    amount: sign * chartAmount(row.amount),
  }));
  const types = (data?.totals.byType ?? [])
    .map((row) => ({ name: CARD_ENTRY_LABEL[row.type], value: Math.abs(chartAmount(row.amount)) }))
    .filter((row) => row.value > 0);
  const methods = (data?.byPaymentMethod ?? []).map((row) => ({
    name: row.name,
    topUps: chartAmount(row.topUps),
    refunds: chartAmount(row.refunds),
  }));

  return (
    <ReportPanel
      title={usage ? "Card usage" : "Card top-ups & refunds"}
      description={
        usage
          ? "Guest-card spending by tier. Every spend is listed on Reports."
          : "Card money in and out by tier and payment method. Every entry is listed on Reports."
      }
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
    >
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard label="Entries" value={formatCount(data.totals.entries)} />
            <SummaryCard
              label={usage ? "Net spent" : "Net change on cards"}
              value={formatMoney(sign * chartAmount(data.totals.netChange))}
            />
          </div>
          {tiers.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title={usage ? "Spent by tier" : "Net change by tier"}>
                <MoneyBarChart
                  data={tiers}
                  layout="vertical"
                  bars={[{ key: "amount", name: usage ? "Spent" : "Net change", color: "#c026d3" }]}
                />
              </ChartCard>
              {usage ? (
                types.length ? (
                  <ChartCard title="By type">
                    <SharePieChart data={types} />
                  </ChartCard>
                ) : (
                  <EmptyChart label="Nothing in this range." />
                )
              ) : methods.length ? (
                <ChartCard title="By payment method">
                  <MoneyBarChart
                    data={methods}
                    bars={[
                      { key: "topUps", name: "Top-ups", color: "#16a34a" },
                      { key: "refunds", name: "Refunds", color: "#dc2626" },
                    ]}
                  />
                </ChartCard>
              ) : (
                <EmptyChart label="No card money taken or paid out in this range." />
              )}
            </div>
          ) : (
            <EmptyChart label={usage ? "No card spending in this range." : "No card top-ups or refunds in this range."} />
          )}
        </>
      ) : null}
    </ReportPanel>
  );
}
