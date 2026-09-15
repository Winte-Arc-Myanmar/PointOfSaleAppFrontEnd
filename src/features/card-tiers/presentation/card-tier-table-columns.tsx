import type { DataTableColumn } from "@/presentation/components/data-table";
import type { CardTier } from "@/core/domain/entities/CardTier";

function formatDiscount(bps: number) {
  return `${(Number(bps) / 100).toFixed(2)}%`;
}

type CardTierTableColumnOptions = {
  onView?: (tier: CardTier) => void;
  formatPrice: (value: number) => string;
};

export function getCardTierTableColumns(
  options: CardTierTableColumnOptions,
): DataTableColumn<CardTier>[] {
  const { onView, formatPrice } = options;

  return [
    {
      key: "name",
      header: "Tier",
      sortable: true,
      className: "min-w-[140px]",
      render: (row) =>
        onView ? (
          <button
            type="button"
            className="font-semibold text-foreground truncate text-left hover:text-mint transition-colors"
            title={row.name}
            onClick={() => onView(row)}
          >
            {row.name}
          </button>
        ) : (
          <span className="font-semibold text-foreground">{row.name}</span>
        ),
    },
    {
      key: "rank",
      header: "Rank",
      sortable: true,
      className: "min-w-[80px]",
      render: (row) => <span className="font-mono text-sm">{row.rank}</span>,
    },
    {
      key: "preloadAmount",
      header: "Preload amount",
      sortable: true,
      className: "min-w-[140px]",
      render: (row) => (
        <span className="text-sm font-semibold">{formatPrice(row.preloadAmount)}</span>
      ),
    },
    {
      key: "preloadFunding",
      header: "Funding",
      className: "min-w-[120px]",
      render: (row) => <span className="text-sm text-muted">{row.preloadFunding}</span>,
    },
    {
      key: "discountBps",
      header: "Discount",
      className: "min-w-[110px]",
      render: (row) => (
        <span className="text-sm">
          {formatDiscount(row.discountBps)}{" "}
          <span className="text-muted">({row.discountBps} bps)</span>
        </span>
      ),
    },
    {
      key: "isPostpaid",
      header: "Postpaid",
      className: "min-w-[100px]",
      render: (row) => (
        <span className={row.isPostpaid ? "text-foreground font-medium" : "text-muted"}>
          {row.isPostpaid ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "validityDays",
      header: "Validity",
      className: "min-w-[100px]",
      render: (row) => <span className="text-sm">{row.validityDays} days</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[90px]",
      render: (row) => (
        <span className={row.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];
}
