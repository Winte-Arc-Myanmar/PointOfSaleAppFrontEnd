import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PosSession } from "@/core/domain/entities/PosSession";
import type { TranslationKey } from "@/presentation/i18n/translations";

function money(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function when(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—";
}

type PosSessionTableColumnOptions = {
  onView?: (session: PosSession) => void;
  t: (key: TranslationKey) => string;
};

export function getPosSessionTableColumns({
  onView,
  t,
}: PosSessionTableColumnOptions): DataTableColumn<PosSession>[] {
  return [
    {
      key: "registerId",
      header: t("shifts.till"),
      className: "min-w-[140px] max-w-[220px]",
      render: (s) => {
        const name = s.registerName ?? s.registerId;
        return onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={name}
            onClick={() => onView(s)}
          >
            {name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate">{name}</span>
        );
      },
    },
    {
      key: "cashierId",
      header: t("shifts.staff"),
      className: "min-w-[120px] max-w-[200px]",
      render: (s) => <span className="text-muted truncate">{s.cashierName ?? s.cashierId}</span>,
    },
    {
      key: "openedAt",
      header: t("shifts.opened"),
      className: "min-w-[120px]",
      render: (s) => <span className="text-muted">{when(s.openedAt)}</span>,
    },
    {
      key: "closedAt",
      header: t("shifts.closed"),
      className: "min-w-[120px]",
      render: (s) =>
        s.status === "OPEN" ? (
          <span className="rounded-full bg-mint/15 px-2 py-0.5 text-xs font-medium text-mint">{t("shifts.open")}</span>
        ) : (
          <span className="text-muted">{when(s.closedAt)}</span>
        ),
    },
    {
      key: "salesCount",
      header: t("shifts.salesCount"),
      className: "min-w-[80px] text-right",
      render: (s) => <span className="text-muted tabular-nums">{s.salesCount ?? 0}</span>,
    },
    {
      key: "totalSales",
      header: t("shifts.sales"),
      className: "min-w-[110px] text-right",
      render: (s) => <span className="text-muted tabular-nums">{money(s.totalSales)}</span>,
    },
    {
      key: "netTotal",
      header: t("shifts.net"),
      className: "min-w-[110px] text-right",
      render: (s) => <span className="font-medium text-foreground tabular-nums">{money(s.netTotal)}</span>,
    },
  ];
}
