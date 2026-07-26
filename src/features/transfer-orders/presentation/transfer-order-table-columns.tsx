import type { DataTableColumn } from "@/presentation/components/data-table";
import type { TransferOrder } from "@/core/domain/entities/TransferOrder";
import { formatDate } from "@/presentation/components/detail";

type TransferOrderTableColumnOptions = {
  onView?: (order: TransferOrder) => void;
};

function statusClassName(status: string): string {
  if (status === "RECEIVED")
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "IN_TRANSIT")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400";
  if (status === "CANCELLED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  return "border-border bg-muted text-foreground";
}

export function getTransferOrderTableColumns(
  options: TransferOrderTableColumnOptions = {},
): DataTableColumn<TransferOrder>[] {
  const { onView } = options;

  return [
    {
      key: "transferNumber",
      header: "Transfer Number",
      sortable: true,
      className: "min-w-[140px]",
      render: (o) =>
        onView ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(o)}
          >
            {o.transferNumber}
          </button>
        ) : (
          <span className="text-sm font-medium text-foreground">{o.transferNumber}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      render: (o) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(o.status)}`}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: "sourceLocationId",
      header: "Source",
      className: "min-w-[160px] max-w-[200px]",
      render: (o) => (
        <span className="font-mono text-xs text-muted truncate" title={o.sourceLocationId}>
          {o.sourceLocationId}
        </span>
      ),
    },
    {
      key: "destinationLocationId",
      header: "Destination",
      className: "min-w-[160px] max-w-[200px]",
      render: (o) => (
        <span className="font-mono text-xs text-muted truncate" title={o.destinationLocationId}>
          {o.destinationLocationId}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      className: "min-w-[120px]",
      render: (o) => (
        <span className="text-sm text-foreground">{formatDate(o.createdAt ?? undefined)}</span>
      ),
    },
  ];
}
