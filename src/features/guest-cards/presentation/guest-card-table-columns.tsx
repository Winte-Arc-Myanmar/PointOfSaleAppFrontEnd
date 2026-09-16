import { Eye } from "lucide-react";
import type { DataTableColumn } from "@/presentation/components/data-table";
import type { MembershipGuestCard } from "@/core/domain/entities/MembershipMember";
import { formatDate } from "@/presentation/components/detail";

type Options = {
  onView?: (card: MembershipGuestCard) => void;
};

export function getGuestCardTableColumns(
  options: Options,
): DataTableColumn<MembershipGuestCard>[] {
  const { onView } = options;

  return [
    {
      key: "cardUid",
      header: "Card UID",
      render: (row) => (
        <button
          type="button"
          className="font-mono text-sm font-semibold text-foreground transition hover:text-mint"
          onClick={() => onView?.(row)}
        >
          {row.cardUid}
        </button>
      ),
    },
    {
      key: "label",
      header: "Label",
      render: (row) => <span className="text-sm">{row.label || "—"}</span>,
    },
    {
      key: "roomNumber",
      header: "Room",
      render: (row) => <span className="text-sm text-muted">{row.roomNumber || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <span className="text-sm font-medium">{row.status}</span>,
    },
    {
      key: "walletId",
      header: "Wallet",
      render: (row) => (
        <span className="font-mono text-xs text-muted">{row.walletId || "—"}</span>
      ),
    },
    {
      key: "issuedAt",
      header: "Issued",
      render: (row) => (
        <span className="text-sm text-muted">{formatDate(row.issuedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-mint hover:underline"
          onClick={() => onView?.(row)}
        >
          <Eye className="size-4" />
          View
        </button>
      ),
    },
  ];
}
