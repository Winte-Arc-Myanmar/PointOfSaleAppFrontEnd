import type { DataTableColumn } from "@/presentation/components/data-table";
import type { TaxRate } from "@/core/domain/entities/TaxRate";

type TaxRateTableColumnOptions = {
  onView?: (rate: TaxRate) => void;
};

export function getTaxRateTableColumns(
  options: TaxRateTableColumnOptions = {},
): DataTableColumn<TaxRate>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (r) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={r.name}
            onClick={() => onView(r)}
          >
            {r.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={r.name}>
            {r.name}
          </span>
        ),
    },
    {
      key: "ratePercentage",
      header: "Rate %",
      sortable: true,
      className: "min-w-[100px]",
      render: (r) => (
        <span className="font-mono text-sm text-foreground">{r.ratePercentage}%</span>
      ),
    },
    {
      key: "isPriceInclusive",
      header: "Price Inclusive",
      className: "min-w-[130px]",
      render: (r) => (
        <span className={r.isPriceInclusive ? "text-green-600 font-medium" : "text-muted"}>
          {r.isPriceInclusive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "glLiabilityAccountId",
      header: "GL Liability Account",
      className: "min-w-[200px] max-w-[240px]",
      render: (r) => (
        <span
          className="font-mono text-xs text-muted truncate"
          title={r.glLiabilityAccountId}
        >
          {r.glLiabilityAccountId}
        </span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[200px] max-w-[240px]",
      render: (r) => (
        <span className="font-mono text-xs text-muted truncate" title={r.tenantId}>
          {r.tenantId}
        </span>
      ),
    },
  ];
}
