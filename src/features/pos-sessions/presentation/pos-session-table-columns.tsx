import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PosSession } from "@/core/domain/entities/PosSession";

function money(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

type PosSessionTableColumnOptions = {
  onView?: (session: PosSession) => void;
};

export function getPosSessionTableColumns(
  options: PosSessionTableColumnOptions = {},
): DataTableColumn<PosSession>[] {
  const { onView } = options;

  return [
    {
      key: "status",
      header: "Status",
      sortable: true,
      className: "min-w-[80px] max-w-[110px]",
      render: (s) =>
        onView ? (
          <button
            type="button"
            className="text-muted truncate text-left hover:text-mint transition-colors"
            title={s.status}
            onClick={() => onView(s)}
          >
            {s.status}
          </button>
        ) : (
          <span className="text-muted">{s.status}</span>
        ),
    },
    {
      key: "registerId",
      header: "Register",
      className: "min-w-[140px] max-w-[220px]",
      render: (s) => (
        <span className="font-mono text-xs text-muted truncate" title={s.registerId}>
          {s.registerId}
        </span>
      ),
    },
    {
      key: "cashierId",
      header: "Cashier",
      className: "min-w-[140px] max-w-[220px]",
      render: (s) => (
        <span className="font-mono text-xs text-muted truncate" title={s.cashierId}>
          {s.cashierId}
        </span>
      ),
    },
    {
      key: "openingCashFloat",
      header: "Opening float",
      className: "min-w-[110px] max-w-[140px]",
      render: (s) => <span className="text-muted">{money(s.openingCashFloat)}</span>,
    },
    {
      key: "expectedClosingCash",
      header: "Expected close",
      className: "min-w-[110px] max-w-[140px]",
      render: (s) => <span className="text-muted">{money(s.expectedClosingCash)}</span>,
    },
  ];
}

