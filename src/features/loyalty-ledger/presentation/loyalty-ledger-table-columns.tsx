import type { DataTableColumn } from "@/presentation/components/data-table";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";

type LoyaltyLedgerTableColumnOptions = {
  onView?: (entry: LoyaltyLedgerEntry) => void;
  customerDetailsById?: Record<string, { name: string; loyaltyTier: string }>;
  orderNumberById?: Record<string, string>;
};

export function getLoyaltyLedgerTableColumns(
  options: LoyaltyLedgerTableColumnOptions = {},
): DataTableColumn<LoyaltyLedgerEntry>[] {
  const { onView, customerDetailsById = {}, orderNumberById = {} } = options;

  return [
    {
      key: "customerId",
      header: "Customer",
      className: "min-w-[140px] max-w-[200px]",
      render: (row) => {
        const customer = customerDetailsById[String(row.customerId)];
        return (
          <span className="font-medium text-foreground truncate" title={customer?.name ?? String(row.customerId)}>
            {customer?.name ?? "Unknown customer"}
          </span>
        );
      },
    },
    {
      key: "loyaltyTier",
      header: "Tier",
      className: "min-w-[100px] max-w-[130px]",
      render: (row) => {
        const tier = customerDetailsById[String(row.customerId)]?.loyaltyTier;
        return <span className="text-sm text-muted">{tier ?? "—"}</span>;
      },
    },
    {
      key: "transactionType",
      header: "Type",
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (row) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={row.transactionType}
            onClick={() => onView(row)}
          >
            {row.transactionType}
          </button>
        ) : (
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
      className: "w-[120px] min-w-[120px]",
      render: (row) => (
        <span className="block whitespace-nowrap text-sm text-muted" title={row.expiryDate ?? ""}>
          {row.expiryDate ? row.expiryDate.slice(0, 10) : "—"}
        </span>
      ),
    },
    {
      key: "referenceOrderId",
      header: "Order ID",
      className: "w-[160px] min-w-[160px] max-w-[160px]",
      render: (row) =>
        row.referenceOrderId && orderNumberById[String(row.referenceOrderId)] ? (
          <span className="block max-w-[140px] truncate text-sm font-medium text-foreground">
            Order #{orderNumberById[String(row.referenceOrderId)]}
          </span>
        ) : (
        <span
          className="block max-w-[140px] truncate font-mono text-xs text-muted"
          title={row.referenceOrderId ?? ""}
        >
          {row.referenceOrderId ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      className: "w-[170px] min-w-[170px]",
      render: (row) => (
        <span className="block whitespace-nowrap text-xs text-muted" title={row.createdAt ?? ""}>
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];
}
