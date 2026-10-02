import type { DataTableColumn } from "@/presentation/components/data-table";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";
import { PRINTER_SECTOR_LABELS } from "./PrinterSectorPicker";
import { formatPrinterAddress } from "./printer-address";

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
      key: "sectors",
      header: "Sectors",
      className: "min-w-[160px]",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.sectors.map((sector) => (
            <span
              key={sector}
              className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
            >
              {PRINTER_SECTOR_LABELS[sector]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "Address",
      className: "min-w-[160px]",
      render: (p) => <span className="font-mono text-xs">{formatPrinterAddress(p)}</span>,
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
