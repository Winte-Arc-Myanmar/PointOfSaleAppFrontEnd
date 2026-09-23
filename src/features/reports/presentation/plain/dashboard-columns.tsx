import type { DataTableColumn } from "@/presentation/components/data-table";
import type {
  ItemSalesCategory,
  ItemSalesRow,
  LoyaltyTierCount,
  LoyaltyTopMember,
  LoyaltyTransactionTypeTotal,
  MemberCardTierIssue,
  NamedPaymentTotal,
  OtherIncomeByDay,
  OtherIncomeByOutlet,
  OtherIncomeByPaymentMethod,
  OtherIncomeEntry,
  SalesSummaryByDay,
  SalesSummaryByHour,
  SalesSummaryByOutlet,
  SalesSummaryByServiceType,
  SalesSummaryRefundMethod,
} from "@/core/domain/entities/Report";
import {
  formatCount,
  formatHour,
  formatLabel,
  formatMoney,
  formatQuantity,
  formatShare,
} from "@/features/reports/presentation/report-utils";

function moneyCell(value: string) {
  return <span className="text-muted">{formatMoney(value)}</span>;
}

export function getSalesSummaryDayColumns(): DataTableColumn<SalesSummaryByDay>[] {
  return [
    { key: "businessDate", header: "Business date", render: (row) => row.businessDate },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => formatCount(row.orderCount),
    },
    {
      key: "netSales",
      header: "Net sales",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "grandTotal",
      header: "Grand total",
      className: "text-right",
      render: (row) => moneyCell(row.grandTotal),
    },
    {
      key: "refunds",
      header: "Refunds",
      className: "text-right",
      render: (row) => moneyCell(row.refunds),
    },
  ];
}

export function getSalesSummaryHourColumns(): DataTableColumn<SalesSummaryByHour>[] {
  return [
    { key: "hour", header: "Hour", render: (row) => formatHour(row.hour) },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => formatCount(row.orderCount),
    },
    {
      key: "netSales",
      header: "Net sales",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "grandTotal",
      header: "Grand total",
      className: "text-right",
      render: (row) => moneyCell(row.grandTotal),
    },
  ];
}

export function getSalesSummaryOutletColumns(): DataTableColumn<SalesSummaryByOutlet>[] {
  return [
    {
      key: "locationName",
      header: "Outlet",
      render: (row) => <span className="font-medium">{row.locationName || "—"}</span>,
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => formatCount(row.orderCount),
    },
    {
      key: "netSales",
      header: "Net sales",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "grandTotal",
      header: "Grand total",
      className: "text-right",
      render: (row) => moneyCell(row.grandTotal),
    },
  ];
}

export function getSalesSummaryServiceColumns(): DataTableColumn<SalesSummaryByServiceType>[] {
  return [
    {
      key: "serviceType",
      header: "Service",
      render: (row) => formatLabel(row.serviceType),
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => formatCount(row.orderCount),
    },
    {
      key: "netSales",
      header: "Net sales",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "grandTotal",
      header: "Grand total",
      className: "text-right",
      render: (row) => moneyCell(row.grandTotal),
    },
  ];
}

export function getRefundMethodColumns(): DataTableColumn<SalesSummaryRefundMethod>[] {
  return [
    {
      key: "refundMethod",
      header: "Method",
      render: (row) => formatLabel(row.refundMethod),
    },
    {
      key: "count",
      header: "Count",
      className: "text-right",
      render: (row) => formatCount(row.count),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => moneyCell(row.amount),
    },
  ];
}

export function getNamedPaymentColumns(): DataTableColumn<NamedPaymentTotal>[] {
  return [
    {
      key: "name",
      header: "Method",
      render: (row) => <span className="font-medium">{row.name || formatLabel(row.kind)}</span>,
    },
    { key: "kind", header: "Kind", render: (row) => formatLabel(row.kind) },
    {
      key: "count",
      header: "Count",
      className: "text-right",
      render: (row) => formatCount(row.count),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => moneyCell(row.amount),
    },
  ];
}

export function getItemCategoryColumns(): DataTableColumn<ItemSalesCategory>[] {
  return [
    {
      key: "categoryName",
      header: "Category",
      render: (row) => <span className="font-medium">{row.categoryName || "—"}</span>,
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => formatCount(row.orderCount),
    },
    {
      key: "quantitySold",
      header: "Qty sold",
      className: "text-right",
      render: (row) => formatQuantity(row.quantitySold),
    },
    {
      key: "netSales",
      header: "Net sales",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "shareOfNetSales",
      header: "Share",
      className: "text-right",
      render: (row) => formatShare(row.shareOfNetSales),
    },
    {
      key: "refundAmount",
      header: "Refunds",
      className: "text-right",
      render: (row) => moneyCell(row.refundAmount),
    },
  ];
}

export function getItemSalesColumns(): DataTableColumn<ItemSalesRow>[] {
  return [
    {
      key: "productName",
      header: "Product",
      render: (row) => <span className="font-medium">{row.productName || "—"}</span>,
    },
    {
      key: "variantSku",
      header: "SKU",
      render: (row) => <span className="font-mono text-xs text-muted">{row.variantSku || "—"}</span>,
    },
    { key: "categoryName", header: "Category", render: (row) => row.categoryName || "—" },
    {
      key: "quantitySold",
      header: "Qty",
      className: "text-right",
      render: (row) => formatQuantity(row.quantitySold),
    },
    {
      key: "averagePrice",
      header: "Avg price",
      className: "text-right",
      render: (row) => moneyCell(row.averagePrice),
    },
    {
      key: "grossSales",
      header: "Gross",
      className: "text-right",
      render: (row) => moneyCell(row.grossSales),
    },
    {
      key: "netSales",
      header: "Net",
      className: "text-right",
      render: (row) => moneyCell(row.netSales),
    },
    {
      key: "shareOfNetSales",
      header: "Share",
      className: "text-right",
      render: (row) => formatShare(row.shareOfNetSales),
    },
    {
      key: "refundAmount",
      header: "Refunds",
      className: "text-right",
      render: (row) => moneyCell(row.refundAmount),
    },
    {
      key: "netAfterRefunds",
      header: "Net after refunds",
      className: "text-right",
      render: (row) => moneyCell(row.netAfterRefunds),
    },
  ];
}

export function getOtherIncomeDayColumns(): DataTableColumn<OtherIncomeByDay>[] {
  return [
    { key: "businessDate", header: "Business date", render: (row) => row.businessDate },
    {
      key: "income",
      header: "Income",
      className: "text-right",
      render: (row) => moneyCell(row.income),
    },
    {
      key: "expense",
      header: "Expense",
      className: "text-right",
      render: (row) => moneyCell(row.expense),
    },
    {
      key: "net",
      header: "Net",
      className: "text-right",
      render: (row) => moneyCell(row.net),
    },
  ];
}

export function getOtherIncomeMethodColumns(): DataTableColumn<OtherIncomeByPaymentMethod>[] {
  return [
    {
      key: "name",
      header: "Method",
      render: (row) => <span className="font-medium">{row.name || "—"}</span>,
    },
    { key: "kind", header: "Kind", render: (row) => formatLabel(row.kind) },
    {
      key: "income",
      header: "Income",
      className: "text-right",
      render: (row) => moneyCell(row.income),
    },
    {
      key: "expense",
      header: "Expense",
      className: "text-right",
      render: (row) => moneyCell(row.expense),
    },
  ];
}

export function getOtherIncomeOutletColumns(): DataTableColumn<OtherIncomeByOutlet>[] {
  return [
    {
      key: "locationName",
      header: "Outlet",
      render: (row) => <span className="font-medium">{row.locationName || "—"}</span>,
    },
    {
      key: "income",
      header: "Income",
      className: "text-right",
      render: (row) => moneyCell(row.income),
    },
    {
      key: "expense",
      header: "Expense",
      className: "text-right",
      render: (row) => moneyCell(row.expense),
    },
    {
      key: "net",
      header: "Net",
      className: "text-right",
      render: (row) => moneyCell(row.net),
    },
  ];
}

function formatWhen(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function getOtherIncomeEntryColumns(): DataTableColumn<OtherIncomeEntry>[] {
  return [
    { key: "businessDate", header: "Date", render: (row) => row.businessDate || "—" },
    { key: "type", header: "Type", render: (row) => formatLabel(row.type) },
    { key: "reason", header: "Reason", render: (row) => formatLabel(row.reason) },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => moneyCell(row.amount),
    },
    { key: "locationName", header: "Outlet", render: (row) => row.locationName || "—" },
    { key: "paymentMethodName", header: "Method", render: (row) => row.paymentMethodName || "—" },
    { key: "reference", header: "Reference", render: (row) => row.reference || "—" },
    { key: "staffName", header: "Staff", render: (row) => row.staffName || "—" },
    { key: "approverName", header: "Approver", render: (row) => row.approverName || "—" },
    { key: "createdAt", header: "Recorded", render: (row) => formatWhen(row.createdAt) },
    { key: "notes", header: "Notes", render: (row) => row.notes || "—" },
  ];
}

export function getIssuedTierColumns(): DataTableColumn<MemberCardTierIssue>[] {
  return [
    { key: "tier", header: "Tier", render: (row) => row.tier || "—" },
    {
      key: "count",
      header: "Issued",
      className: "text-right",
      render: (row) => formatCount(row.count),
    },
    {
      key: "preloadValue",
      header: "Preload",
      className: "text-right",
      render: (row) => moneyCell(row.preloadValue),
    },
  ];
}

export function getSpendOutletColumns(): DataTableColumn<{
  locationId: string;
  locationName: string;
  count: number;
  amount: string;
}>[] {
  return [
    {
      key: "locationName",
      header: "Outlet",
      render: (row) => <span className="font-medium">{row.locationName || "—"}</span>,
    },
    {
      key: "count",
      header: "Spend count",
      className: "text-right",
      render: (row) => formatCount(row.count),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => moneyCell(row.amount),
    },
  ];
}

export function getSpendTierColumns(): DataTableColumn<{ tier: string; amount: string }>[] {
  return [
    { key: "tier", header: "Tier", render: (row) => row.tier || "—" },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => moneyCell(row.amount),
    },
  ];
}

export function getLoyaltyTypeColumns(): DataTableColumn<LoyaltyTransactionTypeTotal>[] {
  return [
    {
      key: "transactionType",
      header: "Type",
      render: (row) => formatLabel(row.transactionType),
    },
    {
      key: "entries",
      header: "Entries",
      className: "text-right",
      render: (row) => formatCount(row.entries),
    },
    {
      key: "points",
      header: "Points",
      className: "text-right",
      render: (row) => formatCount(row.points),
    },
  ];
}

export function getLoyaltyTierColumns(): DataTableColumn<LoyaltyTierCount>[] {
  return [
    {
      key: "loyaltyTier",
      header: "Tier",
      render: (row) => formatLabel(row.loyaltyTier),
    },
    {
      key: "members",
      header: "Members",
      className: "text-right",
      render: (row) => formatCount(row.members),
    },
  ];
}

export function getTopMemberColumns(): DataTableColumn<LoyaltyTopMember>[] {
  return [
    {
      key: "name",
      header: "Member",
      render: (row) => <span className="font-medium">{row.name || "—"}</span>,
    },
    { key: "phone", header: "Phone", render: (row) => row.phone || "—" },
    { key: "loyaltyTier", header: "Tier", render: (row) => formatLabel(row.loyaltyTier) },
    {
      key: "pointsEarned",
      header: "Earned in range",
      className: "text-right",
      render: (row) => formatCount(row.pointsEarned),
    },
    {
      key: "pointsBalance",
      header: "Balance",
      className: "text-right",
      render: (row) => formatCount(row.pointsBalance),
    },
  ];
}
