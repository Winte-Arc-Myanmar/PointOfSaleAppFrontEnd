import type { DataTableColumn } from "@/presentation/components/data-table";
import type {
  PaymentBreakdown,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
  ServerPerformance,
  ZReportPayment,
} from "@/core/domain/entities/Report";
import { formatHour, formatMoney, formatQuantity } from "./report-utils";

export function getPaymentBreakdownColumns(): DataTableColumn<PaymentBreakdown>[] {
  return [
    {
      key: "method",
      header: "Method",
      render: (row) => <span className="font-medium">{row.method}</span>,
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.total)}</span>,
    },
  ];
}

export function getSalesByCategoryColumns(): DataTableColumn<SalesByCategory>[] {
  return [
    {
      key: "categoryName",
      header: "Category",
      render: (row) => <span className="font-medium">{row.categoryName}</span>,
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => <span>{row.orderCount}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.totalRevenue)}</span>,
    },
  ];
}

export function getSalesByItemColumns(): DataTableColumn<SalesByItem>[] {
  return [
    {
      key: "productName",
      header: "Product",
      render: (row) => <span className="font-medium">{row.productName}</span>,
    },
    {
      key: "variantSku",
      header: "SKU",
      render: (row) => <span className="text-muted font-mono text-xs">{row.variantSku}</span>,
    },
    {
      key: "quantitySold",
      header: "Qty sold",
      className: "text-right",
      render: (row) => <span>{formatQuantity(row.quantitySold)}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.totalRevenue)}</span>,
    },
  ];
}

export function getSalesByHourColumns(): DataTableColumn<SalesByHour>[] {
  return [
    {
      key: "hour",
      header: "Hour",
      render: (row) => <span className="font-medium">{formatHour(row.hour)}</span>,
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => <span>{row.orderCount}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.totalRevenue)}</span>,
    },
  ];
}

export function getServerPerformanceColumns(): DataTableColumn<ServerPerformance>[] {
  return [
    {
      key: "waiterName",
      header: "Server",
      render: (row) => <span className="font-medium">{row.waiterName}</span>,
    },
    {
      key: "orderCount",
      header: "Orders",
      className: "text-right",
      render: (row) => <span>{row.orderCount}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.totalRevenue)}</span>,
    },
    {
      key: "totalTips",
      header: "Tips",
      className: "text-right",
      render: (row) => <span>{formatMoney(row.totalTips)}</span>,
    },
    {
      key: "averageTicket",
      header: "Avg ticket",
      className: "text-right",
      render: (row) => <span>{formatMoney(row.averageTicket)}</span>,
    },
  ];
}

export function getZReportPaymentColumns(): DataTableColumn<ZReportPayment>[] {
  return [
    {
      key: "method",
      header: "Method",
      render: (row) => <span className="font-medium">{row.method}</span>,
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      render: (row) => <span className="text-muted">{formatMoney(row.total)}</span>,
    },
    {
      key: "tip",
      header: "Tips",
      className: "text-right",
      render: (row) => <span>{formatMoney(row.tip)}</span>,
    },
  ];
}
