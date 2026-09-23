"use client";

import { useMemo, useState } from "react";
import { BarChart3, Printer } from "lucide-react";
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
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useDailySales, useZReport } from "@/presentation/hooks/useReports";
import { useThermalPrint } from "@/presentation/hooks/useThermalPrint";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { ThermalPaperWidth } from "@/core/domain/entities/ThermalPrint";
import { isDayReportTab, ReportTabBar, type ReportTabId } from "./ReportTabBar";
import { startOfMonth, toDateInputValue } from "./report-utils";
import { ItemSalesPanel } from "./plain/ItemSalesPanel";
import { LoyaltyPointsPanel } from "./plain/LoyaltyPointsPanel";
import { MemberCardsPanel } from "./plain/MemberCardsPanel";
import {
  DailySalesPanel,
  SalesByCategoryPanel,
  SalesByHourPanel,
  SalesByItemPanel,
  ServerPerformancePanel,
  ZReportPanel,
} from "./plain/OperationsPanels";
import { OtherIncomePanel } from "./plain/OtherIncomePanel";
import { SalesSummaryPanel } from "./plain/SalesSummaryPanel";

const ALL_OUTLETS = "__all__";

export function ReportsDashboard() {
  const today = useMemo(() => new Date(), []);
  const toast = useToast();
  const { isPrinting, printZReport, printDailySales } = useThermalPrint();
  const [locationId, setLocationId] = useState(ALL_OUTLETS);
  const [date, setDate] = useState(toDateInputValue(today));
  const [from, setFrom] = useState(startOfMonth(today));
  const [to, setTo] = useState(toDateInputValue(today));
  const [paperWidthMm, setPaperWidthMm] = useState<ThermalPaperWidth>(80);
  const [tab, setTab] = useState<ReportTabId>("sales-summary");

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const selectedLocation = locations.find((location) => String(location.id) === locationId);
  const selectedLocationId = locationId === ALL_OUTLETS ? undefined : locationId;
  const rangeInvalid = from > to;
  const range = rangeInvalid ? null : { from, to, locationId: selectedLocationId };
  const day = date ? { date, locationId: selectedLocationId } : null;
  const needsDay = isDayReportTab(tab);

  const dailySales = useDailySales(day);
  const zReport = useZReport(day);
  const printContext = { locationName: selectedLocation?.name };

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
    if (result.success) toast.success(result.message ?? "Daily sales sent to printer.");
    else toast.error(result.message ?? "Daily sales print failed.");
  }

  async function handlePrintZReport(mode: "browser" | "raw-escpos") {
    if (!zReport.data) {
      toast.warning("Load the Z-report before printing.");
      return;
    }
    const result = await printZReport(zReport.data, printContext, {
      paperWidthMm,
      mode,
      cut: true,
    });
    if (result.success) toast.success(result.message ?? "Z-report sent to printer.");
    else toast.error(result.message ?? "Z-report print failed.");
  }

  return (
    <div className="space-y-6">
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
              <Label htmlFor="report-location">Outlet</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="report-location">
                  <SelectValue placeholder="All outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OUTLETS}>All outlets</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={String(location.id)} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-from">From</Label>
              <Input id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-to">To</Label>
              <Input id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-date">Business date</Label>
              <Input id="report-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <p className="text-xs text-muted">Daily sales, by hour, and Z-report.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted">Thermal paper</p>
              <Select
                value={String(paperWidthMm)}
                onValueChange={(value) => setPaperWidthMm(Number(value) as ThermalPaperWidth)}
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
            <Button type="button" variant="outline" disabled={isPrinting || !dailySales.data} onClick={() => void handlePrintDaily("browser")}>
              <Printer className="mr-2 h-4 w-4" />
              Print daily sales
            </Button>
            <Button type="button" variant="outline" disabled={isPrinting || !zReport.data} onClick={() => void handlePrintZReport("browser")}>
              <Printer className="mr-2 h-4 w-4" />
              Print Z-report
            </Button>
            <Button type="button" variant="outline" disabled={isPrinting || !zReport.data} onClick={() => void handlePrintZReport("raw-escpos")}>
              ESC/POS Z-report
            </Button>
            <Button type="button" variant="outline" disabled={isPrinting || !dailySales.data} onClick={() => void handlePrintDaily("raw-escpos")}>
              ESC/POS daily
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print page
            </Button>
          </div>
        </CardContent>
      </Card>

      <ReportTabBar value={tab} onChange={setTab} className="print:hidden" />

      {rangeInvalid && !needsDay ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted">
          The start date has to be on or before the end date.
        </div>
      ) : null}

      <div data-print-reports className="space-y-8">
        {!rangeInvalid && tab === "sales-summary" && range ? <SalesSummaryPanel range={range} /> : null}
        {!rangeInvalid && tab === "item-sales" && range ? <ItemSalesPanel range={range} /> : null}
        {!rangeInvalid && tab === "other-income" && range ? <OtherIncomePanel range={range} /> : null}
        {!rangeInvalid && tab === "member-cards" && range ? <MemberCardsPanel range={range} /> : null}
        {!rangeInvalid && tab === "loyalty" && range ? <LoyaltyPointsPanel range={range} /> : null}
        {!rangeInvalid && tab === "category" && range ? <SalesByCategoryPanel range={range} /> : null}
        {!rangeInvalid && tab === "top-items" && range ? <SalesByItemPanel range={range} /> : null}
        {!rangeInvalid && tab === "servers" && range ? <ServerPerformancePanel range={range} /> : null}
        {tab === "daily" && day ? <DailySalesPanel day={day} /> : null}
        {tab === "hour" && day ? <SalesByHourPanel day={day} /> : null}
        {tab === "z-report" && day ? <ZReportPanel day={day} /> : null}
      </div>
    </div>
  );
}
