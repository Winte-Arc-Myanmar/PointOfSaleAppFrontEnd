"use client";

import { useMemo, useState } from "react";
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  isDayReportTab,
  ReportTabBar,
  type ReportTabId,
} from "@/features/reports/presentation/ReportTabBar";
import {
  ALL_OUTLETS,
  ReportFilterBar,
} from "@/features/reports/presentation/ReportFilterBar";
import {
  startOfMonth,
  toDateInputValue,
} from "@/features/reports/presentation/report-utils";
import { ItemSalesChart } from "./ItemSalesChart";
import { LoyaltyChart } from "./LoyaltyChart";
import { MemberCardsChart } from "./MemberCardsChart";
import {
  DailySalesChart,
  SalesByCategoryChart,
  SalesByHourChart,
  SalesByItemChart,
  ServerPerformanceChart,
  ZReportChart,
} from "./OperationsCharts";
import { OtherIncomeChart } from "./OtherIncomeChart";
import {
  BarCategoriesChart,
  CardActivityChart,
  ShiftsChart,
  HostessesChart,
  KtvSessionsChart,
  PosBillsChart,
  SpaMenuChart,
} from "./PosCharts";
import { SalesSummaryChart } from "./SalesSummaryChart";

export function DashboardView() {
  const today = useMemo(() => new Date(), []);
  const [locationId, setLocationId] = useState(ALL_OUTLETS);
  const [from, setFrom] = useState(startOfMonth(today));
  const [to, setTo] = useState(toDateInputValue(today));
  const [date, setDate] = useState(toDateInputValue(today));
  const [tab, setTab] = useState<ReportTabId>("sales-summary");

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const selectedLocationId = locationId === ALL_OUTLETS ? undefined : locationId;
  const rangeInvalid = from > to;
  const range = rangeInvalid
    ? null
    : { from, to, locationId: selectedLocationId };
  const day = date ? { date, locationId: selectedLocationId } : null;
  const needsDay = isDayReportTab(tab);

  return (
    <div className="space-y-6">
      <ReportFilterBar
        locations={locations}
        locationId={locationId}
        onLocationChange={setLocationId}
        mode={needsDay ? "day" : "range"}
        from={from}
        to={to}
        onRangeChange={(nextFrom, nextTo) => {
          setFrom(nextFrom);
          setTo(nextTo);
        }}
        date={date}
        onDateChange={setDate}
      />

      <ReportTabBar value={tab} onChange={setTab} />

      {rangeInvalid && !needsDay ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted">
          The start date has to be on or before the end date.
        </div>
      ) : null}

      {!rangeInvalid && tab === "sales-summary" && range ? <SalesSummaryChart range={range} /> : null}
      {!rangeInvalid && tab === "item-sales" && range ? <ItemSalesChart range={range} /> : null}
      {!rangeInvalid && tab === "spa-summary" && range ? <SalesSummaryChart range={range} posType="SPA" /> : null}
      {!rangeInvalid && tab === "spa-bills" && range ? <PosBillsChart range={range} posType="SPA" /> : null}
      {!rangeInvalid && tab === "spa-menu" && range ? <SpaMenuChart range={range} /> : null}
      {!rangeInvalid && tab === "ktv-summary" && range ? <SalesSummaryChart range={range} posType="KTV" /> : null}
      {!rangeInvalid && tab === "ktv-bills" && range ? <PosBillsChart range={range} posType="KTV" /> : null}
      {!rangeInvalid && tab === "ktv-sessions" && range ? <KtvSessionsChart range={range} /> : null}
      {!rangeInvalid && tab === "ktv-hostesses" && range ? <HostessesChart range={range} /> : null}
      {!rangeInvalid && tab === "bar-summary" && range ? <SalesSummaryChart range={range} posType="BAR" /> : null}
      {!rangeInvalid && tab === "bar-bills" && range ? <PosBillsChart range={range} posType="BAR" /> : null}
      {!rangeInvalid && tab === "bar-categories" && range ? <BarCategoriesChart range={range} /> : null}
      {!rangeInvalid && tab === "shifts" && range ? <ShiftsChart range={range} /> : null}
      {!rangeInvalid && tab === "card-usage" && range ? <CardActivityChart key="usage" range={range} kind="USAGE" /> : null}
      {!rangeInvalid && tab === "card-money" && range ? <CardActivityChart key="money" range={range} kind="MONEY" /> : null}
      {!rangeInvalid && tab === "other-income" && range ? <OtherIncomeChart range={range} /> : null}
      {!rangeInvalid && tab === "member-cards" && range ? <MemberCardsChart range={range} /> : null}
      {!rangeInvalid && tab === "loyalty" && range ? <LoyaltyChart range={range} /> : null}
      {!rangeInvalid && tab === "category" && range ? <SalesByCategoryChart range={range} /> : null}
      {!rangeInvalid && tab === "top-items" && range ? <SalesByItemChart range={range} /> : null}
      {!rangeInvalid && tab === "servers" && range ? <ServerPerformanceChart range={range} /> : null}
      {tab === "daily" && day ? <DailySalesChart day={day} /> : null}
      {tab === "hour" && day ? <SalesByHourChart day={day} /> : null}
      {tab === "z-report" && day ? <ZReportChart day={day} /> : null}
    </div>
  );
}
