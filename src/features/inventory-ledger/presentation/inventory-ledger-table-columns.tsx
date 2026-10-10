import type { DataTableColumn } from "@/presentation/components/data-table";
import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";
import { formatDate } from "@/presentation/components/detail";
import { formatMoney } from "@/lib/money";
import { ledgerTypeLabel } from "./ledger-constants";

function shortId(id: string, n = 8): string {
  if (!id) return "-";
  return id.length > n ? `${id.slice(0, n)}...` : id;
}

type InventoryLedgerTableColumnOptions = {
  onView?: (row: InventoryLedgerEntry) => void;
};

export function getInventoryLedgerTableColumns(
  options: InventoryLedgerTableColumnOptions = {},
): DataTableColumn<InventoryLedgerEntry>[] {
  const { onView } = options;

  return [
    {
      key: "transactionType",
      header: "Type",
      sortable: true,
      className: "min-w-[120px]",
      render: (row) =>
        onView ? (
          <button
            type="button"
            className="text-left text-sm text-foreground hover:text-mint transition-colors"
            onClick={() => onView(row)}
          >
            {ledgerTypeLabel(row.transactionType)}
          </button>
        ) : (
          <span className="text-sm text-foreground">{ledgerTypeLabel(row.transactionType)}</span>
        ),
    },
    {
      key: "variantId",
      header: "Item",
      className: "min-w-[160px]",
      render: (row) =>
        row.productName ? (
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground">{row.productName}</div>
            {row.variantSku ? (
              <div className="truncate text-xs text-muted">{row.variantSku}</div>
            ) : null}
          </div>
        ) : (
          <span className="font-mono text-xs text-muted" title={row.variantId}>
            {shortId(row.variantId)}
          </span>
        ),
    },
    {
      key: "quantity",
      header: "Qty",
      className: "min-w-[72px]",
      render: (row) => <span className="tabular-nums text-sm">{row.quantity}</span>,
    },
    {
      key: "unitCost",
      header: "Unit cost",
      className: "min-w-[100px]",
      render: (row) => (
        <span className="tabular-nums text-sm text-muted">{formatMoney(row.unitCost)}</span>
      ),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[120px]",
      render: (row) =>
        row.locationName ? (
          <span className="text-sm text-muted">{row.locationName}</span>
        ) : (
          <span className="font-mono text-xs text-muted" title={row.locationId}>
            {shortId(row.locationId)}
          </span>
        ),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      className: "min-w-[88px]",
      render: (row) => <span className="text-xs text-muted">{row.expiryDate ?? "-"}</span>,
    },
    {
      key: "createdAt",
      header: "Created",
      className: "min-w-[100px]",
      render: (row) => (
        <span className="text-xs text-muted">{formatDate(row.createdAt)}</span>
      ),
    },
  ];
}
