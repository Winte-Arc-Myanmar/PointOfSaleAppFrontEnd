import type { DataTableColumn } from "@/presentation/components/data-table";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";

function formatMoney(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

type CounterOrderTableColumnOptions = {
  onView?: (order: SalesOrder) => void;
  locationLabelById?: Record<string, string>;
};

export function getCounterOrderTableColumns(
  options: CounterOrderTableColumnOptions = {},
): DataTableColumn<SalesOrder>[] {
  const { onView, locationLabelById = {} } = options;

  return [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
      className: "min-w-[120px] max-w-[160px]",
      render: (o) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={o.orderNumber}
            onClick={() => onView(o)}
          >
            {o.orderNumber}
          </button>
        ) : (
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
      key: "locationId",
      header: "Location",
      className: "min-w-[100px] max-w-[160px]",
      render: (o) => (
        <span className="text-muted truncate" title={locationLabelById[o.locationId] ?? o.locationId}>
          {locationLabelById[o.locationId] ?? o.locationId}
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
