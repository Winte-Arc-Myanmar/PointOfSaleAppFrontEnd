import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";

type PaymentMethodTableColumnOptions = {
  onView?: (method: PaymentMethod) => void;
};

export function getPaymentMethodTableColumns(
  options: PaymentMethodTableColumnOptions = {},
): DataTableColumn<PaymentMethod>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[160px] max-w-[260px]",
      render: (m) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={m.name}
            onClick={() => onView(m)}
          >
            {m.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={m.name}>
            {m.name}
          </span>
        ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      className: "min-w-[180px] max-w-[240px]",
      render: (m) => (
        <span className="font-mono text-xs text-muted truncate" title={m.tenantId}>
          {m.tenantId}
        </span>
      ),
    },
    {
      key: "glAccountId",
      header: "GL account ID",
      className: "min-w-[180px] max-w-[240px]",
      render: (m) => (
        <span className="font-mono text-xs text-muted truncate" title={m.glAccountId}>
          {m.glAccountId}
        </span>
      ),
    },
  ];
}

