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
      key: "openingCashFloat",
      header: t("shifts.float"),
      className: "min-w-[100px] text-right",
      render: (s) => <span className="text-muted">{money(s.openingCashFloat)}</span>,
    },
    {
      key: "expectedClosingCash",
      header: t("shifts.expected"),
      className: "min-w-[100px] text-right",
      render: (s) => <span className="text-muted">{s.status === "OPEN" ? "—" : money(s.expectedClosingCash)}</span>,
    },
    {
      key: "actualClosingCash",
      header: t("shifts.counted"),
      className: "min-w-[100px] text-right",
      render: (s) => <span className="text-muted">{money(s.actualClosingCash)}</span>,
    },
    {
      key: "cashVariance",
      header: t("shifts.difference"),
      className: "min-w-[110px] text-right",
      render: (s) => {
        const v = s.cashVariance;
        if (v == null) return <span className="text-muted">—</span>;
        if (v === 0) return <span className="text-muted">{t("shifts.exact")}</span>;
        return (
          <span className={v < 0 ? "font-medium text-red-600" : "font-medium text-amber-600"}>
            {t(v < 0 ? "shifts.short" : "shifts.over")} {money(Math.abs(v))}
          </span>
        );
      },
    },
  ];
}
