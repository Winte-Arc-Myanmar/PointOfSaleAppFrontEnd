import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";
import { formatDate } from "@/presentation/components/detail";

type ExchangeRateTableColumnOptions = {
  onView?: (rate: ExchangeRate) => void;
};

export function getExchangeRateTableColumns(
  options: ExchangeRateTableColumnOptions = {},
): DataTableColumn<ExchangeRate>[] {
  const { onView } = options;

  return [
    {
      key: "baseCurrency",
      header: "Base",
      sortable: true,
      className: "min-w-[80px]",
      render: (r) => (
        <span className="font-mono text-sm font-medium text-foreground">{r.baseCurrency}</span>
      ),
    },
    {
      key: "targetCurrency",
      header: "Target",
      sortable: true,
      className: "min-w-[80px]",
      render: (r) =>
        onView ? (
          <button
            type="button"
            className="font-mono text-sm font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(r)}
          >
            {r.targetCurrency}
          </button>
        ) : (
          <span className="font-mono text-sm font-medium text-foreground">{r.targetCurrency}</span>
        ),
    },
    {
      key: "rate",
      header: "Rate",
      sortable: true,
      className: "min-w-[100px]",
      render: (r) => (
        <span className="font-mono text-sm text-foreground">{r.rate}</span>
      ),
    },
    {
      key: "effectiveFrom",
      header: "Effective From",
      sortable: true,
      className: "min-w-[130px]",
      render: (r) => (
        <span className="text-sm text-foreground">{formatDate(r.effectiveFrom)}</span>
      ),
    },
    {
      key: "effectiveTo",
      header: "Effective To",
      sortable: true,
      className: "min-w-[130px]",
      render: (r) => (
        <span className="text-sm text-foreground">{formatDate(r.effectiveTo)}</span>
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
