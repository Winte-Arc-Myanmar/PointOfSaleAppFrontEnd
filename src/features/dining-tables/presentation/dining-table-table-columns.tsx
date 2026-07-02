import type { DataTableColumn } from "@/presentation/components/data-table";
import type { DiningTable } from "@/core/domain/entities/DiningTable";
import { getStatusConfig } from "@/features/dining/shared/dining-ui";

type DiningTableTableColumnOptions = {
  onView?: (table: DiningTable) => void;
};

export function getDiningTableTableColumns(
  options: DiningTableTableColumnOptions = {}
): DataTableColumn<DiningTable>[] {
  const { onView } = options;

  return [
    {
      key: "tableNumber",
      header: "Table",
      sortable: true,
      className: "min-w-[100px]",
      render: (t) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground hover:text-mint transition-colors"
            onClick={() => onView(t)}
          >
            {t.tableNumber}
          </button>
        ) : (
          <span className="font-medium text-foreground">{t.tableNumber}</span>
        ),
    },
    {
      key: "maxSeats",
      header: "Seats",
      sortable: true,
      className: "min-w-[80px]",
      render: (t) => <span className="text-sm text-foreground">{t.maxSeats}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      render: (t) => {
        const cfg = getStatusConfig(t.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.chipClass}`}
          >
            <span className={`size-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "shape",
      header: "Shape",
      className: "min-w-[100px]",
      render: (t) => <span className="text-xs text-muted">{t.shape}</span>,
    },
    {
      key: "posX",
      header: "Position",
      className: "min-w-[120px]",
      render: (t) => (
        <span className="font-mono text-xs text-muted">
          {t.posX}, {t.posY}
        </span>
      ),
    },
  ];
}
