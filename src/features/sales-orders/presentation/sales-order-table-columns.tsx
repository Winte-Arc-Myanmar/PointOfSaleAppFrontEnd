import type { DataTableColumn } from "@/presentation/components/data-table";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";

function formatMoney(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function getSalesOrderTableColumns(): DataTableColumn<SalesOrder>[] {
  return [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
      className: "min-w-[120px] max-w-[160px]",
      render: (o) => (
        <span className="font-medium text-foreground truncate" title={o.orderNumber}>
          {o.orderNumber}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "min-w-[90px] max-w-[120px]",
      render: (o) => <span className="text-muted">{o.status}</span>,
    },
    {
      key: "salesChannel",
      header: "Channel",
      className: "min-w-[80px] max-w-[120px]",
      render: (o) => <span className="text-muted">{o.salesChannel}</span>,
    },
    {
      key: "customerId",
      header: "Customer",
      className: "min-w-[120px] max-w-[180px]",
      render: (o) => (
        <span className="font-mono text-xs text-muted truncate" title={o.customerId}>
          {o.customerId}
        </span>
      ),
    },
    {
      key: "grandTotal",
      header: "Grand total",
      className: "min-w-[90px] max-w-[130px]",
      render: (o) => <span className="text-muted">{formatMoney(o.grandTotal)}</span>,
    },
  ];
}

