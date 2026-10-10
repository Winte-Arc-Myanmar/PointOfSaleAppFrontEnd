import { Eye } from "lucide-react";
import type { DataTableColumn } from "@/presentation/components/data-table";
import type { MembershipMember } from "@/core/domain/entities/MembershipMember";
import { StatusBadge } from "@/presentation/components/ui/status-badge";

type Options = {
  onView?: (member: MembershipMember) => void;
  formatPrice: (value: number) => string;
};

export function getMembershipMemberTableColumns(
  options: Options,
): DataTableColumn<MembershipMember>[] {
  const { onView, formatPrice } = options;

  return [
    {
      key: "customerName",
      header: "Member",
      sortable: true,
      render: (row) => (
        <button
          type="button"
          className="text-left text-sm font-semibold text-foreground transition hover:text-mint"
          onClick={() => onView?.(row)}
        >
          {row.customerName}
        </button>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="text-sm text-muted">{row.phone || "—"}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      render: (row) => <span className="text-sm font-medium">{row.tier}</span>,
    },
    {
      key: "cardNumber",
      header: "Card",
      render: (row) => (
        row.cardNumber ? (
          <span className="font-mono text-xs">
            {row.cardNumber}
            {(row.activeCardCount ?? 0) > 1 ? (
              <span className="ml-1 text-muted">+{(row.activeCardCount ?? 0) - 1}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-xs text-amber-700 dark:text-amber-300">No card</span>
        )
      ),
    },
    {
      key: "walletBalance",
      header: "Wallet",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold">{formatPrice(row.walletBalance)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <button
          type="button"
          onClick={() => onView?.(row)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-mint/40 hover:bg-mint/10 hover:text-foreground"
          title={`Open ${row.customerName}`}
          aria-label={`Open ${row.customerName}`}
        >
          <Eye className="size-4" />
        </button>
      ),
    },
  ];
}
