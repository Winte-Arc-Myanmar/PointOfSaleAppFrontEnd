import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";
import { PAYMENT_METHOD_KIND_LABELS } from "./payment-method-kinds";

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
      key: "kind",
      header: "Type",
      className: "min-w-[120px]",
      render: (m) => <span className="text-sm">{PAYMENT_METHOD_KIND_LABELS[m.kind].label}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[90px]",
      render: (m) => (
        <span className={m.isActive ? "text-sm text-emerald-700" : "text-sm text-muted"}>
          {m.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];
}

