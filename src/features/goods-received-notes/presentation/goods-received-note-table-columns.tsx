import type { DataTableColumn } from "@/presentation/components/data-table";
import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";
import { formatDate } from "@/presentation/components/detail";

type GoodsReceivedNoteTableColumnOptions = {
  onView?: (note: GoodsReceivedNote) => void;
};

function statusClassName(status: string): string {
  if (status === "ACCEPTED" || status === "POSTED")
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "INSPECTING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400";
  if (status === "REJECTED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
  return "border-border bg-muted text-foreground";
}

export function getGoodsReceivedNoteTableColumns(
  options: GoodsReceivedNoteTableColumnOptions = {},
): DataTableColumn<GoodsReceivedNote>[] {
  const { onView } = options;

  return [
    {
      key: "grnNumber",
      header: "GRN Number",
      sortable: true,
      className: "min-w-[140px]",
      render: (n) =>
        onView ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(n)}
          >
            {n.grnNumber}
          </button>
        ) : (
          <span className="text-sm font-medium text-foreground">{n.grnNumber}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      render: (n) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(n.status)}`}
        >
          {n.status}
        </span>
      ),
    },
    {
      key: "purchaseOrderId",
      header: "Purchase Order",
      className: "min-w-[160px] max-w-[200px]",
      render: (n) => (
        <span className="font-mono text-xs text-muted truncate" title={n.purchaseOrderId}>
          {n.purchaseOrderId}
        </span>
      ),
    },
    {
      key: "receivingLocationId",
      header: "Receiving Location",
      className: "min-w-[160px] max-w-[200px]",
      render: (n) => (
        <span className="font-mono text-xs text-muted truncate" title={n.receivingLocationId}>
          {n.receivingLocationId}
        </span>
      ),
    },
    {
      key: "receivedAt",
      header: "Received",
      sortable: true,
      className: "min-w-[120px]",
      render: (n) => (
        <span className="text-sm text-foreground">{formatDate(n.receivedAt ?? undefined)}</span>
      ),
    },
  ];
}
