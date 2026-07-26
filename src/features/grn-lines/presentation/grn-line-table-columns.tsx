import type { DataTableColumn } from "@/presentation/components/data-table";
import type { GrnLine } from "@/core/domain/entities/GrnLine";

type GrnLineTableColumnOptions = {
  onView?: (line: GrnLine) => void;
  productNameById?: Record<string, string>;
};

export function getGrnLineTableColumns(
  options: GrnLineTableColumnOptions = {},
): DataTableColumn<GrnLine>[] {
  const { onView, productNameById = {} } = options;

  return [
    {
      key: "productId",
      header: "Product",
      sortable: true,
      className: "min-w-[160px] max-w-[240px]",
      render: (l) => {
        const label = productNameById[l.productId] ?? l.productId;
        return onView ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-mint transition-colors truncate"
            title={label}
            onClick={() => onView(l)}
          >
            {label}
          </button>
        ) : (
          <span className="text-sm font-medium text-foreground truncate" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      key: "poLineId",
      header: "PO Line",
      className: "min-w-[140px] max-w-[180px]",
      render: (l) => (
        <span className="font-mono text-xs text-muted truncate" title={l.poLineId}>
          {l.poLineId}
        </span>
      ),
    },
    {
      key: "receivedQuantity",
      header: "Received",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.receivedQuantity}</span>
      ),
    },
    {
      key: "acceptedQuantity",
      header: "Accepted",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.acceptedQuantity}</span>
      ),
    },
    {
      key: "rejectedQuantity",
      header: "Rejected",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.rejectedQuantity}</span>
      ),
    },
    {
      key: "inventoryLedgerPosted",
      header: "Posted",
      className: "min-w-[90px]",
      render: (l) => (
        <span className="text-sm text-foreground">
          {l.inventoryLedgerPosted ? "Yes" : "No"}
        </span>
      ),
    },
  ];
}
