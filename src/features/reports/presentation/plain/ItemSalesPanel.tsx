"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/presentation/components/data-table";
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
import {
  formatCount,
  formatMoney,
  formatQuantity,
  withRowIds,
} from "@/features/reports/presentation/report-utils";
import { getItemCategoryColumns, getItemSalesColumns } from "./dashboard-columns";
import { ReportPanel, Subsection, SummaryCard } from "./dashboard-ui";
import type { DashboardRange } from "./types";

const ALL = "__all__";
const PAGE_SIZE = 50;

const SORT_LABELS: Record<ItemSalesSortBy, string> = {
  netSales: "Net sales",
  grossSales: "Gross sales",
  quantitySold: "Quantity sold",
  refundAmount: "Refund amount",
  productName: "Product name",
  categoryName: "Category name",
};

export function ItemSalesPanel({ range }: { range: DashboardRange }) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);
  const [sortBy, setSortBy] = useState<ItemSalesSortBy>("netSales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [range.from, range.to, range.locationId, search, categoryId, sortBy, sortOrder]);

  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });
  const categories = getPaginatedItems(categoriesData);

  const query = useItemSales({
    ...range,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId: categoryId === ALL ? undefined : categoryId,
    sortBy,
    sortOrder,
  });
  const data = query.data;
  const categoryColumns = useMemo(() => getItemCategoryColumns(), []);
  const itemColumns = useMemo(() => getItemSalesColumns(), []);

  return (
    <ReportPanel
      title="Item sales"
      description="Every item sold in the range. Bill-level discounts are spread across the lines they applied to, so item net sales match the sales summary. Returns are counted on the day they were made."
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
            <SummaryCard
              label="Net after refunds"
              value={formatMoney(data.totals.netAfterRefunds)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Gross sales" value={formatMoney(data.totals.grossSales)} />
            <SummaryCard label="Line discounts" value={formatMoney(data.totals.lineDiscounts)} />
            <SummaryCard label="Order discounts" value={formatMoney(data.totals.orderDiscounts)} />
            <SummaryCard label="Refunds" value={formatMoney(data.totals.refundAmount)} />
          </div>
          <Subsection title="Categories">
            <DataTable
              data={withRowIds(data.categories, (row, index) => row.categoryId || `cat-${index}`)}
              columns={categoryColumns}
              emptyText="No category sales in this range."
            />
          </Subsection>
          <Subsection title="Items">
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="item-search">Search</Label>
                <Input
                  id="item-search"
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
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                >
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
            <DataTable
              data={withRowIds(data.items, (row, index) => row.variantId || `item-${index}`)}
              columns={itemColumns}
              emptyText="No item sales match these filters."
              currentPage={data.meta.page || page}
              totalPages={data.meta.totalPages}
              totalItems={data.meta.total}
              pageSize={data.meta.limit || PAGE_SIZE}
              onPageChange={setPage}
            />
          </Subsection>
        </>
      ) : null}
    </ReportPanel>
  );
}
