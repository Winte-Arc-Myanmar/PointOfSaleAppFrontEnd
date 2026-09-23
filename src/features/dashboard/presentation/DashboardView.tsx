"use client";

import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  isDayReportTab,
  ReportTabBar,
  type ReportTabId,
} from "@/features/reports/presentation/ReportTabBar";
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
import { SalesSummaryChart } from "./SalesSummaryChart";

const ALL_OUTLETS = "__all__";

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutDashboard className="h-5 w-5 text-mint" />
            Dashboard filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-location">Outlet</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger id="dashboard-location">
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
            <p className="text-xs text-muted">Leave on all outlets to include every outlet you can see.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-from">From</Label>
            <Input
              id="dashboard-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-to">To</Label>
            <Input
              id="dashboard-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
            <p className="text-xs text-muted">Business dates, last day included.</p>
          </div>
          {needsDay ? (
            <div className="space-y-2">
              <Label htmlFor="dashboard-date">Business date</Label>
              <Input
                id="dashboard-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <p className="text-xs text-muted">Used by daily sales, by hour, and Z-report.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ReportTabBar value={tab} onChange={setTab} />

      {rangeInvalid && !needsDay ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted">
          The start date has to be on or before the end date.
        </div>
      ) : null}

      {!rangeInvalid && tab === "sales-summary" && range ? <SalesSummaryChart range={range} /> : null}
      {!rangeInvalid && tab === "item-sales" && range ? <ItemSalesChart range={range} /> : null}
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
