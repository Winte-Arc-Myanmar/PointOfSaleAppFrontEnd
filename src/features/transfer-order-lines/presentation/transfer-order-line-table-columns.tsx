import type { DataTableColumn } from "@/presentation/components/data-table";
import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";

type TransferOrderLineTableColumnOptions = {
  onView?: (line: TransferOrderLine) => void;
  productNameById?: Record<string, string>;
};

export function getTransferOrderLineTableColumns(
  options: TransferOrderLineTableColumnOptions = {},
): DataTableColumn<TransferOrderLine>[] {
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
      key: "requestedQuantity",
      header: "Requested",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.requestedQuantity}</span>
      ),
    },
    {
      key: "shippedQuantity",
      header: "Shipped",
      sortable: true,
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.shippedQuantity}</span>
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
  ];
}
