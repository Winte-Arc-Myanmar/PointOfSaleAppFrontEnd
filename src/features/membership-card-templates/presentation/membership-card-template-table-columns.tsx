import { Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/presentation/components/data-table";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";

type Options = {
  onDelete?: (template: MembershipCardTemplate) => void;
  formatPrice: (value: number) => string;
};

export function getMembershipCardTemplateTableColumns(
  options: Options,
): DataTableColumn<MembershipCardTemplate>[] {
  const { onDelete, formatPrice } = options;
  return [
    {
      key: "name",
      header: "Card",
      sortable: true,
      render: (row) => <span className="text-sm font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      render: (row) => <span className="text-sm text-foreground">{row.tier}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (row) => <span className="text-sm font-semibold">{formatPrice(row.amount)}</span>,
    },
    {
      key: "billingPeriod",
      header: "Billing",
      render: (row) => <span className="text-sm text-muted">{row.billingPeriod}</span>,
    },
    {
      key: "rules",
      header: "Rules",
      render: (row) => (
        <p className="max-w-[260px] truncate text-sm text-muted" title={row.rules || "No rules"}>
          {row.rules || "No rules"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={row.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDelete?.(row)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title={`Delete ${row.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];
}
