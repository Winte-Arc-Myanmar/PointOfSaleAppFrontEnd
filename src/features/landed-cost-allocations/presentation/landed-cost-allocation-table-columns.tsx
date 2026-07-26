import type { DataTableColumn } from "@/presentation/components/data-table";
import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";

type LandedCostAllocationTableColumnOptions = {
  onView?: (row: LandedCostAllocation) => void;
};

export function getLandedCostAllocationTableColumns(
  options: LandedCostAllocationTableColumnOptions = {},
): DataTableColumn<LandedCostAllocation>[] {
  const { onView } = options;

  return [
    {
      key: "sourceInvoiceId",
      header: "Source Invoice",
      className: "min-w-[160px] max-w-[200px]",
      render: (row) =>
        onView ? (
          <button
            type="button"
            className="font-mono text-xs text-foreground hover:text-mint transition-colors truncate"
            title={row.sourceInvoiceId}
            onClick={() => onView(row)}
          >
            {row.sourceInvoiceId}
          </button>
        ) : (
          <span
            className="font-mono text-xs text-muted truncate"
            title={row.sourceInvoiceId}
          >
            {row.sourceInvoiceId}
          </span>
        ),
    },
    {
      key: "targetGrnId",
      header: "Target GRN",
      className: "min-w-[160px] max-w-[200px]",
      render: (row) => (
        <span className="font-mono text-xs text-muted truncate" title={row.targetGrnId}>
          {row.targetGrnId}
        </span>
      ),
    },
    {
      key: "allocationMethod",
      header: "Method",
      className: "min-w-[120px]",
      render: (row) => (
        <span className="text-sm text-foreground">{row.allocationMethod}</span>
      ),
    },
    {
      key: "allocatedAmount",
      header: "Allocated",
      sortable: true,
      className: "min-w-[120px]",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-foreground">
          {row.allocatedAmount}
        </span>
      ),
    },
    {
      key: "glJournalPosted",
      header: "GL Posted",
      className: "min-w-[100px]",
      render: (row) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${
            row.glJournalPosted
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
              : "border-border bg-muted text-foreground"
          }`}
        >
          {row.glJournalPosted ? "Yes" : "No"}
        </span>
      ),
    },
  ];
}
