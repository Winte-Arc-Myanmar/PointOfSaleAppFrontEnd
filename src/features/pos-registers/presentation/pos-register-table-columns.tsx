import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PosKind, PosRegister } from "@/core/domain/entities/PosRegister";
import type { TranslationKey } from "@/presentation/i18n/translations";

const KIND_LABEL: Record<PosKind, TranslationKey> = {
  BAR: "shifts.restaurant",
  KTV: "shifts.ktv",
  SPA: "shifts.spa",
};

type PosRegisterTableColumnOptions = {
  locationNames?: Record<string, string>;
  onView?: (register: PosRegister) => void;
  t: (key: TranslationKey) => string;
};

export function getPosRegisterTableColumns(
  options: PosRegisterTableColumnOptions,
): DataTableColumn<PosRegister>[] {
  const { onView, t, locationNames = {} } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[140px] max-w-[220px]",
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
      key: "sellsAt",
      header: t("shifts.sellsAt"),
      className: "min-w-[160px]",
      render: (r) => (
        <span className="text-muted">
          {r.sellsAt.map((kind) => t(KIND_LABEL[kind])).join(" + ")}
          {r.shiftRule === "DAILY" ? ` · ${t("shifts.daily")}` : ""}
        </span>
      ),
    },
    {
      key: "locationId",
      header: "Outlet",
      className: "min-w-[140px] max-w-[220px]",
      render: (r) => locationNames[r.locationId] ?? "—",
    },
    {
      key: "macAddress",
      header: "Device ID",
      className: "min-w-[140px] max-w-[200px]",
      render: (r) => (
        <span className="font-mono text-xs text-muted truncate" title={r.macAddress}>
          {r.macAddress}
        </span>
      ),
    },
  ];
}

