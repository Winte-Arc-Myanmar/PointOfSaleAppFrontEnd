"use client";

import { useEffect, useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCategories } from "@/presentation/hooks/useCategories";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useItemSales } from "@/presentation/hooks/useReports";
import {
  ITEM_SALES_SORT_FIELDS,
  type ItemSalesSortBy,
} from "@/core/domain/repositories/IReportRepository";
import { formatCount, formatMoney, formatQuantity } from "@/features/reports/presentation/report-utils";
import { ReportPanel, SummaryCard } from "@/features/reports/presentation/plain/dashboard-ui";
import { ChartCard, EmptyChart, MoneyBarChart, SharePieChart, chartAmount } from "./charts";
import type { DashboardRange } from "./types";

const ALL = "__all__";
const SORT_LABELS: Record<ItemSalesSortBy, string> = {
  netSales: "Net sales",
  grossSales: "Gross sales",
  quantitySold: "Quantity sold",
  refundAmount: "Refund amount",
  productName: "Product name",
  categoryName: "Category name",
};

export function ItemSalesChart({ range }: { range: DashboardRange }) {
  const [page] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);
  const [sortBy, setSortBy] = useState<ItemSalesSortBy>("netSales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });
  const categories = getPaginatedItems(categoriesData);
  const query = useItemSales({
    ...range,
    page,
    limit: 12,
    search: search || undefined,
    categoryId: categoryId === ALL ? undefined : categoryId,
    sortBy,
    sortOrder,
  });
  const data = query.data;
  const items = (data?.items ?? []).map((row) => ({
    name: row.productName || row.variantSku || "Item",
    netSales: chartAmount(row.netSales),
  }));
  const categoryShare = (data?.categories ?? [])
    .map((row) => ({ name: row.categoryName || "Uncategorized", value: chartAmount(row.netSales) }))
    .filter((row) => row.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="chart-item-search">Search</Label>
          <Input
            id="chart-item-search"
            value={searchInput}
            placeholder="Product name or SKU"
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={String(category.id)} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort by</Label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as ItemSalesSortBy)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_SALES_SORT_FIELDS.map((field) => (
                <SelectItem key={field} value={field}>
                  {SORT_LABELS[field]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Order</Label>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ReportPanel
        title="Item sales"
        description="Top items and category share. The full item list is on Reports."
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
      >
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Items" value={formatCount(data.totals.itemCount)} />
              <SummaryCard label="Qty sold" value={formatQuantity(data.totals.quantitySold)} />
              <SummaryCard label="Net sales" value={formatMoney(data.totals.netSales)} />
              <SummaryCard label="Net after refunds" value={formatMoney(data.totals.netAfterRefunds)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {items.length ? (
                <ChartCard title="Top items by net sales" height={360}>
                  <MoneyBarChart
                    data={items}
                    layout="vertical"
                    bars={[{ key: "netSales", name: "Net sales", color: "#16a34a" }]}
                  />
                </ChartCard>
              ) : (
                <EmptyChart label="No item sales match these filters." />
              )}
              {categoryShare.length ? (
                <ChartCard title="Category share of net sales">
                  <SharePieChart data={categoryShare} />
                </ChartCard>
              ) : (
                <EmptyChart label="No category sales in this range." />
              )}
            </div>
          </>
        ) : null}
      </ReportPanel>
    </div>
  );
}
