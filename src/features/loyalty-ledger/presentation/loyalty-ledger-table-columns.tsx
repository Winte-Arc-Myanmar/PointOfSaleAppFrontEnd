import type { DataTableColumn } from "@/presentation/components/data-table";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";

export function getLoyaltyLedgerTableColumns(): DataTableColumn<LoyaltyLedgerEntry>[] {
  return [
    {
      key: "transactionType",
      header: "Type",
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (row) => (
        <span className="font-medium text-foreground truncate" title={row.transactionType}>
          {row.transactionType}
        </span>
      ),
    },
    {
      key: "points",
      header: "Points",
      sortable: true,
      className: "min-w-[80px]",
      render: (row) => (
        <span className="font-mono text-sm tabular-nums">{row.points}</span>
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      className: "min-w-[110px] max-w-[140px]",
      render: (row) => (
        <span className="text-sm text-muted truncate" title={row.expiryDate ?? ""}>
          {row.expiryDate ?? "—"}
        </span>
      ),
    },
    {
      key: "referenceOrderId",
      header: "Order ref",
      className: "min-w-[120px] max-w-[200px]",
      render: (row) => (
        <span
          className="font-mono text-xs text-muted truncate"
          title={row.referenceOrderId ?? ""}
        >
          {row.referenceOrderId ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      className: "min-w-[140px] max-w-[180px]",
      render: (row) => (
        <span className="text-xs text-muted truncate" title={row.createdAt ?? ""}>
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];
}
