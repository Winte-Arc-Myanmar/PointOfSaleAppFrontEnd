import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";
import { formatDate } from "@/presentation/components/detail";

type PurchaseRequisitionTableColumnOptions = {
  onView?: (row: PurchaseRequisition) => void;
};

function statusClassName(status: string): string {
  if (status === "APPROVED")
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  if (status === "PENDING_APPROVAL")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  if (status === "REJECTED" || status === "CANCELLED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
  return "border-border bg-muted text-foreground";
}

export function getPurchaseRequisitionTableColumns(
  options: PurchaseRequisitionTableColumnOptions = {},
): DataTableColumn<PurchaseRequisition>[] {
  const { onView } = options;

  return [
    {
      key: "department",
      header: "Department",
      sortable: true,
      className: "min-w-[140px]",
      render: (r) =>
        onView ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(r)}
          >
            {r.department}
          </button>
        ) : (
          <span className="text-sm font-medium text-foreground">{r.department}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[130px]",
      render: (r) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(r.status)}`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "requestedBy",
      header: "Requested By",
      className: "min-w-[160px] max-w-[200px]",
      render: (r) => (
        <span className="font-mono text-xs text-muted truncate" title={r.requestedBy}>
          {r.requestedBy}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      className: "min-w-[120px]",
      render: (r) => (
        <span className="text-sm text-foreground">{formatDate(r.createdAt ?? undefined)}</span>
      ),
    },
  ];
}
