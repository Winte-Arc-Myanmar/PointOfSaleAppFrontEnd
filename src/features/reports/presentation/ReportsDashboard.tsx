"use client";

import { useMemo, useState } from "react";
import { BarChart3, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { AppLoader } from "@/presentation/components/loader";
import { DataTable } from "@/presentation/components/data-table";
import { DetailRows } from "@/presentation/components/detail";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useLocations } from "@/presentation/hooks/useLocations";
import {
  useDailySales,
  useSalesByCategory,
  useSalesByHour,
  useSalesByItem,
  useServerPerformance,
  useZReport,
} from "@/presentation/hooks/useReports";
import { useThermalPrint } from "@/presentation/hooks/useThermalPrint";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { ThermalPaperWidth } from "@/core/domain/entities/ThermalPrint";
import { cn } from "@/lib/utils";
import {
  getPaymentBreakdownColumns,
  getSalesByCategoryColumns,
  getSalesByHourColumns,
  getSalesByItemColumns,
  getServerPerformanceColumns,
  getZReportPaymentColumns,
} from "./report-table-columns";
import {
  formatMoney,
  startOfMonth,
  toDateInputValue,
  toRangeEnd,
  toRangeStart,
  withRowIds,
} from "./report-utils";

const TOP_ITEMS_LIMIT = 10;
const NONE = "__none__";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function ReportSection({
  title,
  isLoading,
  isFetching,
  error,
  onRetry,
  children,
}: {
  title: string;
  isLoading: boolean;
  isFetching?: boolean;
  error: Error | null;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const showSoftFetch = Boolean(isFetching && !isLoading);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <h3 className="section-label">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4", showSoftFetch && "animate-spin")} />
        </Button>
      </div>
      <h3 className="section-label hidden print:block">{title}</h3>
      {isLoading ? (
        <div className="flex justify-center py-8 print:hidden">
          <AppLoader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm print:hidden">
          <p className="text-destructive">Failed to load {title.toLowerCase()}.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={cn(showSoftFetch && "opacity-70 transition-opacity print:opacity-100")}>
          {children}
        </div>
      )}
    </section>
  );
}

export function ReportsDashboard() {
  const today = useMemo(() => new Date(), []);
  const toast = useToast();
  const { isPrinting, printZReport, printDailySales } = useThermalPrint();
  const [locationId, setLocationId] = useState(NONE);
  const [date, setDate] = useState(toDateInputValue(today));
  const [fromDate, setFromDate] = useState(startOfMonth(today));
  const [toDate, setToDate] = useState(toDateInputValue(today));
  const [paperWidthMm, setPaperWidthMm] = useState<ThermalPaperWidth>(80);

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const selectedLocation = locations.find(
    (location) => String(location.id) === locationId,
  );
  const printContext = {
    locationName: selectedLocation?.name,
  };

  const dailyParams =
    locationId !== NONE ? { locationId, date } : null;
  const rangeParams =
    locationId !== NONE
      ? {
          locationId,
          fromDate: toRangeStart(fromDate),
          toDate: toRangeEnd(toDate),
          limit: TOP_ITEMS_LIMIT,
        }
      : null;

  const dailySales = useDailySales(dailyParams);
  const salesByHour = useSalesByHour(dailyParams);
  const salesByCategory = useSalesByCategory(rangeParams);
  const salesByItem = useSalesByItem(rangeParams);
  const serverPerformance = useServerPerformance(rangeParams);
  const zReport = useZReport(dailyParams);

  const paymentColumns = useMemo(() => getPaymentBreakdownColumns(), []);
  const categoryColumns = useMemo(() => getSalesByCategoryColumns(), []);
  const itemColumns = useMemo(() => getSalesByItemColumns(), []);
  const hourColumns = useMemo(() => getSalesByHourColumns(), []);
  const serverColumns = useMemo(() => getServerPerformanceColumns(), []);
  const zPaymentColumns = useMemo(() => getZReportPaymentColumns(), []);

  const locationReady = locationId !== NONE;
  const canPrintDaily = Boolean(dailySales.data);
  const canPrintZ = Boolean(zReport.data);

  async function handlePrintDaily(mode: "browser" | "raw-escpos") {
    if (!dailySales.data) {
      toast.warning("Load daily sales before printing.");
      return;
    }
    const result = await printDailySales(dailySales.data, printContext, {
      paperWidthMm,
      mode,
      cut: true,
    });
    if (result.success) {
      toast.success(result.message ?? "Daily sales sent to printer.");
    } else {
      toast.error(result.message ?? "Daily sales print failed.");
    }
  }

  async function handlePrintZReport(mode: "browser" | "raw-escpos") {
    if (!zReport.data) {
      toast.warning("Load Z-report before printing.");
      return;
    }
    const result = await printZReport(zReport.data, printContext, {
      paperWidthMm,
      mode,
      cut: true,
    });
    if (result.success) {
      toast.success(result.message ?? "Z-report sent to printer.");
    } else {
      toast.error(result.message ?? "Z-report print failed.");
    }
  }

  function handlePrintPage() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="space-y-8">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-mint" />
            Report filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-location">Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="report-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Select location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={String(location.id)} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-date">Report date</Label>
              <Input
                id="report-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <p className="text-xs text-muted">Daily sales, by hour, Z-report</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-from">Range from</Label>
              <Input
                id="report-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-to">Range to</Label>
              <Input
                id="report-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <p className="text-xs text-muted">Category, items, servers</p>
            </div>
          </div>

          {locationReady ? (
            <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted">Thermal paper</p>
                <Select
                  value={String(paperWidthMm)}
                  onValueChange={(value) =>
                    setPaperWidthMm(Number(value) as ThermalPaperWidth)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">80mm thermal</SelectItem>
                    <SelectItem value="58">58mm thermal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting || !canPrintDaily}
                onClick={() => void handlePrintDaily("browser")}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print daily sales
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting || !canPrintZ}
                onClick={() => void handlePrintZReport("browser")}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Z-report
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting || !canPrintZ}
                onClick={() => void handlePrintZReport("raw-escpos")}
              >
                ESC/POS Z-report
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting || !canPrintDaily}
                onClick={() => void handlePrintDaily("raw-escpos")}
              >
                ESC/POS daily
              </Button>
              <Button type="button" variant="outline" onClick={handlePrintPage}>
                Print page
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!locationReady ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted print:hidden">
          Select a location to load sales reports.
        </div>
      ) : (
        <div data-print-reports className="space-y-8">
          <div className="hidden space-y-1 print:block">
            <p className="text-lg font-bold">Sales reports</p>
            <p className="text-sm">
              {selectedLocation?.name ?? "Location"} · Date {date} · Range{" "}
              {fromDate} → {toDate}
            </p>
          </div>

          <ReportSection
            title="Daily sales summary"
            isLoading={dailySales.isLoading}
            isFetching={dailySales.isFetching}
            error={dailySales.error}
            onRetry={() => dailySales.refetch()}
          >
            {dailySales.data ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryCard label="Orders" value={String(dailySales.data.orderCount)} />
                  <SummaryCard label="Grand total" value={formatMoney(dailySales.data.grandTotal)} />
                  <SummaryCard label="Average ticket" value={formatMoney(dailySales.data.averageTicket)} />
                  <SummaryCard label="Tips" value={formatMoney(dailySales.data.tipAmount)} />
                </div>
                <DetailRows
                  rows={[
                    { label: "Subtotal", value: formatMoney(dailySales.data.subtotal) },
                    { label: "Tax", value: formatMoney(dailySales.data.totalTax) },
                    { label: "Discount", value: formatMoney(dailySales.data.totalDiscount) },
                    { label: "Service charge", value: formatMoney(dailySales.data.serviceCharge) },
                  ]}
                />
                <DataTable
                  data={withRowIds(dailySales.data.paymentBreakdown, (row) => row.paymentMethodId)}
                  columns={paymentColumns}
                  emptyText="No payment breakdown for this day."
                />
              </div>
            ) : null}
          </ReportSection>

          <ReportSection
            title="Sales by hour"
            isLoading={salesByHour.isLoading}
            isFetching={salesByHour.isFetching}
            error={salesByHour.error}
            onRetry={() => salesByHour.refetch()}
          >
            <DataTable
              data={withRowIds(salesByHour.data ?? [], (row) => `hour-${row.hour}`)}
              columns={hourColumns}
              emptyText="No hourly sales for this day."
            />
          </ReportSection>

          <ReportSection
            title="Sales by category"
            isLoading={salesByCategory.isLoading}
            isFetching={salesByCategory.isFetching}
            error={salesByCategory.error}
            onRetry={() => salesByCategory.refetch()}
          >
            <DataTable
              data={withRowIds(salesByCategory.data ?? [], (row) => row.categoryId)}
              columns={categoryColumns}
              emptyText="No category sales in this range."
            />
          </ReportSection>

          <ReportSection
            title="Top items by revenue"
            isLoading={salesByItem.isLoading}
            isFetching={salesByItem.isFetching}
            error={salesByItem.error}
            onRetry={() => salesByItem.refetch()}
          >
            <DataTable
              data={withRowIds(salesByItem.data ?? [], (row) => row.variantId)}
              columns={itemColumns}
              emptyText="No item sales in this range."
            />
          </ReportSection>

          <ReportSection
            title="Server performance"
            isLoading={serverPerformance.isLoading}
            isFetching={serverPerformance.isFetching}
            error={serverPerformance.error}
            onRetry={() => serverPerformance.refetch()}
          >
            <DataTable
              data={withRowIds(serverPerformance.data ?? [], (row) => row.waiterId)}
              columns={serverColumns}
              emptyText="No server performance data in this range."
            />
          </ReportSection>

          <ReportSection
            title="Z-Report"
            isLoading={zReport.isLoading}
            isFetching={zReport.isFetching}
            error={zReport.error}
            onRetry={() => zReport.refetch()}
          >
            {zReport.data ? (
              <div className="space-y-6">
                <DetailRows
                  rows={[
                    { label: "Date", value: zReport.data.date },
                    { label: "Completed orders", value: String(zReport.data.orders.completed) },
                    { label: "Voided orders", value: String(zReport.data.orders.voided) },
                    { label: "Refunded orders", value: String(zReport.data.orders.refunded) },
                  ]}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SummaryCard label="Grand total" value={formatMoney(zReport.data.totals.grandTotal)} />
                  <SummaryCard label="Subtotal" value={formatMoney(zReport.data.totals.subtotal)} />
                  <SummaryCard label="Tax" value={formatMoney(zReport.data.totals.totalTax)} />
                  <SummaryCard label="Discount" value={formatMoney(zReport.data.totals.totalDiscount)} />
                  <SummaryCard label="Tips" value={formatMoney(zReport.data.totals.tipAmount)} />
                  <SummaryCard
                    label="Service charge"
                    value={formatMoney(zReport.data.totals.serviceCharge)}
                  />
                </div>
                <DataTable
                  data={withRowIds(zReport.data.payments, (row) => row.paymentMethodId)}
                  columns={zPaymentColumns}
                  emptyText="No payments recorded."
                />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-muted">Top items</h4>
                    <DataTable
                      data={withRowIds(zReport.data.topItems, (row) => row.variantId)}
                      columns={itemColumns}
                      emptyText="No top items."
                    />
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-muted">By category</h4>
                    <DataTable
                      data={withRowIds(zReport.data.byCategory, (row) => row.categoryId)}
                      columns={categoryColumns}
                      emptyText="No category breakdown."
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </ReportSection>
        </div>
      )}
    </div>
  );
}
