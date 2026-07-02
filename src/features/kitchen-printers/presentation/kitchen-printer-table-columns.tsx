import type { DataTableColumn } from "@/presentation/components/data-table";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";

type KitchenPrinterTableColumnOptions = {
  onView?: (printer: KitchenPrinter) => void;
};

export function getKitchenPrinterTableColumns(
  options: KitchenPrinterTableColumnOptions = {}
): DataTableColumn<KitchenPrinter>[] {
  const { onView } = options;
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px]",
      render: (p) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(p)}
          >
            {p.name}
          </button>
        ) : (
          <span className="font-medium text-foreground">{p.name}</span>
        ),
    },
    {
      key: "ipAddress",
      header: "IP address",
      className: "min-w-[140px]",
      render: (p) => <span className="font-mono text-xs">{p.ipAddress}</span>,
    },
    {
      key: "port",
      header: "Port",
      className: "min-w-[80px]",
      render: (p) => <span className="font-mono text-xs">{p.port}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[100px]",
      render: (p) => (
        <span
          className={
            p.isActive
              ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
              : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {p.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "locationId",
      header: "Location ID",
      className: "min-w-[220px] max-w-[260px]",
      render: (p) => (
        <span className="font-mono text-xs text-muted truncate" title={p.locationId}>
          {p.locationId}
        </span>
      ),
    },
  ];
}
