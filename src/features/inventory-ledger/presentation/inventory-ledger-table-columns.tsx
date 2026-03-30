import type { DataTableColumn } from "@/presentation/components/data-table";
import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";
import { formatDate } from "@/presentation/components/detail";

function shortId(id: string, n = 8): string {
  if (!id) return "—";
  return id.length > n ? `${id.slice(0, n)}…` : id;
}

export function getInventoryLedgerTableColumns(): DataTableColumn<InventoryLedgerEntry>[] {
  return [
    {
      key: "transactionType",
      header: "Type",
      sortable: true,
      className: "min-w-[100px] max-w-[140px]",
      render: (row) => (
        <span className="font-mono text-xs text-foreground" title={row.transactionType}>
          {row.transactionType || "—"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      className: "min-w-[72px]",
      render: (row) => (
        <span className="tabular-nums text-sm">{row.quantity}</span>
      ),
    },
    {
      key: "unitCost",
      header: "Unit cost",
      className: "min-w-[80px]",
      render: (row) => (
        <span className="tabular-nums text-sm text-muted">{row.unitCost}</span>
      ),
    },
    {
      key: "variantId",
      header: "Variant",
      className: "min-w-[90px] max-w-[120px]",
      render: (row) => (
        <span className="font-mono text-xs text-muted truncate" title={row.variantId}>
          {shortId(row.variantId)}
        </span>
      ),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[90px] max-w-[120px]",
      render: (row) => (
        <span className="font-mono text-xs text-muted truncate" title={row.locationId}>
          {shortId(row.locationId)}
        </span>
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      className: "min-w-[88px]",
      render: (row) => (
        <span className="text-xs text-muted">
          {row.expiryDate ?? "—"}
        </span>
      ),
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
